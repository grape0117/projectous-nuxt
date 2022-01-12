<template>
  <tr class="task-container">
    <td>{{ taskClientNameFromProject(task.project_id) }}</td>
    <td>{{ taskProjectName(task.project_id) }}</td>
    <td>
      <a @click="editTask(task)">{{ task.title }}</a> <button @click="getNeed()">Set Need</button>
      <div v-if="task.settings && task.settings.needs">{{ task.settings.needs }}</div>
      <task-note v-if="!hide_notes" v-bind:task="task"></task-note>
    </td>
    <td style="white-space: nowrap">
      <div v-for="task_user in task_users()"><i v-if="task_user.role === 'manager'" class="glyphicon glyphicon-flash"></i><i v-else-if="task_user.role === 'reviewer'" class="glyphicon glyphicon-thumbs-up"></i>&nbsp; {{ user_from_task_user(task_user) }} {{ task_user.role }}</div>
    </td>
    <td>
      <div class="btn-group">
        <button class="btn btn-xs btn-default task-option-hidden" v-if="!forToday(task)" @click="markForToday(task.id)">Today</button>
        <button class="btn btn-xs btn-primary" v-else="" @click="markNotToday(task.id)">
          {{ task.next_work_day }}
        </button>
        <button class="btn btn-xs btn-default task-option-hidden" @click="markTomorrow(task.id)">
          <i class="glyphicon glyphicon-menu-right"></i>
        </button>
        <button class="btn btn-xs btn-defaul task-option-hidden" @click="markNextWeek(task.id)">
          <i class="glyphicon glyphicon-forward"></i>
        </button>
        <button :class="'btn btn-xs dropdown-toggle task-option-hidden ' + todayClass()" data-toggle="dropdown">
          <span class="caret"></span>
        </button>
        <ul class="dropdown-menu">
          <!-- dropdown menu links -->
          <li @click="setNextWorkDay(interval)" v-for="interval in [1, 2, 3, 4, 5, 6, 7]">
            <a>{{ getWorkDayName(interval) }}</a>
          </li>
        </ul>
      </div>

      <button :class="'btn btn-xs btn-' + taskStatusClass() + ' task-option-hidden'" v-if="isVisibleToUser()" @click="moveStatusForward()"><i class="glyphicon glyphicon-check"></i></button>
      <button class="btn btn-xs btn-default task-option-hidden" @click="startTaskTimer(task)"><i class="glyphicon glyphicon-play"></i></button>
      <!--<button v-if="!current_project_id" class="btn btn-xs btn-default task-option-hidden" @click="goToProject(task.project_id)">View Project
            </button>-->
      <button class="btn btn-xs btn-default task-option-hidden" @click="editTask(task)"><i class="glyphicon glyphicon-pencil"></i></button>
      <button class="btn btn-xs btn-default task-option-hidden" @click="toggle_notes()">Show Notes</button>
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
  methods: {
    user_from_task_user(task_user) {
      return this.$store.getters['company_users/getById'](task_user.company_user_id)['name']
    },
    async showTaskDetail() {
      await this.$router.push({ query: { task: this.task.id, showChatSection: 'true' } })
    },
    task_users() {
      const task_users = this.$store.getters['task_users/getByTaskId'](this.task.id)
      console.log('task_users', task_users)
      return task_users
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
