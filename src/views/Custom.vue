<template>
  <div>
    Project Filter: <input v-model="project_search" />
    <hr />
    <b-container fluid>
      <b-row>
        <b-col cols="3" class="scroll-col">
          <div class="text-center">
            Projects
          </div>
          <div v-for="client in activeClients">
            <!--            Todo: change client id to client name-->
            {{ client.name }}
            <ul>
              <li v-for="{ name, id } in openClientProjects(client)">
                <div @click="setPinnedProject(id)" class="project-item__status">
                  <img
                    src="@/assets/img/star-pin.svg"
                    alt="star-unpin"
                    v-if="!!pinnedProjects.find(project => project === id)"
                  />
                  <img
                    src="@/assets/img/star-unpin.svg"
                    alt="star-pin"
                    v-else
                  />
                </div>
                <div class="project-item__name" @click="setProjectId(id)">
                  {{ name }}
                </div>
              </li>
            </ul>
          </div>
        </b-col>
        <b-col v-if="selectedProjectId" cols="6">
          <pj-draggable
            :listsBlockName="listsBlockNames.PROJECTS"
            :data="selectedProjectTasksForStatusesColumns"
            :lists="taskPerStatusLists"
            :verticalAlignment="false"
            :selectedCompanyUserId="selectedCompanyUserId"
            @create="createTask"
            @update="updateTask"
            @delete="deleteTask"
            @updateOptions="updateTaskSortOrder"
            @setCurrentListsBlockName="
              currentListsBlockName = listsBlockNames.PROJECTS
            "
          />
        </b-col>
      </b-row>
    </b-container>
    <TaskDetails v-if="taskDetailsDisplayed" :taskId="editedTaskId" />
    <!--    <timer-tab />-->
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
import TimerTab from './TimerTab.vue'

const CompanyClients = namespace('company_clients')
const CompanyUsers = namespace('company_users')
const TaskUsers = namespace('task_users')
const Tasks = namespace('tasks')
const Lists = namespace('lists')
const Projects = namespace('projects')

const taskStatuses = ['open', 'in-progress', 'turned-in', 'completed', 'closed']

interface ITaskTimerToggle {
  taskId: number | string
  timerId: number | string | null
}

enum listsBlockNames {
  'TASKS_USERS' = 'tasksUsers',
  'PROJECTS' = 'projects'
}

@Component({
  components: {
    NewListForm,
    TaskDetails,
    TimerTab
  }
})
export default class Custom extends Vue {
  get listsBlockNames() {
    return listsBlockNames
  }

  get lists() {
    return !this.selectedCompanyUserId
      ? []
      : this.getUserLists(this.selectedCompanyUserId)
  }
  get tasksUsers() {
    if (!this.selectedCompanyUserId) return []
    return this.sortedByDays(this.selectedCompanyUserId)
  }
  get sortedCompanyUsers() {
    return this.$store.getters['company_users/getActive']
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
    return projectTasks
      .map(({ id, title, status, sort_order, temp }: ITask) => ({
        id,
        title,
        status,
        listId: status,
        sort_order,
        temp
      }))
      .sort(({ sort_order: a }: any, { sort_order: b }: any) => a - b)
  }

  get taskPerStatusLists() {
    return taskStatuses.map(status => ({
      title: status,
      id: status,
      group: status,
      initiallyExpanded: true
    }))
  }
  @Projects.Mutation('projects/SET_SELECTED_PROJECT') public setProjectId!: any
  @Projects.Action public pinProject!: any
  @Projects.State(state => state.selectedProjectId) public selectedProjectId!:
    | string
    | number
    | null
  @Projects.State(state => state.pinnedProjects)
  public pinnedProjects!: number[]
  @TaskUsers.Getter('getById') private getTaskUserById!: any
  @TaskUsers.Getter private sortedByDays!: any
  @TaskUsers.Action('createTaskUser') private createTaskUserVuex!: any
  @TaskUsers.Action('updateTaskUser') private updateTaskUserVuex!: any
  @TaskUsers.Action('deleteTaskUser') private deleteTaskUserVuex!: any
  @TaskUsers.Action('updateSortOrder')
  private updateTaskUsersSortOrderVuex!: any
  @Tasks.Action('createTask') private createTaskVuex!: any
  @Tasks.Action('updateTask') private updateTaskVuex!: any
  @Tasks.Action('deleteTask') private deleteTaskVuex!: any
  @Tasks.Action('updateSortOrder') private updateTaskSortOrderVuex!: any
  @Tasks.Getter('getById') private getTaskById!: any
  @Tasks.Getter('getByProjectId') private getTaskByProjectId!: any
  @Lists.Getter private getUserLists!: any
  @Projects.Getter private getUserProjects!: any

  private editedTaskTimerId: number | string | null = null
  private editedTaskId: number | string | null = null
  private currentListsBlockName: string | null = null
  private project_search: string = ''

  private selectedCompanyUserId: any = null

  public setPinnedProject(id: number) {
    this.pinProject({ id, userId: this.selectedCompanyUserId })
  }

  public openClientProjects(client: any) {
    return this.$store.state.projects.projects
      .filter((project: any) => {
        if (
          this.project_search &&
          (project.name
            .toLowerCase()
            .indexOf(this.project_search.toLowerCase()) === -1 &&
            client.name
              .toLowerCase()
              .indexOf(this.project_search.toLowerCase()) === -1)
        ) {
          return false
        }
        if (project.status !== 'open') return false
        return project.client_id === client.client_id
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
  public async createTask({ title, listId = 'open', sort_order, temp }: any) {
    return await this.createTaskVuex({
      title,
      project_id: this.selectedProjectId,
      sort_order,
      status: listId,
      temp
    })
  }

  public async updateTask(task: any) {
    if (this.currentListsBlockName !== this.listsBlockNames.PROJECTS) return
    const taskCopy = cloneDeep(this.getTaskById(task.id))
    taskCopy.status = task.listId
    taskCopy.sort_order = task.sort_order
    await this.updateTaskVuex(taskCopy)
  }

  public async deleteTask(task: any) {
    await this.deleteTaskVuex(task)
    return
  }

  public async createTaskUser({ title, listId, sort_order, temp }: any) {
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
    const task = { title, sort_order, temp }
    const { id: task_id } = await this.createTask(task)
    const taskUser = {
      task_id,
      next_work_day,
      company_user_id: this.selectedCompanyUserId,
      user_task_list_id,
      sort_order,
      temp
    }
    await this.createTaskUserVuex(taskUser)
  }

  public async updateTaskUser({ id, task_id, title, listId, sort_order }: any) {
    if (this.currentListsBlockName !== this.listsBlockNames.TASKS_USERS) return
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

  public async deleteTaskUser(taskUser: any) {
    await this.deleteTaskUserVuex(taskUser)
    await this.deleteTask({ id: taskUser.task_id })
  }

  private onTaskTimerToggled(payload: ITaskTimerToggle) {
    const { taskId, timerId } = payload
    const task = this.$store.getters['tasks/getById'](taskId)
    console.log('task', task)
    let timer = {
      task_id: taskId
    }
    if (task.project_id) {
      console.log('fetching project')
      const project = this.$store.getters['projects/getById'](task.project_id)
      // @ts-ignore
      timer['project_id'] = project.id
      console.log(timer)
    }
    this.$store.dispatch('timers/startTimer', timer)
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

  @Watch('selectedCompanyUserId')
  private changeRouteQueryParams(value: any) {
    if (value) {
      this.$router.push({ query: { user: value } }).catch(e => {})
    }
  }
  @Watch('sortedCompanyUsers')
  private onSortedCompanyUsersChanged(users: any) {
    const query = this.$route.query.user
    if (query) {
      const user = users.find(({ id }: any) => id === +query)
      if (user && !this.selectedCompanyUserId)
        this.selectedCompanyUserId = user.id
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
  float: left;
  clear: both;
  padding-right: 1rem;
  cursor: pointer;
  text-align: right;
}
.scroll-col {
  height: calc(100vh - 170px);
  overflow-y: scroll;
}
</style>
