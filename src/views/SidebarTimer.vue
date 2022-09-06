<template>
  <li v-if="isCurrentUser()" class="timer-row-template sidebar-timer" :style="{ 'background-color': status_running ? default_theme_color : null }" v-bind:data-restarted="timer.restart_at">
    <div v-if="client_name() && !project.acronym">
      <p class="title-project-client-name sidebar-timer-client-name">{{ client_name() }}</p>
    </div>

    <div @click="editTimer()">
      <project-icon v-bind:project="project"></project-icon>
      <span v-if="project.id" class="sidebar-timer-client-project">{{ project.name }}</span>
      <span v-else class="sidebar-timer-client-no-project-title">{{ project.name }}</span>
    </div>

    <div class="status-icon-with-timer">
      <div v-if="isCurrentUser()" class="status-icons">
        <i class="icon-pause icon-class" v-if="status_running" v-on:click="pauseTimer"></i>
        <i class="icon-stop icon-class" style="color: red" v-if="status_running" v-on:click="stopTimer"></i>
        <i class="icon-play_arrow icon-class" v-else @click="restartTimer"></i>
      </div>
      <div class="sidebar-timer-timer">
        <span :style="status_running ? 'font-weight: bold;' : ''">{{ durationDisplay }}</span>
      </div>
      <div class="bump-button" v-if="showBumpButton">
        <span @click="bumpItUp">Bump it up</span>
      </div>
    </div>

    <div class="sidebar-timer-report-at">{{ restartedAt() }}</div>

    <div class="sidebar-timer-notes">
      <b-form-textarea ref="noteInput" style="overflow-y: hidden; color: white; font-size: smaller; min-width: 100px; background: none; border-left: white solid 1px" v-on:blur="saveNotes" class="sidebar-timer-timer-task" v-model="timer.notes" debounce="500" rows="2" max-rows="30" cols="300" @change="setNoteValue($event, data.item)"></b-form-textarea>
    </div>
    <div v-if="isNotCurrentUser()">{{ user.name }}</div>
    <span class="sidebar-timer-timer-id">{{ timer.id }}</span>
  </li>
</template>

<script>
import Vue from 'vue'
import moment from 'moment'
import { format_report_at, datetimeToJS, applyTheme } from '../utils/util-functions'
import { colorThemes } from '@/mixins/colorThemes'

import { EventBus } from '@/components/event-bus'
import { IProject } from '../store/modules/projects/types'
import { cloneDeep } from 'lodash'
import ProjectIcon from '../components/ui/ProjectIcon'

export default {
  name: 'sidebar-timer',
  components: { ProjectIcon },
  props: ['timer', 'projects', 'users', 'tasks', 'running_timers', 'index'],
  mixins: [colorThemes],
  data: function() {
    return {
      totalDuration: 0,
      invoiceDuration: 0,
      showTimerAlert: false
    }
  },
  watch: {
    'timer.status'(status) {
      EventBus.$emit('timerStatus', status)
    },
    'timer.notes'(notes) {
      if (notes === null) return
      if ((notes.includes('&#8203;') && notes.length === 7) || notes === '') {
        this.timer.notes = ''
      }
    },
    $route(to, from) {
      this.checkPathTimerId()
    }
  },
  computed: {
    status_running() {
      return this.timer.status === 'running'
    },
    durationDisplay: function() {
      const totalDuration = this.timer.duration
      if (totalDuration > this.totalDuration && this.timer.status == 'running') this.totalDuration = totalDuration
      else if (this.timer.status != 'running') this.totalDuration = this.timer.duration

      //if(this.timer.status == 'running'){
      return this.durationHours + ':' + this.durationMinutes + ':' + this.durationSeconds
      //} else {
      //    return this.durationHours()+':'+this.durationMinutes();
      //}
    },
    durationHours: function() {
      this.totalDuration = this.totalDuration ? this.totalDuration : 0
      return Math.floor(this.totalDuration / 3600)
    },
    durationMinutes: function() {
      this.totalDuration = this.totalDuration ? this.totalDuration : 0
      return ('00' + Math.floor((this.totalDuration % 3600) / 60)).slice(-2)
    },
    invoiceDurationHours: function() {
      this.invoiceDuration = this.invoiceDuration ? this.invoiceDuration : 0
      return Math.floor(this.invoiceDuration / 3600)
    },
    invoiceDurationMinutes: function() {
      this.invoiceDuration = this.invoiceDuration ? this.invoiceDuration : 0
      return ('00' + Math.floor((this.invoiceDuration % 3600) / 60)).slice(-2)
    },
    durationSeconds: function() {
      this.totalDuration = this.totalDuration ? this.totalDuration : 0
      return ('00' + Math.floor(this.totalDuration % 60)).slice(-2)
    },
    showBumpButton() {
      if (Number(this.durationHours) === 0 && Number(this.durationMinutes) < 10 && this.timer.status === 'stopped') {
        return true
      }
      return false
    },
    clientColor() {
      const client = this.$store.state.clients.clients.find(c => c.client_company_id === this.project.client_company_id)
      if (client) {
        return client.color
      }
    },
    current_user_id: function() {
      return this.$store.state.settings.current_user_id
    },
    project: function() {
      const self = this
      const project = this.$store.state.projects.projects.find(projectInStore => projectInStore.id == self.timer.project_id)

      if (!project) {
        return { name: 'No Project', id: null }
      } else {
        return project
      }
    },
    user: function() {
      const self = this
      const company_user = this.$store.state.company_users.company_users.find(cu => cu.id == self.timer.company_user_id)

      if (!company_user) {
        return { name: 'not found', id: null }
      } else {
        return company_user
      }
    },
    task: function() {
      const self = this
      const task = this.$store.state.tasks.tasks.find(t => t.id == self.timer.task_id)

      if (!task) {
        return { name: '', id: null }
      } else {
        return task
      }
    },
    client: function() {}
    // hasLessWork() {
    //   const thirtyMinutes = 30
    //   return parseInt(this.durationMinutes()) < thirtyMinutes
    // }
  },
  mounted: function() {
    if (this.index === 0 && this.timer.notes === null) {
      this.$refs['noteInput'].focus()
    }
    /**
     * load in current running project if one exists
     */
    if (this.timer.status == 'running' && this.timer.user_id == this.$store.state.settings.current_user_id) {
      /*if (this.timer.project_id) {
        this.$store.dispatch(
          'projects/setCurrentProjectById',
          this.timer.project_id
        )
      }*/
    }
    this.incrementDuration()
    this.checkPathTimerId()
  },
  methods: {
    applyTheme,
    async bumpItUp() {
      const timer = await _.cloneDeep(this.timer)
      timer.duration = 600

      await this.$store.dispatch('UPDATE_ATTRIBUTE', {
        module: 'timers',
        id: timer.id,
        attribute: 'duration',
        value: timer.duration
      })
    },
    tasktitle: function() {
      const self = this
      if (this.timer.task_id) {
        const task = this.$store.state.tasks.tasks.find(t => t.id == self.timer.task_id)

        if (task) {
          return task.title
        }
      }
    },
    isBillable: function() {
      return this.timer.is_billable ? true : false
    },
    /*

            this.totalDuration increments when a timer is running
            > works because without it, the same value would get set over and over again.

             */

    // durationHours: function() {
    //   this.totalDuration = this.totalDuration ? this.totalDuration : 0
    //   return Math.floor(this.totalDuration / 3600)
    // },
    // durationMinutes: function() {
    //   this.totalDuration = this.totalDuration ? this.totalDuration : 0
    //   return ('00' + Math.floor((this.totalDuration % 3600) / 60)).slice(-2)
    // },
    // invoiceDurationHours: function() {
    //   this.invoiceDuration = this.invoiceDuration ? this.invoiceDuration : 0
    //   return Math.floor(this.invoiceDuration / 3600)
    // },
    // invoiceDurationMinutes: function() {
    //   this.invoiceDuration = this.invoiceDuration ? this.invoiceDuration : 0
    //   return ('00' + Math.floor((this.invoiceDuration % 3600) / 60)).slice(-2)
    // },
    // durationSeconds: function() {
    //   this.totalDuration = this.totalDuration ? this.totalDuration : 0
    //   return ('00' + Math.floor(this.totalDuration % 60)).slice(-2)
    // },
    isCurrentUser: function() {
      return this.current_user_id === this.timer.user_id
    },
    isNotCurrentUser: function() {
      return !this.isCurrentUser()
    },
    client_name: function() {
      if (!this.timer.project_id) {
        return
      }
      const project = this.$store.getters['projects/getById'](this.timer.project_id)
      if (project) {
        const client = this.$store.getters['clients/getByClientCompanyId'](project.client_company_id)
        return client ? client.name : ''
      }
    },
    incrementDuration: function() {
      const self = this
      self.totalDuration = self.timer.duration
      window.setInterval(function() {
        self.incrementRunningTimers()
      }, 100)
    },
    incrementRunningTimers: function() {
      const self = this
      if (!self.running_timers[self.timer.id] && self.timer.status == 'running') {
        let start_time
        if (self.timer.restarted_at) {
          start_time = Math.round(datetimeToJS(self.timer.restarted_at).getTime() / 1000)
        } else {
          start_time = Math.round(datetimeToJS(self.timer.created_at).getTime() / 1000)
        }
        self.running_timers[self.timer.id] = window.setInterval(function() {
          const duration = Math.round(new Date().getTime() / 1000) - start_time + Number(self.timer.duration)
          self.totalDuration = duration
        }, 500)
      } else if (self.running_timers[self.timer.id] && self.timer.status != 'running') {
        window.clearInterval(self.running_timers[self.timer.id])
        delete self.running_timers[self.timer.id]
      } else {
      }
    },
    checkDay(timezone_date, compare_date) {
      const T_date = moment(timezone_date).format('YYYY-MM-DD')
      const c_date = moment(compare_date).format('YYYY-MM-DD')

      return moment(T_date).isSame(c_date)
    },
    checkDayDifference(start, end) {
      return moment(end).diff(start, 'd')
    },
    restartedAt() {
      const timezone = moment.tz.guess()
      // Same timezone from database
      const actual_date = moment.tz(this.timer.report_at, 'GMT')
      // Date/Time conversion depending on current timezone
      const timezone_date = actual_date
        .clone()
        .tz(timezone)
        .format('YYYY-MM-DD')
      const TODAY = moment(new Date()).format('YYYY-MM-DD')
      const YESTERDAY = moment(timezone_date)
        .subtract(1, 'days')
        .format('YYYY-MM-DD')

      const difference = this.checkDayDifference(timezone_date, TODAY)
      if (difference === 0) {
        return actual_date
          .clone()
          .tz(timezone)
          .format('h:mm a')
      } else if (difference === 1) {
        return (
          'Yesterday ' +
          actual_date
            .clone()
            .tz(timezone)
            .format('h:mm a')
        )
      } else {
        return actual_date
          .clone()
          .tz(timezone)
          .format('ddd MMM Do h:mm a')
      }
    },
    reportAt: function() {
      return format_report_at(datetimeToJS(this.timer.report_at))
    },
    editTimer: function() {
      console.log('editTimer')
      this.applyTheme()
      this.$store.commit('settings/setCurrentEditTimerStatus', 'edit')
      Vue.set(this.$store.state.settings, 'current_edit_timer', this.timer)
      console.log(this.$store.state.settings.current_edit_timer)
      this.$bvModal.show('timer-modal')
    },
    notesClass: function() {
      if (this.timer.notes == '') {
        return 'empty-notes'
      }
      return ''
    },
    restartTimer: function() {
      this.$store.dispatch('timers/restartTimer', this.timer)
    },
    stopTimer: function() {
      this.$store.dispatch('timers/stopTimer', this.timer)
    },
    pauseTimer: function() {
      this.$store.dispatch('timers/pauseTimer', this.timer)
    },
    async saveTimer() {
      await this.$store.dispatch('timers/saveTimer', this.timer)
    },
    saveNotes: async function(event) {
      let notesWithAcronym = this.timer.notes

      // Check for ABC: //TODO: move somewhere else to common area?
      const projectRegex = /^([A-Z-]+):\s*/ //TODO: fix the :[:space] not being captured
      const acronym_match = notesWithAcronym ? notesWithAcronym.match(projectRegex) : null

      // We have an acronym. Look for a matching project
      let notes
      if (acronym_match && acronym_match[1]) {
        const projects_by_acronym = this.$store.state.projects.projects.filter(project => project.acronym === acronym_match[1])
        if (projects_by_acronym.length === 1) {
          //TODO: update history
          this.timer.project_id = projects_by_acronym[0].id
          notes = notesWithAcronym.replace(acronym_match[0], '')
        } else {
          notes = notesWithAcronym
        }
      } else {
        notes = notesWithAcronym
      }
      this.timer.notes = notes
      // event.target.innerHTML = notes //If you just change the project using ABC: it doesn't change the underlying object so the DOM doesn't update

      // await this.$store.dispatch('timers/saveTimer', this.timer)
      await this.saveTimer()
    },
    checkPathTimerId: function() {
      const query = this.$route.query
      if (query.timer_id === this.timer.id.toString()) {
        Vue.set(this.$store.state.settings, 'current_edit_timer', this.timer)
        this.$bvModal.show('timer-modal')
      }
    }
  }
}
</script>

<style lang="scss">
.sidebar-timer {
  // min-width: 200px;
  // width: 100%;
  padding: 5px 15px;
  color: white;
  margin-bottom: 7px;
  border-radius: 5px;
  background-color: rgba(0, 0, 0, 0.2);
}
.sidebar-timer-acronym {
  padding: 5px 10px;
  white-space: nowrap;
  // background-color: green;
  cursor: pointer;
  font-size: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 20px;
}
.sidebar-timer-client-name {
  font-size: 12px;
  font-weight: bold;
}
.sidebar-timer-client-project {
  margin-bottom: 0 !important;
  font-size: 15px;
}
.sidebar-timer-client-no-project-title {
  font-weight: bold;
  padding-left: 2px;
  font-size: 17px;
  margin-bottom: 0 !important;
  color: red;
}
.sidebar-timer-report-at {
  font-weight: bold;
  font-size: 12px;
  margin-top: 10px;
  margin-bottom: 5px;
}
.sidebar-timer-notes > .timer-task {
  background-color: rgba(0, 0, 0, 0) !important;
}
.sidebar-timer-timer {
  font-size: 20px;
}
.status-icon-with-timer {
  // border: 1px solid red;
  display: flex;
  align-items: center;
  margin-left: -5px;

  .bump-button {
    font-size: 14px;
    margin-left: 10px;
    border: 1px solid white;
    padding: 3px 5px;
    cursor: pointer;
  }
}
.sidebar-timer-timer-task {
  border: 0px;
  border-left: 1px solid white;
  width: 100%;
  padding: 0 5px;
  font-weight: 600;
  color: white;

  &::placeholder {
    color: rgba($color: #ffffff, $alpha: 0.5);
  }
}
// .side-timer-timer-active {
//   box-shadow: 0px 0px 5px rgba($color: lightgreen, $alpha: 1) !important;
// }
// .side-timer-less-work {
//   box-shadow: 0px 0px 5px rgba($color: red, $alpha: 0.7);
// }
</style>
<style lang="scss" scoped>
.status-icons {
  display: flex;
  margin-right: 5px;
}
.icon-class {
  color: white;
  font-size: 20px;
  cursor: pointer;
  color: green;
}
li {
  list-style: none;
}
.sidebar-timer-timer-id {
  font-size: 12px;
}
.sidebar-timer {
  background-color: rgba($color: #000000, $alpha: 0.4);
  box-shadow: 0px 0px 16px -7px rgba($color: #ffffff, $alpha: 1);
}
</style>
