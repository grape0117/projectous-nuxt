<style scoped>
.message-panel {
  width: 100%;
}

.msg-content {
  padding: 8px 12px;
  border: solid 1px grey;
  border-radius: 8px;
  margin-top: 5px;
}
</style>
<template>
  <div class="message-panel">
    <b-list-group style="max-height:500px; overflow-y: auto;">
      <b-list-group-item v-for="message in getMessages">
        <div class="msg-header">
          <span>{{ getUserNameWithCompanyUserId(message.company_user_id) }}</span> /
          <span>{{ formatTime(message.timestamp) }}</span>
        </div>
        <label class="msg-content">{{ message.message }}</label>
        <div class="msg-action" v-if="current_company_user_id == message.company_user_id">
          <b-button variant="primary" @click="editMessage(message)" style="margin-right: 10px;">Edit</b-button>
          <b-button variant="warning" @click="deleteMessage(message)">Delete</b-button>
        </div>
      </b-list-group-item>
    </b-list-group>
    <b-form-textarea type="text" v-model="s_message" placeholder="Write you message" rows="2" max-rows="4"> </b-form-textarea>
    <b-button pill variant="primary" @click="saveMessage()" style="margin-top: 5px; margin-left: 210px;">Save</b-button>
  </div>
</template>

<script>
import uuid from 'uuid'
import moment from 'moment'
export default {
  data() {
    return {
      s_message: '',
      selected_message: null
    }
  },
  props: ['task_id'],
  /* Load surveys and questionnaired on page load. */
  created() {
    console.log(this.task_id)
  },
  computed: {
    getMessages() {
      return this.$store.getters['task_messages/getByTaskId'](this.task_id)
    },
    current_company_user_id() {
      return this.$store.state.settings.current_company_user_id
    }
  },
  mounted() {},
  methods: {
    getUserNameWithCompanyUserId(company_user_id) {
      return this.$store.state.company_users.company_users[this.$store.state.company_users.lookup[company_user_id]].name
    },
    formatTime(datetime) {
      return moment(datetime).format('MM-DD HH:mm:ss')
    },
    editMessage(message) {
      this.selected_message = message
      this.s_message = message.message
    },
    deleteMessage(message) {
      if (confirm('Are you sure to delete this message?')) {
        this.$store.dispatch('DELETE', { module: 'task_messages', entity: message }, { root: true })
      }
    },
    saveMessage() {
      let task_id = this.task_id
      let company_user_id = this.current_company_user_id
      console.log(task_id, company_user_id)
      let message = this.s_message
      if (this.selected_message == null) {
        this.$store
          .dispatch('task_messages/createTaskMessage', {
            task_id,
            company_user_id,
            message
          })
          .then(res => {})
      } else {
        this.selected_message.message = this.s_message
        this.$store.dispatch('UPDATE', { module: 'task_messages', entity: this.selected_message }, { root: true })
        this.selected_message = null
        this.s_message = ''
      }
    }
  }
}
</script>
