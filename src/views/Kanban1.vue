<template>
  <div class="kanban-page">
    <b-container fluid class="overflow-hidden">
      <b-row class="kanban-page-innerwrapper">
        <b-col class="client-section scroll-col">
          <div class="d-flex justify-content-center mb-3">
            <v-select v-model="selectedClient" label="name" :options="activeClients" style="width: 100px"> </v-select>
          </div>

          <div class="client-name">
            <span class="mr-2">Shared Project</span>
          </div>

          <div class="client-project-name" v-for="{ name, id, acronym } in sharedProjects" :key="id" @click="setSharedProjectId(id)">
            <!-- <div @click="setPinnedProject(id)" class="project-item-status">
              <img src="@/assets/img/star-pin.svg" alt="star-unpin" v-if="!!pinnedProjects.find(project => project === id)" />
              <img src="@/assets/img/star-unpin.svg" alt="star-pin" v-else />
            </div> -->
            <p style="margin-bottom: 0 !important">
              <!-- <span class="client-section-acronym" :style="{ 'background-color': client.color }" v-if="acronym">{{ acronym }}</span> -->
              <span class="client-project-name__name">{{ name }}</span>
            </p>
          </div>

          <div v-if="clientVisible(client)" v-for="(client, index) in selectedClient.id ? filteredClient : activeClients" :key="index">
            <div class="client-name">
              <span class="mr-2">{{ client.name }}</span>
              <b-icon class="pointer mr-2" v-if="isAdmin" icon="pencil" variant="info" @click="editClient(client.id)"></b-icon>
              <div class="add-client">
                <i class="icon-add pointer" :style="{ color: default_theme_color }" @click="addProject(client)" />
              </div>
            </div>

            <div class="d-flex align-items-center pl-1">
              <div class="d-flex" v-for="(user, user_index) in client_users.filter(({ client_id }) => client_id === client.id)" :key="user.id">
                <span v-if="user_index < 5" v-b-tooltip.hover :title="company_users.filter(c_user => c_user.id === user.company_user_id)[0].name" class="avatar mr-1 pointer" :style="{ 'background-color': company_users.filter(c_user => c_user.id === user.company_user_id)[0].color }">
                  {{ abbrName(company_users.filter(c_user => c_user.id === user.company_user_id)[0].name) }}
                </span>

                <span v-if="client_users.filter(({ client_id }) => client_id === client.id) && client_users.filter(({ client_id }) => client_id === client.id).length > 5 && user_index - 1 === client_users.filter(({ client_id }) => client_id === client.id).length" class="avatar pointer" ref="client_user_names" style="background-color: rgba(0, 0, 0, 0.2); color: rgba(0, 0, 0, 0.6); border: 1.5px dashed;"> + {{ client_users.filter(({ client_id }) => client_id === client.id) - 5 }} </span>
              </div>

              <b-tooltip :target="() => $refs['client_user_names']" placement="right" v-if="company_users && company_users.length">
                <div class="d-flex flex-column align-items-start">
                  <span v-for="(user, user_index) in client_users.filter(({ client_id }) => client_id === client.id)" :key="user.id" v-show="user_index >= 5">
                    {{ company_users.filter(c_user => c_user.id === user.company_user_id)[0].name }}
                  </span>
                </div>
              </b-tooltip>
            </div>

            <div class="client-project-name" v-for="{ name, id, acronym } in clientProjects(client)" :key="id" @click="setRegularProjectId(id)">
              <div @click="setPinnedProject(id)" class="project-item-status">
                <img src="@/assets/img/star-pin.svg" alt="star-unpin" v-if="!!pinnedProjects.find(project => project === id)" />
                <img src="@/assets/img/star-unpin.svg" alt="star-pin" v-else />
              </div>
              <p style="margin-bottom: 0 !important">
                <span class="client-section-acronym" :style="{ 'background-color': client.color }" v-if="acronym">{{ acronym }}</span>
                <span class="client-project-name__name">{{ name }}</span>
              </p>
            </div>
          </div>
        </b-col>

        <b-col v-if="selectedProjectId" class="kanban-draggable custom-width">
          <div class="kanban_title-part mb-1">
            <h4 class="kanban-page-title" v-if="selectedProjectId">{{ clientNameFromProject(selectedProjectId) }} -- {{ projectName(selectedProjectId) }} <b-icon icon="pencil" variant="info" @click="editProject(selectedProjectId)"></b-icon></h4>
            <div class="d-flex flex-column ml-3" v-if="project_users && project_users.length">
              <span class="avatar-titles ml-1">Project Users:</span>
              <div class="d-flex align-items-center pl-1">
                <div v-for="(user, user_index) in project_users" :key="user.id">
                  <span v-if="user_index < 5" v-b-tooltip.hover :title="user.fullname || user.name" class="avatar mr-1 pointer" :style="{ 'background-color': user.color }">
                    {{ abbrName(user.name) }}
                  </span>
                </div>
                <span v-if="project_users.length > 5" class="avatar pointer" ref="project_users_avatar" style="background-color: rgba(0, 0, 0, 0.2); color: rgba(0, 0, 0, 0.6); border: 1.5px dashed;"> +{{ project_users.length - 5 }} </span>
                <b-tooltip :target="() => $refs['project_users_avatar']" placement="right">
                  <div class="d-flex flex-column align-items-start">
                    <span v-for="(user, user_index) in project_users" :key="user.id" v-show="user_index >= 5">
                      {{ user.fullname || user.name }}
                    </span>
                  </div>
                </b-tooltip>
              </div>
            </div>
            <div class="d-flex flex-column  ml-3" v-if="project_involved_users && project_involved_users.length">
              <span class="avatar-titles ml-1">All Involved Users:</span>
              <div class="d-flex align-items-center pl-1">
                <div v-for="(user, user_index) in project_involved_users" :key="user.id">
                  <span v-if="user_index < 5" v-b-tooltip.hover :title="user.fullname || user.name" class="avatar mr-1 pointer" :style="{ 'background-color': user.color }">
                    {{ abbrName(user.name) }}
                  </span>
                </div>
                <span v-if="project_involved_users.length > 5" class="avatar pointer" ref="involved_users_avatar" style="background-color: rgba(0, 0, 0, 0.2); color: rgba(0, 0, 0, 0.6); border: 1.5px dashed;"> +{{ project_involved_users.length - 5 }} </span>
                <b-tooltip :target="() => $refs['involved_users_avatar']" placement="right">
                  <div class="d-flex flex-column align-items-start">
                    <span v-for="(user, user_index) in project_involved_users" :key="user.id" v-show="user_index >= 5">
                      {{ user.fullname || user.name }}
                    </span>
                  </div>
                </b-tooltip>
              </div>
            </div>
            <button class="btn btn-primary mx-2" v-if="!is_shared_project" @click="shareWithClient()">Share with client</button>
          </div>

          <pj-draggable1 :listsBlockName="listsBlockNames.PROJECTS" :projectColumns="selectedProjectTasksForStatusesColumns" :lists="taskPerStatusLists" :verticalAlignment="false" :selectedCompanyUserId="selectedCompanyUserId" :project_id="selectedProjectId" @createItem="createTask" @update="updateTask" @delete="deleteTask" @updateSortOrders="updateTaskSortOrders" @setCurrentListsBlockName="currentListsBlockName = listsBlockNames.PROJECTS" :is_shared_project="is_shared_project" />
        </b-col>
      </b-row>
    </b-container>
    <TaskDetails v-if="taskDetailsDisplayed" :taskId="editedTaskId" />
    <b-modal ref="taskEditModal" id="task-card-edit" v-model="showShareModal" class="task-edit-modal" style="min-height: 500px" :size="'lg'" v-if="selectedProjectId">
      <template #modal-header>
        <div class="header">
          <h2 class="d-flex justify-content-between title">Share "{{ projectName(selectedProjectId) }}"</h2>
        </div>
      </template>
      <div no-body>
        <b-form-input v-model="client_email" type="email" placeholder="Add client's email"></b-form-input>
      </div>
      <div slot="modal-footer" class="w-100">
        <div class="w-100">
          <b-button variant="outline-primary" size="sm" class="float-left" @click="copyShareLink">
            Copy link
          </b-button>
          <b-button variant="primary" size="sm" class="float-right" @click="shareProject">
            Done
          </b-button>
        </div>
      </div>
    </b-modal>
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
import TaskTray from './TaskTray.vue'
import TimerTab from './TimerTab.vue'
import TaskSideBar from './TaskSideBar.vue'
import uuid from 'uuid'
import { colorThemes } from '@/mixins/colorThemes'
import { getCookie } from '@/utils/util-functions'
// import { EventBus } from '@/components/event-bus'
import { deleteDB } from 'idb'

const CompanyClients = namespace('clients')
const CompanyUsers = namespace('company_users')
const TaskUsers = namespace('task_users')
const Tasks = namespace('tasks')
const Lists = namespace('lists')
const Projects = namespace('projects')
const SharedProjects = namespace('shared_projects')

const taskStatuses = ['backlog', 'in-progress', 'turned-in', 'completed', 'closed']

interface ITaskTimerToggle {
  taskId: number | string
  timerId: number | string | null
}

enum listsBlockNames {
  'TASKS_USERS' = 'tasksUsers',
  'PROJECTS' = 'projects'
}

@Component({
  mixins: [colorThemes],
  components: {
    NewListForm,
    TaskDetails,
    TimerTab,
    TaskTray,
    TaskSideBar
  }
})
export default class Custom extends Vue {
  @Projects.Mutation('projects/SET_SELECTED_PROJECT') public setProjectId!: any
  @Projects.Action public pinProject!: any
  @Projects.State(state => state.selectedProjectId) public selectedProjectId!: string | number | null
  @Projects.State(state => state.pinnedProjects)

  // @SharedProjects.Mutation('shared_projects/SET_SELECTED_PROJECT') public setSharedProjectId!: any
  // @SharedProjects.State(state => state.selectedProjectId) public selectedSharedProjectId!: string | number | null
  // @SharedProjects.Action public pinProject!: any
  // @SharedProjects.State(state => state.pinnedProjects)
  public pinnedProjects!: number[]
  private showTask: boolean = true
  private showTimer: boolean = true
  private showChat: boolean = false
  private selectedClient: object = { id: null }
  private clientNameFilter: string = ''
  public showShareModal: boolean = false
  public client_email: string = ''

  get client_users() {
    const clientReducer = (acc: any, client: any) => {
      for (const user of this.active_users) {
        if (this.clientUser(client.id, user.id)) {
          acc.push(this.clientUser(client.id, user.id))
        }
      }

      return acc
    }

    const client_users = this.selectedClient ? this.filteredClient.reduce(clientReducer, []) : this.activeClients.reduce(clientReducer, [])

    return client_users
  }

  get active_users() {
    return this.$store.getters['company_users/getActive']
  }

  get company_users() {
    return this.$store.state.company_users.company_users
  }

  get project_involved_users() {
    let users = this.project_involved_user_ids.reduce((acc: any, id: any) => {
      let user = this.company_users.find((u: any) => u.id === id)

      if (user) {
        acc.push(user)
      }

      return acc
    }, [])
    return users
  }

  get project_involved_user_ids() {
    // return 'test'
    let users = this.project_tasks.reduce((acc: any, task: any) => {
      for (const user of task.users) {
        acc.push(user.company_user_id)
      }

      return acc
    }, [])

    return [...new Set(users)]
  }

  get project_tasks() {
    if (!this.selectedProjectId) return []

    this.$store.dispatch('tasks/getBoardTasksFromIDB', this.selectedProjectId)
    const tasks = this.$store.state.tasks.tasks_by_project
    // console.log({tasks})
    return tasks
  }

  get project_users() {
    if (!this.selectedProjectId) return []
    let users = []
    if (this.is_shared_project) {
      // users = this.$store.state.shared_projects.shared_projects.find(({ id }: any) => id === this.selectedProjectId).users
      return []
    }
    users = this.$store.state.projects.projects.find(({ id }: any) => id === this.selectedProjectId).users

    if (users) {
      const project_users = users.reduce((acc: any, user: any) => {
        let company_user = this.$store.state.company_users.company_users.find(({ id }: any) => id === user.company_user_id)
        if (company_user) {
          acc.push(company_user)
        }
        return acc
      }, [])
      return project_users
    }

    return []
  }

  get filteredClient() {
    return this.activeClients.filter((client: any) => {
      console.log(client.name.toLowerCase().indexOf(this.clientNameFilter.toLowerCase()))
      /* @ts-ignore */
      return client.id === this.selectedClient.id && client.name.toLowerCase().indexOf(this.clientNameFilter.toLowerCase()) !== -1
    })
  }

  get listsBlockNames() {
    return listsBlockNames
  }
  get isAdmin() {
    return this.$store.getters['settings/isAdmin']
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
        return client.status === 'lead' || client.status === 'new' || client.status === 'active'
      })
      .sort((a: any, b: any) => {
        if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
        if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
        return 0
      })
  }

  get projectsByClientId() {
    const projects: IProject[] = this.getUserProjects(null)
    const listOfProjectsToDisplay = projects.filter(pr => pr.status === 'open').sort((a, b) => a.client_id - b.client_id)
    return groupBy(listOfProjectsToDisplay, 'client_id')
  }
  get taskDetailsDisplayed() {
    return this.editedTaskId && this.editedTaskTimerId
  }

  get current_company_user_id() {
    return this.$store.state.settings.current_company_user_id
  }
  get selectedProjectTasksForStatusesColumns() {
    console.log('here')
    // const projectTasks = this.getTaskByProjectId(this.selectedProjectId)
    // const task_list = this.getTaskListByProjectId(this.selectedProjectId)
    const projectTasks = this.$store.getters['tasks/getByProjectId'](this.selectedProjectId)
    const task_list = this.$store.getters['projects/getTaskListByProjectId'](this.selectedProjectId)

    if (task_list.length > 0) {
      let columns = new Array(task_list.length)
      for (let i = 0; i < task_list.length; i++) {
        const list = task_list[i]
        let tasks = projectTasks.filter((task: ITask) => list.tasks.indexOf(task.id) >= 0)
        tasks = [...tasks].sort(({ id: task_a_id }: any, { id: task_b_id }: any) => (list.tasks.indexOf(task_a_id) > list.tasks.indexOf(task_b_id) ? 1 : -1))

        columns[i] = {
          title: list.title,
          // idList: list.id,
          tasks: tasks
        }
      }
      return columns
    } else {
      let tasks = projectTasks
        .map(({ id, title, status, sort_order, temp, idList, labels, detail, due_date, assignedMembers }: ITask) => ({
          id,
          title,
          status,
          listId: status,
          sort_order,
          temp,
          idList: idList || 'backlog',
          labels,
          detail,
          due_date,
          assignedMembers
        }))
        .sort(({ sort_order: a }: any, { sort_order: b }: any) => a - b)

      let columns = [
        {
          title: 'Backlog',
          tasks: tasks
        }
      ]
      return columns
    }
  }

  get taskPerStatusLists() {
    return []

    if (this.$store.state.lists.lists.length > 0) {
      return this.$store.state.lists.lists
    }

    return taskStatuses.map(status => ({
      title: status,
      id: status,
      group: status,
      initiallyExpanded: true
    }))
  }

  get sharedProjects() {
    const shared_projects = this.$store.getters['shared_projects/openprojects']()
    return shared_projects
  }

  mounted() {}

  @TaskUsers.Getter('getById') private getTaskUserById!: any
  @TaskUsers.Getter private sortedByDays!: any
  @TaskUsers.Action('createTaskUser') private createTaskUserVuex!: any
  @TaskUsers.Action('updateTaskUser') private updateTaskUserVuex!: any
  @TaskUsers.Action('updateSortOrders')
  private updateTaskUsersSortOrdersVuex!: any
  @Tasks.Action('createTask') private createTaskVuex!: any
  @Tasks.Action('createProjectTaskWithTaskList') private createProjectTaskVuex!: any
  @Tasks.Action('updateTask') private updateTaskVuex!: any
  @Tasks.Action('updateSortOrders') private updateTaskSortOrdersVuex!: any
  @Tasks.Getter('getById') private getTaskById!: any
  @Tasks.Getter('getByProjectId') private getTaskByProjectId!: any
  @Lists.Getter private getUserLists!: any
  @Projects.Getter private getUserProjects!: any
  @Projects.Getter private getTaskListByProjectId!: any

  private show_all_active_projects: boolean = false
  private editedTaskTimerId: number | string | null = null
  private editedTaskId: number | string | null = null
  private currentListsBlockName: string | null = null
  private project_search: string = ''

  private selectedCompanyUserId: any = null

  private is_shared_project: boolean = false

  public setSharedProjectId(id: any) {
    this.is_shared_project = true
    this.setProjectId(id)
  }
  public setRegularProjectId(id: any) {
    this.is_shared_project = false
    this.setProjectId(id)
  }

  public setPinnedProject(id: number) {
    this.pinProject({ id, userId: this.selectedCompanyUserId })
  }

  public abbrName(name: any) {
    if (!name) return ''
    let matches = name.match(/\b(\w)/g) // ['J','S','O','N']
    if (matches) {
      let acronym = matches.join('') // JSON
      return acronym.toUpperCase()
    }
  }

  public clientProjects(client: any) {
    return this.$store.state.projects.projects
      .filter((project: any) => {
        if (this.project_search && project.name.toLowerCase().indexOf(this.project_search.toLowerCase()) === -1 && client.name.toLowerCase().indexOf(this.project_search.toLowerCase()) === -1) {
          return false
        }
        if (project.status !== 'open') return false
        if (project.client_company_id !== client.client_company_id) return false
        if (!this.show_all_active_projects) {
          let project_user = this.$store.getters['project_users/getByProjectIdAndUserId'](project.id, this.current_company_user_id)
          return project_user !== 'undefined'
        }
        return true
      })
      .sort((a: any, b: any) => {
        if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
        if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
        return 0
      })
  }

  public makeToast(variant: any, title: string, content: string) {
    this.$bvToast.toast(content, {
      title: title,
      // @ts-ignore
      variant: variant
    })
  }

  public copyShareLink() {
    navigator.clipboard.writeText(`${document.location.origin}/shared-project/${this.selectedProjectId}`)
    this.makeToast('success', 'Success', 'Copied Successfully')
  }
  public shareWithClient() {
    this.showShareModal = true
  }
  public async shareProject() {
    if (this.client_email) {
      // @ts-ignore
      const result = await this.$http().post('/projects/share', { project_id: this.selectedProjectId, client_email: this.client_email })
      if (result.message == 'Success') {
        this.makeToast('success', 'Success', 'Invited the client successfully')
      } else {
        this.makeToast('error', 'Error', result.message)
      }
      this.client_email = ''
    }
    this.showShareModal = false
  }
  // public clientProjectUsers(projects: any) {
  //   const project_users = projects.reduce((acc:any, project:any) => {

  //     for (const users of project) {
  //       if(users.length) {
  //         acc.push(users)
  //       }
  //     }

  //     return acc
  //   }, [])

  //   return project_users
  // }

  public clientName(client_id: any) {
    const client = this.$store.getters['clients/getById'](client_id)
    return client ? client.name : ''
  }

  public clientNameFromProject(project_id: any) {
    if (this.is_shared_project) {
      return ''
    }
    const project = this.$store.getters['projects/getById'](project_id)
    const client = this.$store.getters['clients/getById'](project.client_id)
    return client ? client.name : ''
  }

  public projectName(project_id: any) {
    let project = this.$store.getters['projects/getById'](project_id)
    if (this.is_shared_project) {
      project = this.$store.getters['shared_projects/getById'](project_id)
    }
    return project ? project.name : ''
  }

  public async createTask(task: any) {
    console.log('CREATE TASK CUSTOM')

    this.createProjectTaskVuex({
      task: {
        // title: title,
        ...task.task,
        project_id: this.selectedProjectId,
        // sort_order: item.sort_order,
        // status: item.status,
        status: 'open',
        temp: false
        // idList: idList,
        // assignedMembers: assignedMembers
      },
      task_list: task.task_list
    })
  }

  public deleteTask(task: any) {
    this.$store.dispatch('DELETE', { module: 'tasks', entity: task })
  }

  //TODO: rename as move project task
  public updateTask(task: any) {
    console.log('************* Custom updateTask *************', task)
    task.status = task.listId
    delete task.listId
    delete task.user_task_list_id
    if (this.currentListsBlockName !== this.listsBlockNames.PROJECTS) return
    this.$store.dispatch('UPDATE', { module: 'tasks', entity: task })
  }

  private clientUser(client_id: any, company_user_id: any) {
    return this.$store.getters['client_users/getByClientIdAndCompanyUserId']({ client_id, company_user_id })
  }

  private clientVisible(client: any) {
    const client_user = this.$store.getters['client_users/getByClientIdAndCompanyUserId']({ client_id: client.id, company_user_id: this.current_company_user_id })
    //console.log(client_user)
    return true
  }
  //TODO: pass only ids instead of whole objects?
  private updateTaskSortOrders(tasks: any): void {
    const parsedTasks = JSON.parse(tasks)
    this.$store.dispatch(
      'tasks/updateSortOrders',
      parsedTasks.map(({ id }: { id: string }) => id)
    )
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

  private editProject(project_id: any) {
    let project = this.$store.getters['projects/getById'](project_id)
    this.$store.commit('settings/setCurrentEditProject', cloneDeep(project))
    this.$store.commit('settings/setCurrentEditProjectStatus', 'edit')
  }

  private async addProject(client: any) {
    await this.$router.push({ query: { new_project_client_company_id: client.client_company_id } })
    this.$store.state.settings.current_edit_project = { id: uuid.v4() }
    this.$store.commit('settings/setCurrentEditProjectStatus', 'add')
    this.$store.dispatch('settings/openModal', 'project')
  }

  private editClient(client_id: any) {
    console.log('edit client')
    let client = this.$store.getters['clients/getById'](client_id)
    this.$store.commit('settings/setCurrentEditCompanyClient', cloneDeep(client))
  }

  private editTask(task_id: any) {
    let task = this.$store.getters['tasks/getById'](task_id)
    console.log('editing task: ', task)
    this.$store.commit('settings/setCurrentEditTask', cloneDeep(task))
    //this.$store.dispatch('settings/openModal', {modal: 'task', id: task_id})
  }

  created() {
    // EventBus.$on('toggle_tasks', () => {
    //   this.showTask = !this.showTask
    // })
    // EventBus.$on('toggle_timers', () => {
    //   this.showTimer = !this.showTimer
    // })
    // EventBus.$on('toggle_chat', () => {
    //   this.showChat = !this.showChat
    // })
  }
}
</script>
<style lang="scss">
.add-client {
  width: 20px;
  height: 20px;
  background-color: rgba($color: #000000, $alpha: 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50px;
  font-size: 16px;
}
.kanban_title-part {
  display: flex;
  // justify-content: space-between;
  /* border: 1px solid red;
  padding: 0 5px; */
}
.kanban-page {
  /* background-color: rgba(0, 0, 0, 0.3); */
  overflow-y: initial;
}
.kanban-draggable {
  width: 100px;
  height: calc(100vh - 77px);
  overflow-x: hidden;
  overflow-y: hidden;
}
.client-section-acronym {
  /* display: flex;
  align-items: center;
  justify-content: center; */
  color: white;
  font-size: 10px;
  white-space: nowrap;
  padding: 5px 5px;
  margin-right: 5px;
}
.kanban-page-innerwrapper {
  display: flex;
  justify-content: space-between;
}
</style>

<style scoped>
.avatar-titles {
  font-size: 10px;
  font-weight: 600;
}
.pointer {
  cursor: pointer;
}
.client-section {
  /* max-width: 350px; */
  max-width: 240px;
  /* border: 5px solid red; */
  flex-grow: 0 !important;
  flex-basis: 260px !important;
  padding-top: 10px;
  overflow-y: scroll;
  overflow-x: hidden;
  height: calc(100vh - 50px) !important;
  background-color: rgba(0, 0, 0, 0.4);
}
.project-item-status {
}
.scroll-col {
  height: calc(100vh - 50px);
  overflow-y: auto;
}
/* .custom-width {
  width: 50% !important;
} */
.kanban-page-title {
  color: white;
  margin-bottom: 0px;
}
.client-name {
  display: flex;
  font-weight: bold;
  font-size: 15px;
  text-transform: uppercase;
  color: white;
}
.client-project-name {
  padding: 5px 0;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: flex-start;
}
.client-project-name:hover {
  background-color: rgba(0, 0, 0, 0.2);
  cursor: pointer;
}
.client-project-name__name {
  width: 100%;
  height: 100%;
  color: white;
}
</style>
