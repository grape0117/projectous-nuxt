<template>
  <div class="message-panel">
    <b-list-group class="message-panel_inner" v-if="chat && Object.keys(chat).length > 0">
      <div v-for="(message, index) in chatMessages" :key="message.id">
        <div class="date" v-if="isShowDate(index, message, chat.messages)">
          {{ date(message.createdAt) }}
        </div>
        <task-message-item :message="message" @edit-message="editMessage" @delete-message="deleteMessage" :is_me="message.company_user_id == current_company_user_id" />
      </div>
    </b-list-group>
    <div>
      <b-form-textarea type="text" v-model="s_message" placeholder="Write you message" rows="3" max-rows="3"> </b-form-textarea>
      <b-button pill variant="primary" @click="saveMessage()" style="float: right; margin-top: 10px">Save</b-button>
    </div>
  </div>
</template>

<script>
import uuid from 'uuid'
import moment from 'moment'
import { chain, groupBy } from 'lodash'

export default {
  data() {
    return {
      s_message: '',
      selected_message: null
    }
  },
  components: {
    'task-message-item': () => import('./TaskMessageItem.vue')
  },
  props: {
    chat: {
      type: Object,
      require: true
    }
  },
  /* Load surveys and questionnaired on page load. */
  created() {},
  computed: {
    chatMessages() {
      let messages = this.chat.messages.sort(function(a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt)
      })
      return messages.reverse()
    },
    // getMessages() {
    //   let messages = this.$store.getters['task_messages/getByTaskId'](this.task_id)
    //   messages.sort(function(a, b) {
    //     return new Date(b.created_at) - new Date(a.created_at)
    //   })
    //   return messages.reverse()
    // },
    current_company_user_id() {
      return this.$store.state.settings.current_company_user_id
    }
  },
  mounted() {},
  methods: {
    isShowDate(index, message, messages) {
      if (index === 0) return true
      return messages && messages.length > 0 && this.date(message.createdAt) !== this.date(messages[index > 0 ? index - 1 : index].createdAt)
    },
    date(date) {
      return moment(date).format('MMM DD, YYYY | ddd')
    },
    editMessage(message) {
      this.selected_message = message
      this.s_message = message.message
    },
    deleteMessage(message) {
      if (confirm('Are you sure to delete this message?')) {
        let task = this.$store.getters['tasks/getById'](message.task_id)
        this.$store.dispatch('DELETE', { module: 'task_messages', entity: message }, { root: true })
        let task_messages = this.chatMessages
        if (task_messages.length == 0) {
          task.last_task_message_created_at = null
          task.last_task_message_id = null
        } else {
          // get the last message by updated_at
          let last_message = chain(task_messages)
            .sortBy(function(item) {
              return item.updated_at
            })
            .reverse()
            .value()[0]
          task.last_task_message_id = last_message.id
          task.last_task_message_created_at = last_message.updated_at
        }
        this.$store.dispatch('UPDATE', { module: 'tasks', entity: task }, { root: true })
      }
    },
    async saveMessage() {
      let task_id = this.chat.chat_id
      let company_user_id = this.current_company_user_id
      let message = this.s_message
      let task
      if (this.selected_message == null) {
        // create
        // let message = {
        //   id: uuid.v4(),
        //   task_id: this.task_id,
        //   company_user_id: this.current_company_user_id,
        //   message: this.s_message,
        //   created_at: moment().format('YYYY-MM-DD HH:mm:ss')
        // }
        // this.$store.dispatch('ADD_ONE', { module: 'task_messages', entity: [message] }, { root: true })
        let task_message = this.$store.dispatch('task_messages/createTaskMessage', {
          task_id,
          company_user_id,
          message
        })
        // .then(res => {

        // })
        console.log(task_message.task_messages)
        this.s_message = ''
        return
        task = this.$store.getters['tasks/getById'](task_id)
        task.last_task_message_id = task_message.task_messages.id
        task.last_task_message_created_at = moment().format('YYYY-MM-DD HH:mm:ss')
      } else {
        // update
        // update task_message
        this.selected_message.message = this.s_message
        this.$store.dispatch('UPDATE', { module: 'task_messages', entity: this.selected_message }, { root: true })
        // update task
        task = this.$store.getters['tasks/getById'](this.selected_message.task_id)
        task.last_task_message_id = this.selected_message.id
        task.last_task_message_created_at = moment().format('YYYY-MM-DD HH:mm:ss')
        this.$store.dispatch('UPDATE', { module: 'tasks', entity: task }, { root: true })
        // initialize
        this.selected_message = null
        this.s_message = ''
      }
      this.$store.dispatch('UPDATE', { module: 'tasks', entity: task }, { root: true })
    }
  }
}
</script>

<style lang="scss" scoped>
.date {
  display: flex;
  justify-content: center;
  font-size: 12px;
  padding: 8px 0px;
  border-top: 1px solid gray;
}
.message-panel {
  width: 100%;
  // height: 100%;
  // border: 1px solid red;

  display: flex;
  flex-direction: column;
}

.message-panel_inner {
  background-color: rgba($color: #000000, $alpha: 0.7);
}
</style>
