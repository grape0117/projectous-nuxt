<template>
  <div class="task-side-bar">
    <div class="task-side-bar-label">
      <span>CHAT</span>
    </div>
    <div class="message-sidebar" v-show="Object.keys(openedChat).length === 0">
      <div class="message-sidebar_new-task" @click="createTask">
        +
      </div>
      <b-list-group v-if="taskMessages.length > 0" class="task-side-bar_list">
        <task-sidebar-item @openChat="openChat" v-for="(task, index) in taskMessages" :key="index" :task="task" @setLastMessage="setLastMessage" />
      </b-list-group>
      <div v-else class="d-flex justify-content-center">
        <span class="task-side-bar-no-messages">No messages yet.</span>
      </div>
    </div>

    <div class="" v-if="Object.keys(openedChat).length > 0">
      <b-button variant="dark" @click="closeChat" style="margin-bottom: 10px; margin-top: 10px; margin-left: 5px;"> <i class="icon-arrow_back" />Back </b-button>
      <task-message class="task-side-bar_task-message" v-bind:task_id="openedChat.id" :task_messages="openedChat.messages"> </task-message>
    </div>
  </div>
</template>

<script>
import uuid from 'uuid'
import moment from 'moment'
// import TaskMessage from './TaskMessage.vue'
import { chain, forEach, groupBy } from 'lodash'

export default {
  data() {
    return {
      active_task: {},
      openedChat: {}
    }
  },
  computed: {
    // messagesTaskIds() {
    //   return this.$store.state.task_messages.task_messages.map(message => message.task_id)
    // },
    taskMessages() {
      let tasks = this.$store.state.tasks.tasks
      let projects = this.$store.state.projects.projects
      let taskMessages = tasks.map(task => task).filter(task => task.messages.length > 0)

      taskMessages.forEach(async taskMessage => {
        taskMessage.project = await projects.find(project => project.id === taskMessage.project_id)
      })

      taskMessages.sort((a, b) => {
        return new Date(b.last_task_message_created_at) - new Date(a.last_task_message_created_at)
      })
      // .filter(task => {
      //   if(_.includes(this.messagesTaskIds, task.id)) {
      //     return task
      //   }
      // })
      return taskMessages
    },
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
    async setLastMessage(lastMessage) {
      let tasks = this.$store.state.tasks.tasks
      await tasks.forEach(async task => {
        if (task.id === lastMessage.task_id) {
          task.last_task_message_created_at = await lastMessage.created_at
          task.last_task_message_id = await lastMessage.id
        }
      })
    },
    openChat(chat) {
      this.openedChat = chat
    },
    closeChat() {
      this.openedChat = {}
    },
    async createTask() {
      let newTask = { id: uuid.v4() }
      await this.$store.dispatch('UPSERT', { module: 'tasks', entity: newTask })
      this.$router.push({ name: 'Task_Detail', params: { task_id: newTask.id } })
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
  max-height: calc(100vh - 300px);
  min-height: calc(100vh - 300px);
  overflow-y: scroll;
  overflow-x: hidden;
}
.message-sidebar_new-task {
  cursor: pointer;
  margin-top: -10px;
  margin-bottom: 5px;
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
  width: 350px;
  display: flex;
  flex-direction: column;
  /* align-items: center; */
  /* justify-content: center; */
  /* padding: 0 20px 20px 20px; */
  color: white;
  /* background-color: #616161; */
  background-color: rgba(0, 0, 0, 0.5);
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
}
.task-side-bar-label {
  top: 0;
  font-weight: bold;
  position: sticky;
  padding: 10px;
  z-index: 1;
  background-color: rgba($color: #000000, $alpha: 0.5);
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
.task-sidebar-last-message {
  margin-top: 5px;
  font-size: 15px;
  padding-left: 10px !important;
}
.task-sidebar-last-message-wrapper {
  border-top: 1px solid rgba(0, 0, 0, 0.2);
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
