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
    <div id="update-data-button" @click="storeDataInIndexedDb" />
  </div>
</template>

<script>
import EditUserModal from './views/EditUserModal'
import {
  createListsByDays,
  createUserLists,
  getCookie
} from '@/utils/util-functions'
import { idbKeyval, idbGetAll } from '@/plugins/idb'
import { modulesNames, modulesNamesList } from './store/modules-names'

export default {
  components: { EditUserModal },
  computed: {
    // current_edit_project: () => this.$store.state.settings.current_edit_project,
    // current_edit_company_user: () =>
    //   this.$store.state.settings.current_edit_company_user,
    // current_edit_company_client: () =>
    //   this.$store.state.settings.current_edit_company_client,
    // current_edit_task: () => this.$store.state.settings.current_edit_task,
    // current_edit_timer: () => this.$store.state.settings.current_edit_timer,
    // current_edit_task_type: () =>
    //   this.$store.state.settings.current_edit_task_type
  },
  watch: {
    current_edit_company_user() {
      if (this.current_edit_company_user.id) {
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
      const indexDBExists = (await window.indexedDB.databases()).find(
        db => db.name === 'projectous-data'
      )
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
        { module: modulesNames.PROJECTS, entities: projects },
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
