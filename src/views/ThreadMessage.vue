<template>
  <div class="message-panel" id="message-container">
    <thread-title :thread="thread" />
    <b-list-group class="thread-message-panel_inner" ref="msgContainer" @dragover="dragOver" @drop="dropFile">
      <div v-for="(message, index) in chatMessages" :key="message.id">
        <div class="date" v-if="isShowDate(index, message, chat.messages)">
          {{ date(message.created_at) }}
        </div>
        <task-message-item :message="message" @edit-message="editMessage" @delete-message="deleteMessage" :is_me="message.company_user_id == current_company_user_id" />
      </div>
    </b-list-group>
    <vue-dropzone @vdropzone-drag-leave="dragLeave" ref="chatDropzone" id="dropzone" :options="dropzoneOptions" @vdropzone-complete="afterComplete" @vdropzone-sending="sendingFiles" v-if="showDropzone" :useCustomSlot="true" @vdropzone-file-added="fileAdded" @vdropzone-files-added="filesAdded" @vdropzone-canceled="cancelUpload" @vdropzone-removed-file="removedFile" @vdropzone-success="uploadSuccess">
      <div class="dropzone-custom-content">
        <h3 class="dropzone-custom-title">Drag and drop a file</h3>
        <div class="subtitle">...or click to select a file from your computer</div>
      </div>
    </vue-dropzone>
    <div class="send-message" v-if="thread && thread.status == 'open'">
      <b-form-textarea type="text" ref="message_content" v-model="s_message" placeholder="Write you message" rows="3" max-rows="3" @keyup.enter.exact="changeText" @keydown.enter="handleEnter"> </b-form-textarea>
      <i class="icon-attach_file" @click="attachFile()" />
      <i class="icon-send" :style="s_message == '' || s_message == '\n' ? 'color: gray;' : 'color: darkorange;'" @click="saveMessage()" />
    </div>
    <div class="thread-btns" v-if="thread && thread.status == 'open'">
      <b-button @click="closeThread">CLOSE THREAD</b-button>
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
      thread_title: '',
      thread_message: null,
      thread: null
    }
  },
  components: {
    'task-message-item': () => import('./TaskMessageItem.vue'),
    'thread-title': () => import('./ThreadTitle.vue'),
    vueDropzone: vue2Dropzone
  },
  props: {
    chat: {
      type: Object,
      require: true
    },
    showChat: false,
    messageId: null,
    task_id: null,
    thread_id: null
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
        if (this.$refs.message_content) {
          this.$refs.message_content.focus()
        }
        let thread = this.$store.getters['threads/getById'](this.thread_id)[0]
        if (thread) {
          this.thread_title = thread.title
          this.thread = thread
        }
      }
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
        let container = this.$refs.msgContainer
        container.scrollTop = container.scrollHeight + 120
      })
      return messages.reverse()
    },
    current_company_user_id() {
      return this.$store.state.settings.current_company_user_id
    }
  },
  mounted() {
    setTimeout(() => {
      let container = this.$refs.msgContainer
      container.scrollTop = container.scrollHeight + 120
    }, 500)
    if (this.thread_id) {
      let thread = this.$store.getters['threads/getById'](this.thread_id)[0]
      this.thread = thread
    }
    // if (this.messageId) {
    //   let message_content = this.$store.getters['task_messages/getById'](this.messageId)
    //   this.thread_title = message_content ? message_content.message : ''
    //   this.thread_message = message_content ? message_content : null
    //   this.thread_id = message_content.task_id + '-' + message_content.timestamp
    // }
  },
  methods: {
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

      let task_id = this.task_id
      let company_user_id = this.current_company_user_id
      let message = this.s_message
      let task
      if (this.selected_message == null) {
        let task_message = this.$store.dispatch('task_messages/createThreadMessage', {
          task_id,
          thread_id: this.thread_id,
          company_user_id,
          file_path: response.file_path,
          message: response.name,
          is_file: true,
          thumbnail: response.thumbnail_path,
          task_message_id: this.messageId
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
      if (this.$refs.chatDropzone && this.$refs.chatDropzone.getActiveFiles().length > 0) {
        this.$refs.chatDropzone.processQueue()
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
        // create
        // let message = {
        //   id: uuid.v4(),
        //   task_id: this.task_id,
        //   company_user_id: this.current_company_user_id,
        //   message: this.s_message,
        //   created_at: moment().format('YYYY-MM-DD HH:mm:ss')
        // }
        // this.$store.dispatch('ADD_ONE', { module: 'task_messages', entity: [message] }, { root: true })
        this.s_message = ''
        let task_message = await this.$store.dispatch('task_messages/createThreadMessage', {
          thread_id: this.thread_id,
          task_id,
          company_user_id,
          message
          // task_message_id: this.messageId,
          // timestamp: this.thread_message.timestamp
        })
        console.log('task_message', task_message)

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

<style lang="scss" scoped>
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
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
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
