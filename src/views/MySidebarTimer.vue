<template id="mytimer-sidebar-template">
  <div>
    <pre></pre>
    <!-- {{ timerEmptyFields }} -->
    <!-- <sidebar-timer v-bind:running_timers="running_timers" v-bind:projects="projects" v-bind:users="users" v-for="timer in mytimers()" v-bind:timer="timer" :key="'sidebar-' + timer.id"></sidebar-timer> -->
    <sidebar-timer v-bind:running_timers="running_timers" v-bind:projects="projects" v-bind:users="users" v-for="(timer, timerIndex) in mytimers" v-bind:timer="timer" :key="'sidebar-' + timer.id" :index="timerIndex"> </sidebar-timer>
  </div>
</template>

<script>
import { EventBus } from '@/components/event-bus'
import moment from 'moment'
import { datetimeToJS } from '../utils/util-functions'
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
            return timer.user_id === self.$store.state.settings.current_user_id //TODO: company_user_id
            // return timer.company_user_id === this.$store.state.settings.current_company_user_id
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
      let timers = this.timers
        .filter(timer => timer.company_user_id === this.$store.state.settings.current_company_user_id)

        // .filter(timer => {
        //   let getToday = moment().format('YYYY-MM-DD HH:mm:ss')
        //   let getYesterday = moment()
        //     .subtract(1, 'day')
        //     .format('YYYY-MM-DD HH:mm:ss')

        //   let date = datetimeToJS(timer.status_changed_at)
        //     .toString()
        //     .split(' ')
        //   let today = datetimeToJS(getToday)
        //     .toString()
        //     .split(' ')
        //   let yesterday = datetimeToJS(getYesterday)
        //     .toString()
        //     .split(' ')

        //   if ((date[0] === yesterday[0] && date[1] === yesterday[1] && date[2] === yesterday[2] && date[3] === yesterday[3]) || (date[0] === today[0] && date[1] === today[1] && date[2] === today[2] && date[3] === today[3])) {
        //     return true
        //   }
        // })
        .sort(function(a, b) {
          if (a.status === 'running') {
            return -1
          }
          let aDate = new Date(a.status_changed_at)
          let bDate = new Date(b.status_changed_at)

          if (aDate > bDate) return -1
          if (aDate < bDate) return 1

          return 0
        })
      return timers
    }
  }
}
</script>
