<template id="timer-row-template">
  <!-- <li v-if="isCurrentUser()" class="sidebar-timer" :class="'project-item timer-' + timer.status" v-bind:data-restarted="timer.restart_at"> -->
  <li v-if="isCurrentUser()" class="sidebar-timer" :class="{ 'sidebar-timer-client-no-project': !project.id }" v-bind:data-restarted="timer.restart_at">
    <div class="d-flex align-items-center justify-content-between">
      <div v-if="client_name()">
        <p class="title-project-client-name sidebar-timer-client-name">{{ client_name() }}</p>
      </div>
      <div class="status-icon-with-timer">
        <div v-if="isCurrentUser()" class="status-icons">
          <i class="icon-pause icon-class" v-if="timer.status === 'running'" v-on:click="pauseTimer"></i>
          <i class="icon-stop icon-class" v-if="timer.status === 'running'" v-on:click="stopTimer"></i>
          <i class="icon-play_arrow icon-class" v-else @click="restartTimer"></i>
        </div>
        <div class="sidebar-timer-timer">
          <span :style="timer.status === 'running' ? 'font-weight: bold;' : ''">{{ durationDisplay() }}</span>
        </div>
      </div>
    </div>
    <div class="project-details sidebar-timer-client-info" @click="editTimer()">
      <p v-if="project.id" class="sidebar-timer-client-project">{{ project.name }}</p>
      <p v-else class="sidebar-timer-client-no-project-title">{{ project.name }}</p>
      <!-- <div style="color: #666666; font-size: 10px;">{{ tasktitle() }}</div>-->
    </div>
    <div class="sidebar-timer-notes" v-if="timer.notes">
      <div placeholder="Notes..." class="sidebar-timer-timer-task" :class="'timer-task ' + notesClass()" v-on:blur="saveNotes" contenteditable="true" v-html="timer.notes"></div>
    </div>
    <div v-else>
      <div placeholder="Notes..." class="sidebar-timer-timer-task" :class="'timer-task ' + notesClass()" v-on:blur="saveNotes" contenteditable="true" v-html="timer.notes" style="background: rgba(0,0,0, 0.2);"></div>
    </div>
    <div v-if="isNotCurrentUser()">{{ user.name }}</div>
    <div class="sidebar-timer-timer-details">
      <div class="sidebar-timer-report-at">{{ reportAt() }}</div>
      <span class="sidebar-timer-timer-id">{{ timer.id }}</span>
    </div>
  </li>
</template>

<script>
import Vue from 'vue'
import { format_report_at, datetimeToJS } from '../utils/util-functions'

export default {
  name: 'sidebar-timer',
  props: ['timer', 'projects', 'users', 'tasks', 'running_timers'],
  data: function() {
    return {
      totalDuration: 0,
      invoiceDuration: 0
    }
  },
  computed: {
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
  },
  mounted: function() {
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
  },
  methods: {
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
    durationDisplay: function() {
      const totalDuration = this.timer.duration
      if (totalDuration > this.totalDuration && this.timer.status == 'running') this.totalDuration = totalDuration
      else if (this.timer.status != 'running') this.totalDuration = this.timer.duration

      //if(this.timer.status == 'running'){
      return this.durationHours() + ':' + this.durationMinutes() + ':' + this.durationSeconds()
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
    reportAt: function() {
      return format_report_at(datetimeToJS(this.timer.report_at))
    },
    editTimer: function() {
      console.log('editTimer')
      Vue.set(this.$store.state.settings, 'current_edit_timer', this.timer)
      console.log(this.$store.state.settings.current_edit_timer)
      this.$bvModal.show('timer-modal')

      //this.$store.dispatch('timers/editTimer', this.timer)
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
    saveNotes: function(event) {
      this.timer.notes = event.target.innerHTML
      this.$store.dispatch('timers/saveTimer', this.timer)
    }
  }
}
</script>

<style>
.sidebar-timer {
  padding: 5px 15px;
  padding-top: 15px;
  color: white;
  margin-bottom: 7px;
  border-radius: 5px;
  background-color: #818181;
}
/* title-project-project-name */
.sidebar-timer-client-info {
  margin-top: 5px;
  margin-bottom: 5px;
}
.sidebar-timer-client-name {
  font-size: 12px;
  font-weight: bold;
}
.sidebar-timer-client-project {
  /* border-left: 2px solid white; */
  /* padding-left: 5px; */
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
}
.sidebar-timer-notes > .timer-task {
  background-color: rgba(0, 0, 0, 0) !important;
}
.sidebar-timer-timer {
  font-size: 20px;
}
.status-icon-with-timer {
  display: flex;
  align-items: center;
}
.sidebar-timer-timer-task {
  padding: 0 5px;
  font-weight: 600;
}
</style>
<style scoped>
.status-icons {
  display: flex;
  margin-right: 5px;
}
.icon-class {
  color: white;
  font-size: 20px;
  cursor: pointer;
  /* border: 1px solid red; */
}
li {
  list-style: none;
}
.sidebar-timer-timer-id {
  font-size: 12px;
}
.sidebar-timer-timer-details {
  margin-top: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
