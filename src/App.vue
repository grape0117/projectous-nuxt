<template>
  <div id="app">
    <nav-bar></nav-bar>
    <div class="container-fluid">
      <div class="row-no-padding">
        <router-view />
      </div>
    </div>
    <task-modal />
    <edit-user-modal />
    <edit-timer-modal />
    <div id="update-data-button" @click="storeDataInIndexedDb" />
  </div>
</template>

<script>
import EditUserModal from './views/EditUserModal'
import EditTaskModal from './views/EditTaskModal'
import EditTimerModal from './views/EditTimerModal'
import {
  createListsByDays,
  createUserLists,
  getCookie
} from '@/utils/util-functions'
import Vue from 'vue'
import { idbKeyval, idbGetAll } from '@/plugins/idb'
import { modulesNames, modulesNamesList } from './store/modules-names'

export default {
  components: { EditUserModal, EditTaskModal, EditTimerModal },
  computed: {
    current_edit_task: function() {
      return this.$store.getters['settings/get_current_edit_task']
    }
  },
  watch: {
    current_edit_task: function(value) {
      console.log(value)
      alert('watched!')
      if (this.current_edit_task.id) {
        this.$bvModal.show('timer-modal')
      } else {
        this.$bvModal.hide('timer-modal')
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
    if (getCookie('auth_token')) {
      await this.getAppData()
    }
  },
  methods: {
    async getAppDataFromApi() {
      try {
        return await this.$http().get('/test-tasks')
      } catch (e) {
        console.log(e)
      }
    },
    async getAppData() {
      let indexDBExists = true
      let request = window.indexedDB.open('projectous-data')
      request.onupgradeneeded = function(e) {
        e.target.transaction.abort()
        indexDBExists = false
      }
      const dataValidation = await this.checkDataInIndexDB()
      let data = {}
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
      this.setAppData(data)
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
    async setAppData({
      company_clients,
      company_users,
      task_users,
      tasks,
      projects,
      project_users,
      user_task_lists
    }) {
      //this.$bvModal.show('edit-user-modal')
      const {
        company_clients,
        company_users,
        current_company_id,
        current_company_user_id,
        task_users,
        tasks,
        timers,
        projects,
        project_users,
        user_task_lists,
        user_id
        // @ts-ignore
      } = await this.$http().get('/test-tasks')
      Vue.set(this.$store.state.settings, 'current_user_id', user_id)
      Vue.set(
        this.$store.state.settings,
        'current_company_user_id',
        current_company_user_id
      )
      Vue.set(
        this.$store.state.settings,
        'current_company_id',
        current_company_id
      )

      this.$store.commit(
        'ADD_MANY',
        { module: modulesNames.TASK_USERS, entities: task_users },
        { root: true }
      )
      this.$store.commit(
        'ADD_MANY',
        { module: modulesNames.TASKS, entities: tasks },
        { root: true }
      )
      this.$store.commit(
        'ADD_MANY',
        { module: 'timers', entities: timers },
        { root: true }
      )
      this.$store.commit(
        'ADD_MANY',
        { module: 'projects', entities: projects },
        { root: true }
      )
      this.$store.commit(
        'ADD_MANY',
        { module: modulesNames.PROJECT_USERS, entities: project_users },
        { root: true }
      )
      this.$store.commit(
        'ADD_MANY',
        { module: modulesNames.COMPANY_USERS, entities: company_users },
        { root: true }
      )
      this.$store.commit(
        'ADD_MANY',
        { module: modulesNames.COMPANY_CLIENTS, entities: company_clients },
        { root: true }
      )
      const daysLists = createListsByDays()
      const userLists = createUserLists(user_task_lists)
      this.$store.commit('lists/lists/CREATE_LISTS', {
        listName: 'generalLists',
        lists: daysLists
      })
      this.$store.commit('lists/lists/CREATE_LISTS', {
        listName: 'userLists',
        lists: userLists
      })
      //TODO: companies
    },
    async storeDataInIndexedDb() {
      const appData = await this.getAppDataFromApi()
      for (let key in appData) {
        if (Array.isArray(appData[key])) {
          appData[key].forEach(async entity => {
            await idbKeyval.set(entity.id, entity, key)
          })
        } else {
          await idbKeyval.set(key, appData[key], 'properties')
        }
      }
      return appData
    }
  }
}
</script>

<style lang="scss">
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
