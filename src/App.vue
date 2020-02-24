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
    }
  },
  mounted() {
    if (getCookie('auth_token')) {
      this.init()
    }
  },
  methods: {
    async init() {
      //this.$bvModal.show('edit-user-modal')
      const {
        company_clients,
        company_users,
        current_company_id,
        current_company_user_id,
        task_users,
        tasks,
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
