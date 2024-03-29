<template>
  <div id="task-tray">
    <div class="task-tray-wrapper">
      <div class="task-tray-top-div">
        <div class="task-tray-title">
          <span>TASKS</span>
        </div>
        <div class="task-tray-selection-box">
          <select id="selectCompanyUser" v-model="selectedCompanyUserId">
            <option v-for="(companyUser, i) in sortedCompanyUsers" :value="companyUser.id" :id="'company_user-' + companyUser.id" :key="`${companyUser.id}-${i}`">
              {{ companyUser.name }}
            </option>
          </select>
          <!-- <button class="closebtnLeft" @click="trayToggle()"><b-icon icon="x-circle"></b-icon></button> -->
        </div>
      </div>
      <pj-draggable class="task-tray-draggable" @createItem="createTaskUser" @update="updateTaskUser" @delete="deleteTaskUser" @taskTimerToggled="onTaskTimerToggled" @updateSortOrders="updateTaskUserSortOrders" @setCurrentListsBlockName="currentListsBlockName = listsBlockNames.TASKS_USERS" :selectedCompanyUserId="selectedCompanyUserId" :listsBlockName="listsBlockNames.TASKS_USERS" :data="tasksUsers" :lists="lists" />
      <new-list-form v-if="selectedCompanyUserId" :user-id="selectedCompanyUserId" />
    </div>
    <!-- <div
    :class="'chat-hide-btn ' + trayClass()">
      <button @click="trayToggle()" type="button" id="chat-tray-btn" :class="'btn btn-purple ' + trayClass()">
        tasks
      </button>
    </div> -->
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
import { ITimer } from '../store/modules/timers/types'
import uuid from 'uuid'
import { getCookie } from '@/utils/util-functions'
import { projects } from '@/store/modules/projects'

const TaskUsers = namespace('task_users')
const Lists = namespace('lists')
const Projects = namespace('projects')

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
    return !this.selectedCompanyUserId ? [] : this.getUserLists(this.selectedCompanyUserId)
  }
  get tasksUsers() {
    if (!this.selectedCompanyUserId) return []
    return this.sortedByDays(this.selectedCompanyUserId)
  }
  get sortedCompanyUsers() {
    return this.$store.getters['company_users/getActive']
  }

  get activeClients() {
    return this.$store.state.clients.clients
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
    const user_projects: IProject[] = this.getUserProjects(null)
    const listOfProjectsToDisplay = user_projects.filter(pr => pr.status === 'open').sort((a, b) => a.client_id - b.client_id)
    return groupBy(listOfProjectsToDisplay, 'client_id')
  }
  get taskDetailsDisplayed() {
    return this.editedTaskId && this.editedTaskTimerId
  }
  get selectedProjectTasksForStatusesColumns() {
    const projectTasks = this.$store.getters['projects/getById'](this.selectedProjectId)
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

  @Projects.Mutation('projects/SET_SELECTED_PROJECT') public setProjectId!: any
  @Projects.Action public pinProject!: any
  @Projects.State(state => state.selectedProjectId) public selectedProjectId!: string | number | null
  @Projects.State(state => state.pinnedProjects)
  public pinnedProjects!: number[]
  @TaskUsers.Getter('getById') private getTaskUserById!: any
  @TaskUsers.Getter private sortedByDays!: any
  @Lists.Getter private getUserLists!: any
  @Projects.Getter private getUserProjects!: any

  private editedTaskTimerId: number | string | null = null
  private editedTaskId: number | string | null = null
  private currentListsBlockName: string | null = null
  private project_search: string = ''
  private tray_expanded: boolean = false

  private selectedCompanyUserId: any = null

  public async createTaskUser({ item, ids_of_items_to_shift_up }: any) {
    let next_work_day = null
    let user_task_list_id = null
    if (item.listId === 'Past') {
      /*
              TODO: This isn't clean. It shouldn't just be a month back. Seems like we have options:
              1) When the list loads, resave all to have a specific listId like -1
              2) Figure out where in the list the new entry was added and use the same next_work_day (seems wrong though)
               */
      const date = new Date()
      next_work_day = formatDateToYYYY_MM_DD(new Date(date.setMonth(date.getMonth() - 1)))
      //If listId is a date, return that I think
    } else if (!!Date.parse(item.listId) && isNaN(item.listId)) {
      //TODO: check to see if we even need to convert it
      next_work_day = formatDateToYYYY_MM_DD(item.listId)
      //If listId is a number, this is a user-created list
    } else if (Number.isInteger(Number(item.listId))) {
      //Only user-created lists have a listId set on task_user object
      user_task_list_id = item.listId
    }

    const task_id = uuid.v4()
    const task_user_id = uuid.v4()
    const task = { id: task_id, title: item.title, status: 'open' } //TODO: sort_order? maybe put at the top of the list?
    //const { id: task_id } = await this.createTask(task)
    const taskUser = {
      id: task_user_id,
      task_id,
      next_work_day,
      company_user_id: this.selectedCompanyUserId,
      user_task_list_id,
      sort_order: item.sort_order
    }
    //await this.createTaskUserVuex(taskUser)
    //this.$store.dispatch('ADD_ONE', { module: 'tasks', entity: task })
    this.$store
      .dispatch('task_users/createUserTask', {
        taskUser,
        task,
        ids_of_taskUsers_to_shift_up: ids_of_items_to_shift_up
      })
      .then(function() {
        // @ts-ignore
        const elements = document.querySelectorAll('[data-id="' + task_user_id + '"]')
        if (elements.length) {
          // @ts-ignore
          elements[0].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
          // @ts-ignore
          elements[0].focus()
        } else {
        }
      })
  }

  public async updateTaskUser({ id, task_id, title, listId, sort_order }: any) {
    if (this.currentListsBlockName !== this.listsBlockNames.TASKS_USERS) return
    const taskUser = cloneDeep(this.getTaskUserById(id)) //TODO: test this.$store.getters...

    taskUser.next_work_day = null
    taskUser.user_task_list_id = null

    if (listId === 'Past') {
      //TODO: see note on create function
      const date = new Date()
      taskUser.next_work_day = formatDateToYYYY_MM_DD(new Date(date.setMonth(date.getMonth() - 1)))

      //If listId is 'Unmarked' keep everything null
    } else if (listId === 'Unmarked') {
      //If listId is a date, set next_work_day
    } else if (!!Date.parse(listId) && isNaN(listId)) {
      taskUser.next_work_day = formatDateToYYYY_MM_DD(listId)

      //If listId is a number, this is a user-created list
    } else if (Number.isInteger(Number(listId))) {
      //Only user-created lists have a listId set on task_user object
      taskUser.user_task_list_id = listId
    }

    taskUser.sort_order = sort_order
    await this.$store.dispatch('UPDATE', { module: 'task_users', entity: taskUser })
    //TODO: why is updating a title mixed in with moving a task?
    /*const task = cloneDeep(this.$store.getters['tasks/getById'](task_id))
        if (task.title !== title) {
            task.title = title
            //TODO: maybe UPDATE_ATTRIBUTE instead of retrieving and updating
            this.$store.dispatch('UPDATE', {module: 'tasks', entity: task})
        }*/
  }

  public async deleteTaskUser(taskUser: any) {
    await this.$store.dispatch('DELETE', { module: 'task_users', entity: taskUser })
  }

  private trayClass() {
    return this.tray_expanded ? 'expanded' : ''
  }

  private trayToggle() {
    this.tray_expanded = this.tray_expanded === false
  }

  private onTaskTimerToggled(payload: ITaskTimerToggle) {
    const { taskId, timerId } = payload
    const RUNNING = 'running'

    const task = this.$store.getters['tasks/getById'](taskId)
    let timer = {
      task_id: taskId
    }
    if (task.project_id) {
      const project = this.$store.getters['projects/getById'](task.project_id)
      // @ts-ignore
      timer['project_id'] = project.id
    }
    let hasActiveTimer = this.$store.state.timers.timers.find((proj: any) => proj.task_id === taskId && proj.status === RUNNING)

    if (hasActiveTimer) {
      this.$store.dispatch('timers/stopTimer', hasActiveTimer)
      this.editedTaskId = taskId
      this.editedTaskTimerId = timerId
      return
    }

    const hasExistingTimer = this.$store.state.timers.timers.find((proj: any) => proj.task_id === taskId)

    if (hasExistingTimer) {
      this.$store.dispatch('timers/restartTimer', hasExistingTimer)
      return
    }

    this.$store.dispatch('timers/startTimer', timer)
    this.editedTaskId = taskId
    this.editedTaskTimerId = timerId
  }

  //TODO: pass only ids instead of whole objects?
  private updateTaskUserSortOrders(tasks: any): void {
    const parsedTasks = JSON.parse(tasks)
    this.$store.dispatch(
      'task_users/updateSortOrders',
      parsedTasks.map(({ id }: { id: number }) => id)
    )
  }

  private getCompanyUser() {
    const id = this.$store.state.settings.current_user_id
    // let user = this.sortedCompanyUsers.find((user: any) => user.user_id === 345)
    let user = this.sortedCompanyUsers.find((u: any) => u.user_id === id)

    this.selectedCompanyUserId = user.id
  }

  @Watch('selectedCompanyUserId')
  private changeRouteQueryParams(value: any) {
    if (!getCookie('auth_token')) return
    if (value) {
      // this.$router.push({ query: { user: value } }).catch(e => {})
      // will only delete the "task" in $router.query
      let query = Object.assign({}, this.$route.query)
      query.user = value
      // delete query.task
      this.$router.replace({ query }).catch(e => {})
    }
  }
  @Watch('sortedCompanyUsers')
  private onSortedCompanyUsersChanged(users: any, oldVal: any) {
    const query = this.$route.query.user

    if (oldVal.length === 0) {
      this.getCompanyUser()
    }

    if (query) {
      const user = users.find(({ id }: any) => id === +query)
      if (user && !this.selectedCompanyUserId) this.selectedCompanyUserId = user.id
    }
  }
  // mounted() {
  //   let companyUsers = this.sortedCompanyUsers

  //   // let result = companyUsers.find(async (user: any) => user.user_id === await getCookie('id'))

  // }
}
</script>

<style lang="scss">
#task-tray {
  width: 275px;
  height: calc(100vh - 50px);
  overflow-y: scroll;
  background-color: rgba(0, 0, 0, 0.6);
}
.task-tray-selection-box {
  align-self: center;
}
.task-tray-top-div {
  display: flex;
  top: 0;
  font-weight: bold;
  position: sticky;
  padding: 10px;
  z-index: 1;
  background-color: rgba($color: #000000, $alpha: 0.5);
}
.task-tray-draggable {
  width: 87%;
  align-self: center;
}
.task-tray-draggable .list__group {
  width: auto !important;
  padding: 0;
}
.task-tray-title {
  color: white;
  margin-right: 30px;
  // margin-top: 10px;
  // margin-left: 15px;
  // color: white;
  // font-weight: bold;
}
.task-tray-wrapper {
  display: flex;
  flex-direction: column;
  // align-items: center;
}

.task-tray-wrapper .list__wrapper > .list > .list__group {
  max-width: 100% !important;
  padding-right: 10px;
  justify-content: flex-start;
}

.task-tray-wrapper .list__wrapper .list {
  align-items: inherit !important;
}
</style>
