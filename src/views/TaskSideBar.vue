<style scoped>
:root {
  --h: 1.4rem;
}

html {
  line-height: var(--1h);
}
.message-sidebar {
  width: 350px;
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

.list-group-item label {
}
</style>
<template>
  <div style="padding: 20px;">
    <div class="message-sidebar" v-if="!active_task.id">
      <b-list-group>
        <b-list-group-item v-for="task in tasks" :class="[task.id == active_task.id ? 'active' : '']" @click="onSelectTask(task)">
          <b-avatar class="mr-2 project-avatar"></b-avatar>
          <div class="message-item">
            <div class="message-item-header">
              <label class="task-title mr-auto">{{ task.title }}</label>
              <span class="task-time">{{ messageTime(task.messages[0].created_at) }}</span>
            </div>
            <div class="message-item-content">
              <label for="">{{ task.messages[0].message }}</label>
            </div>
          </div>
        </b-list-group-item>
      </b-list-group>
    </div>
    <div v-else class="message-detail">
      <b-button variant="dark" @click="onBack()" style="margin-bottom: 10px;"><- Back</b-button>
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
      let task_messages = this.$store.state.task_messages.task_messages
      if (!task_messages.length) return []
      let g_tasks = chain(task_messages)
        .groupBy('task_id')
        .sortBy(function(item) {
          return item[0].updated_at
        })
        .reverse()
        .value()
      let r_tasks = []
      for (let key in g_tasks) {
        let task_id = g_tasks[key][0].task_id
        let task = this.$store.getters['tasks/getById'](task_id)
        task.messages = g_tasks[key]
        r_tasks.push(task)
      }
      return r_tasks.splice(0, 50)
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
