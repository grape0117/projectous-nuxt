<template>
  <div role="tabpanel" :class="'tab-pane active'" :id="'tab-' + tab">
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
  </div>
</template>

<script>
import TasksTabRow from './TasksTabRow'
export default {
  props: ['tasks', 'tab'],
  name: 'tasks-tab',
  components: {
    'tasks-tab-row': TasksTabRow
  }
}
</script>
