<template>
  <!-- <div role="tabpanel" :class="'tab-pane active'" :id="'tab-' + tab">
    <div class="table-responsive">
      <table class="table timer-table">
        <thead>
          <tr class="row-date">
            <td>Client</td>
            <td>Project</td>
            <td>Task</td>
            <td>Assigned</td>
            <td>Actions</td>
            <td>Due</td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in tasks" v-bind:task="task" is="tasks-tab-row"></tr>
        </tbody>
      </table>
    </div>
  </div> -->

  <div class="row">
    <user-task-row v-for="task in tasks" v-bind:task="task" is="user-task-row"></user-task-row>
  </div>
</template>

<script>
import TasksTabRow from './TasksTabRow'
import UserTaskRow from './UserTaskRow'
export default {
  props: ['tasks', 'tab'],
  name: 'tasks-tab',
  components: {
    'tasks-tab-row': TasksTabRow,
    'user-task-row': UserTaskRow
  }
}
</script>
