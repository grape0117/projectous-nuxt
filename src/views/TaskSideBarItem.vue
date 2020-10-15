<template>
  <b-list-group-item class="task-sidebar-item">
    <div class="">
      <span class="ml-2 task-sidebar-date">{{ messageTime(task.last_task_message_created_at) }}</span>
      <div class="d-flex align-items-center">
        <div class="message-avatar">
          <i class="icon-person icon-class"></i>
        </div>
        <div>
          <span class="task-sidebar-title">{{ task.title }}</span>
        </div>
      </div>
    </div>

    <div class="task-sidebar-last-message-wrapper">
      <div class="task-sidebar-last-message" @click="toggleMessages">
        <span class="">{{ getLastMessage(task) }}</span>
      </div>
      <div class="task-sidebar-message-detail" v-show="showMessages">
        <b-button variant="dark" @click="toggleMessages" style="margin-bottom: 10px;"> <i class="icon-arrow_back" />Back </b-button>
        <task-message v-bind:task_id="task.id"> </task-message>
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
    return {
      showMessages: false
    }
  },
  props: {
    task: {
      type: Object,
      required: true
    }
  },
  computed: {},
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
    toggleMessages() {
      this.showMessages = !this.showMessages
    }
  },
  watch: {},
  components: {
    'task-message': () => import('./TaskMessage.vue')
  }
}
</script>

<style lang="scss">
.task-sidebar-item {
  background-color: rgba($color: #000000, $alpha: 0.4) !important;
  box-shadow: 0px 0px 16px -7px rgba($color: #ffffff, $alpha: 1);
}
.task-sidebar-message-detail {
  margin-top: 10px;
}
.task-sidebar-date {
  font-size: 13px;
  font-weight: bold;
}
</style>
