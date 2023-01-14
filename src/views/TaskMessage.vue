<template>
  <div class="message-panel" id="message-container">
    <b-list-group class="message-panel_inner" v-if="chat && Object.keys(chat).length > 0" @dragover="dragOver" @drop="dropFile">
      <div v-for="(message, index) in chatMessages" :key="message.id">
        <div class="date" v-if="isShowDate(index, message, chat.messages)">
          {{ date(message.createdAt) }}
        </div>
        <task-message-item :message="message" @edit-message="editMessage" @delete-message="deleteMessage" :is_me="message.company_user_id == current_company_user_id" />
      </div>
    </b-list-group>
    <vue-dropzone @vdropzone-drag-leave="dragLeave" ref="chatDropzone" id="dropzone" :options="dropzoneOptions" @vdropzone-complete="afterComplete" @vdropzone-sending="sendingFiles" v-if="showDropzone" :useCustomSlot="true" @vdropzone-file-added="fileAdded" @vdropzone-files-added="filesAdded" @vdropzone-canceled="cancelUpload" @vdropzone-removed-file="removedFile">
      <div class="dropzone-custom-content">
        <h3 class="dropzone-custom-title">Drag and drop to upload content!</h3>
        <div class="subtitle">...or click to select a file from your computer</div>
      </div>
    </vue-dropzone>
    <div>
      <b-form-textarea type="text" v-model="s_message" placeholder="Write you message" rows="3" max-rows="3"> </b-form-textarea>
      <b-button pill variant="primary" @click="saveMessage()" style="float: right; margin-top: 10px">Save</b-button>
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

export default {
  data() {
    return {
      showDropzone: false,
      fileExist: false,
      s_message: '',
      selected_message: null,
      dropzoneOptions: {
        // url: `${process.env.VUE_APP_API_URL}/store-file`,
        url: `http://testing.projectous.com/upload`,
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
      }
    }
  },
  components: {
    'task-message-item': () => import('./TaskMessageItem.vue'),
    vueDropzone: vue2Dropzone
  },
  props: {
    chat: {
      type: Object,
      require: true
    }
  },
  /* Load surveys and questionnaired on page load. */
  created() {},
  computed: {
    chatMessages() {
      let messages = this.chat.messages.sort(function(a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt)
      })
      return messages.reverse()
    },
    // getMessages() {
    //   let messages = this.$store.getters['task_messages/getByTaskId'](this.task_id)
    //   messages.sort(function(a, b) {
    //     return new Date(b.created_at) - new Date(a.created_at)
    //   })
    //   return messages.reverse()
    // },
    current_company_user_id() {
      return this.$store.state.settings.current_company_user_id
    }
  },
  mounted() {},
  methods: {
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
      this.showDropzone = true
      this.fileExist = true
    },
    sendingFiles(file, xhr, formData) {},
    afterComplete(response) {
      console.log('complete')
      this.showDropzone = false
      this.$refs.chatDropzone.removeAllFiles()
    },
    cancelUpload(file) {
      console.log('cancel')
      console.log(file)
    },
    removedFile(file, error, xhr) {
      console.log('remove')
      console.log(file)
      if (this.$refs.chatDropzone.getActiveFiles().length == 0) {
        this.showDropzone = false
      }
    },
    isShowDate(index, message, messages) {
      if (index === 0) return true
      return messages && messages.length > 0 && this.date(message.createdAt) !== this.date(messages[index > 0 ? index - 1 : index].createdAt)
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
      this.$refs.chatDropzone.processQueue()
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
        let task_message = this.$store.dispatch('task_messages/createTaskMessage', {
          task_id,
          company_user_id,
          message
        })
        // .then(res => {

        // })
        console.log(task_message.task_messages)
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
    }
  }
}
</script>

<style lang="scss" scoped>
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
  bottom: 130px;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
}

.dropzone .dz-message {
  height: 600px;
  justify-content: center;
  display: flex;
  flex-direction: column;
}

.dropzone-custom-title,
.subtitle {
  color: white;
}

.message-panel_inner {
  background-color: rgba($color: #000000, $alpha: 0.7);
}
</style>
