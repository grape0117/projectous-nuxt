<template>
  <tr class="task-container">
    <td>{{ taskClientNameFromProject(task.project_id) }}</td>
    <td>{{ taskProjectName(task.project_id) }}</td>
    <td>
      <a @click="editTask(task)">{{ task.title }}</a>
      <task-note v-if="!hide_notes" v-bind:task="task"></task-note>
    </td>
    <td style="white-space: nowrap">
      <div v-for="user in task_users(task)" :style="isUnderlined(user)"><i v-if="user.role === 'manager'" class="glyphicon glyphicon-flash"></i><i v-else-if="user.role === 'reviewer'" class="glyphicon glyphicon-thumbs-up"></i>&nbsp;{{ user.name }}</div>
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
  name: 'tasks-tab-row'
}
</script>

<style scoped>
tr {
  display: table-row;
}
</style>
