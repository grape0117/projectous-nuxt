<template>
  <!-- <div @click="$emit('showTask', task)" :style="'background-color: ' + backgroundColor"> -->
  <div @click="showTaskDetail" :style="'background-color: ' + backgroundColor">
    <!-- <img :src="'//www.projectous.com/api/projects/' + task.project_id + '/favicon.png'" /> -->
    <!-- <img src="https://dummyimage.com/30x30/000/fff" /> -->
    <!-- <pre>{{ task }}</pre> -->
    <div class="task-img" v-if="task.project.acronym">
      <!-- <b-avatar variant="primary" :text="task.project.acronym" class="task-card-avatar mr-3"></b-avatar> -->
      <div class="task-card-avatar mr-1" :style="clientColor">
        {{ task.project.acronym }}
      </div>

      <div class="task-card_task-title" style="max-width: 130px;">
        <span>{{ task.title }}</span>
      </div>
    </div>
    <div class="task-detail" v-else>
      <div class="project-title">
        <strong>{{ task.project.name }}</strong>
      </div>
      <div class="task-card_task-title">
        <span>{{ task.title }}</span>
      </div>
      <!-- <div class="task-title">
        <span v-if="task.project.acronym"
          ><strong>{{ task.project.acronym }}</strong></span
        >
        {{ task.project.title }}
      </div> -->
    </div>

    <div class="d-flex justify-content-between align-items-end">
      <div class="task-card-date">
        <small>{{ getDiffAssignedDate }}</small>
      </div>
      <div class="assigned-users">
        <!-- <pre v-for="(user, userIndex) in taskUsers" :key="userIndex" v-if="user.name">
          {{ user }}
        </pre> -->
        <b-avatar v-for="(user, userIndex) in taskUsers" :key="userIndex" v-if="user.name" :text="user.abbr" v-b-tooltip.hover :title="user.name" size="25px" :style="{ 'margin-left': userIndex === 0 ? '0' : '2px', 'background-color': user.color }" style="color: black; box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);"> </b-avatar>
      </div>
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
    clientColor() {
      let client = this.$store.state.clients.clients.find(({ id }) => Number(id) === this.task.project.client_company_id)
      return { backgroundColor: client && client.color ? client.color : 'gray' }
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
      // let me = this
      // let task_users = this.$store.getters['task_users/getByTaskId'](this.task.id)
      let task_users = this.task.users
      if (task_users && task_users.length === 0) return []
      let r_users = []

      // console.log(task_users)
      // console.log(typeof task_users)

      if (task_users && task_users.length > 0) {
        task_users.forEach(async user => {
          if (!user.company_user_id) return (user.name = '')
          else {
            // let c_user = await this.$store.state.company_users.company_users[user.company_user_id - 1]
            let c_user = this.$store.state.company_users.company_users.find(x => x.user_id === user.company_user_id)
            user.name = c_user ? c_user.name : ''
            user.abbr = this.abbrName(user.name)
          }
          r_users.push(user)
        })
      }

      return r_users
    }
  },
  methods: {
    async showTaskDetail() {
      await this.$router.push({ query: { task: this.task.id } })
    },
    abbrName(name) {
      if (!name) return ''
      let matches = name.match(/\b(\w)/g) // ['J','S','O','N']
      if (matches) {
        let acronym = matches.join('') // JSON
        return acronym.toUpperCase()
      }
    }
  }
}
</script>
<style>
.task-card_task-title {
  font-size: 12px;
  font-weight: 500;
  height: 40px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  white-space: pre-wrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
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
  display: flex;
  align-items: center;
  padding: 0px 10px;
  height: 30px !important;
  white-space: nowrap;
  font-size: 10px !important;
  font-weight: 500;
  color: white;
  border-radius: 0 !important;
}
.assigned-users {
  display: flex;
}
</style>

<style scoped>
.task-img {
  /* width: 40px; */
  display: flex;
  /* vertical-align: top; */
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
