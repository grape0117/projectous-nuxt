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
        <b-col cols="3">
          <pj-draggable
            :data="tasksUsers"
            :lists="lists"
            @create="createTask"
            @update="updateTaskUser"
            @taskTimerToggled="onTaskTimerToggled"
          />
        </b-col>
        <b-col cols="3">
          <div class="text-center">
            Projects
          </div>
          <div v-for="(projects, clientId) in projectsByClientId">
            <!--            Todo: change client id to client name-->
            Client id: {{ clientId }}
            <ul>
              <li
                v-for="{ name, id } in projects"
                @click="selectedProjectId = id"
                class="project-item__name"
              >
                {{ name }}
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

const CompanyUsers = namespace('company_users')
const TaskUsers = namespace('task_users')
const Tasks = namespace('tasks')
const Lists = namespace('lists')
const Projects = namespace('projects')

const taskStatuses = ['open', 'in progress', 'closed']

interface ITaskTimerToggle {
  taskId: number | string
  timerId: number | string | null
}

@Component({
  components: {
    TaskDetails
  }
})
export default class Custom extends Vue {
  @TaskUsers.Getter('getById') private getTaskUserById!: any
  @TaskUsers.Getter private sortedByDays!: any
  @TaskUsers.Action('updateTaskUser') private updateTaskUserVuex!: any
  @TaskUsers.Action('createTaskUser') private createTaskUserVuex!: any
  @Tasks.Action('updateTask') private updateTaskVuex!: any
  @Tasks.Action('createTask') private createTaskVuex!: any
  @Tasks.Getter('getById') private getTaskById!: any
  @Tasks.Getter('getByProjectId') private getTaskByProjectId!: any
  @Lists.Getter private getUserLists!: any
  @Projects.Getter private getUserProjects!: any
  @CompanyUsers.State(state => state.company_users) private companyUsers!: any

  private selectedProjectId: string | number | null = null
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
      group: status
    }))
  }

  private selectedCompanyUser: any = null

  public async createTask(item: any) {
    await this.createTaskVuex({ title: item.title })
  }

  public async updateTask(task: any) {
    const taskCopy = cloneDeep(this.getTaskById(task.id))
    taskCopy.status = task.listId
    taskCopy.sort_order = task.sort_order
    await this.updateTaskVuex(taskCopy)
  }

  public async createTaskUser(item: any) {
    const newTaskID = await this.createTaskVuex({ title: item.title })
    const newUserTask = cloneDeep(item)
    delete newUserTask.title
    newUserTask.task_id = newTaskID
    this.createTaskUserVuex(newUserTask)
  }

  public async updateTaskUser({ id, task_id, title, listId, sort_order }: any) {
    const taskUser = cloneDeep(this.getTaskUserById(id))
    let newNextWorkDay = null
    if (listId === 'Past') {
      const date = new Date()
      newNextWorkDay = formatDateToYYYY_MM_DD(
        new Date(date.setMonth(date.getMonth() - 1))
      )
      //If listId is a date, return that I think
    } else if (!!Date.parse(listId) && isNaN(listId)) {
      newNextWorkDay = formatDateToYYYY_MM_DD(listId)
      //If listId is a number, this is a user-created list
    } else if (Number.isInteger(Number(listId))) {
      //Only user-created lists have a listId set on task_user object
      taskUser.user_task_list_id = listId
      //TODO: set next_word_day to null?
    }
    taskUser.next_work_day = newNextWorkDay
    taskUser.sort_order = sort_order
    await this.updateTaskUserVuex(taskUser)
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
</style>
