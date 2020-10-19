<template>
  <div @click="$emit('showTask', task)" style="" :style="'background-color: ' + backgroundColor">
    <!-- <img :src="'//www.projectous.com/api/projects/' + task.project_id + '/favicon.png'" /> -->
    <!-- <img src="https://dummyimage.com/30x30/000/fff" /> -->
    <!-- <pre>{{ task }}</pre> -->

    <div class="task-img" v-if="task.project.acronym">
      <!-- <b-avatar variant="primary" :text="task.project.acronym" class="task-card-avatar mr-3"></b-avatar> -->
      <span class="task-card-avatar mr-3">
        {{ task.project.acronym }}
      </span>
    </div>
    <div class="task-detail" v-else>
      <div class="project-title">
        <strong>{{ task.project.name }}</strong>
      </div>
      <!-- <div class="task-title">
        <span v-if="task.project.acronym"
          ><strong>{{ task.project.acronym }}</strong></span
        >
        {{ task.project.title }}
      </div> -->
      <!-- <div class="assigned-users">
        <b-avatar v-for="(user, userIndex) in taskUsers" :key="userIndex" v-if="user.name" :text="user.abbr" class="mr-3" v-b-tooltip.hover :title="user.name" size="25px" style="margin-right: 5px;"> </b-avatar>
      </div> -->
    </div>
    <div class="task-card-date">
      <small>{{ getDiffAssignedDate }}</small>
    </div>
  </div>
</template>
<script>
import moment from 'moment'

export default {
  name: 'task-card',
  props: ['task'],
  computed: {
    // project() {
    //   if (!this.task.project_id) return { acronym: 'test', name: 'name' }
    //   // let project = this.task
    //   let project = this.$store.getters['projects/getById'](this.task.project_id)
    //   return project
    // },
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
      // const task_users = this.$store.getters['task_users/getByTaskId'](this.task.id)
      const task_users = this.task.users
      if (task_users && task_users.length) {
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
      // let task_users = this.$store.getters['task_users/getByTaskId'](this.task.id)
      let task_users = this.task.users
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

.task-img .task-card-avatar {
  padding: 5px 10px;
  height: 30px !important;
  font-weight: 500;
  background-color: green !important;
  color: white;
  border-radius: 0 !important;
}
</style>

<style scoped>
.task-img {
  /* width: 40px; */
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
