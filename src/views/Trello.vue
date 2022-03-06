<template>
  <div class="kanban-page">
    <b-container fluid>
      <b-row class="kanban-page-innerwrapper">
        <b-col class="client-section scroll-col">
          <div class="d-flex justify-content-center mb-3">
            <v-select v-model="selectedClient" label="name" :options="activeClients" style="width: 100px"></v-select>
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

            <div class="client-project-name" v-for="{ name, id, acronym } in clientProjects(client)" :key="id" @click="setProjectId(id)">
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
            <h4 class="kanban-page-title" v-if="selectedProjectId">
              {{ clientNameFromProject(selectedProjectId) }} -- {{ projectName(selectedProjectId) }}
              <b-icon icon="pencil" variant="info" @click="editProject(selectedProjectId)"></b-icon>
            </h4>
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
          </div>

          <pj-draggable :listsBlockName="listsBlockNames.PROJECTS" :data="selectedProjectTasksForStatusesColumns" :lists="taskPerStatusLists" :verticalAlignment="false" :selectedCompanyUserId="selectedCompanyUserId" @createItem="createTask" @update="updateTask" @delete="deleteTask" @updateSortOrders="updateTaskSortOrders" @setCurrentListsBlockName="currentListsBlockName = listsBlockNames.PROJECTS" />
        </b-col>
      </b-row>
    </b-container>
    <TaskDetails v-if="taskDetailsDisplayed" :taskId="editedTaskId" />
  </div>
</template>
<script>
import {cloneDeep, groupBy} from 'lodash'
import {formatDateToYYYY_MM_DD} from '@/utils/dateFunctions'
import TaskDetails from '@/components/draggable/TaskDetails.vue'
import {IProject} from '@/store/modules/projects/types'
import {ITask} from '@/store/modules/tasks/types'
import NewListForm from '@/components/draggable/NewListForm.vue'
import TaskTray from './TaskTray.vue'
import TimerTab from './TimerTab.vue'
import TaskSideBar from './TaskSideBar.vue'
import uuid from 'uuid'
import {colorThemes} from '@/mixins/colorThemes'
import {getCookie} from '@/utils/util-functions'
import {EventBus} from '@/components/event-bus'

const taskStatuses = ['open', 'in-progress', 'turned-in', 'completed', 'closed']


enum listsBlockNames = {
  'TASKS_USERS' = 'tasksUsers',
  'PROJECTS' = 'projects'
}

export default {
  // @Projects.State(state => state.selectedProjectId) public selectedProjectId!: string | number | null
  mixins: [colorThemes],
  components: {
    NewListForm,
    TaskDetails,
    TimerTab,
    TaskTray,
    TaskSideBar
  },
  computed: {
    client_users() {
      const clientReducer = (acc, client) => {
        for (const user of this.active_users) {
          if (this.clientUser(client.id, user.id)) {
            acc.push(this.clientUser(client.id, user.id))
          }
        }

        return acc
      }

      const client_users = this.selectedClient ? this.filteredClient.reduce(clientReducer, []) : this.activeClients.reduce(clientReducer, [])

      return client_users
    },
    active_users() {
      return this.$store.getters['company_users/getActive']
    },
    company_users() {
      return this.$store.state.company_users.company_users
    },
    project_involved_users() {
      let users = this.project_involved_user_ids.reduce((acc, id) => {
        let user = this.company_users.find((u) => u.id === id)

        if (user) {
          acc.push(user)
        }

        return acc
      }, [])
      return users
    },
    project_involved_user_ids() {
      // return 'test'
      let users = this.project_tasks.reduce((acc, task) => {
        for (const user of task.users) {
          acc.push(user.company_user_id)
        }

        return acc
      }, [])

      return [...new Set(users)]
    },
    project_tasks() {
      if (!this.selectedProjectId) return []

      this.$store.dispatch('tasks/getBoardTasksFromIDB', this.selectedProjectId)
      const tasks = this.$store.state.tasks.tasks_by_project
      console.log({tasks})
      return tasks
    },
    project_users() {
      if (!this.selectedProjectId) return []
      let users = this.$store.state.projects.projects.find(({id}) => id === this.selectedProjectId).users

      if (users) {
        const project_users = users.reduce((acc, user) => {
          let company_user = this.$store.state.company_users.company_users.find(({id}) => id === user.company_user_id)
          if (company_user) {
            acc.push(company_user)
          }
          return acc
        }, [])
        return project_users
      }

      return []
    },
    filteredClient() {
      return this.activeClients.filter((client) => {
        console.log(client.name.toLowerCase().indexOf(this.clientNameFilter.toLowerCase()))
        /* @ts-ignore */
        return client.id === this.selectedClient.id && client.name.toLowerCase().indexOf(this.clientNameFilter.toLowerCase()) !== -1
      })
    },
    listsBlockNames() {
      return listsBlockNames
    },
    isAdmin() {
      return this.$store.getters['settings/isAdmin']
    },
    lists() {
      return !this.selectedCompanyUserId ? [] : this.$store.getters['lists/getUserLists'](this.selectedCompanyUserId)
    },
    tasksUsers() {
      if (!this.selectedCompanyUserId) return []
      return this.$store.getters['task_users/sortedByDays'](this.selectedCompanyUserId)
    },
    sortedCompanyUsers() {
      return this.$store.getters['company_users/getActive']
    },
    activeClients() {
      return this.$store.state.clients.clients
        .filter((client) => {
          return client.status === 'lead' || client.status === 'new' || client.status === 'active'
        })
        .sort((a, b) => {
          if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
          if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
          return 0
        })
    },
    projectsByClientId() {
      const projects = this.$store.getters['projects/getUserProjects'](null)
      const listOfProjectsToDisplay = projects.filter(pr => pr.status === 'open').sort((a, b) => a.client_id - b.client_id)
      return groupBy(listOfProjectsToDisplay, 'client_id')
    },
    taskDetailsDisplayed() {
      return this.editedTaskId && this.editedTaskTimerId
    },
    current_company_user_id() {
      return this.$store.state.settings.current_company_user_id
    },
    selectedProjectTasksForStatusesColumns() {
      const projectTasks = this.$store.getters['tasks/getTaskByProjectId'](this.selectedProjectId)
      return projectTasks
        .map(({id, title, status, sort_order, temp}) => ({
          id,
          title,
          status,
          listId: status,
          sort_order,
          temp
        }))
        .sort(({sort_order: a}, {sort_order: b}) => a - b)
    },
    taskPerStatusLists() {
      return taskStatuses.map(status => ({
        title: status,
        id: status,
        group: status,
        initiallyExpanded: true
      }))
    }
  },
  data() {
    return {
      show_all_active_projects: false,
      editedTaskTimerId: null,
      editedTaskId: null,
      currentListsBlockName: null,
      project_search: '',
      selectedCompanyUserId: null,
      selectedClient: { id: null },
      clientNameFilter: '',
      pinnedProjects: []
    }
  },

  mounted() {
    alert('mounted')
  },
  methods: {
    setPinnedProject(id) {
      this.$store.dispatch('projects/pinProject', {id, userId: this.selectedCompanyUserId})
    },
    abbrName(name) {
      if (!name) return ''
      let matches = name.match(/\b(\w)/g) // ['J','S','O','N']
      if (matches) {
        let acronym = matches.join('') // JSON
        return acronym.toUpperCase()
      }
    },
    clientProjects(client) {
      return this.$store.state.projects.projects
        .filter((project) => {
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
        .sort((a, b) => {
          if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
          if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
          return 0
        })
    },

    clientName(client_id) {
      const client = this.$store.getters['clients/getById'](client_id)
      return client ? client.name : ''
    },

    clientNameFromProject(project_id) {
      const project = this.$store.getters['projects/getById'](project_id)
      const client = this.$store.getters['clients/getById'](project.client_id)
      return client ? client.name : ''
    },

    projectName(project_id) {
      const project = this.$store.getters['projects/getById'](project_id)
      return project ? project.name : ''
    },

    async createTask({item, ids_of_items_to_shift_up}) {
      console.log('CREATE TASK CUSTOM')

      this.$store.dispatch('tasks/createProjectTask', {
        title: item.title,
        project_id: this.selectedProjectId,
        sort_order: item.sort_order,
        status: item.status,
        temp: false
      })
    },

    deleteTask(task) {
      this.$store.dispatch('DELETE', {module: 'tasks', entity: task})
    },

    //TODO: rename as move project task
    updateTask(task) {
      console.log('************* Custom updateTask *************', task)
      task.status = task.listId
      delete task.listId
      delete task.user_task_list_id
      if (this.currentListsBlockName !== this.listsBlockNames.PROJECTS) return
      this.$store.dispatch('UPDATE', {module: 'tasks', entity: task})
    },

    clientUser(client_id, company_user_id) {
      return this.$store.getters['client_users/getByClientIdAndCompanyUserId']({client_id, company_user_id})
    },

    clientVisible(client) {
      const client_user = this.$store.getters['client_users/getByClientIdAndCompanyUserId']({
        client_id: client.id,
        company_user_id: this.current_company_user_id
      })
      //console.log(client_user)
      return true
    },
    //TODO: pass only ids instead of whole objects?
    updateTaskSortOrders(tasks) {
      const parsedTasks = JSON.parse(tasks)
      this.$store.dispatch(
        'tasks/updateSortOrders',
        parsedTasks.map(({id}) => id)
      )
    },

    onTaskTimerToggled(payload) {
      const {taskId, timerId} = payload
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
    },
    editProject(project_id) {
      let project = this.$store.getters['projects/getById'](project_id)
      this.$store.commit('settings/setCurrentEditProject', cloneDeep(project))
      this.$store.commit('settings/setCurrentEditProjectStatus', 'edit')
    },

    async addProject(client) {
      await this.$router.push({query: {new_project_client_company_id: client.client_company_id}})
      this.$store.state.settings.current_edit_project = {id: uuid.v4()}
      this.$store.commit('settings/setCurrentEditProjectStatus', 'add')
      this.$store.dispatch('settings/openModal', 'project')
    },

    editClient(client_id) {
      console.log('edit client')
      let client = this.$store.getters['clients/getById'](client_id)
      this.$store.commit('settings/setCurrentEditCompanyClient', cloneDeep(client))
    },

    editTask(task_id) {
      let task = this.$store.getters['tasks/getById'](task_id)
      console.log('editing task: ', task)
      this.$store.commit('settings/setCurrentEditTask', cloneDeep(task))
      //this.$store.dispatch('settings/openModal', {modal: 'task', id: task_id})
    }
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
  height: calc(100vh - 50px);
  overflow-x: auto;
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
  height: calc(100vh - 40px);
  overflow-y: auto;
}

/* .custom-width {
      width: 50% !important;
    } */
.kanban-page-title {
  color: white;
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
