<template>
  <b-list-group-item class="message-panel_inner-message">
    <div class="msg-header">
      <span>{{ getUserNameWithCompanyUserId(message.company_user_id) }}</span> /
      <span v-if="message.timestamp">{{ formatTime(message.timestamp) }}</span>
    </div>
    <div class="message-wrapper">
      <pre class="msg-content" style="color: white;">{{ message.message }}</pre>
      <div class="message-actions" v-if="current_company_user_id == message.company_user_id">
        <i class="icon-more_vert" @click="open_actions = !open_actions" />
        <div class="message-actions-options" v-if="open_actions">
          <i class="icon-edit" @click="editMessage(message)" />
          <i class="icon-delete" @click="deleteMessage(message)" />
        </div>
      </div>
    </div>
    <span class="message-dateTime">{{ formatTime(message.updated_at || message.created_at) }}</span>
  </b-list-group-item>
</template>

<script>
import moment from 'moment'

export default {
  name: 'task-message-item',
  data() {
    return {
      open_actions: false
    }
  },
  props: ['message'],
  computed: {
    current_company_user_id() {
      return this.$store.state.settings.current_company_user_id
    }
  },
  methods: {
    getUserNameWithCompanyUserId(company_user_id) {
      let company_user = this.$store.state.company_users.company_users[this.$store.state.company_users.lookup[company_user_id]]
      if (company_user) return company_user.name
      else return ''
    },
    formatTime(datetime) {
      return moment(datetime).format('MMM-DD-YYYY hh:mm:ss A')
    },
    editMessage(message) {
      this.$emit('edit-message', message)
    },
    deleteMessage(message) {
      this.$emit('delete-message', message)
    }
  }
}
</script>

<style lang="scss" scoped>
.msg-content {
  padding: 8px 12px;
  border: solid 1px grey;
  border-radius: 8px;
  margin-top: 5px;
  margin-bottom: 0;
}

.message-panel_inner-message {
  background-color: rgba($color: #000000, $alpha: 0) !important;
  border-bottom: 1px solid white;

  .message-dateTime {
    font-size: 12px;
    font-weight: bold;
  }
}

.message-wrapper {
  // border: 1px solid red;
  display: flex;
  justify-content: space-between;
  // position: relative;

  .message-actions {
    padding-top: 5px;
    // border: 1px solid red;
    position: relative;

    i {
      cursor: pointer;
    }

    .message-actions-options {
      // border: 1px solid red;
      position: absolute;
      display: flex;
      top: 3px;
      right: 22px;
      background-color: rgba($color: #2b2929, $alpha: 1);
      box-shadow: 0px 0px 16px -6px white;
      border-radius: 4px;
      padding: 3px;

      :not(:last-child) {
        margin-right: 8px;
      }
    }
  }
}
</style>
