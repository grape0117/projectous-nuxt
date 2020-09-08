<style scoped>
.task-img {
  width: 40px;
  display: inline-block;
  vertical-align: top;
}
.task-detail {
  display: inline-block;
  width: calc(100% - 50px);
}
.task-title {
  height: 40px;
  /* max-height: 60px; */
  text-overflow: ellipsis;
  overflow-y: hidden;
}

.project-title {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
<template>
  <div @click="$emit('showTask', task)" class="task-card" :style="'background-color: ' + backgroundColor">
    <!-- <img :src="'//www.projectous.com/api/projects/' + task.project_id + '/favicon.png'" /> -->
    <!-- <img src="https://dummyimage.com/30x30/000/fff" /> -->
    <div class="task-img">
      <b-avatar v-if="project.avatar" variant="primary" text="BV" class="mr-3"></b-avatar>
      <b-avatar v-if="project.acronym" variant="primary" :text="project.acronym" class="mr-3"></b-avatar>
      <b-avatar v-else variant="primary" text="P" class="mr-3"></b-avatar>
    </div>
    <div class="task-detail">
      <div class="project-title" v-if="!project.acronym">
        <strong>{{ project.name }}</strong>
      </div>
      <div class="task-title">
        <span v-if="project.acronym"
          ><strong>{{ project.acronym }}</strong></span
        >
        {{ task.title }}
      </div>
      <div class="assigned-users">
        <b-avatar v-for="user in taskUsers" v-if="user.name" :text="user.abbr" class="mr-3" v-b-tooltip.hover :title="user.name" size="25px" style="margin-right: 5px;"> </b-avatar>
      </div>
      <div></div>
    </div>
    <small>{{ getDiffAssignedDate }}</small>
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
      // console.log(this.task.due_date)
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
    },
    getDiffAssignedDate() {
      const task_users = this.$store.getters['task_users/getByTaskId'](this.task.id)
      if (task_users.length) {
        let today = moment()
        let assigned_at = moment(task_users[0].created_at)
        let diff = today.diff(assigned_at, 'days')
        if (diff == 0) return 'assigned today'
        else if (diff == 1) return 'assigned yesterday'
        else return 'assigned ' + diff + ' day(s) ago'
      } else {
        return 'not assigned yet'
      }
    },
    taskUsers() {
      let me = this
      let task_users = this.$store.getters['task_users/getByTaskId'](this.task.id)
      if (!task_users.length) return []
      let r_users = []

      task_users.forEach(function(user) {
        if (!user.company_user_id) user.name = ''
        else {
          let c_user = me.$store.state.company_users.company_users[user.company_user_id]
          user.name = c_user ? c_user.name : ''
        }
        user.abbr = me.abbrName(user.name)
        r_users.push(user)
      })
      return task_users
    }
  },
  methods: {
    abbrName(name) {
      if (name == '') return name
      if (name.includes(' ')) return name.charAt(0).toUpperCase()
      else return name.charAt(0).toUpperCase() + name.charAt(1).toUpperCase()
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
.task-card {
  cursor: pointer;
  font-size: small;
  width: 200px;
  /* white-space: nowrap; */
  overflow-x: hidden;
  text-overflow: ellipsis;
  min-height: 120px;
  max-height: 120px;
}

.task-card {
  padding: 6px;
}
</style>
