<template>
  <div class="task-side-bar">
    <div class="task-side-bar-label">
      <span>CHAT</span>
      <div style="display: flex;">
        <span v-if="total_chats_count > 0" class="total-chats-num rounded-circle task-sidebar-item_badge">{{ total_chats_count }}</span
        ><span v-if="total_chats_count > 0 && unread_messages_num > 0">/</span><span v-if="unread_messages_num > 0" class="unread-message-num rounded-circle task-sidebar-item_badge">{{ unread_messages_num }}</span>
      </div>
      <div class="message-sidebar_new-task" @click="createTask">+</div>
    </div>
    <div class="message-sidebar" ref="chatsContainer" @scroll="getNextChats">
      <b-list-group v-if="chats && chats.length > 0" class="task-side-bar_list">
        <task-sidebar-item v-for="(chat, index) in chats" :key="index" :chat="chat" />
      </b-list-group>
      <div v-else class="d-flex justify-content-center">
        <span class="task-side-bar-no-messages">No messages yet.</span>
      </div>
    </div>
  </div>
</template>

<script>
import uuid from 'uuid'
import moment from 'moment'

export default {
  props: ['show', 'updated_at', 'new_message'],
  data() {
    return {
      active_task: {},
      openedChatId: null
    }
  },
  watch: {
    show: {
      immediate: true,
      handler(val) {
        if (this.is_loggedIn && val) {
          this.getChats()
        }
      }
    },
    updated_at: {
      immediate: true,
      handler(val) {
        if (this.is_loggedIn && val) {
          let update_chat_index = this.chats.findIndex(({ chat_id }) => chat_id == this.new_message.task_id)
          let newMessage = this.chats[update_chat_index]
          newMessage.last_message.text = this.new_message.message
          newMessage.last_message.created_at = this.new_message.created_at
          newMessage.last_message.id = this.new_message.id
          newMessage.last_message.user = { name: this.new_message.user.name, color: this.new_message.user.color, role: this.new_message.user.user_role, _id: this.new_message.user.id }
          this.chats.splice(update_chat_index, 1)
          this.chats = [newMessage, ...this.chats]
        }
      }
    }
  },
  computed: {
    unread_messages_num() {
      let total_unread_num = 0
      this.$store.state.tasks.chats.map(({ num_unread }) => {
        total_unread_num = total_unread_num + num_unread
      })
      return total_unread_num
    },
    total_chats_count() {
      return this.$store.state.settings.total_chats_count
    },
    is_loggedIn() {
      return this.$store.state.settings.logged_in
    },
    current_company_user_id() {
      return this.$store.state.settings.current_company_user_id
    },
    chats() {
      return this.$store.state.tasks.chats
    }
  },
  mounted() {},
  methods: {
    async getChats() {
      this.$store.dispatch('tasks/updateChats')
    },
    getNextChats: _.debounce(function() {
      const chatsContainer = this.$refs.chatsContainer
      if (chatsContainer.scrollTop + chatsContainer.clientHeight + 20 >= chatsContainer.scrollHeight) {
        const result = this.$store.dispatch('tasks/getMoreChats', this.chats.slice(-1)[0].thread_id)
      }
    }, 500),
    async createTask() {
      let newTask = { id: uuid.v4() }
      await this.$store.dispatch('UPSERT', { module: 'tasks', entity: newTask })
      await this.$router.push({ query: { task: newTask.id } })
    },
    messageTime(time) {
      let today = moment()
      let msgTime = moment(time)
      let diff = today.diff(msgTime, 'days')
      if (diff == 0) return 'Today'
      else if (diff == 1) return 'Yesterday'
      else return msgTime.format('d/MM/YY')
    },
    getLastMessage(task) {
      if (task.last_task_message_id == '') return ''
      else return this.$store.getters['task_messages/getById'](task.last_task_message_id).message
    },
    onSelectTask(task) {
      this.active_task = task
    },
    onBack() {
      this.active_task = {}
    }
  },
  components: {
    'task-message': () => import('./TaskMessage.vue'),
    'task-sidebar-item': () => import('./TaskSideBarItem.vue')
  }
}
</script>
<style lang="scss">
.task-side-bar_back-button {
  background-color: blue;
}
.task-side-bar_task-message {
  height: 100%;
  height: calc(100vh - 160px) !important;
}
.task-side-bar_task-message .message-panel_inner {
  height: calc(100vh - 325px);
  overflow-y: auto;
  overflow-x: hidden;
}
.message-sidebar_new-task {
  cursor: pointer;
  margin-top: -5px;
  margin-right: 10px;
  // margin-bottom: 5px;
  font-size: 20px;
}
.task-side-bar_list {
  // border: 1px solid red;
  // height: 100%;
  // height: calc(100vh - 140px);
  // overflow-y: scroll;
  overflow: hidden;
}

.task-side-bar {
  position: relative;
  width: 300px;
  display: flex;
  flex-direction: column;
  /* align-items: center; */
  /* justify-content: center; */
  /* padding: 0 20px 20px 20px; */
  color: white;
  /* background-color: #616161; */
  background-color: rgba(0, 0, 0, 0.6);
  height: calc(100vh - 50px);
  overflow: hidden;
}
.message-sidebar {
  align-self: center;
  // width: 300px;
  padding: 0 10px 0 10px;
  width: 100%;
  padding-top: 15px;
  overflow-y: scroll;
  overflow-x: hidden;
  height: 100%;
}
.task-side-bar-label {
  top: 0;
  font-weight: bold;
  position: sticky;
  padding: 10px;
  z-index: 1;
  background-color: rgba($color: #000000, $alpha: 0.5);
  display: flex;
  justify-content: space-between;
  // align-items: center;
  // border: 1px solid red;
}
.message-avatar {
  /* width: 50px;
    height: 50px; */
  display: flex;
  /* justify-content: center; */
  align-items: center;
}
.task-side-bar .icon-class {
  font-size: 25px;
}
.message-panel .list-group .list-group-item {
  /* display: flex; */
  /* background-color: #616161; */
  background-color: rgba(0, 0, 0, 0.5);
  /* border: 5px solid red; */
}
</style>

<style scoped>
:root {
  --h: 1.4rem;
}

html {
  line-height: var(--1h);
}

.message-panel {
  width: 298px;
}
.list-group {
  background-color: rgba(0, 0, 0, 0);
}
.list-group-item {
  border-radius: 10px;
  margin-bottom: 10px;
  border: 1px solid rgba(0, 0, 0, 0);
  /* background-color: #818181; */
  background-color: rgba(0, 0, 0, 0.2);
  padding: 10px !important;
}
.task-sidebar-title {
  font-size: 17px;
  font-weight: bold;
  margin-bottom: 0px;
  line-height: 18px;
}
/* .task-side-bar .message-sidebar .list-group {
  border: 5px solid red;
} */
/* .project-avatar {
  vertical-align: top; */
/* } */

.message-sidebar .task-title {
  font-size: 14px;
  font-weight: bold;
  max-width: 170px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin-bottom: 0px;
}

.message-item {
  display: inline-block;
  width: calc(100% - 60px);
}

.message-sidebar .task-time {
  float: right;
}

.list-group-item {
  cursor: pointer;
}
.task-side-bar-no-messages {
  padding: 10px 20px;
  border-radius: 5px;
  background-color: rgba(0, 0, 0, 0.2);
}
.unread-message-num {
  background-color: red;
  color: white;
  font-weight: bold;
  border: 1px solid red;
  font-size: 18px;
  width: 25px;
  height: 25px;
}
.total-chats-num {
  background-color: green;
  color: white;
  font-weight: bold;
  border: 1px solid green;
  font-size: 18px;
  width: 25px;
  height: 25px;
}
</style>
