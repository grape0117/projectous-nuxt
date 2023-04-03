<template>
  <div class="task-detail" v-if="task">
    <div class="p-3">
      <b>
        <b-badge :style="{ 'background-color': getClientAcronymColor(task.project_id) }" variant="primary" class="mr-2 ml-2" v-if="getProjectDetails(task.project_id)" v-b-tooltip.hover :title="taskProjectName(task.project_id)">
          {{ getProjectDetails(task.project_id) }}
        </b-badge>
        <h5 class="task-title mx-3 my-0">{{ task.title }}</h5>
        <span v-for="user in task_users">
          <span v-if="getCompanyUserDetails(user.company_user_id)" :title="`${getCompanyUserDetails(user.company_user_id).fullname}`" :class="`avatar mr-1 pointer ${user.status} ${user.step} ${user.notes ? 'notes' : ''}`" :style="{ 'background-color': getCompanyUserDetails(user.company_user_id).color, cursor: 'pointer', display: 'inline-flex' }">
            {{ abbrName(getCompanyUserDetails(user.company_user_id).name) }}
          </span>
        </span>
      </b>
      <div class="row task-row">
        <div>
          <h6 class="card-text">
            <i class="icon-play_arrow" @click="startTimer()" v-if="!getTaskTimers(task.id, 'button_status')" style="color:green;cursor:pointer;"></i>
            <i class="icon-stop" @click="stopTimer()" v-if="getTaskTimers(task.id, 'button_status')" style="color:red;cursor:pointer;"></i>
          </h6>
        </div>
        <div class="duration">
          <span class="estimated-hour">{{ durationDisplay }}</span>
          <date-picker id="task-list-due-date1" :color="dueDateDetails(task.due_date, true)" class="mx-3" :style="{ display: 'flex', cursor: 'pointer', height: 40 }" :expire_date="expireDate(task.due_date)" name="due_at" placeholder="Due Date" :value="dueDate(task.due_date)" v-b-tooltip.hover :title="dueDateDetails(task.due_date)"></date-picker>
        </div>
      </div>
      <div class="task-description">
        <pre class="msg-content" style="color: black;">{{ task.note }}</pre>
      </div>
    </div>
    <b-tabs content-class="mt-3 " class="threads-list p-3" active-nav-item-class="font-weight-bold text-uppercase tab-active" active-tab-class="font-weight-bold">
      <b-tab title="THREADS">
        <div class="thread-container">
          <div :class="`thread-item ${thread_id == thread.id ? 'active' : ''}`" v-for="thread in threads" @click="openThread(thread)">
            <span v-if="getCompanyUserDetails(thread.owner.id)" :class="`avatar mr-1 pointer`" :style="{ 'background-color': getCompanyUserDetails(thread.owner.id).color, cursor: 'pointer', display: 'inline-flex' }">
              {{ abbrName(getCompanyUserDetails(thread.owner.id).name) }}
            </span>
            <p :class="`m-0 ${thread.num_unread > 0 ? 'unread-item' : ''}`" :style="`color: ${thread.num_unread > 0 ? 'white' : ''};`">{{ thread.title }}</p>
            <div class="unread-message-num" v-if="thread.num_unread > 0" style="position: relative;">
              <span class="rounded-circle task-sidebar-item_badge">{{ thread.num_unread }}</span>
            </div>
            <span @click="selectReponsibility(thread)" v-if="thread.responsibility_company_user_id && getCompanyUserDetails(thread.responsibility_company_user_id)" :class="`avatar mr-1 pointer ml-4 responsibility`" :style="{ 'background-color': getCompanyUserDetails(thread.responsibility_company_user_id).color, cursor: 'pointer', display: 'inline-flex' }">
              {{ abbrName(getCompanyUserDetails(thread.responsibility_company_user_id).name) }}
            </span>
          </div>
          <div class="mt-3 ml-2" v-if="closed_threads.length > 0">
            <a class="see-closed" href="javascript:void();" @click="showClosedThreads()"><span v-if="show_closed_threads">Hide</span><span v-else>See</span> {{ closed_threads.length }} closed threads</a>
            <div v-if="show_closed_threads" :class="`thread-item ${thread_id == thread.id ? 'active' : ''}`" v-for="thread in closed_threads" @click="openThread(thread)">
              <span v-if="getCompanyUserDetails(thread.owner.id)" :class="`avatar mr-1 pointer`" :style="{ 'background-color': getCompanyUserDetails(thread.owner.id).color, cursor: 'pointer', display: 'inline-flex' }">
                {{ abbrName(getCompanyUserDetails(thread.owner.id).name) }}
              </span>
              <p class="m-0">{{ thread.title }}</p>
            </div>
          </div>
        </div>
        <b-button class="text-white border-white new-thread-btn" variant="outline-primary" @click="createThread()">New Thread</b-button>
      </b-tab>
      <b-tab title="FILES">
        <h2>files</h2>
      </b-tab>
      <b-tab title="LOG">
        <h2>logs</h2>
      </b-tab>
    </b-tabs>
    <new-thread-modal id="new-thread" :task_id="this.task.id" />
    <select-responsibility-modal id="select-responsibility" :thread="thread" :task_id="this.task.id" />
  </div>
</template>

<script>
import uuid from 'uuid'
import moment from 'moment'
import vue2Dropzone from 'vue2-dropzone'
import { EventBus } from '@/components/event-bus'
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
import { chain, groupBy } from 'lodash'
import { getCookie, abbrName } from '@/utils/util-functions'
import DatePicker from './DatePicker'
import NewThreadModal from './NewThreadModal'
import SelectResponsibilityModal from './SelectResponsibilityModal'

export default {
  data() {
    return {
      showDropzone: false,
      fileExist: false,
      s_message: '',
      selected_message: null,
      enabledNotification: false,
      dropzoneOptions: {
        // url: `${process.env.VUE_APP_API_URL}/store-file`,
        url: `https://testing.projectous.com/upload`,
        thumbnailWidth: 150,
        maxFilesize: 500,
        autoProcessQueue: false,
        addRemoveLinks: true,
        headers: {
          InstanceID: this.$store.state.settings.instance_id,
          Authorization: 'Bearer ' + getCookie('auth_token'),
          'Cache-Control': '',
          'X-Requested-With': '',
          'Access-Control-Allow-Origin': '*'
        }
        // paramName: function(n) {
        //   return "files[]";
        // },
      },
      show_closed_threads: false,
      usersList: [],
      thread: null
    }
  },
  components: {
    'task-message-item': () => import('./TaskMessageItem.vue'),
    vueDropzone: vue2Dropzone,
    'date-picker': DatePicker,
    NewThreadModal,
    SelectResponsibilityModal
  },
  props: {
    task: {
      type: Object,
      required: false,
      default: () => {}
    },
    chat: {
      type: Object,
      require: true
    },
    showChat: false,
    thread_id: null
  },
  /* Load surveys and questionnaired on page load. */
  created() {
    EventBus.$on('selectReponsibility', thread => {
      this.selectReponsibility(JSON.parse(thread))
    })
  },
  watch: {
    showChat: function(show) {}
  },

  computed: {
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
    durationDisplay() {
      const totalDuration = this.task.total_time_spent
      // let durationHours = totalDuration ? Math.floor(totalDuration / 3600) : '0'
      let durationHours = Math.floor(totalDuration / 3600)
      let time_estimate = this.task.estimate ? this.task.estimate : '?'
      // let durationMinutes = totalDuration ? ('00' + Math.floor((totalDuration % 3600) / 60)).slice(-2) : '00'
      // let durationSeconds = totalDuration ? ('00' + Math.floor(totalDuration % 60)).slice(-2) : '00'

      // return durationHours + ':' + durationMinutes + ':' + durationSeconds
      return durationHours + '/' + time_estimate
    },
    task_users: {
      get: function() {
        return this.$store.getters['task_users/getByTaskId'](this.task.id)
        // return this.$store.getters['task_users/getByTaskId'](this.task.id).filter(task_user => task_user.role != 'owner')
      },
      set: function(newValue) {}
    },

    // chatMessages() {
    //   const task_id = this.chat.chat_id
    //   let messages = this.$store.getters['task_messages/getByTaskId'](task_id)
    //   messages = messages.sort(function(a, b) {
    //     return new Date(b.created_at) - new Date(a.created_at)
    //   })
    //   setTimeout(() => {
    //     let container = this.$refs.msgContainer
    //     container.scrollTop = container.scrollHeight + 120
    //   }, 100)

    //   return messages.reverse()
    // },
    // getMessages() {
    //   let messages = this.$store.getters['task_messages/getByTaskId'](this.task_id)
    //   messages.sort(function(a, b) {
    //     return new Date(b.created_at) - new Date(a.created_at)
    //   })
    //   return messages.reverse()
    // },
    current_company_user_id() {
      return this.$store.state.settings.current_company_user_id
    },
    current_company_user() {
      const me = this.$store.getters['company_users/getMe']
      return me
    },
    threads() {
      const myThreas = this.$store.getters['threads/getOpenedThreads'](this.task.id)
      return myThreas
    },
    closed_threads() {
      const myThreas = this.$store.getters['threads/getClosedThreads'](this.task.id)
      return myThreas
    }
  },
  mounted() {
    // setTimeout(() => {
    //   let container = this.$refs.msgContainer
    //   container.scrollTop = container.scrollHeight + 120
    // }, 500)
  },
  methods: {
    showClosedThreads() {
      this.show_closed_threads = !this.show_closed_threads
    },
    createThread() {
      this.$bvModal.show('new-thread-modal')
    },
    async openThread(thread) {
      const TASK_ID = this.task.id
      if (Object.keys(this.$route.query).length > 0 && this.$route.query.task === TASK_ID && this.$route.query.thread === thread.id) return
      await this.$router.push({ query: { task: TASK_ID, thread: thread.id, showChat: 'true' } })
    },
    async setTab(tab) {
      this.tab = tab
    },
    tabClass(tab) {
      if (this.tab === tab) {
        return 'active'
      }
    },
    expireDate(due_date) {
      if (!due_date) {
        return ''
      }
      const timezone = moment.tz.guess()
      const timezone_date = moment()
        .tz(timezone)
        .format('YYYY-MM-DD')
      const task_due_date = moment(due_date).format('YYYY-MM-DD')

      const diff = moment.duration(moment(task_due_date).diff(moment(timezone_date)))
      if (!diff._isValid) {
        return ''
      }
      const days = diff.asDays()

      if (Math.abs(parseInt(days)) > 99) {
        return '>99'
      }

      return Math.abs(parseInt(days))
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
        color = 'red'
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
      if (!due_date) {
        color = '#28a745'
      }
      if (return_color) {
        return_value = color
      }
      return return_value
    },
    abbrName,
    getCompanyUserDetails(company_user_id) {
      const user_details = this.$store.state.company_users.company_users.find(e => e.id === company_user_id)

      return user_details
    },
    getClientAcronymColor(project_id) {
      return this.getProjectDetails(project_id, true)
    },
    taskProjectName(project_id) {
      return this.$store.getters['projects/projectProjectName'](project_id)
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
    getProject(project_id) {
      const project = this.$store.getters['projects/getById'](project_id)
      return project
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

    changeText(e) {
      if (this.s_message == '\n' || this.s_message == '') {
        this.s_message = ''
      }
    },
    dragLeave(event) {
      if (!this.fileExist) {
        this.showDropzone = false
      }
    },
    dropFile(event) {},
    dragOver(event) {
      this.showDropzone = true
      event.preventDefault()
    },
    fileAdded(file) {
      this.showDropzone = true
      this.fileExist = true
    },
    filesAdded(file) {
      $('#dropzone').addClass('dropzone-file-contentainer')
      this.showDropzone = true
      this.fileExist = true
    },
    sendingFiles(file, xhr, formData) {},
    uploadSuccess(file, response) {
      this.showDropzone = false
      this.$refs.chatDropzone.removeAllFiles()

      let task_id = this.chat.chat_id
      let company_user_id = this.current_company_user_id
      let message = this.s_message
      let task
      let me = this.current_company_user
      if (this.selected_message == null) {
        let task_message = this.$store.dispatch('task_messages/createTaskMessage', {
          task_id,
          company_user_id,
          file_path: response.file_path,
          message: response.name,
          is_file: true,
          thumbnail: response.thumbnail_path,
          user: me
        })
        this.s_message = ''
        return
      }
    },
    afterComplete(response) {
      this.showDropzone = false
      this.$refs.chatDropzone.removeAllFiles()
    },
    cancelUpload(file) {},
    removedFile(file, error, xhr) {
      if (this.$refs.chatDropzone.getActiveFiles().length == 0) {
        this.showDropzone = false
      }
    },
    isShowDate(index, message, messages) {
      if (index === 0) return true
      return messages && messages.length > 0 && this.date(message.created_at) !== this.date(messages[index > 0 ? index - 1 : index].created_at)
    },
    date(date) {
      return moment(date).format('MMM DD, YYYY | ddd')
    },

    selectReponsibility(thread) {
      console.log(thread)
      this.thread = thread
      this.$nextTick(() => {
        this.$bvModal.show('select-responsibility-modal')
      })
    },
    async saveMessage() {
      if (this.$refs.chatDropzone && this.$refs.chatDropzone.getActiveFiles().length > 0) {
        this.$refs.chatDropzone.processQueue()
      }
      if (this.s_message == '\n' || this.s_message == '') {
        this.s_message = ''
        return
      }
      let task_id = this.chat.chat_id
      let company_user_id = this.current_company_user_id
      let message = this.s_message
      let task
      if (this.selected_message == null) {
        // create
        // let message = {
        //   id: uuid.v4(),
        //   task_id: this.task_id,
        //   company_user_id: this.current_company_user_id,
        //   message: this.s_message,
        //   created_at: moment().format('YYYY-MM-DD HH:mm:ss')
        // }
        // this.$store.dispatch('ADD_ONE', { module: 'task_messages', entity: [message] }, { root: true })
        let me = this.current_company_user
        let task_message = this.$store.dispatch('task_messages/createTaskMessage', {
          task_id,
          company_user_id,
          message,
          user: me
        })
        // .then(res => {

        // })
        this.s_message = ''
        return
        task = this.$store.getters['tasks/getById'](task_id)
        task.last_task_message_id = task_message.task_messages.id
        task.last_task_message_created_at = moment().format('YYYY-MM-DD HH:mm:ss')
      } else {
        // update
        // update task_message
        this.selected_message.message = this.s_message
        this.$store.dispatch('UPDATE', { module: 'task_messages', entity: this.selected_message }, { root: true })
        // update task
        task = this.$store.getters['tasks/getById'](this.selected_message.task_id)
        task.last_task_message_id = this.selected_message.id
        task.last_task_message_created_at = moment().format('YYYY-MM-DD HH:mm:ss')
        this.$store.dispatch('UPDATE', { module: 'tasks', entity: task }, { root: true })
        // initialize
        this.selected_message = null
        this.s_message = ''
      }
      this.$store.dispatch('UPDATE', { module: 'tasks', entity: task }, { root: true })
    },
    attachFile() {
      this.showDropzone = true
      var that = this
      setTimeout(() => {
        that.$refs.chatDropzone.$el.click()
      }, 500)
    }
  }
}
</script>

<style scoped>
.task-detail {
  width: 100%;
  background-color: #aeaeae;
}
b {
  display: flex;
  align-items: center;
}
.task-row {
  width: 100%;
  justify-content: space-between;
}
.task-title {
  color: #fffdfd;
}
.duration {
  display: flex;
  align-items: center;
}
.estimated-hour {
  font-size: 22px;
  color: red;
}
.icon-play_arrow,
.icon-stop {
  font-size: 57px;
}

.icon-play_arrow:before,
.icon-stop:before {
  margin: 0px;
}
.msg-content {
  padding: 8px 12px;
  background-color: #c5c5c5;
  border-radius: 4px;
  margin-top: 5px;
  margin-bottom: 0;
  white-space: pre-wrap;
  font-size: 17px;
  min-height: 93%;
  word-break: break-word;
}
.threads-list {
  margin-top: 10px;
  background-color: #5755ac;
  height: calc(100% - 230px);
  min-height: 200px;
  position: relative;
}
.nav-tabs .nav-link.active,
.nav-tabs .nav-item.show .nav-link,
.tab-active {
  background-color: #5755ac !important;
}
.nav-tabs .nav-link {
  background-color: gray !important;
}
.tab-active {
  background-color: #5755ac !important;
}

.thread-item {
  display: flex;
  align-items: center;
  margin-top: 10px;
  cursor: pointer;
  position: relative;
}
.thread-item .responsibility {
  position: absolute;
  right: 0px;
  z-index: 999;
  border: solid red 2px;
}

.thread-item:hover {
  background-color: #575681;
}
.thread-item.active {
  background-color: #575681;
}

.thread-container {
  max-height: 90%;
  height: calc(100vh - 547px);
  overflow: auto;
}
.new-thread-btn {
  position: absolute;
  bottom: 15px;
  right: 20px;
}

.see-closed {
  color: white;
}
.unread-message-num span {
  background-color: red;
  color: white;
  font-weight: bold;
  border: 1px solid red;
  position: absolute;
  right: -47px;
  top: -11px;
  font-size: 14px;
  width: 20px;
  height: 20px;
}
.task-description {
  height: 94px;
  overflow: auto;
}

.unread-item {
  font-weight: bolder;
  color: white;
}

::-webkit-scrollbar {
  width: 10px;
}

/* Track */
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px grey;
  border-radius: 10px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #777;
  border-radius: 10px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #888;
  cursor: pointer;
}
</style>
