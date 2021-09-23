<template>
  <div role="tabpanel" :class="'tab-pane active'" :id="'tab-' + tab">
    <div class="table-responsive">
      <table class="table timer-table">
        <thead>
          <tr class="row-date">
            <td @click="set_sort('client')">Client&nbsp;<span v-html="sortArrow('client')"></span></td>
            <td @click="set_sort('project')">Project&nbsp;<span v-html="sortArrow('project')"></span></td>
            <td @click="set_sort('task')">Task&nbsp;<span v-html="sortArrow('task')"></span></td>
            <td @click="set_sort('assigned')">Assigned&nbsp;<span v-html="sortArrow('assigned')"></span></td>
            <td @click="set_sort('')">Actions&nbsp;<span v-html="sortArrow('')"></span></td>
            <td @click="set_sort('due_date')">Due&nbsp;<span v-html="sortArrow('due_date')"></span></td>
          </tr>
        </thead>
        <tbody style="overflow-y: scroll; height: calc(100vh - 100px);">
          <tr v-for="task in tasks" v-bind:task="task" is="tasks-tab-row"></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import TasksTabRow from './TasksTabRow'
export default {
  props: ['tasks', 'sort', 'direction', 'current_project_id', 'tab', 'task_filter', 'hide_notes'],
  name: 'tasks-tab',
  components: {
    'tasks-tab-row': TasksTabRow
  },
  methods: {
    set_sort(column) {
      let self = this
      if (column === self.sort) {
        this.$emit('direction', self.direction === 'asc' ? 'desc' : 'asc')
      } else {
        this.$emit('direction', 'desc')
        this.$emit('sort', column)
      }
    },
    sortArrow(column) {
      if (column === this.sort) {
        return this.direction === 'asc' ? '<i class="glyphicon glyphicon-arrow-up"></i>' : '<i class="glyphicon glyphicon-arrow-down"></i>'
      }
    }
  }
}
</script>
