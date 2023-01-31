<template>
  <b-list-group-item class="message-panel_inner-message" :style="is_me ? 'float: right;' : ''">
    <b-avatar v-if="!is_me" class="mr-1 mb-4" :text="user_name" v-b-tooltip.hover :title="message.user.name" size="25px" />
    <div>
      <div class="message-wrapper">
        <pre class="msg-content" style="color: white;">{{ message.text }}</pre>
        <div class="message-actions" v-if="current_company_user_id == message.company_user_id">
          <i class="icon-more_vert" @click="open_actions = !open_actions" />
          <div class="message-actions-options" v-if="open_actions">
            <i class="icon-edit" @click="editMessage(message)" />
            <i class="icon-delete" @click="deleteMessage(message)" />
            <i v-if="message.isFile" class="icon-download" @click="downloadFile(message)" />
          </div>
        </div>
      </div>
      <span class="message-dateTime">{{ formatTime(message.senderLocalTime) }}</span>
    </div>
  </b-list-group-item>
</template>

<script>
import moment from 'moment'
import { abbrName } from '@/utils/util-functions'
import { writeFileSync } from 'fs'

export default {
  name: 'task-message-item',
  data() {
    return {
      open_actions: false
    }
  },
  props: ['message', 'is_me'],
  computed: {
    user_name() {
      return abbrName(this.message.user.name)
    },
    current_company_user_id() {
      return this.$store.state.settings.current_company_user_id
    }
  },
  methods: {
    forceFileDownload(response, title) {
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', title)
      document.body.appendChild(link)
      link.click()
    },
    downloadFile(message) {
      this.$http()
        .post2('/download', { file_key: message.filePath })
        .then(response => {
          this.forceFileDownload(response, message.text)
        })
    },
    getUserNameWithCompanyUserId(company_user_id) {
      let company_user = this.$store.state.company_users.company_users[this.$store.state.company_users.lookup[company_user_id]]
      if (company_user) return company_user.name
      else return ''
    },
    formatTime(datetime) {
      return moment(datetime).format('hh:mm A')
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
  background-color: gray;
  // border: solid 1px grey;
  border-radius: 4px;
  margin-top: 5px;
  margin-bottom: 0;
  white-space: pre-wrap;
}

.message-panel_inner-message {
  display: flex;
  align-items: flex-end;
  background-color: rgba($color: #000000, $alpha: 0) !important;
  border: 0 !important;
  padding: 0px 10px 5px 10px;
  max-width: 90%;
  .b-avatar-text {
    width: 25px !important;
  }

  .message-dateTime {
    font-size: 12px;
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
