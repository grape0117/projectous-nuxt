<template>
  <div>
    <select v-model="selectedCompanyUser">
      <option
        v-for="(companyUser, i) in sortedCompanyUsers"
        :value="companyUser"
        :id="companyUser.id"
        :key="`${companyUser.id}-${i}`"
      >
        {{ companyUser.name }}
      </option>
    </select>
    <hr />
    <b-container fluid>
      <b-row>
        <b-col cols="3" class="scroll-col">
          <pj-draggable
            :data="tasksUsers"
            :lists="lists"
            @create="createTaskUser"
            @update="updateTaskUser"
            @taskTimerToggled="onTaskTimerToggled"
            @updateOptions="updateTaskUserSortOrder"
          />
          <new-list-form v-if="selectedCompanyUser" :user-id="selectedCompanyUser.id" />
        </b-col>
        <b-col cols="3" class="scroll-col">
          <div class="text-center">
            Projects
          </div>
          <div v-for="client in activeClients">
            <!--            Todo: change client id to client name-->
            {{ client.name }}
            <ul>
              <li
                v-for="{ name, id } in openClientProjects(client)"
              >
                <div class="project-item__name" @click="setProjectId(id)">{{ name }}</div>
                <div @click="setPinnedProject(id)" class="project-item__status">
                  <img src="@/assets/img/star-pin.svg" alt="star-unpin" v-if="!!pinnedProjects.find(project => project === id)">
                  <img src="@/assets/img/star-unpin.svg" alt="star-pin" v-else>
                </div>
              </li>
            </ul>
          </div>
        </b-col>
        <b-col v-if="selectedProjectId" cols="6">
          <pj-draggable
            :data="selectedProjectTasksForStatusesColumns"
            :lists="taskPerStatusLists"
            :verticalAlignment="false"
            @create="createTask"
            @update="updateTask"
            @updateOptions="updateTaskSortOrder"
          />
        </b-col>
      </b-row>
    </b-container>
    <TaskDetails v-if="taskDetailsDisplayed" :taskId="editedTaskId" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { cloneDeep, groupBy } from 'lodash'
import { formatDateToYYYY_MM_DD } from '@/utils/dateFunctions'
import TaskDetails from '@/components/draggable/TaskDetails.vue'
import { IProject } from '@/store/modules/projects/types'
import { ITask } from '@/store/modules/tasks/types'
import NewListForm from '@/components/draggable/NewListForm.vue'

const CompanyClients = namespace('company_clients')
const CompanyUsers = namespace('company_users')
const TaskUsers = namespace('task_users')
const Tasks = namespace('tasks')
const Lists = namespace('lists')
const Projects = namespace('projects')

const taskStatuses = ['open', 'in progress', 'turned-in', 'completed', 'closed']

interface ITaskTimerToggle {
  taskId: number | string
  timerId: number | string | null
}

@Component({
  components: {
    NewListForm,
    TaskDetails
  }
})
export default class Custom extends Vue {
  @TaskUsers.Getter('getById') private getTaskUserById!: any
  @TaskUsers.Getter private sortedByDays!: any
  @TaskUsers.Action('updateTaskUser') private updateTaskUserVuex!: any
  @TaskUsers.Action('createTaskUser') private createTaskUserVuex!: any
  @TaskUsers.Action('updateSortOrder')
  private updateTaskUsersSortOrderVuex!: any
  @Tasks.Action('updateTask') private updateTaskVuex!: any
  @Tasks.Action('createTask') private createTaskVuex!: any
  @Tasks.Action('updateSortOrder') private updateTaskSortOrderVuex!: any
  @Tasks.Getter('getById') private getTaskById!: any
  @Tasks.Getter('getByProjectId') private getTaskByProjectId!: any
  @Lists.Getter private getUserLists!: any
  @Projects.Getter private getUserProjects!: any
  @Projects.Mutation('projects/SET_SELECTED_PROJECT') setProjectId!: any
  @Projects.Action pinProject!: any
  @Projects.State(state => state.selectedProjectId) selectedProjectId!: string | number | null
  @Projects.State(state => state.pinnedProjects) pinnedProjects!: number[]
  @CompanyUsers.State(state => state.company_users) private companyUsers!: any

  private editedTaskTimerId: number | string | null = null
  private editedTaskId: number | string | null = null

  get lists() {
    return !this.selectedCompanyUser
      ? []
      : this.getUserLists(this.selectedCompanyUser.id)
  }
  get tasksUsers() {
    if (!this.selectedCompanyUser) return []
    return this.sortedByDays(this.selectedCompanyUser.id)
  }
  get sortedCompanyUsers() {
    return this.companyUsers.sort(
      (
        { name: nameA }: { name: string },
        { name: nameB }: { name: string }
      ) => {
        if (nameA.toLowerCase() > nameB.toLowerCase()) return 1
        if (nameA.toLowerCase() < nameB.toLowerCase()) return -1
        return 0
      }
    )
  }

  get activeClients() {
    return this.$store.state.company_clients.company_clients
      .filter((client: any) => {
        return client.status === 'active'
      })
      .sort((a: any, b: any) => {
        if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
        if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
        return 0
      })
  }

  get projectsByClientId() {
    const projects: IProject[] = this.getUserProjects(null)
    const listOfProjectsToDisplay = projects
      .filter(pr => pr.status === 'open')
      .sort((a, b) => a.client_id - b.client_id)
    return groupBy(listOfProjectsToDisplay, 'client_id')
  }
  get taskDetailsDisplayed() {
    return this.editedTaskId && this.editedTaskTimerId
  }
  get selectedProjectTasksForStatusesColumns() {
    const projectTasks = this.getTaskByProjectId(this.selectedProjectId)
    return projectTasks.map(({ id, title, status }: ITask) => ({
      id,
      title,
      status,
      listId: status
    }))
  }

  get taskPerStatusLists() {
    return taskStatuses.map(status => ({
      title: status,
      id: status,
      group: status,
      initiallyExpanded: true
    }))
  }

  private selectedCompanyUser: any = null

  public setPinnedProject(id: number) {
    this.pinProject({ id, userId: this.selectedCompanyUser.id })
  }

  public openClientProjects(client: any) {
    return this.$store.state.projects.projects
      .filter((project: any) => {
        if (project.status !== 'open') return false
        return project.client_id === client.client_company_id
      })
      .sort((a: any, b: any) => {
        if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
        if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
        return 0
      })
  }
  public clientName(company_client_id: any) {
    const company_client = this.$store.getters['company_clients/getById'](
      company_client_id
    )
    return company_client ? company_client.name : ''
  }
  public async createTask({ title }: any) {
    await this.createTaskVuex({ title, project_id: this.selectedProjectId })
  }

  public async updateTask(task: any) {
    const taskCopy = cloneDeep(this.getTaskById(task.id))
    taskCopy.status = task.listId
    taskCopy.sort_order = task.sort_order
    await this.updateTaskVuex(taskCopy)
  }

  public async createTaskUser({ title, listId, sort_order }: any) {
    let next_work_day = null
    let user_task_list_id = null
    if (listId === 'Past') {
      /*
        TODO: This isn't clean. It shouldn't just be a month back. Seems like we have options:
        1) When the list loads, resave all to have a specific listId like -1
        2) Figure out where in the list the new entry was added and use the same next_work_day (seems wrong though)
         */
      const date = new Date()
      next_work_day = formatDateToYYYY_MM_DD(
        new Date(date.setMonth(date.getMonth() - 1))
      )
      //If listId is a date, return that I think
    } else if (!!Date.parse(listId) && isNaN(listId)) {
      //TODO: check to see if we even need to convert it
      next_work_day = formatDateToYYYY_MM_DD(listId)
      //If listId is a number, this is a user-created list
    } else if (Number.isInteger(Number(listId))) {
      //Only user-created lists have a listId set on task_user object
      user_task_list_id = listId
    }
    const task = { title }
    const { id } = await this.createTaskVuex(task)
    const taskUser = {
      task_id: id,
      next_work_day,
      company_user_id: this.selectedCompanyUser.id,
      user_task_list_id,
      sort_order
    }
    await this.createTaskUserVuex(taskUser)
  }

  public async updateTaskUser({ id, task_id, title, listId, sort_order }: any) {
    const taskUser = cloneDeep(this.getTaskUserById(id))
    let next_work_day = null
    let user_task_list_id = null
    if (listId === 'Past') {
      //TODO: see note on create function
      const date = new Date()
      next_work_day = formatDateToYYYY_MM_DD(
        new Date(date.setMonth(date.getMonth() - 1))
      )
      user_task_list_id = null
    } else if (listId === 'Unmarked') {
      next_work_day = null
      user_task_list_id = null
      //If listId is a date, return that I think
    } else if (!!Date.parse(listId) && isNaN(listId)) {
      next_work_day = formatDateToYYYY_MM_DD(listId)
      user_task_list_id = null
      //If listId is a number, this is a user-created list
    } else if (Number.isInteger(Number(listId))) {
      //Only user-created lists have a listId set on task_user object
      next_work_day = null
      user_task_list_id = listId
    }
    taskUser.next_work_day = next_work_day
    taskUser.user_task_list_id = user_task_list_id
    taskUser.sort_order = sort_order
    await this.updateTaskUserVuex(taskUser)
    //TODO: why is updating a title mixed in with moving a task?
    const task = cloneDeep(this.getTaskById(task_id))
    if (task.title !== title) {
      task.title = title
      await this.updateTaskVuex(task)
    }
  }

  private onTaskTimerToggled(payload: ITaskTimerToggle) {
    const { taskId, timerId } = payload
    this.editedTaskId = taskId
    this.editedTaskTimerId = timerId
  }

  private updateTaskUserSortOrder(tasks: any): void {
    const parsedTasks = JSON.parse(tasks)
    this.updateTaskUsersSortOrderVuex(
      parsedTasks.map(({ id }: { id: number }) => id)
    )
  }

  private updateTaskSortOrder(tasks: any): void {
    const parsedTasks = JSON.parse(tasks)
    this.updateTaskSortOrderVuex(
      parsedTasks.map(({ id }: { id: number }) => id)
    )
  }

  @Watch('selectedCompanyUser')
  private changeRouteQueryParams(value: any) {
    if (value) {
      this.$router.push({ query: { user: value.id } }).catch(e => {})
    }
  }
  @Watch('sortedCompanyUsers')
  private onSortedCompanyUsersChanged(users: any) {
    const query = this.$route.query.user
    if (query) {
      const user = users.find(({ id }: any) => id === +query)
      if (user && !this.selectedCompanyUser) this.selectedCompanyUser = user
    }
  }
}
</script>

<style>
.project-item__name {
  cursor: pointer;
}

.project-item__name:hover {
  color: blue;
}
.project-item__status {
  padding-right: 1rem;
  cursor: pointer;
  text-align: right;
}
.scroll-col {
  height: calc(100vh - 170px);
  overflow-y: scroll;
}
</style>
