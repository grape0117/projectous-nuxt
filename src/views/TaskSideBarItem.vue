<template>
  <b-list-group-item class="task-sidebar-item">
    <div class="unread-message-num" v-if="chat.num_unread > 0">
      <span class="rounded-circle task-sidebar-item_badge">{{ chat.num_unread }}</span>
    </div>
    <div class="" @click="showTaskDetail">
      <p class="task-sidebar-item_header-part" style="margin-bottom: 8px !important">
        <span v-if="chat && chat.acronym" class="task-sidebar-item_project-badge" :style="{ 'background-color': chat.color ? chat.color : null }">{{ chat.acronym }}</span>
        <span v-else class="task-sidebar-item_project-name mr-2" style="color: green">{{ chat.project }}</span>
        <span class="task-sidebar-item_project-name">{{ chat.task }}</span>
      </p>
      <div class="d-flex align-items-center">
        <div>
          <p class="task-thread-title">{{ chat.thread_title }}</p>
        </div>
      </div>
      <div class="d-flex align-items-center">
        <div>
          <p class="task-sidebar-title">{{ chat.last_message.text | messageContent }}</p>
        </div>
      </div>
    </div>

    <div class="task-sidebar-last-message-wrapper d-flex">
      <div class="message-avatar" style="margin-right: 5px">
        <span class="rounded-circle task-sidebar-item_badge" v-if="chat.last_message.company_user_id" :style="{ backgroundColor: chat.last_message.user.color }">
          {{ chat.last_message.user.name | abbrName }}
        </span>
      </div>
      <div class="task-sidebar-last-message" style="margin-top: 0 !important;" @click="showTaskDetail">
        <span class="task-sidebar-date">{{ chat.last_message.createdAt | showDate }}</span>
      </div>
      <!-- <span class="task-sidebar_go-to-task" @click="showTaskDetail">[ Go to task]</span> -->
    </div>
  </b-list-group-item>
</template>
<script>
import uuid from 'uuid'
import moment from 'moment'

import { chain, groupBy } from 'lodash'
import { EventBus } from '@/components/event-bus'

export default {
  data() {
    return {}
  },
  props: {
    chat: {
      type: Object,
      required: true
    }
  },
  computed: {
    // clientColor() {
    //   return this.$store.state.clients.clients.find(client => client.client_company_id === this.task.project.client_company_id).color
    // },
    // getLastMessageCompanyUser() {
    //   return this.$store.state.company_users.company_users.find(user => user.id === this.getLastMessage.company_user_id)
    // },
    // getLastMessage() {
    //   let messages = this.$store.state.task_messages.task_messages.filter(msg => msg.task_id === this.task.id)
    //   messages.sort(function(a, b) {
    //     return new Date(b.created_at) - new Date(a.created_at)
    //   })
    //   return messages.reverse()[messages.length - 1]
    // }
  },
  mounted() {},
  methods: {
    async showTaskDetail() {
      const CHAT_ID = this.chat.chat_id
      const THREAD_ID = this.chat.thread_id

      if (Object.keys(this.$route.query).length > 0 && this.$route.query.task === CHAT_ID && this.$route.query.thread === THREAD_ID) return

      await this.$router.push({ query: { task: CHAT_ID, thread: this.chat.thread_id, showChat: 'true' } })
    }
  },
  watch: {
    getLastMessage(newVal, oldVal) {
      if (newVal === oldVal) return

      this.$emit('setLastMessage', newVal)
    }
  },
  components: {
    'task-message': () => import('./TaskMessage.vue')
  },
  filters: {
    abbrName(name) {
      if (!name) return ''
      let matches = name.match(/\b(\w)/g) // ['J','S','O','N']
      if (matches) {
        let acronym = matches.join('') // JSON
        return acronym.toUpperCase()
      }
    },
    showDate(createdAt) {
      if (moment(createdAt).isSame(moment(), 'day')) {
        return moment(createdAt).format('hh:mm A')
      } else if (moment(createdAt).isSame(moment(), 'year')) {
        return moment(createdAt).format('ddd MMM Do')
      }
      return moment(createdAt).format('MMM Do YYYY')
    },
    messageContent(text) {
      if (text.length > 110) {
        return text.substring(0, 110) + '...'
      }
      return text
    }
  }
}
</script>

<style lang="scss">
.task-sidebar-item {
  background-color: rgba($color: #000000, $alpha: 0.4) !important;
  box-shadow: 0px 0px 16px -7px rgba($color: #ffffff, $alpha: 1);
}
.task-sidebar-item_header-part {
  // display: flex;
}
.task-sidebar-item_project-badge {
  // background-color: green;
  white-space: nowrap;
  font-size: 10px;
  padding: 5px 5px;
  max-height: 20px;
  margin-right: 5px;
}
.task-sidebar-item_project-name {
  font-size: 16px;
  font-weight: 500;
}
.task-sidebar-date {
  font-size: 11px;
}
.task-sidebar-item_badge {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 15px;
  height: 15px;
  color: black;
  box-shadow: rgba(255, 255, 255, 0.5) 0px 0px 5px;
  margin-left: 0px;
  font-size: 9px;
}
.task-sidebar-last-message {
  font-size: 12px;
  flex: 1;
}
.task-sidebar-last-message-wrapper {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid rgba(0, 0, 0, 0.2);
}
.task-sidebar_go-to-task {
  font-size: 12px;
  font-weight: bold;
  color: lightblue;
  display: flex;
  align-self: center;
  cursor: pointer;
  // border: 1px solid red;
}
.task-sidebar_go-to-task:hover {
  color: #007fff;
}
.task-thread-title {
  font-size: 19px;
  font-weight: bold;
}
.task-sidebar-title {
  font-size: 12px;
  margin-bottom: 0px;
  line-height: 18px;
}
.unread-message-num span {
  background-color: red;
  color: white;
  font-weight: bold;
  border: 1px solid red;
  position: absolute;
  right: 0px;
  top: 0px;
  font-size: 18px;
  width: 25px;
  height: 25px;
}
</style>
