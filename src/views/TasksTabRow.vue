<template>
  <tr class="task-container">
    <td>{{ taskClientNameFromProject(task.project_id) }}</td>
    <td>{{ taskProjectName(task.project_id) }}</td>
    <td>
      <a @click="editTask(task)">{{ task.title }}</a>
    </td>
    <td style="white-space: nowrap">
      <div v-for="task_user in task_users()"><i v-if="task_user.role === 'manager'" class="glyphicon glyphicon-flash"></i><i v-else-if="task_user.role === 'reviewer'" class="glyphicon glyphicon-thumbs-up"></i>&nbsp; {{ user_from_task_user(task_user) }} {{ task_user.role }}</div>
    </td>
    <td>
      <div class="btn-group">
        <select v-model="task.priority">
          <option v-for="priority in priorities" :selected="getNumericPriority(priority) === getNumericPriority(task.priority)">{{ priority }}</option>
        </select>
      </div>

      <div class="status-icons">
        <i class="icon-check_circle" style="font-size: 20px; color: #007bff; cursor: pointer;" @click="moveStatusForward()"></i>
        <i class="icon-play_arrow icon-class" @click="startTimer()" v-if="!getTaskTimers(task.id, 'button_status')"></i>
        <i class="icon-stop icon-class" style="color: red" @click="stopTimer()" v-if="getTaskTimers(task.id, 'button_status')"></i>
      </div>
      <b-badge variant="primary" @click="showTaskDetail" style="cursor:pointer">Open task</b-badge>
    </td>
    <td>{{ task.due_date }}</td>
  </tr>
</template>

<script>
import TaskActionRow from './TaskActionRow.vue'
import ProjectIcon from '../components/ui/ProjectIcon'
import moment from 'moment'
export default {
  props: ['task'],
  extends: TaskActionRow,
  name: 'tasks-tab-row',
  data() {
    return {
      priorities: ['high', 'regular', 'low', 'hold']
    }
  },
  watch: {
    'task.priority'(value) {
      console.log('priority watcher')
      this.$store.dispatch('UPDATE_ATTRIBUTE', { module: 'tasks', id: this.task.id, attribute: 'priority', value: value })
    }
  },
  methods: {
    getTaskTimers(id, type) {
      let timers = this.$store.state.timers.timers
      let running_timers = timers.find(e => e.status === 'running' && e.task_id === id)
      let return_data
      switch (type) {
        case 'button_status':
          return_data = running_timers ? true : false
          break
        case 'stop_timer':
          return_data = running_timers
          break
        case 'restart_timer':
          const latest_task_timer = timers.find(e => e.task_id === id)

          //guess timezone
          const timezone = moment.tz.guess()
          const tz_date = moment(new Date()).tz(timezone)
          //convert current date to database timezone
          const gmt_date = tz_date.clone().tz('GMT')
          const is_same_day = latest_task_timer ? moment(gmt_date).isSame(latest_task_timer.report_at, 'day') : false

          return_data = is_same_day ? latest_task_timer : null
          break
      }
      return return_data
    },
    restartTimer(timer) {
      this.$store.dispatch('timers/restartTimer', timer)
    },
    stopTimer() {
      const timer = this.getTaskTimers(this.task.id, 'stop_timer')
      this.$store.dispatch('timers/stopTimer', timer)
    },
    pauseTimer(timer) {
      this.$store.dispatch('timers/pauseTimer', timer)
    },
    startTimer() {
      let timer = {
        task_id: this.task.id
      }
      if (this.task.project_id) {
        timer.project_id = this.task.project_id
      }

      const task_timer = this.getTaskTimers(this.task.id, 'restart_timer')
      if (task_timer) {
        this.restartTimer(task_timer)
      } else {
        this.$store.dispatch('timers/startTimer', timer)
      }
    },
    getNumericPriority(priority) {
      switch (priority) {
        case 'high':
        case 'today':
          return 3
        case 'active':
        case 'regular':
        case 'this week':
          return 2
        case 'low':
        case 'when possible':
          return 1
        case 'hold':
        default:
          return 0
      }
    },
    user_from_task_user(task_user) {
      return this.$store.getters['company_users/getById'](task_user.company_user_id)['name']
    },
    async showTaskDetail() {
      await this.$router.push({ query: { task: this.task.id, showChatSection: 'true' } })
    },
    task_users() {
      return this.$store.getters['task_users/getByTaskId'](this.task.id)
    },
    getNeed() {
      const need = prompt('What is blocking this task?', this.task.settings ? (this.task.settings.needs ? this.task.settings.needs : '') : '')
      if (need !== '') {
        this.set_needs_message(need)
      }
    },
    set_needs_message(message) {
      if (this.task.settings) {
        this.task.settings.needs = message
      } else {
        this.task.settings = { needs: message }
      }
      this.$store.dispatch('UPDATE_ATTRIBUTE', { module: 'tasks', id: this.task.id, attribute: 'settings', value: this.task.settings })
    }
  }
}
</script>

<style scoped>
tr {
  display: table-row;
}
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
</style>
