<template>
  <div class="task-side-bar">
    <div class="message-sidebar">
      <b-list-group>
        <b-list-group-item :class="[task.id == active_task.id ? 'active' : '']" v-for="(task, index) in tasks" :key="index" @click="onSelectTask(task)">
          <div class="">
            <span class="ml-2">{{ messageTime(task.last_task_message_created_at) }}</span>
            <div class="d-flex align-items-center">
              <div class="message-avatar">
                <i class="icon-person icon-class"></i>
              </div>
              <!-- <b-avatar class="mr-2 project-avatar"></b-avatar> -->
              <div>
                <span class="task-sidebar-title">{{ task.title }}</span>
              </div>
            </div>
          </div>

          <div class="task-sidebar-last-message-wrapper">
            <div class="task-sidebar-last-message">
              <span class="">{{ getLastMessage(task) }}</span>
            </div>
            <div v-if="active_task.id" class="task-sidebar-message-detail">
              <b-button variant="dark" @click="onBack()" style="margin-bottom: 10px;"> <- Back</b-button>
              <task-message v-bind:task_id="active_task.id"> </task-message>
            </div>
          </div>
        </b-list-group-item>
      </b-list-group>
    </div>
  </div>
</template>

<script>
import uuid from 'uuid'
import moment from 'moment'
// import TaskMessage from './TaskMessage.vue'
import { chain, groupBy } from 'lodash'

export default {
  data() {
    return {
      active_task: {}
    }
  },
  computed: {
    tasks() {
      let tasks = this.$store.state.tasks.tasks
      let r_tasks = chain(tasks)
        .filter(function(item) {
          return item.last_task_message_created_at
        })
        .sortBy('last_task_message_created_at')
        .reverse()
        .value()
        .slice(0, 50)
      console.log(r_tasks)
      for (let key in r_tasks) {
        let task_id = r_tasks[key].id
        let task_messages = this.$store.getters['task_messages/getByTaskId'](task_id)
        r_tasks[key].messages = task_messages
      }
      return r_tasks
    },
    current_company_user_id() {
      return this.$store.state.settings.current_company_user_id
    }
  },
  mounted() {},
  methods: {
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
    'task-message': () => import('./TaskMessage.vue')
  }
}
</script>
<style>
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
.task-side-bar .list-group-item {
  /* display: flex; */
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
.task-side-bar {
  padding: 20px;
  color: white;
  background-color: #616161;
  height: calc(100vh - 50px);
  overflow-y: scroll;
}
.message-sidebar {
  width: 300px;
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
  background-color: #818181;
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

/* .message-item-content label:before {
    content: '...';
    position: absolute;
    bottom: 0;
    right: 0;
  }

  .message-item-content label:after {
    content: '';
    position: absolute;
    right: 0;
    width: 1rem;
    height: 1rem;
    background: white;
  } */
</style>
