<template>
  <tr class="task-container">
    <td>{{ taskClientNameFromProject(task.project_id) }}</td>
    <td>{{ taskProjectName(task.project_id) }}</td>
    <td>
      <a @click="editTask(task)">{{ task.title }}</a>
    </td>
    <td style="white-space: nowrap">
      <div v-for="task_user in task_users()"><i v-if="task_user.role === 'manager'" class="glyphicon glyphicon-flash"></i><i v-else-if="task_user.role === 'reviewer'" class="glyphicon glyphicon-thumbs-up"></i>&nbsp; {{ user_from_task_user(task_user) }} {{ task_user.role }}</div>
    </td>
    <td>
      <div class="btn-group">
        <select v-model="task.priority">
          <option v-for="priority in priorities" :selected="getNumericPriority(priority) === getNumericPriority(task.priority)">{{ priority }}</option>
        </select>
      </div>

      <button @click="moveStatusForward()"><i class="glyphicon glyphicon-check">Check</i></button>
      <button @click="startTimer()"><i class="glyphicon glyphicon-play">Play</i></button>
      <button @click="showTaskDetail">Go to Task</button>
    </td>
    <td>{{ task.due_date }}</td>
  </tr>
</template>

<script>
import TaskActionRow from './TaskActionRow.vue'
export default {
  props: ['task'],
  extends: TaskActionRow,
  name: 'tasks-tab-row',
  data() {
    return {
      priorities: ['high', 'regular', 'low', 'hold']
    }
  },
  watch: {
    'task.priority'(value) {
      console.log('priority watcher')
      this.$store.dispatch('UPDATE_ATTRIBUTE', { module: 'tasks', id: this.task.id, attribute: 'priority', value: value })
    }
  },
  methods: {
    startTimer() {
      let timer = {
        task_id: task.id
      }
      if (task.project_id) {
        const project = this.$store.getters['projects/getById'](task.project_id)
        timer.project_id = project.id
      }
      this.$store.dispatch('timers/startTimer', timer)
    },
    getNumericPriority(priority) {
      switch (priority) {
        case 'high':
        case 'today':
          return 3
        case 'active':
        case 'regular':
        case 'this week':
          return 2
        case 'low':
        case 'when possible':
          return 1
        case 'hold':
        default:
          return 0
      }
    },
    user_from_task_user(task_user) {
      return this.$store.getters['company_users/getById'](task_user.company_user_id)['name']
    },
    async showTaskDetail() {
      await this.$router.push({ query: { task: this.task.id, showChatSection: 'true' } })
    },
    task_users() {
      return this.$store.getters['task_users/getByTaskId'](this.task.id)
    },
    getNeed() {
      const need = prompt('What is blocking this task?', this.task.settings ? (this.task.settings.needs ? this.task.settings.needs : '') : '')
      if (need !== '') {
        this.set_needs_message(need)
      }
    },
    set_needs_message(message) {
      if (this.task.settings) {
        this.task.settings.needs = message
      } else {
        this.task.settings = { needs: message }
      }
      this.$store.dispatch('UPDATE_ATTRIBUTE', { module: 'tasks', id: this.task.id, attribute: 'settings', value: this.task.settings })
    }
  }
}
</script>

<style scoped>
tr {
  display: table-row;
}
</style>
