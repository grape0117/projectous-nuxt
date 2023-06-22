<template>
  <div :id="'task_' + task.id" @mouseenter="addHoverClass" @mouseleave="removeHoverClass" :style="{ border: isNewTask ? 'white dashed 3px' : 'none', display: 'table-row', background: 'rgba(0,0,0,.4)' }" class="col-md-12 user-task-row" v-show="showTimer">
    <b-form-checkbox name="task_checkbox" :id="task.id" class="mr-2 color-white" v-if="showCheckbox"> </b-form-checkbox>
    <div :style="{ 'white-space': 'nowrap', 'text-align': 'right', display: 'table-cell' }">
      <b-icon v-if="task['isToday']" :icon="is_mouse_enter ? 'star' : 'star-fill'" font-scale="1" variant="warning" class="mr-2" @mouseenter="is_mouse_enter = true" @mouseleave="is_mouse_enter = false" @click="changeNextWorkDay(task.id, 0)"></b-icon>
      <b-icon v-else :icon="is_mouse_enter ? 'star-fill' : 'star'" font-scale="1" variant="warning" class="show-on-hovered mr-2" @mouseenter="is_mouse_enter = true" @mouseleave="is_mouse_enter = false" @click="changeNextWorkDay(task.id, 1)"></b-icon>
      <i class="show-on-hovered icon-play_arrow" @click="startTimer()" v-if="!getTaskTimers(task.id, 'button_status')" style="color:green;cursor:pointer;"></i>
      <i class="icon-stop" @click="stopTimer()" v-if="getTaskTimers(task.id, 'button_status')" style="color:red;cursor:pointer;"></i>
    </div>
    <div :style="{ 'white-space': 'nowrap', 'text-align': 'right', display: 'table-cell' }">
      <b>
        <b-badge :style="{ 'background-color': getClientAcronymColor(task.project_id) }" variant="primary" class="mr-2 ml-2" v-if="getProjectDetails(task.project_id)" :title="taskProjectName(task.project_id)">
          {{ getProjectDetails(task.project_id) }}
        </b-badge>

        <b-badge v-else-if="task.project_id" :style="{ 'max-width': '100px', overflow: 'hidden', 'background-color': getClientAcronymColor(task.project_id) }" variant="primary" class="mr-2 ml-2">
          {{ getProject(task.project_id) ? getProject(task.project_id).name : '--' }}
        </b-badge>

        <b-badge v-else :style="{ 'background-color': 'transparent' }" variant="primary" class="mr-2 ml-2">
          --
        </b-badge>
      </b>
    </div>
    <div style="white-space: nowrap; display: table-cell">
      <b-dropdown class="mr-3" id="priorities-dropdown" :variant="priorityColor(task.priority)">
        <b-dropdown-item @click="updatePriority('high')">High</b-dropdown-item>
        <b-dropdown-item @click="updatePriority('regular')">Regular</b-dropdown-item>
        <b-dropdown-item @click="updatePriority('low')">Low</b-dropdown-item>
        <b-dropdown-item @click="updatePriority('hold')">Hold</b-dropdown-item>
      </b-dropdown>
    </div>
    <div style="display: table-cell; width: 99%">
      <span style="float: right; margin-right: 10px;" class="white-text">{{ durationDisplay }}</span>
      <span v-if="isCompletedTask" style="margin-right: 5px;"><b-badge variant="success">Completed</b-badge></span>
      <span @click="showTaskDetail" :style="{ cursor: 'pointer', 'font-weight': `${task.messages && task.messages.length > 0 ? 'bolder' : 'normal'}` }" class="white-text">{{ task.title ? task.title : '---' }} </span>
      <span v-for="user in task_users" v-if="isAdmin() || is_owner">
        <span v-if="getCompanyUserDetails(user.company_user_id)" :title="`${getCompanyUserDetails(user.company_user_id).name}   ${user.step ? user.step : '--'}:${user.notes ? user.notes : '--'}`" @click="updateUser(user)" :class="`avatar mr-1 pointer ${user.status} ${user.step} ${user.notes ? 'notes' : ''}`" :style="{ 'background-color': getCompanyUserDetails(user.company_user_id).color, cursor: 'pointer', display: 'inline-flex', 'margin-left': '5px' }">
          {{ abbrName(getCompanyUserDetails(user.company_user_id).name) }}
        </span>
      </span>
      <span class="show-on-hovered" v-if="isMyTask">
        <span title="Complete" class="add-dev-btn" v-if="!isCompletedTask" variant="outline-success" @click="completeMyTask(task.id)" pill><i class="icon-check"/></span>
        <span title="Cancel Complete" class="add-dev-btn" v-else variant="outline-success" @click="notCompleteMyTask(task.id)" pill><i class="icon-close"/></span>
      </span>
      <span title="Add developer" v-if="isAdmin()" class="show-on-hovered add-dev-btn" @click="addDeveloper(task.id)" pill><i class="icon-add"/></span>
      <span v-if="isAdmin() || is_owner" title="Delete" class="show-on-hovered add-dev-btn" variant="outline-error" @click="deleteTask(task.id)" pill><i class="icon-delete"/></span>
      <!-- <b-button v-if="isAdmin" variant="outline-light" @click="addDeveloper(task.id)" pill><i class="icon-person_add"/></b-button> -->
      <h5 v-if="isMyTask">
        {{ myStepAndNotes }}
      </h5>
    </div>
    <div class="col-md-3" style="white-space: nowrap; display: table-cell; align-self:center">
      <div>
        <input id="task-list-due-date" @change="saveDueDate" :class="task.due_date && task.due_date !== '0000-00-00 00:00:00' ? 'badge badge-danger mr-3' : 'badge badge-danger mr-3  show-on-hovered'" :style="{ width: task.due_date && task.due_date !== '0000-00-00 00:00:00' ? '' : '34px!important', float: 'left', display: 'flex', cursor: 'pointer', 'background-color': dueDateDetails(task.due_date, true) }" type="date" name="due_at" placeholder="Due Date" :value="dueDate(task.due_date)" v-b-tooltip.hover :title="dueDateDetails(task.due_date)" />
      </div>
    </div>
  </div>
</template>

<script>
import TaskActionRow from './TaskActionRow.vue'
import ProjectIcon from '../components/ui/ProjectIcon'
import moment from 'moment'
import { Datetime } from 'vue-datetime'
import { EventBus } from '@/components/event-bus'
import { abbrName } from '@/utils/util-functions'
export default {
  props: ['task', 'tab', 'showCheckbox'],
  extends: TaskActionRow,
  components: {
    datetime: Datetime
  },
  name: 'user-task-row',
  data() {
    return {
      // priorities: ['high', 'regular', 'low', 'hold'],
      is_mouse_enter: false,
      priorities: [
        { value: 'high', text: 'High' },
        { value: 'regular', text: 'Regular' },
        { value: 'low', text: 'Low' },
        { value: 'hold', text: 'Hold' }
      ]
    }
  },
  watch: {},
  computed: {
    hasMargin() {
      let tasks = []
      if (this.tab === 'all') {
        tasks = this.$store.state.tasks.all_tasks
      } else if (this.tab === 'others') {
        tasks = this.$store.state.tasks.others_tasks
      } else if (this.tab === 'my_tasks') {
        tasks = this.$store.state.tasks.my_tasks
      } else if (this.tab === 'today_tasks') {
        tasks = this.$store.state.tasks.today_tasks
      } else if (this.tab === 'past_due') {
        tasks = this.$store.state.tasks.past_due_tasks
      } else if (this.tab === 'managing') {
      } else if (isFinite(this.tab)) {
        const user_id = this.tab
        tasks = user_id ? this.$store.getters['tasks/getByCompanyUserId'](user_id) : this.$store.getters['tasks/getMyTasks']
      } else {
        tasks = this.$store.state.tasks.my_tasks
      }
      const task = tasks.filter(task => task.id == this.task.id)[0]
      return task && task.hasMargin
    },
    isNewTask() {
      const timezone = moment.tz.guess()
      const timezone_date = moment()
        .tz(timezone)
        .format('YYYY-MM-DD')
      const diff = moment.duration(moment(this.task.created_at).diff(moment(timezone_date)))
      const days = diff.asDays()

      return Math.abs(days) < 2
    },
    is_owner() {
      const current_user_id = this.$store.state.settings.current_company_user_id
      return current_user_id == this.task.owner
    },
    durationDisplay() {
      const totalDuration = this.task.total_time_spent
      if (totalDuration === 0) return ''
      let durationHours = totalDuration ? Math.floor(totalDuration / 3600) : 0
      let durationMinutes = totalDuration ? ('00' + Math.floor((totalDuration % 3600) / 60)).slice(-2) : '00'
      let durationSeconds = totalDuration ? ('00' + Math.floor(totalDuration % 60)).slice(-2) : '00'

      return durationHours + ':' + durationMinutes + ':' + durationSeconds
    },
    isCompletedTask() {
      const current_user_id = this.$store.state.settings.current_company_user_id
      const user_info = this.$store.getters['task_users/getByTaskIdAndCompanyUserId']({ task_id: this.task.id, company_user_id: current_user_id })[0]
      return user_info && user_info.status === 'completed'
    },
    myStepAndNotes() {
      const current_user_id = this.$store.state.settings.current_company_user_id
      const user_info = this.$store.getters['task_users/getByTaskIdAndCompanyUserId']({ task_id: this.task.id, company_user_id: current_user_id })[0]
      if (user_info.step && user_info.notes) {
        return `${user_info.step}: ${user_info.notes}`
      } else if (user_info.step) {
        return `${user_info.step}: --`
      } else if (user_info.notes) {
        return `--: ${user_info.notes}`
      } else {
        return ''
      }
    },
    isMyTask() {
      const current_user_id = this.$store.state.settings.current_company_user_id
      const user_info = this.$store.getters['task_users/getByTaskIdAndCompanyUserId']({ task_id: this.task.id, company_user_id: current_user_id })
      return user_info.length > 0 && user_info[0].role === 'assigned'
    },
    task_users: {
      get: function() {
        return this.$store.getters['task_users/getByTaskId'](this.task.id).filter(task_user => task_user.role != 'owner')
      },
      set: function(newValue) {}
    },
    showTimer() {
      // const running_timers = this.$store.getters['timers/runningTimers']
      // if (running_timers.length > 0 && running_timers[0].task_id == this.task.id) {
      //   return true
      // } else if (running_timers.length > 0 && (!running_timers[0].task_id || running_timers[0].task_id != this.task.id)) {
      //   return false
      // }
      return true
    },
    current_company_user() {
      const me = this.$store.getters['company_users/getMe']
      return me
    }
  },
  methods: {
    addHoverClass: function(e) {
      e.target.classList.add('hovered')
    },
    removeHoverClass: function(e) {
      e.target.classList.remove('hovered')
    },
    getProject(project_id) {
      const project = this.$store.getters['projects/getById'](project_id)
      return project
    },
    priorityColor(priority) {
      if (this.task.due_date) {
        const timezone = moment.tz.guess()
        const timezone_date = moment()
          .tz(timezone)
          .format('YYYY-MM-DD')
        const task_due_date = moment(this.task.due_date).format('YYYY-MM-DD')

        const diff = moment.duration(moment(task_due_date).diff(moment(timezone_date)))
        const days = diff.asDays()
        if (days < 0) {
          color = 'past_due_color'
          return color
        } else if (days === 0) {
          color = 'due_today_color'
          return color
        }
      }
      let color = 'primary'
      switch (priority) {
        case 'high':
          color = 'danger'
          break
        case 'active':
          color = 'primary'
          break
        case 'regular':
          color = 'success'
          break
        case 'low':
          color = 'warning'
          break
        case 'hold':
          color = 'secondary'
          break

        default:
          color = 'primary'
          break
      }
      return color
    },
    date_pick() {
      document.getElementById('task-list-due-date').click()
    },
    makeToast(variant = null, content = '') {
      this.$bvToast.toast(content, {
        title: `${variant === 'success' ? 'Success' : 'Error'}`,
        variant: variant,
        solid: true
      })
    },
    addDeveloper(task_id) {
      this.$emit('showModal', task_id)
    },
    async deleteTask() {
      let to_delete = await this.$bvModal.msgBoxConfirm('Are you sure you want to delete?', {
        title: 'Please Confirm',
        size: 'md',
        buttonSize: 'sm',
        okVariant: 'danger',
        okTitle: 'YES',
        cancelTitle: 'NO',
        footerClass: 'p-2',
        hideHeaderClose: false,
        centered: true
      })

      if (to_delete) {
        this.$store.dispatch('DELETE', { module: 'tasks', entity: this.task })
      }
    },
    async completeMyTask(task_id) {
      const task_progress_info = {
        company_user_id: 'me',
        status: 'completed',
        notes: ''
      }
      const result = await this.$http().post(`/tasks-progress/${task_id}`, task_progress_info)
      if (result.status === 'success') {
        this.$emit('updateStatus', { status: 'completed', task_id: task_id })
      } else {
        this.makeToast('danger', result.message)
      }
      const { task_thread } = await this.$store.dispatch('threads/createThread', {
        task_id: task_id,
        title: `${this.current_company_user.fullname} Completed`,
        user: this.current_company_user
      })
      await this.$router.push({ query: { task: task_id, thread: task_thread.id, showChat: 'true' } })
      EventBus.$emit('complete_task', { task_id: task_id })
    },
    async notCompleteMyTask(task_id) {
      const task_progress_info = {
        company_user_id: 'me',
        status: '',
        notes: ''
      }
      const result = await this.$http().post(`/tasks-progress/${task_id}`, task_progress_info)
      if (result.status === 'success') {
        this.$emit('updateStatus', { status: '', task_id: task_id })
      } else {
        this.makeToast('danger', result.message)
      }
    },
    updateUser(user) {
      this.$emit('showUpdateModal', user)
    },
    updatePriority(priority) {
      this.task.priority = priority
      this.$store.dispatch('UPDATE_ATTRIBUTE', { module: 'tasks', id: this.task.id, attribute: 'priority', value: priority })
    },
    capitalizeFirstLetter(string) {
      const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)

      return capitalize(string)
    },
    abbrName,
    getCompanyUserDetails(company_user_id) {
      const user_details = this.$store.state.company_users.company_users.find(e => e.id === company_user_id)

      return user_details
    },
    getClientAcronymColor(project_id) {
      return this.getProjectDetails(project_id, true)
    },
    getProjectDetails(project_id, is_color) {
      const project = this.getProject(project_id)
      let client_data = null
      if (is_color && project) {
        client_data = this.$store.getters['clients/getByClientCompanyId'](project.client_company_id)
        return client_data ? client_data.color : ''
      }
      return project ? project.acronym : false
    },
    dueDate(due_date) {
      let formatted_date
      if (due_date) {
        formatted_date = moment(due_date, 'yyyy-MM-DD').format('yyyy-MM-DD')
      } else {
        return ''
      }
      return formatted_date
    },
    dueDateDetails(due_date, return_color) {
      if (!due_date && !return_color) {
        return ''
      }
      const timezone = moment.tz.guess()
      const timezone_date = moment()
        .tz(timezone)
        .format('YYYY-MM-DD')
      const task_due_date = moment(due_date).format('YYYY-MM-DD')

      const diff = moment.duration(moment(task_due_date).diff(moment(timezone_date)))
      const days = diff.asDays()
      const near_due_date = [1, 2, 3]
      let return_value
      let color
      if (days < 0) {
        return_value = 'Past due'
        color = '#484848'
      } else if (days === 0) {
        return_value = 'Due today'
        color = 'red'
      } else if (near_due_date.includes(days)) {
        return_value = `Due in ${days} ${days === 1 ? 'day' : 'days'}`
        color = 'orange'
      } else {
        return_value = `Due on ${moment(due_date).format('MMMM DD')}`
        if (due_date === '0000-00-00 00:00:00') {
          return_value = 'Select a due date'
        }
        color = '#17a2b8'
      }
      if (!due_date) {
        color = 'rgba(255,255,255,.4)'
      }
      if (return_color) {
        return_value = color
      }
      return return_value
    },
    saveDueDate(e) {
      const due_date = e.target.value
      this.$store.dispatch('UPDATE_ATTRIBUTE', { module: 'tasks', id: this.task.id, attribute: 'due_date', value: due_date })
    },
    changeNextWorkDay(task_id, star) {
      this.$emit('showSnoozeModal', { task_id, star })
    },
    getTaskTimers(id, type) {
      let timers = this.$store.state.timers.timers
      let running_timers = timers.filter(e => e.status === 'running' && e.task_id === id)
      let return_data
      switch (type) {
        case 'button_status':
          return_data = running_timers.length > 0 ? true : false
          break
        case 'stop_timer':
          return_data = timers.find(e => e.status === 'running' && e.task_id === id)
          break
        case 'restart_timer':
          const latest_task_timer = timers.filter(e => e.task_id === id)
          const latest_timer = latest_task_timer[latest_task_timer.length - 1]
          //guess timezone
          const timezone = moment.tz.guess()
          const tz_date = moment(new Date()).tz(timezone)
          //convert current date to database timezone
          const gmt_date = tz_date.clone().tz('GMT')

          const is_same_day = latest_timer ? moment(moment(gmt_date).format('YYYY-MM-DD')).isSame(moment(latest_timer.report_at).format('YYYY-MM-DD'), 'day') : false

          return_data = { is_same_day, latest_timer }
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

      const { is_same_day, latest_timer } = this.getTaskTimers(this.task.id, 'restart_timer')
      if (is_same_day) {
        this.restartTimer(latest_timer)
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
      const updated_path = `/user-tasks?task=${this.task.id}&showChatSection=true&tab=${this.tab}`
      sessionStorage.setItem('tasks', updated_path)
      await this.$router.push({ query: { task: this.task.id, showChatSection: 'true', tab: this.tab } })
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

<style type="text/css">
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

#priorities-dropdown > .btn {
  padding: 0px 5px !important;
  display: inline-block;
  padding: 0.25em 0.4em;
  font-size: 75%;
  font-weight: 700;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 8px !important;
  width: 13px !important;
  height: 13px !important;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out, -webkit-box-shadow 0.15s ease-in-out;
}
#priorities-dropdown > .btn.btn-past_due_color {
  background-color: #484848;
}
#priorities-dropdown > .btn.btn-due_today_color {
  background-color: red;
}

#task-list-due-date {
  color: white;
  border: none !important;
  text-align: center !important;
  width: 135px !important;
  height: 20px;
}
.completed {
  border: solid 2px #28a745;
}
.add-dev-btn {
  border-radius: 50%;
  border: solid 1px;
  padding: 2px 0px 3px;
  margin-left: 4px;
}
.add-dev-btn:hover {
  cursor: pointer;
  color: #fff;
  background-color: #28a745;
  border-color: #28a745;
}

.add-dev-btn i {
  font-size: 19px;
  font-weight: bold;
}

span.avatar.notes:before {
  content: '';
  background: url(notes.png) no-repeat;
  display: block;
  width: 15px;
  height: 15px;
  margin-right: -25px;
  margin-top: -17px;
  background-size: contain;
  position: absolute;
}
.user-task-row .icon-play_arrow,
.user-task-row .icon-stop {
  border: solid 2px white;
  border-radius: 50%;
  font-size: 17px;
}
.user-task-row .icon-play_arrow:hover,
.user-task-row .icon-stop:hover {
  background-color: #fff;
}

.show-on-hovered {
  visibility: hidden;
}

.hovered .show-on-hovered {
  visibility: visible;
}

.hovered > div {
  background-color: rgba(0, 0, 0, 0.4);
}

#priorities-dropdown > .btn::after {
  content: none;
}
input[value='']::-webkit-datetime-edit {
  color: transparent;
}
input:focus::-webkit-datetime-edit {
  color: #000;
}

input[type='date'].show-on-hovered::-webkit-calendar-picker-indicator {
  bottom: 0;
  cursor: pointer;
  height: auto;
  left: 5px;
  position: absolute;
  right: 125px;
  top: 0;
  width: auto;
}
input[type='date'].show-on-hovered,
input[type='date'].show-on-hovered:focus {
  color: transparent !important;
  float: left;
}
/* span.avatar.test:after {
  background: url(../assets/icons/test.png) no-repeat;
  content: '';
  display: block;
  width: 30px;
  height: 30px;
  margin-right: -5px;
  margin-top: 31px;
  background-size: contain;
  position: absolute;
}
span.avatar.feedback:after {
  background: url(../assets/icons/feedback.png) no-repeat;
  content: '';
  display: block;
  width: 20px;
  height: 20px;
  margin-right: -5px;
  margin-top: 31px;
  background-size: contain;
  position: absolute;
}
span.avatar.notify:after {
  background: url(../assets/icons/notify.png) no-repeat;
  content: '';
  display: block;
  width: 20px;
  height: 20px;
  margin-right: -5px;
  margin-top: 31px;
  background-size: contain;
  position: absolute;
}
span.avatar.publish:after {
  background: url(../assets/icons/publish.png) no-repeat;
  content: '';
  display: block;
  width: 20px;
  height: 20px;
  margin-right: -5px;
  margin-top: 31px;
  background-size: contain;
  position: absolute;
} */
</style>
