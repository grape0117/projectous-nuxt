<template id="mytimer-sidebar-template">
  <div style="background: white;">
    <button @click="addTimer()">Modal</button>
    <button @click="startTimer()">Start New</button>
    <sidebar-timer
      v-bind:running_timers="running_timers"
      v-bind:projects="projects"
      v-bind:users="users"
      v-for="timer in mytimers()"
      v-bind:timer="timer"
      :key="timer.id"
    ></sidebar-timer>
  </div>
</template>

<script>
import SidebarTimer from './SidebarTimer.vue'
export default {
  name: 'my-sidebar-timer',
  components: {
    SidebarTimer
  },
  computed: {
    timers: function() {
      return this.$store.state.timers.timers
    },
    projects: function() {
      return this.$store.state.projects.projects
    },
    users: function() {
      return this.$store.state.company_users.company_users
    },
    company_clients: function() {
      return this.$store.state.company_clients.company_clients
    },
    current_company: function() {
      return this.$store.state.settings.current_company
    },
    user_id: function() {
      return this.$store.state.settings.current_user_id
    }
  },
  data: function() {
    return {
      running_timers: {}
    }
  },
  methods: {
    mytimers: function() {
      var self = this
      var allTimers = this.timers
      if (this.$store.state.settings.current_company_user.id == 36) {
        //TODO: different sort for Chad
        return this.timers
          .filter(function(timer) {
            if (
              self.$store.getters['company_clients/getCompanyClientById'](
                timer.company_client_id
              ).status != 'active'
            ) {
              return false
            }
            if (
              self.$store.getters['projects/getProjectById'](timer.project_id)
                .status == 'closed'
            ) {
              return false
            }
            return timer.user_id == self.$store.state.settings.current_user_id //TODO: company_user_id
          })
          .sort(function(a, b) {
            var aClientKey = ''
            var bClientKey = ''
            var aClientName = ''
            var bClientName = ''
            var aProjectKey = ''
            var bProjectKey = ''
            var aProjectName = ''
            var bProjectName = ''
            if (!a.company_client_id || !a.project_id) {
              return -1
            }
            if (!b.company_client_id || !b.project_id) {
              return 1
            }
            if (a.company_client_id != b.company_client_id) {
              aClientName = self.$store.getters[
                'company_clients/getCompanyClientById'
              ](a.company_client_id)
                ? self.$store.getters['company_clients/getCompanyClientById'](
                    a.company_client_id
                  ).name.toLowerCase()
                : ''
              bClientName = self.$store.getters[
                'company_clients/getCompanyClientById'
              ](b.company_client_id)
                ? self.$store.getters['company_clients/getCompanyClientById'](
                    b.company_client_id
                  ).name.toLowerCase()
                : ''
              if (aClientName > bClientName) {
                return 1
              }
              return -1
            } else {
              aProjectName = self.$store.getters['projects/getProjectById'](
                a.project_id
              ).name.toLowerCase()
              bProjectName = self.$store.getters['projects/getProjectById'](
                b.project_id
              ).name.toLowerCase()
              if (aProjectName == bProjectName) {
                return 0 //TODO: check report_at?
              }
              if (aProjectName > bProjectName) {
                return 1
              }
              return -1
            }
          })
      }
      return this.timers.filter(function(timer) {
        return (
          timer.user_id ==
          self.$store.state.settings.current_company_user.user_id
        )
      })
    },
    addTimer: function() {
      this.$store.dispatch('timers/addTimer') //timers/addTimer2 signature
    },
    startTimer: function() {
      this.$store.dispatch('timers/startTimer', {
        current_company_id: this.$store.state.settings.current_company.id,
        company_client_id: '',
        project_id: '',
        task_id: '',
        is_billable: 1,
        report_at: ''
      })
    }
  }
}
</script>
