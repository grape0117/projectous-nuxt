<template id="timer-row-template">
  <li
    :class="'project-item timer-' + timer.status"
    v-bind:data-restarted="timer.restart_at"
  >
    <div class="hover-tab project-details" @click="editTimer()">
      <p class="title-project-client-name">{{ client_name() }}</p>
      <p class="title-project-project-name">{{ project.name }}</p>
      <div style="color: #666666; font-size: 10px;">{{ tasktitle() }}</div>
    </div>
    <div v-if="isCurrentUser()">
      <button
        v-if="timer.status === 'running'"
        v-on:click="pauseTimer"
        class="btn btn-default"
        style="float: left; margin-right: 5px;margin-top:2px;"
      >
        <b-icon icon="pause"></b-icon>
      </button>
      <button
        v-if="timer.status === 'running'"
        v-on:click="stopTimer"
        class="btn btn-default"
        style="float: left; margin-right: 5px;margin-top:2px;"
      >
        <b-icon icon="stop"></b-icon>
      </button>
      <button
        v-else
        v-on:click="restartTimer"
        class="btn btn-default"
        style="float: left;  margin-right: 5px;margin-top:5px;"
      >
        <b-icon icon="play"></b-icon>
      </button>
    </div>
    <div
      style="font-size: 19px; margin-top: 5px; margin-right: -1px; text-align: left;"
    >
      {{ durationDisplay() }}
    </div>
    <div style="float: left; clear: right;">{{ reportAt() }}</div>
    <div v-if="isCurrentUser()">
      <div
        placeholder="Notes..."
        v-bind:class="'timer-task ' + notesClass()"
        v-on:blur="saveNotes"
        contenteditable="true"
        v-html="timer.notes"
      ></div>
    </div>
    <div v-else>
      <div
        placeholder="Notes..."
        v-bind:class="'timer-task ' + notesClass()"
        contenteditable="false"
        v-html="timer.notes"
      ></div>
    </div>
    <div v-if="isNotCurrentUser()">{{ user.name }}</div>
    <small>{{ timer.id }}</small>
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
      var self = this
      var project = this.$store.state.projects.projects.find(function(project) {
        return project.id == self.timer.project_id
      })

      if (!project) {
        return { name: 'No Project', id: null }
      } else {
        return project
      }
    },
    user: function() {
      var self = this
      var company_user = this.$store.state.company_users.company_users.find(
        function(company_user) {
          return company_user.id == self.timer.company_user_id
        }
      )

      if (!company_user) {
        return { name: 'not found', id: null }
      } else {
        return company_user
      }
    },
    task: function() {
      var self = this
      var task = this.$store.state.tasks.tasks.find(function(task) {
        return task.id == self.timer.task_id
      })

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
    if (
      this.timer.status == 'running' &&
      this.timer.user_id == this.$store.state.settings.current_user_id
    ) {
      if (this.timer.project_id) {
        this.$store.dispatch(
          'projects/setCurrentProjectById',
          this.timer.project_id
        )
      }
    }
    this.incrementDuration()
  },
  methods: {
    tasktitle: function() {
      var self = this
      if (this.timer.task_id) {
        var task = this.$store.state.tasks.tasks.find(function(task) {
          return task.id == self.timer.task_id
        })

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
      var totalDuration = this.timer.duration
      if (totalDuration > this.totalDuration && this.timer.status == 'running')
        this.totalDuration = totalDuration
      else if (this.timer.status != 'running')
        this.totalDuration = this.timer.duration

      //if(this.timer.status == 'running'){
      return (
        this.durationHours() +
        ':' +
        this.durationMinutes() +
        ':' +
        this.durationSeconds()
      )
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
      !this.isCurrentUser()
    },
    client_name: function() {
      if (!this.timer.project_id) {
        return
      }
      let project = this.$store.getters['projects/getById'](
        this.timer.project_id
      )
      if (project) {
        let company_client = this.$store.getters[
          'company_clients/getByClientCompanyId'
        ](project.client_id)
        return company_client ? company_client.name : ''
      }
    },
    incrementDuration: function() {
      var self = this
      self.totalDuration = self.timer.duration
      window.setInterval(function() {
        self.incrementRunningTimers()
      }, 100)
    },
    incrementRunningTimers: function() {
      var self = this
      if (
        !self.running_timers[self.timer.id] &&
        self.timer.status == 'running'
      ) {
        var start_time
        if (self.timer.restarted_at) {
          start_time = Math.round(
            datetimeToJS(self.timer.restarted_at).getTime() / 1000
          )
        } else {
          start_time = Math.round(
            datetimeToJS(self.timer.created_at).getTime() / 1000
          )
        }
        self.running_timers[self.timer.id] = window.setInterval(function() {
          var duration =
            Math.round(new Date().getTime() / 1000) -
            start_time +
            Number(self.timer.duration)
          self.totalDuration = duration
        }, 500)
      } else if (
        self.running_timers[self.timer.id] &&
        self.timer.status != 'running'
      ) {
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
