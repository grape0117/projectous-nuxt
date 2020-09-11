<template>
  <div id="app" style="position: relative">
    <main style="flex-grow: 1">
      <div class="row-no-padding">
        <Header />
        <router-view />
      </div>
    </main>

    <task-modal />
    <edit-client-modal id="edit-client-modal" />
    <edit-user-modal id="edit-user-modal" />
    <invite-user-modal id="invite-user-modal" />
    <edit-timer-modal id="edit-timer-modal" />
    <edit-project-modal id="edit-project-modal" />

    <div id="update-data-button" @click="storeDataInIndexedDb" />

    <!-- <b-nav vertical>
        <b-navbar-brand to="/">Projectous</b-navbar-brand>
        <b-nav-item to="/tasks">Tasks</b-nav-item>
        <b-nav-item to="/projects">Projects</b-nav-item>
        <b-nav-item to="/clients">Clients</b-nav-item>
        <b-nav-item to="/users">Users</b-nav-item>
        <b-nav-item to="/profile">Profile</b-nav-item>
        <b-nav-item to="/logout">Log Out</b-nav-item>
      </b-nav> -->
  </div>
</template>

<script>
import '@/assets/icons/fontello/css/fontello.css'

import Header from '@/components/Header.vue'

import TimerTab from './views/TimerTab'
import EditClientModal from './views/EditClientModal.vue'
import EditUserModal from './views/EditUserModal'
import InviteUserModal from './views/InviteUserModal'
import EditTaskModal from './views/EditTaskModal'
import EditTimerModal from './views/EditTimerModal'
import EditProjectModal from './views/EditProjectModal'
import { createListsByDays, createUserLists, getCookie } from '@/utils/util-functions'
import Vue from 'vue'
import { idbKeyval, idbGetAll } from '@/plugins/idb.ts'
import { modulesNames, modulesNamesList } from './store/modules-names'
import TaskTray from './views/TaskTray'
import uuid from 'uuid'
import AllTaskFilipTemplate from './views/AllTaskFilipTemplate'
import { EventBus } from '@/components/event-bus'

export default {
  components: {
    Header,
    AllTaskFilipTemplate,
    TimerTab,
    TaskTray,
    EditClientModal,
    EditUserModal,
    InviteUserModal,
    EditTaskModal,
    EditTimerModal,
    EditProjectModal
  },
  data() {
    return {
      showTask: true,
      showTimer: true
    }
  },
  computed: {
    current_edit_task: function() {
      return this.$store.getters['settings/get_current_edit_task']
    },
    current_edit_project: function() {
      console.log('cureent edit projec')
      return this.$store.getters['settings/get_current_edit_project']
    }
  },
  watch: {
    current_edit_task: function(value) {
      alert('watched!')
      if (this.current_edit_task.id) {
        this.$bvModal.show('task-modal')
      } else {
        this.$bvModal.hide('task-modal')
      }
    },
    current_edit_project: function(value) {
      alert('watched!')
      if (this.current_edit_project.id) {
        this.$bvModal.show('project-modal')
      } else {
        this.$bvModal.hide('project-modal')
      }
    },
    current_edit_client: function(value) {
      alert('watched!')
      if (this.current_edit_project.id) {
        this.$bvModal.show('client-modal')
      } else {
        this.$bvModal.hide('client-modal')
      }
    },
    '$route.path': {
      handler(newRoute, oldRoute) {
        if (oldRoute === '/login') {
          this.getAppData()
        }
      },
      deep: true
    }
  },
  async mounted() {
    /**
     * We want every modal hide to check to see if another modal should be displayed.
     */
    //Make bvModal available in vuex store -- complaint department is =>
    window.$_app = this
    //Add trigger on modal hidden
    this.$root.$on('bv::modal::hidden', () => {
      this.$store.dispatch('settings/closedModal')
    })

    /**
     * Each tab / instance needs a unique indentifier
     */
    this.$store.state.settings.instance_id = uuid.v4()

    /**
     * Polling for new data TODO: long polling or websocket. If websocket, make sure it resumes easily.
     */
    if (getCookie('auth_token')) {
      await this.getAppData()
      setInterval(this.getNewData, 3000)
    }
  },
  methods: {
    getNewData() {
      this.$http()
        .get('/get-new-data/' + window.sessionStorage.last_poll_timestamp)
        .then(response => {
          this.$store.dispatch('PROCESS_INCOMING_DATA', response)
        })
    },
    async getAppDataFromApi() {
      try {
        return await this.$http().get('/test-tasks')
      } catch (e) {
        console.log(e)
      }
    },
    async getAppData() {
      let indexDBExists = false
      let request = window.indexedDB.open('projectous-data')

      request.onupgradeneeded = function(e) {
        e.target.transaction.abort()
        indexDBExists = false
      }

      const dataValidation = await this.checkDataInIndexDB()
      let data = {}
      //TODO: find out why adding a table breaks
      if (indexDBExists && dataValidation) {
        for (let propertyName of modulesNamesList) {
          const allEntities = await idbGetAll(propertyName)
          if (propertyName === 'properties') {
            Object.keys(allEntities).forEach(key => {
              data[key] = allEntities[key]
            })
          } else {
            data[propertyName] = allEntities
          }
        }
      } else {
        data = await this.storeDataInIndexedDb()
      }
      //this.setAppData(data)
      this.$store.dispatch('PROCESS_INCOMING_DATA', data)
      //TODO
      const userLists = createUserLists(data.lists)
      this.$store.commit('lists/lists/CREATE_LISTS', {
        listName: 'userLists',
        lists: userLists
      })
      this.dateInterval()
      setInterval(this.dateInterval, 1800000)
    },
    async checkDataInIndexDB() {
      let valid = true
      for (let key in modulesNames) {
        if (modulesNames.hasOwnProperty(key)) {
          try {
            await idbKeyval.keys(modulesNames[key])
          } catch (e) {
            valid = false
          }
        }
      }
      return valid
    },
    async setAppData({ client_users, clients, company_users, task_users, tasks, projects, project_users, user_task_lists, current_company_id, current_company_user_id, timers, user_id }) {
      // this.$bvModal.show('edit-user-modal')
      Vue.set(this.$store.state.settings, 'current_user_id', user_id)
      Vue.set(this.$store.state.settings, 'current_company_user_id', current_company_user_id)
      Vue.set(this.$store.state.settings, 'current_company_id', current_company_id)

      this.$store.commit('ADD_MANY', { module: 'client_users', entities: client_users }, { root: true })
      this.$store.commit('ADD_MANY', { module: 'task_users', entities: task_users }, { root: true })
      this.$store.commit('ADD_MANY', { module: 'tasks', entities: tasks }, { root: true })
      this.$store.commit('ADD_MANY', { module: 'timers', entities: timers }, { root: true })
      this.$store.commit('ADD_MANY', { module: 'projects', entities: projects }, { root: true })
      this.$store.commit('ADD_MANY', { module: 'project_users', entities: project_users }, { root: true })
      this.$store.commit('ADD_MANY', { module: 'company_users', entities: company_users }, { root: true })
      this.$store.commit('ADD_MANY', { module: 'clients', entities: clients }, { root: true })
      const userLists = createUserLists(user_task_lists)
      this.$store.commit('lists/lists/CREATE_LISTS', {
        listName: 'userLists',
        lists: userLists
      })
      /*      this.dateInterval()
      setInterval(this.dateInterval, 1800000)*/

      //TODO: companies
    },
    async storeDataInIndexedDb() {
      const appData = await this.getAppDataFromApi()
      console.log('appData', appData)
      for (let key in appData) {
        if (Array.isArray(appData[key])) {
          appData[key].forEach(async entity => {
            try {
              if (key === 'lists') {
                key = 'user_task_lists' //TODO: fix name
              }
              await idbKeyval.set(entity.id, entity, key)
            } catch (e) {
              console.error('---------------------')
              console.error(e)
              console.error(entity)
              console.error('---------------------')
            }
          })
        } else {
          await idbKeyval.set(key, appData[key], 'properties')
        }
      }
      return appData
    },
    dateInterval() {
      this.$store.commit('lists/createListsByDays')
    }
  }
  // created() {
  //   EventBus.$on('toggle_tasks', () => {
  //     this.showTask = !this.showTask
  //   })
  //   EventBus.$on('toggle_timers', () => {
  //     this.showTimer = !this.showTimer
  //   })
  // }
}
</script>

<style lang="scss">
#app {
  display: flex;
  margin-bottom: 60px;
}
#update-data-button {
  position: absolute;
  top: 30px;
  right: 30px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  background: url('assets/icons/refresh-icon.svg');
}
</style>
