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
      s_message: ''
    }
  },
  props: ['task'],
  /* Load surveys and questionnaired on page load. */
  created() {},
  computed: {
    getMessages() {
      // this.$store.state.task_messages.task_messages[this.$store.state.task_messages.lookup[task_id]];
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
        let index = this.show_task.settings.messages.findIndex(function(item, i) {
          return item.id == message.id
        })
        if (index != -1) this.show_task.settings.messages.splice(index, 1)
        this.selected_message = null
        this.saveTask(false)
      }
    },
    saveMessage() {
      let task_id = this.task.id
      let company_user_id = this.current_company_user_id
      console.log(task_id, company_user_id)
      let message = this.s_message
      this.$store
        .dispatch('task_messages/createTaskMessage', {
          task_id,
          company_user_id,
          message
        })
        .then(res => {})
    }
  }
}
</script>
