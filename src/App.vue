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
  </div>
</template>

<script>
import EditUserModal from './views/EditUserModal'
import {
  createListsByDays,
  createUserLists,
  getCookie
} from '@/utils/util-functions'
import { idbKeyval } from '@/plugins/idb'

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
    }
  },
  async mounted() {
    if (getCookie('auth_token')) {
      const appData = await this.getAppData()
      this.setAppData(appData)
    }
  },
  methods: {
    async getAppData() {
      const appDataInIDB = await idbKeyval.get('data')
      if (appDataInIDB) {
        return appDataInIDB
      } else {
        return await this.$http().get('/test-tasks')
      }
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
        { module: 'task_users', entities: task_users },
        { root: true }
      )
      this.$store.commit(
        'ADD_MANY',
        { module: 'tasks', entities: tasks },
        { root: true }
      )
      this.$store.commit(
        'ADD_MANY',
        { module: 'projects', entities: projects },
        { root: true }
      )
      this.$store.commit(
        'ADD_MANY',
        { module: 'project_users', entities: project_users },
        { root: true }
      )
      this.$store.commit(
        'ADD_MANY',
        { module: 'company_users', entities: company_users },
        { root: true }
      )
      this.$store.commit(
        'ADD_MANY',
        { module: 'company_clients', entities: company_clients },
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
    }
  }
}
</script>
