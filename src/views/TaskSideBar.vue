<template>
  <div class="task-side-bar" style="padding: 20px;">
    <div class="message-sidebar" v-if="!active_task.id">
      <b-list-group>
        <b-list-group-item v-for="(task, index) in tasks" :key="index" :class="[task.id == active_task.id ? 'active' : '']" @click="onSelectTask(task)">
          <b-avatar class="mr-2 project-avatar"></b-avatar>
          <div class="message-item">
            <div class="message-item-header">
              <label class="task-title mr-auto">{{ task.title }}</label>
              <span class="task-time">{{ messageTime(task.last_task_message_created_at) }}</span>
            </div>
            <div class="message-item-content">
              <label for="">{{ getLastMessage(task) }}</label>
            </div>
          </div>
        </b-list-group-item>
      </b-list-group>
    </div>
    <div v-else class="message-detail">
      <b-button variant="dark" @click="onBack()" style="margin-bottom: 10px;"> <- Back</b-button>
      <task-message v-bind:task_id="active_task.id"> </task-message>
    </div>
  </div>
</template>

<script>
import uuid from 'uuid'
import moment from 'moment'
import TaskMessage from './TaskMessage.vue'
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
    'task-message': TaskMessage
  }
}
</script>
<style scoped>
:root {
  --h: 1.4rem;
}

html {
  line-height: var(--1h);
}
.task-side-bar {
  background-color: #616161;
}
.message-sidebar {
  width: 300px;
}
.message-panel {
  width: 298px;
}
.list-group-item {
  padding-right: 5px;
}

.project-avatar {
  vertical-align: top;
}

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

.message-item-content label {
  padding-right: 10px;
  --max-lines: 2;
  position: relative;
  max-height: 48px;
  overflow: hidden;
  cursor: inherit;
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
