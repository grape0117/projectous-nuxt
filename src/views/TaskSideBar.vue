<template>
  <div class="task-side-bar">
    <div class="task-side-bar-label">
      <span>CHAT</span>
      <span style="font-weight: normal; align-self: center; max-width: 200px" v-if="hasOpenedChat">{{ openedChat.project }}</span>
      <div class="message-sidebar_new-task" @click="createTask">+</div>
    </div>
    <!-- <pre>{{ chats }}</pre> -->
    <div class="message-sidebar" v-show="!hasOpenedChat">
      <b-list-group v-if="chats && chats.length > 0" class="task-side-bar_list">
        <!-- <task-sidebar-item @openChat="openChat" v-for="(task, index) in taskMessages" :key="index" :task="task" @setLastMessage="setLastMessage" /> -->
        <task-sidebar-item @openChat="openChat" v-for="(chat, index) in chats" :key="index" :chat="chat" />
      </b-list-group>
      <div v-else class="d-flex justify-content-center">
        <span class="task-side-bar-no-messages">No messages yet.</span>
      </div>
    </div>

    <div class="" v-if="hasOpenedChat">
      <div class="d-flex justify-content-between">
        <b-button variant="dark" @click="closeChat" style="margin-bottom: 10px; margin-top: 10px; margin-left: 5px"> <i class="icon-arrow_back" />Back </b-button>
        <span class="task-sidebar_go-to-task" style="margin-right: 20px" @click="goToTask">[ Go to task]</span>
      </div>

      <task-message class="task-side-bar_task-message" :chat="openedChat"> </task-message>
    </div>
  </div>
</template>

<script>
import uuid from 'uuid'
import moment from 'moment'

export default {
  data() {
    return {
      active_task: {},
      openedChat: {},
      chats: []
    }
  },
  computed: {
    hasOpenedChat() {
      return Object.keys(this.openedChat).length > 0
      // return Object.keys(this.openedChat).length > 0
    },
    // messagesTaskIds() {
    //   return this.$store.state.task_messages.task_messages.map(message => message.task_id)
    // },
    // OLD
    // taskMessages() {
    //   let tasks = this.$store.state.tasks.tasks
    //   let projects = this.$store.state.projects.projects
    //   let taskMessages = tasks.map(task => task).filter(task => task.messages && task.messages.length > 0)

    //   taskMessages.forEach(async taskMessage => {
    //     taskMessage.project = await projects.find(project => project.id === taskMessage.project_id)
    //   })

    //   taskMessages.sort((a, b) => {
    //     return new Date(b.last_task_message_created_at) - new Date(a.last_task_message_created_at)
    //   })
    //   return taskMessages
    // },
    // tasks() {
    //   let tasks = this.$store.state.tasks.tasks
    //   let r_tasks = chain(tasks)
    //     .filter(function(item) {
    //       return item.last_task_message_created_at
    //     })
    //     .sortBy('last_task_message_created_at')
    //     .reverse()
    //     .value()
    //     .slice(0, 50)
    //   console.log(r_tasks)
    //   for (let key in r_tasks) {
    //     let task_id = r_tasks[key].id
    //     let task_messages = this.$store.getters['task_messages/getByTaskId'](task_id)
    //     r_tasks[key].messages = task_messages
    //   }
    //   return r_tasks
    // },
    current_company_user_id() {
      return this.$store.state.settings.current_company_user_id
    }
  },
  async created() {
    let { chats } = await this.$http().get('/chats')
    this.chats = chats
  },
  mounted() {},
  methods: {
    // sortedTaskMessages() {
    //   let taskMessages = this.taskMessages
    //   this.$nextTick(() => {
    //     taskMessages.sort(async (a,b) =>{
    //       return new Date(await b.last_task_message_created_at) - new Date(await a.last_task_message_created_at);
    //       // return new Date(b.last_message.updated_at || b.last_message.created_at) - new Date(a.last_message.updated_at || a.last_message.created_at);
    //     });
    //   });
    //   return taskMessages
    // },
    async goToTask() {
      if (Object.keys(this.$route.query).length > 0 && this.$route.query.task === this.openedChat.chat_id) return

      EventBus.$emit('showTask', this.openedChat)
      await this.$router.push({ query: { task: this.openedChat.chat_id } })
    },
    // async setLastMessage(lastMessage) {
    //   let tasks = this.$store.state.tasks.tasks
    //   await tasks.forEach(async task => {
    //     if (task.id === lastMessage.task_id) {
    //       task.last_task_message_created_at = await lastMessage.created_at
    //       task.last_task_message_id = await lastMessage.id
    //     }
    //   })
    // },
    async openChat(chat_id) {
      const { chat } = await this.$http().get(`/chat/${chat_id}`)
      this.openedChat = chat
    },
    closeChat() {
      this.openedChat = {}
    },
    async createTask() {
      let newTask = { id: uuid.v4() }
      await this.$store.dispatch('UPSERT', { module: 'tasks', entity: newTask })
      // this.$router.push({ name: 'Task_Detail', params: { task_id: newTask.id } })
      // this.$router.push({ name: 'Task_Detail', params: { task_id: newTask.id } })
      await this.$router.push({ query: { task: newTask.id } })
      EventBus.$emit('showTask', newTask)
      // await EventBus.$emit('')
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
  watch: {},
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
}

.task-side-bar {
  position: relative;
  width: 300px;
  display: flex;
  flex-direction: column;
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
}
.message-avatar {
  display: flex;
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
</style>
