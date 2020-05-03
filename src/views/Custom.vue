<template>
  <div>
    Project Filter: <input v-model="project_search" /> <input type="checkbox" v-model="show_all_active_projects" /> Show all active projects
    <hr />
    <b-container fluid>
      <b-row>
        <b-col cols="5" class="scroll-col">
          <div v-if="clientVisible(client)" v-for="client in activeClients">
            <!--            Todo: change client id to client name-->
            <div style="background: #666666; color: white; padding-left: 5px; text-transform: uppercase">{{ client.name }} <b-icon icon="pencil" variant="info" @click="editClient(client.id)"></b-icon></div>
            <div v-for="{ name, id } in openClientProjects(client)">
              <div @click="setPinnedProject(id)" class="project-item__status">
                <img src="@/assets/img/star-pin.svg" alt="star-unpin" v-if="!!pinnedProjects.find(project => project === id)" />
                <img src="@/assets/img/star-unpin.svg" alt="star-pin" v-else />
              </div>
              <div class="project-item__name" @click="setProjectId(id)">
                {{ name }}
              </div>
            </div>
          </div>
        </b-col>
        <b-col v-if="selectedProjectId" cols="6">
          <h4 v-if="selectedProjectId">{{ clientNameFromProject(selectedProjectId) }} -- {{ projectName(selectedProjectId) }} <b-icon icon="pencil" variant="info" @click="editProject(selectedProjectId)"></b-icon></h4>
          <pj-draggable :listsBlockName="listsBlockNames.PROJECTS" :data="selectedProjectTasksForStatusesColumns" :lists="taskPerStatusLists" :verticalAlignment="false" :selectedCompanyUserId="selectedCompanyUserId" @createItem="createTask" @update="updateTask" @delete="deleteTask" @updateSortOrders="updateTaskSortOrders" @setCurrentListsBlockName="currentListsBlockName = listsBlockNames.PROJECTS" />
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
import TimerTab from './TimerTab.vue'
import uuid from 'uuid'

const CompanyClients = namespace('clients')
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
  @Projects.State(state => state.selectedProjectId) public selectedProjectId!: string | number | null
  @Projects.State(state => state.pinnedProjects)
  public pinnedProjects!: number[]
  @TaskUsers.Getter('getById') private getTaskUserById!: any
  @TaskUsers.Getter private sortedByDays!: any
  @TaskUsers.Action('createTaskUser') private createTaskUserVuex!: any
  @TaskUsers.Action('updateTaskUser') private updateTaskUserVuex!: any
  @TaskUsers.Action('deleteTaskUser') private deleteTaskUserVuex!: any
  @TaskUsers.Action('updateSortOrders')
  private updateTaskUsersSortOrdersVuex!: any
  @Tasks.Action('createTask') private createTaskVuex!: any
  @Tasks.Action('updateTask') private updateTaskVuex!: any
  @Tasks.Action('deleteTask') private deleteTaskVuex!: any
  @Tasks.Action('updateSortOrders') private updateTaskSortOrdersVuex!: any
  @Tasks.Getter('getById') private getTaskById!: any
  @Tasks.Getter('getByProjectId') private getTaskByProjectId!: any
  @Lists.Getter private getUserLists!: any
  @Projects.Getter private getUserProjects!: any

  private show_all_active_projects: boolean = false
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

  public clientName(client_id: any) {
    const client = this.$store.getters['clients/getById'](client_id)
    return client ? client.name : ''
  }

  public clientNameFromProject(project_id: any) {
    const project = this.$store.getters['projects/getById'](project_id)
    const client = this.$store.getters['clients/getById'](project.client_id)
    return client ? client.name : ''
  }

  public projectName(project_id: any) {
    const project = this.$store.getters['projects/getById'](project_id)
    return project ? project.name : ''
  }

  public async createTask({ item, ids_of_items_to_shift_up }: any) {
    console.log('CREATE TASK CUSTOM')
    item.project_id = this.selectedProjectId

    console.log(item)
    this.$store.dispatch('ADD_ONE', { module: 'tasks', entity: item })
  }

  //TODO: rename as move project task
  public updateTask(task: any) {
    console.log('************* Custom updateTask *************', task)
    task.status = task.listId
    if (this.currentListsBlockName !== this.listsBlockNames.PROJECTS) return
    this.$store.dispatch('UPDATE', { module: 'tasks', entity: task })
  }

  public deleteTask(task: any) {
    this.$store.dispatch('DELETE', { module: 'tasks', entity: task })
  }

  private clientVisible(client: any) {
    const client_user = this.$store.getters['client_users/getByClientIdAndCompanyUserId']({ client_id: client.id, company_user_id: this.current_company_user_id })
    console.log(client_user)
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
    console.log('edit project')
    let project = this.$store.getters['projects/getById'](project_id)
    this.$store.commit('settings/setCurrentEditProject', cloneDeep(project))
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
