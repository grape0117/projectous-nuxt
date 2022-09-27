<template>
  <div class="col-md-12">
    <div class="card" style="margin:5px 15px;background-color: rgba(0,0,0,.4); color:white;">
      <div class="card-body" style="padding: 10px 20px 10px 25px">
        <div class="row" style="padding: 0px;">
          <div class="col-md-9" style="align-self:center">
            <h6 class="card-text">
              <!-- <span data-v-24a82bfa="" class="project-icon mr-2" style="background-color: lime;"><span></span><span class="dragzone-project-acronym"> RWR </span></span> -->
              <b-badge :style="{ 'background-color': getClientAcronymColor(task.project_id) }" variant="primary" class="mr-2" v-if="getProjectDetails(task.project_id)">{{ getProjectDetails(task.project_id) }}</b-badge>
              <b>
                {{ taskProjectName(task.project_id) ? taskProjectName(task.project_id) : 'No Project' }} | {{ task.title ? task.title : '---' }}
                <span v-for="user in task.users">
                  <span data-v-0d6e703a="" :title="getCompanyUserDetails(user.company_user_id).name" class="avatar mr-1 pointer" :style="{ 'background-color': getCompanyUserDetails(user.company_user_id).color, cursor: 'pointer', display: 'inline-flex' }"
                    ><!-- background-color: #007bff; display:inline-flex; cursor: pointer; -->
                    {{ abbrName(getCompanyUserDetails(user.company_user_id).name) }}
                  </span>
                </span>
                <!-- <span v-if="task.users.length > 0" :title="company_users.filter(c_user => c_user.id === user.company_user_id)[0].name" class="avatar mr-1 pointer" :style="{ 'background-color': company_users.filter(c_user => c_user.id === user.company_user_id)[0].color }">
                        {{ abbrName(company_users.filter(c_user => c_user.id === user.company_user_id)[0].name) }}
                        </span> -->
              </b>
            </h6>
          </div>
          <div class="col-md-3" style="align-self:center">
            <div v-if="!is_select_priority">
              <b-badge @click="startTimer()" v-if="!getTaskTimers(task.id, 'button_status')" variant="light mr-2" style="cursor:pointer; float:right"> <i class="icon-play_arrow" style="color:green;"></i>Play </b-badge>
              <b-badge @click="stopTimer()" v-if="getTaskTimers(task.id, 'button_status')" variant="light mr-2" style="cursor:pointer; float:right"> <i class="icon-stop" style="color:red;"></i>Stop </b-badge>
              <b-badge variant="primary mr-2" style="cursor:pointer; float:right" @click="showTaskDetail"><i class="icon-open_in_new"></i>Open task</b-badge>
              <b-badge variant="danger mr-2" style="cursor:pointer; float:right" @click="enableSelectPriority">! {{ task.priority }}</b-badge>
              <b-badge variant="warning mr-2" v-if="task.due_date" style="cursor:pointer; float:right"><i class="icon-timer"></i>{{ dueDate(task.due_date) }}</b-badge>
            </div>
            <div v-if="is_select_priority">
              <b-form-select v-model="task.priority" :options="priorities" size="sm" style="width:90px; float: right; background-color: #ffa500; color:white; border: none;"></b-form-select>
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
  props: ['task'],
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
      is_select_priority: false
    }
  },
  watch: {
    'task.priority'(value) {
      this.is_select_priority = false
      this.$store.dispatch('UPDATE_ATTRIBUTE', { module: 'tasks', id: this.task.id, attribute: 'priority', value: value })
    }
  },
  methods: {
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
    enableSelectPriority() {
      this.is_select_priority = true
    },
    dueDate(due_date) {
      return moment(due_date).format('MMM D')
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
          // console.log(moment(gmt_date).format("YYYY-MM-DD"), moment(latest_timer.report_at).format("YYYY-MM-DD"))
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
