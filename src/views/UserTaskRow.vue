<template>
  <div class="col-md-12">
    <div class="card" style="margin:5px 15px;background-color: rgba(0,0,0,.4); color:white;">
      <div class="card-body" style="padding: 10px 20px 10px 25px">
        <div class="row" style="padding: 0px;">
          <div class="col-md-9" style="align-self:center">
            <h6 class="card-text">
              <b-badge :style="{ 'background-color': getClientAcronymColor(task.project_id) }" variant="primary" class="mr-2" v-if="getProjectDetails(task.project_id)" v-b-tooltip.hover :title="taskProjectName(task.project_id) && taskProjectName(task.project_id)">
                {{ getProjectDetails(task.project_id) }}
              </b-badge>
              <b-badge @click="startTimer()" v-if="!getTaskTimers(task.id, 'button_status')" variant="light mr-2" style="cursor:pointer"> <i class="icon-play_arrow" style="color:green;"></i>Play </b-badge>
              <b-badge @click="stopTimer()" v-if="getTaskTimers(task.id, 'button_status')" variant="light mr-2" style="cursor:pointer"> <i class="icon-stop" style="color:red;"></i>Stop </b-badge>
              <!-- <b-badge variant="danger mr-2" style="cursor:pointer">{{ task.priority ? capitalizeFirstLetter(task.priority) : 'Priority' }}</b-badge> -->
              <b-dropdown id="priorities-dropdown" :text="task.priority ? capitalizeFirstLetter(task.priority) : ''" variant="danger" style="border:none">
                <b-dropdown-item @click="updatePriority('high')">High</b-dropdown-item>
                <b-dropdown-item @click="updatePriority('regular')">Regular</b-dropdown-item>
                <b-dropdown-item @click="updatePriority('low')">Low</b-dropdown-item>
                <b-dropdown-item @click="updatePriority('hold')">Hold</b-dropdown-item>
              </b-dropdown>
              <b>
                | {{ task.title ? task.title : '---' }}
                <span v-for="user in task.users">
                  <span :title="getCompanyUserDetails(user.company_user_id).name" @click="updateUser(user)" :class="`avatar mr-1 pointer ${user.status} ${user.step} ${user.notes ? 'notes' : ''}`" :style="{ 'background-color': getCompanyUserDetails(user.company_user_id).color, cursor: 'pointer', display: 'inline-flex' }">
                    {{ abbrName(getCompanyUserDetails(user.company_user_id).name) }}
                  </span>
                </span>
                <span v-if="isMyTask()">
                  <span title="Complete" class="add-dev-btn" v-if="!isCompletedTask()" variant="outline-success" @click="completeMyTask(task.id)" pill><i class="icon-check"/></span>
                  <span title="Cancel Complete" class="add-dev-btn" v-else variant="outline-success" @click="notCompleteMyTask(task.id)" pill><i class="icon-close"/></span>
                </span>
                <span title="Add developer" v-if="isAdmin" class="add-dev-btn" @click="addDeveloper(task.id)" pill><i class="icon-add"/></span>

                <!-- <b-button v-if="isAdmin" variant="outline-light" @click="addDeveloper(task.id)" pill><i class="icon-person_add"/></b-button> -->
              </b>
            </h6>
          </div>
          <div class="col-md-3" style="align-self:center">
            <div>
              <b-badge variant="primary mr-2" style="cursor:pointer; float:right" @click="showTaskDetail"><i class="icon-open_in_new"></i>Open task</b-badge>
              <input id="task-list-due-date" @change="saveDueDate" class="badge badge-danger mr-2" :style="{ float: 'right', display: 'flex', cursor: 'pointer', 'background-color': dueDateDetails(task.due_date, true) }" type="date" name="due_at" placeholder="Due Date" :value="dueDate(task.due_date)" v-b-tooltip.hover :title="dueDateDetails(task.due_date)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TaskActionRow from './TaskActionRow.vue'
import ProjectIcon from '../components/ui/ProjectIcon'
import moment from 'moment'
import { Datetime } from 'vue-datetime'
import { abbrName } from '@/utils/util-functions'
export default {
  props: ['task', 'isAdmin'],
  extends: TaskActionRow,
  components: {
    datetime: Datetime
  },
  name: 'user-task-row',
  data() {
    return {
      // priorities: ['high', 'regular', 'low', 'hold'],
      priorities: [
        { value: 'high', text: 'High' },
        { value: 'regular', text: 'Regular' },
        { value: 'low', text: 'Low' },
        { value: 'hold', text: 'Hold' }
      ],
      users_in_task: this.task.users,
      user_info: {}
    }
  },
  watch: {},
  methods: {
    makeToast(variant = null, content = '') {
      this.$bvToast.toast(content, {
        title: `${variant === 'success' ? 'Success' : 'Error'}`,
        variant: variant,
        solid: true
      })
    },
    isCompletedTask() {
      const current_user_id = this.$store.state.settings.current_company_user_id
      this.user_info = this.task.users.filter(user => user.company_user_id === current_user_id)[0]
      return this.user_info && this.user_info.status === 'completed'
    },
    isMyTask() {
      const current_user_id = this.$store.state.settings.current_company_user_id
      return this.task.users.findIndex(user => user.company_user_id === current_user_id) > -1
    },
    addDeveloper(task_id) {
      this.$emit('showModal', task_id)
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
        return client_data.color
      }
      return project ? project.acronym : false
    },
    dueDate(due_date) {
      let formatted_date
      if (due_date) {
        formatted_date = moment(new Date(due_date)).format('yyyy-MM-DD')
      }
      return formatted_date
    },
    dueDateDetails(due_date, return_color) {
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
        color = '#ffc107'
      } else if (days === 0) {
        return_value = 'Due today'
        color = 'red'
      } else if (near_due_date.includes(days)) {
        return_value = `Due in ${days} ${days === 1 ? 'day' : 'days'}`
        color = 'orange'
      } else {
        return_value = `Due on ${moment(due_date).format('MMMM DD')}`
        color = '#17a2b8'
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
          console.log(latest_timer)
          //guess timezone
          const timezone = moment.tz.guess()
          const tz_date = moment(new Date()).tz(timezone)
          //convert current date to database timezone
          const gmt_date = tz_date.clone().tz('GMT')

          const is_same_day = latest_timer ? moment(moment(gmt_date).format('YYYY-MM-DD')).isSame(moment(latest_timer.report_at).format('YYYY-MM-DD'), 'day') : false
          console.log(is_same_day)

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
      console.log(latest_timer)
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
  border-radius: 0.25rem;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out, -webkit-box-shadow 0.15s ease-in-out;
}

#task-list-due-date {
  color: white !important;
  border: none !important;
  text-align: center !important;
  width: 135px !important;
  height: 20px;
}
.completed {
  border: solid 4px #28a745;
  padding: 14px;
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
span.avatar.test:after {
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
}
</style>
