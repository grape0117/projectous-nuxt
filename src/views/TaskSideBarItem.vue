<template>
  <b-list-group-item class="task-sidebar-item">
    <!-- <pre class="border" style="color: white;">
      {{ getLastMessage }}
      {{ task.last_message }}
      {{ task.last_task_message_created_at}}
    </pre> -->

    <div class="" @click="openChat">
      <p class="task-sidebar-item_header-part">
        <span v-if="task.project.acronym" class="task-sidebar-item_project-badge">{{ task.project.acronym }}</span>
        <span v-else class="task-sidebar-item_project-name mr-2" style="color: green;">{{ task.project.name }}</span>
        <span class="task-sidebar-item_project-name">{{ task.title }}</span>
      </p>
      <div class="d-flex align-items-center">
        <div class="message-avatar" style="margin-right: 10px;">
          <span class="rounded-circle task-sidebar-item_badge" :style="{ backgroundColor: getLastMessageCompanyUser.color }">
            {{ getLastMessageCompanyUser.name | abbrName }}
          </span>
        </div>
        <div>
          <span class="task-sidebar-title">{{ getLastMessage.message }}</span>
        </div>
      </div>
    </div>

    <div class="task-sidebar-last-message-wrapper">
      <div class="task-sidebar-last-message" style="margin-top: 0 !important; padding-top: 5px !important;" @click="openChat">
        <!-- <span class="ml-2 task-sidebar-date" >{{ task.last_task_message_created_at }}</span> -->
        <span class="ml-2 task-sidebar-date">{{ task.last_task_message_created_at | moment('MMMM Do YYYY') }}</span>
      </div>
    </div>
  </b-list-group-item>
</template>
<script>
import uuid from 'uuid'
import moment from 'moment'
// import TaskMessage from './TaskMessage.vue'
import { chain, groupBy } from 'lodash'

export default {
  data() {
    return {}
  },
  props: {
    task: {
      type: Object,
      required: true
    }
  },
  computed: {
    getLastMessageCompanyUser() {
      return this.$store.state.company_users.company_users.find(user => user.id === this.getLastMessage.company_user_id)
    },
    getLastMessage() {
      let messages = this.$store.state.task_messages.task_messages.filter(msg => msg.task_id === this.task.id)
      messages.sort(function(a, b) {
        return new Date(b.created_at) - new Date(a.created_at)
      })
      return messages.reverse()[messages.length - 1]
    }
  },
  mounted() {},
  methods: {
    openChat() {
      this.$emit('openChat', this.task)
    },
    messageTime(time) {
      if (time === null) return 'No Date'

      let today = moment()
      let msgTime = moment(time)
      let diff = today.diff(msgTime, 'days')
      if (diff == 0) return 'Today'
      else if (diff == 1) return 'Yesterday'
      else return msgTime.format('d/MM/YY')
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
  background-color: green;
  white-space: nowrap;
  font-size: 10px;
  padding: 2px 5px;
  max-height: 20px;
  margin-right: 5px;
}
.task-sidebar-item_project-name {
  font-size: 14px;
  font-weight: 500;
}
.task-sidebar-date {
  font-size: 13px;
  font-weight: bold;
}
.task-sidebar-item_badge {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 25px;
  height: 25px;
  color: black;
  box-shadow: rgba(255, 255, 255, 0.5) 0px 0px 5px;
  margin-left: 0px;
  font-size: 10px;
}
</style>
