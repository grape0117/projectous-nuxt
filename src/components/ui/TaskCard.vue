<template>
  <div @click="$emit('showTask', task)" class="task-card" :style="'background-color: ' + backgroundColor">
    <img :src="'//www.projectous.com/api/projects/' + task.project_id + '/favicon.png'" />
    <div v-if="!project.acronym">{{ project.name }}</div>
    <div>
      <span v-f="project.acronym">{{ project.acronym }}</span> {{ task.title }}
    </div>
    <div><small>(s) assigned 3 days ago</small></div>
  </div>
</template>
<script>
import moment from 'moment'

export default {
  name: 'task-card',
  props: ['task'],
  computed: {
    project() {
      if (!this.task.project_id) return { acronym: 'test', name: 'name' }
      let project = this.$store.getters['projects/getById'](this.task.project_id)
      return project
    },
    backgroundColor() {
      //no due date and older than 2 weeks => yellow
      //due tomorrow: yellow
      //due today: orange
      //due yesterday or before: red
      console.log(this.task.due_date)
      if (this.task.due_date) {
        if ((moment().isBefore(this.task.due_date), 'day')) {
          return 'red'
        } else if ((moment().isSame(this.task.due_date), 'day')) {
          return 'orange'
        } else if (
          (moment()
            .add(1, 'day')
            .isSame(this.task.due_date),
          'day')
        ) {
          return 'yellow'
        } else {
          return 'lightblue'
        }
      }

      if (
        moment(this.task.created_at)
          .add(100, 'day')
          .isBefore(moment())
      ) {
        return 'lightgrey'
      }
      return 'lightblue'
    }
  }
}
</script>
<style>
.task-card.past-due {
  background: red;
}
.task-card.regular {
  background-color: lightblue;
}
.task-card.regular:hover {
  background-color: blue;
}
.task-card.today {
}
.task-card.coming-up {
}
.task-card div,
.task-card {
  cursor: pointer;
  font-size: small;
  width: 200px;
  white-space: nowrap;
  overflow-x: hidden;
  text-overflow: ellipsis;
}
</style>
