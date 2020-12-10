<template id="mytimer-sidebar-template">
  <div>
    <pre></pre>
    <!-- {{ timerEmptyFields }} -->
    <!-- <sidebar-timer v-bind:running_timers="running_timers" v-bind:projects="projects" v-bind:users="users" v-for="timer in mytimers()" v-bind:timer="timer" :key="'sidebar-' + timer.id"></sidebar-timer> -->
    <sidebar-timer v-bind:running_timers="running_timers" v-bind:projects="projects" v-bind:users="users" v-for="timer in mytimers" v-bind:timer="timer" :key="'sidebar-' + timer.id"> </sidebar-timer>
  </div>
</template>

<script>
import { EventBus } from '@/components/event-bus'

export default {
  name: 'my-sidebar-timer',
  data: function() {
    return {
      running_timers: {}
    }
  },
  components: {
    SidebarTimer: () => import('./SidebarTimer.vue')
  },
  created() {
    this.$watch('timerEmptyFields', async count => {
      await EventBus.$emit('timerEmptyFields', this.timerEmptyFields)
    })
  },
  computed: {
    timerEmptyFields() {
      let totalCount = 0
      this.mytimers.forEach(timer => {
        if (timer.project_id === null || timer.notes === null) {
          totalCount++
        }
      })
      return totalCount
    },
    timers: function() {
      console.log('trigger!')
      return this.$store.state.timers.timers
    },
    projects: function() {
      return this.$store.state.projects.projects
    },
    users: function() {
      return this.$store.state.company_users.company_users
    },
    clients: function() {
      return this.$store.state.clients.clients
    },
    current_company: function() {
      return this.$store.state.settings.current_company
    },
    user_id: function() {
      return this.$store.state.settings.current_user_id
    },
    mytimers: function() {
      const self = this
      if (this.$store.state.settings.current_company_user.id == 36) {
        //TODO: different sort for Chad
        return this.timers
          .filter(function(timer) {
            if (self.$store.getters['clients/getCompanyClientById'](timer.client_id).status != 'active') {
              return false
            }
            if (self.$store.getters['projects/getById'](timer.project_id).status == 'closed') {
              return false
            }
            return timer.user_id == self.$store.state.settings.current_user_id //TODO: company_user_id
          })
          .sort(function(a, b) {
            let aClientKey = ''
            let bClientKey = ''
            let aClientName = ''
            let bClientName = ''
            let aProjectKey = ''
            let bProjectKey = ''
            let aProjectName = ''
            let bProjectName = ''
            if (!a.client_id || !a.project_id) {
              return -1
            }
            if (!b.client_id || !b.project_id) {
              return 1
            }
            if (a.client_id != b.client_id) {
              aClientName = self.$store.getters['clients/getCompanyClientById'](a.client_id) ? self.$store.getters['clients/getCompanyClientById'](a.client_id).name.toLowerCase() : ''
              bClientName = self.$store.getters['clients/getCompanyClientById'](b.client_id) ? self.$store.getters['clients/getCompanyClientById'](b.client_id).name.toLowerCase() : ''
              if (aClientName > bClientName) {
                return 1
              }
              return -1
            } else {
              aProjectName = self.$store.getters['projects/getById'](a.project_id).name.toLowerCase()
              bProjectName = self.$store.getters['projects/getById'](b.project_id).name.toLowerCase()
              if (aProjectName === bProjectName) {
                return 0 //TODO: check report_at?
              }
              if (aProjectName > bProjectName) {
                return 1
              }
              return -1
            }
          })
      }
      console.log('getting timers')
      return this.timers
        .filter(function(timer) {
          return true
          return timer.company_user_id === self.$store.state.settings.current_company_user.id
        })
        .sort(function(a, b) {
          let aDate = new Date(a.status_changed_at)
          let bDate = new Date(b.status_changed_at)
          if (aDate > bDate) return -1
          if (aDate < bDate) return 1
          return 0
        })
    }
  }
}
</script>
