<template>
  <div class="message-panel" id="message-container" @dragover="dragOver" @drop="dropFile">
    <thread-title :thread="thread" v-if="!thread_type" />
    <b-list-group class="thread-message-panel_inner" ref="msgContainer" @scroll="getNextMessages">
      <div v-for="(message, index) in chatMessages" :key="message.id">
        <div class="date" v-if="isShowDate(index, message, chatMessages)">
          {{ date(message.created_at) }}
        </div>
        <task-message-item :message="message" @edit-message="editMessage" @delete-message="deleteMessage" :is_me="message.company_user_id == current_company_user_id" />
      </div>
    </b-list-group>
    <vue-dropzone @vdropzone-drag-leave="dragLeave" ref="chatDropzone" id="dropzone" :options="dropzoneOptions" @vdropzone-complete-multiple="afterComplete" @vdropzone-sending="sendingFiles" v-if="showDropzone" :useCustomSlot="true" @vdropzone-file-added="fileAdded" @vdropzone-files-added="filesAdded" @vdropzone-canceled="cancelUpload" @vdropzone-removed-file="removedFile" @vdropzone-success-multiple="uploadSuccess">
      <div class="dropzone-custom-content">
        <h3 class="dropzone-custom-title">Drag and drop a file</h3>
        <div class="subtitle">...or click to select a file from your computer</div>
      </div>
    </vue-dropzone>
    <div class="video-container" v-if="show_share_screen">
      <i class="icon-close" @click="closeRcording" />
      <video src="" autplay class="video-preview bg-black w-full h-auto w-48 mw-48 mx-auto mb-4" style="max-width: 48%;"></video>
      <video class="recorded-video-result bg-black h-auto mx-auto mb-4 w-48 mw-48" :src="downloadUrl" style="max-width: 48%;" controls></video>
    </div>
    <div class="chat-block-spinner-bar" style="position: absolute; display: flex; height: 100%; z-index: 10; justify-content: center!important; align-items: center; width: 100%; top: 0; right: 0;">
      <div class="bounce1"></div>
      <div class="bounce2"></div>
      <div class="bounce3"></div>
    </div>
    <div class="send-message" v-if="(thread && thread.status == 'open') || thread_type == 'client'">
      <b-form-textarea type="text" ref="message_content" v-model="s_message" placeholder="Write you message" rows="3" max-rows="3" @keyup.enter.exact="changeText" @keydown.enter="handleEnter" @paste="$event => onMessagePaste($event)"> </b-form-textarea>
      <i class="icon-attach_file" @click="attachFile()" />
      <!-- <b-form-checkbox v-if="!isStarted" v-model="include_audio" name="check-button" switch variant="warning" class="text-white">
      </b-form-checkbox> -->
      <i class="icon-screen_share" @click="startRecording" v-if="!isStarted" />
      <i class="icon-stop" @click="stopRecording" v-if="isStarted" />
      <i class="icon-help_outline" @click="needHelp" />
      <i class="icon-send" :style="(s_message !== '' && s_message !== '\n') || fileExist || stream_video ? 'color: darkorange;' : 'color: gray;'" @click="saveMessage()" />
    </div>
    <div class="thread-btns" v-if="(thread && thread.status == 'open') || thread_type == 'client'">
      <b-button v-if="!thread_type" @click="closeThread">CLOSE THREAD</b-button>
      <b-button @click="saveMessage()">SUBMIT</b-button>
    </div>
    <div class="thread-btns" v-else>
      <b-button @click="reopenThread">Reopen THREAD</b-button>
    </div>
  </div>
</template>

<script>
import uuid from 'uuid'
import moment from 'moment'
import vue2Dropzone from 'vue2-dropzone'
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
import { chain, groupBy } from 'lodash'
import { getCookie } from '@/utils/util-functions'
import { EventBus } from '@/components/event-bus'
import _ from 'lodash'

export default {
  data() {
    return {
      showDropzone: false,
      fileExist: false,
      s_message: '',
      selected_message: null,
      enabledNotification: false,
      timeout: 100000,
      dropzoneOptions: {
        // url: `${process.env.VUE_APP_API_URL}/store-file`,
        url: `https://testing.projectous.com/upload`,
        // url: `http://localhost:3000/upload`,
        thumbnailWidth: 150,
        maxFilesize: 500,
        maxFiles: 1000,
        parallelUploads: 100,
        uploadMultiple: true,
        autoProcessQueue: false,
        addRemoveLinks: true,
        headers: {
          InstanceID: this.$store.state.settings.instance_id,
          Authorization: 'Bearer ' + getCookie('auth_token'),
          'Cache-Control': '',
          'X-Requested-With': '',
          'Access-Control-Allow-Origin': '*'
        }
      },
      thread_message: null,
      last_message_timestamp: null,

      stream: null,
      audio: null,
      mixedStream: null,
      chunks: [],
      recorder: null,
      startButton: null,
      stopButton: null,
      downloadUrl: null,
      recordedVideo: null,
      include_audio: true,
      isStarted: false,
      stream_video: null,
      show_share_screen: false
    }
  },
  components: {
    'task-message-item': () => import('./TaskMessageItem.vue'),
    'thread-title': () => import('./ThreadTitle.vue'),
    vueDropzone: vue2Dropzone
  },
  props: {
    showChat: false,
    messageId: null,
    task_id: null,
    thread_id: null,
    thread_type: null
  },
  created() {
    this.$nextTick(() => {
      if (this.$refs.message_content) {
        this.$refs.message_content.focus()
      }
    })
  },
  watch: {
    showChat: function(show) {
      if (show) {
        let container = this.$refs.msgContainer
        container.scrollTop = container.scrollHeight + 120
      }
    },
    thread_id: function(thread_id) {
      if (thread_id) {
        this.s_message = ''
        if (this.$refs.message_content) {
          this.$refs.message_content.focus()
        }
      }
      this.$nextTick(() => {
        let container = this.$refs.msgContainer
        container.scrollTop = container.scrollHeight + 120
      })
    }
    // messageId: function(messageid) {
    //   if (messageid) {
    //     let message_content = this.$store.getters['task_messages/getById'](messageid)
    //     this.thread_title = message_content ? message_content.message : ''
    //     this.thread_message = message_content ? message_content : null
    //     this.thread_id = message_content.task_id + '-' + message_content.timestamp
    //   }
    // }
  },

  computed: {
    isNotificationEnabled() {
      return Notification.permission === 'granted'
    },
    chatMessages() {
      let messages = this.$store.getters['task_messages/getByThreadId'](this.thread_id)
      messages = messages.sort(function(a, b) {
        return new Date(b.created_at) - new Date(a.created_at)
      })
      this.$nextTick(() => {
        if (messages.length > 0 && this.last_message_timestamp <= messages[0].timestamp) {
          this.last_message_timestamp = messages[0].timestamp
          let container = this.$refs.msgContainer
          container.scrollTop = container.scrollHeight + 120
        }
      })
      return messages.reverse()
    },
    thread() {
      return this.$store.getters['threads/getById'](this.thread_id)[0]
    },
    current_company_user_id() {
      return this.$store.state.settings.current_company_user_id
    }
  },
  mounted() {
    this.hideLoading()
    setTimeout(() => {
      let container = this.$refs.msgContainer
      container.scrollTop = container.scrollHeight + 120
    }, 500)
    this.getNextMessages()
  },
  methods: {
    async needHelp() {
      if (this.thread.responsibility_company_user_id == this.current_company_user_id) {
        alert('You should change the responsibility')
        return
      }
      const result = await this.$http().post(`/need_help`, {
        task_id: this.task_id,
        thread_id: this.thread_id,
        responsibility_company_user_id: this.thread.responsibility_company_user_id
      })
    },
    clearScreen() {
      this.chunks = []
      this.stream = null
      this.audio = null
      this.mixedStream = null
      this.recorder = null
      this.startButton = null
      this.stopButton = null
      this.downloadUrl = ''
      this.recordedVideo = ''
      this.include_audio = true
      this.isStarted = false
      this.stream_video = null
      this.hideLoading()
    },
    async saveVideo() {
      this.showLoading()
      const data = new FormData()
      let fileName = `video.mp4`
      this.stream_video = new Blob(this.chunks, { type: 'video/mp4' })
      this.hideLoading()
    },
    async setupStream() {
      try {
        this.stream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        })
        if (this.include_audio) {
          this.audio = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 44100
            }
          })
        }
        this.setupVideoFeedback()
      } catch (err) {
        console.error(err)
      }
    },
    setupVideoFeedback() {
      if (this.stream) {
        const video = document.querySelector('.video-preview')
        video.srcObject = this.stream
        video.play()
      } else {
        console.warn('No stream available')
      }
    },
    async startRecording() {
      this.show_share_screen = true
      this.chunks = []
      await this.setupStream()

      if (this.stream) {
        if (this.audio) {
          this.mixedStream = new MediaStream([...this.stream.getTracks(), ...this.audio.getTracks()])
        } else {
          this.mixedStream = new MediaStream([...this.stream.getTracks()])
        }
        this.recorder = new MediaRecorder(this.mixedStream)
        this.recorder.ondataavailable = this.handleDataAvailable
        this.recorder.onstop = this.handleStop
        this.recorder.start(1000)
        this.isStarted = true
        console.log('Recording started')
      } else {
        console.warn('No stream available.')
      }
    },

    stopRecording() {
      this.recorder.stop()
      this.isStarted = false
    },

    handleDataAvailable(e) {
      this.chunks.push(e.data)
    },
    showLoading() {
      const loadingElement = document.getElementsByClassName('chat-block-spinner-bar')
      loadingElement[0].style.display = 'flex'
    },
    hideLoading() {
      const loadingElement = document.getElementsByClassName('chat-block-spinner-bar')
      loadingElement[0].style.display = 'none'
    },
    handleStop(e) {
      const blob = new Blob(this.chunks, { type: 'video/mp4' })

      this.downloadUrl = URL.createObjectURL(blob)
      const recordedVideo = document.getElementsByClassName('recorded-video-result')[0]
      recordedVideo.load()
      recordedVideo.onloadeddata = function() {
        recordedVideo.play()
      }

      this.stream.getTracks().forEach(track => track.stop())
      if (this.audio) {
        this.audio.getTracks().forEach(track => track.stop())
      }
      this.saveVideo()
    },

    closeRcording() {
      const really = confirm('Are you sure want to close?')
      if (really) {
        this.show_share_screen = false
      }
    },

    getNextMessages: _.debounce(function() {
      const msgContainer = this.$refs.msgContainer
      let topOfWindow = msgContainer.scrollTop
      if (topOfWindow < 20 && this.chatMessages.length > 0) {
        const result = this.$store.dispatch('task_messages/getMoreMessages', this.chatMessages[0])
      }
    }, 1000),

    async closeThread() {
      const thread = await this.$store.dispatch('threads/closeThread', { thread_id: this.thread_id })
      // this.$store.dispatch('tasks/updateChats')
      EventBus.$emit('close-thread')
    },
    async reopenThread() {
      const thread = await this.$store.dispatch('threads/reopenThread', { thread_id: this.thread_id })
      EventBus.$emit('reopen-thread')
    },

    async enableNotification() {
      const notificationPermission = await Notification.requestPermission()
      if (notificationPermission == 'granted') {
        this.enabledNotification = true
      }
    },
    handleEnter(e) {
      if (e.ctrlKey) {
        this.s_message = this.s_message + '\n'
      } else if (e.shiftKey) {
        return
      } else {
        this.saveMessage()
      }
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
      $('#dropzone').addClass('dz-drag-hover')
      event.preventDefault()
    },
    fileAdded(file) {
      this.showDropzone = true
      this.fileExist = true
    },
    filesAdded(file) {
      // $('#dropzone').addClass('dropzone-file-contentainer')
      this.showDropzone = true
      this.fileExist = true
    },
    sendingFiles(file, xhr, formData) {},
    uploadSuccess(file, response) {
      this.showDropzone = false
      this.fileExist = false
      this.$refs.chatDropzone.removeAllFiles()
      let task_id = this.task_id
      let company_user_id = this.current_company_user_id
      let message = this.s_message
      let task
      if (this.selected_message == null) {
        for (const res of response) {
          let task_message = this.$store.dispatch('task_messages/createThreadMessage', {
            task_id,
            thread_id: this.thread_id,
            company_user_id,
            file_path: res.file_path,
            message: res.name,
            is_file: true,
            thumbnail: res.thumbnail_path,
            task_message_id: this.messageId
          })
        }
        this.s_message = ''
        return
      }
    },
    afterComplete(response) {
      this.showDropzone = false
      this.fileExist = false
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
    editMessage(message) {
      this.selected_message = message
      this.s_message = message.message
    },
    deleteMessage(message) {
      if (confirm('Are you sure to delete this message?')) {
        let task = this.$store.getters['tasks/getById'](message.task_id)
        this.$store.dispatch('DELETE', { module: 'task_messages', entity: message }, { root: true })
        let task_messages = this.chatMessages
        if (task_messages.length == 0) {
          task.last_task_message_created_at = null
          task.last_task_message_id = null
        } else {
          // get the last message by updated_at
          let last_message = chain(task_messages)
            .sortBy(function(item) {
              return item.updated_at
            })
            .reverse()
            .value()[0]
          task.last_task_message_id = last_message.id
          task.last_task_message_created_at = last_message.updated_at
        }
        this.$store.dispatch('UPDATE', { module: 'tasks', entity: task }, { root: true })
      }
    },
    async saveMessage() {
      if (this.stream_video) {
        this.showLoading()
        const data = new FormData()
        let fileName = `video.mp4`
        let file = new File([this.stream_video], fileName)

        data.append('files', this.stream_video, 'video.mp4')
        console.log('files', file)
        const res = await this.$http().postImage('/upload', data)
        let file_path = res[0]['file_path']
        console.log(file_path)
        this.show_share_screen = false
        let task_id = this.task_id
        let company_user_id = this.current_company_user_id
        let task_message = this.$store.dispatch('task_messages/createThreadMessage', {
          task_id,
          thread_id: this.thread_id,
          company_user_id,
          file_path: file_path,
          message: fileName,
          is_file: true
        })

        this.hideLoading()
        this.clearScreen()
      }
      if (this.$refs.chatDropzone && this.$refs.chatDropzone.getActiveFiles().length > 0) {
        this.$refs.chatDropzone.processQueue()
        console.log('Image should be uploaded here!')
      }
      if (this.s_message == '\n' || this.s_message == '') {
        this.s_message = ''
        return
      }
      let task_id = this.task_id
      let company_user_id = this.current_company_user_id
      let message = this.s_message
      let task
      if (this.selected_message == null) {
        this.s_message = ''
        let task_message = await this.$store.dispatch('task_messages/createThreadMessage', {
          thread_id: this.thread_id,
          task_id,
          company_user_id,
          message
          // task_message_id: this.messageId,
          // timestamp: this.thread_message.timestamp
        })
        this.$nextTick(() => {
          this.last_message_timestamp = task_message.timestamp
          let container = this.$refs.msgContainer
          container.scrollTop = container.scrollHeight + 120
        })
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
    },
    onMessagePaste(event) {
      const items = event.clipboardData.items
      if (items[0].kind === 'file') {
        this.showDropzone = true
        this.$nextTick(() => {
          // $('#dropzone').addClass('dropzone-file-contentainer')
          for (const item of items) {
            if (item.kind === 'file') {
              const blob = item.getAsFile()
              const reader = new FileReader()
              this.$refs.chatDropzone.addFile(blob)
            }
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@-moz-keyframes spin {
  100% {
    -moz-transform: rotate(-360deg);
  }
}

@-webkit-keyframes spin {
  100% {
    -webkit-transform: rotate(-360deg);
  }
}

@keyframes spin {
  100% {
    -webkit-transform: rotate(-360deg);
    transform: rotate(-360deg);
  }
}

@-webkit-keyframes bounceDelay {
  0%,
  80%,
  100% {
    -webkit-transform: scale(0);
  }
  40% {
    -webkit-transform: scale(1);
  }
}
@keyframes bounceDelay {
  0%,
  80%,
  100% {
    transform: scale(0);
    -webkit-transform: scale(0);
  }
  40% {
    transform: scale(1);
    -webkit-transform: scale(1);
  }
}

#message-container {
  position: relative;
  background-color: #cdcdcd;
}
#dropzone {
  height: calc(100% - 201px);

  .dropzone-custom-content {
    margin-top: 40% !important;
  }
}
.dropzone-file-contentainer {
  display: flex;
  align-items: end;
}
.dropzone .dz-message {
  margin-top: 40% !important;
}
.date {
  display: flex;
  justify-content: center;
  font-size: 12px;
  padding: 8px 0px;
  border-top: 1px solid gray;
}
.message-panel {
  width: 100%;
  display: flex;
  flex-direction: column;
}
.dropzone {
  position: absolute;
  width: 100%;
  bottom: 163px;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.5);
  border: none;
}

.dz-drag-hover {
  height: 100% !important;
  bottom: 0px !important;
  padding-top: 57px;
}
.dropzone-custom-title,
.subtitle {
  color: white;
}

.thread-message-panel_inner {
  background-color: rgba($color: #000000, $alpha: 0.7);
}
.task-cloud_task-message .thread-message-panel_inner {
  min-height: 105px;
  height: calc(100vh - 379px);
  overflow-y: scroll;
  overflow-x: hidden;
}
.icon-attach_file {
  color: gray;
  font-size: 24px;
  // float: right;
}
.icon-stop,
.icon-screen_share,
.icon-help_outline {
  cursor: pointer;
  color: rgb(255, 84, 84);
  font-size: 24px;
}
.icon-stop_screen_share {
  color: rgb(255, 84, 84);
  font-size: 24px;
}

.video-container {
  position: absolute;
  width: 100%;
  min-height: 105px;
  height: calc(100vh - 379px);
  top: 48px;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
}
.video-container video {
  border: solid 3px rgb(255, 84, 84);
  border-radius: 10px;
  max-width: 48%;
  width: 48%;
}
.video-container .icon-close {
  position: absolute;
  top: 0;
  right: 0;
  cursor: pointer;
}

.chat-block-spinner-bar {
  display: inline-block;
  width: 100%;
  text-align: center;
}
.chat-block-spinner-bar > div {
  margin: 0 2px;
  width: 15px;
  height: 15px;
  background: #996300;
  border-radius: 100% !important;
  display: inline-block;
  -webkit-animation: bounceDelay 1.4s infinite ease-in-out;
  animation: bounceDelay 1.4s infinite ease-in-out;
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
}
.chat-block-spinner-bar .bounce1 {
  -webkit-animation-delay: -0.32s;
  animation-delay: -0.32s;
}
.chat-block-spinner-bar .bounce2 {
  -webkit-animation-delay: -0.16s;
  animation-delay: -0.16s;
}
.icon-send {
  color: gray;
  font-size: 24px;
  float: right;
}
.send-message {
  border: gray solid 1px;
  border-radius: 7px;
  background-color: white;
}
.thread-btns {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
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
