<template>
  <div>
    <div class="shadow rounded px-1 pt-1 pb-1 card-content" v-if="task.type !== 'new'" ref="card_element" @click="showTaskDetail">
      <div class="badge-container" v-if="task.labels">
        <badge v-for="label in task.labels" :color="badgeColor(label)" :label="label">{{ label }}</badge>
      </div>
      <div class="flex justify-content-between">
        <p style="font-size: 14px;" class="text-white">{{ task.title }}</p>
      </div>
      <div class="d-flex mt-4 justify-content-between items-center">
        <span :style="`font-size: 14px; color: ${dueDateDetails(task.due_date, true)};`" v-show="task.due_date" class="text-white"><i class="icon-date_range"></i>{{ dueDate(task.due_date) }}</span>
      </div>
      <div class="assigned-members d-flex" v-if="task_users">
        <span v-for="user in task_users">
          <span :title="`${getCompanyUserDetails(user.company_user_id).name}`" :class="`avatar mr-1 pointer`" :style="{ 'background-color': getCompanyUserDetails(user.company_user_id).color, cursor: 'pointer', display: 'inline-flex' }">
            {{ abbrName(getCompanyUserDetails(user.company_user_id).name) }}
          </span>
        </span>
        <!-- <span v-for="member_id in task.assignedMembers">
          <span :title="`${getCompanyUserDetails(member_id).name}`" :class="`avatar mr-1 pointer`" :style="{ 'background-color': getCompanyUserDetails(member_id).color, cursor: 'pointer', display: 'inline-flex' }">
            {{ abbrName(getCompanyUserDetails(member_id).name) }}
          </span>
        </span> -->
      </div>
      <a href="#none">
        <i class="icon-edit" @click="editTask"></i>
      </a>
    </div>
    <div class="bg-white shadow rounded px-3 pt-3 pb-2 border border-white" id="new-task" ref="new_task" v-else>
      <div class="flex justify-content-between">
        <textarea type="text" name="new_task_title" placeholder="Enter a title for this task" v-model="new_task_title" v-on:keyup.enter="addTaskWithEnter" @input="changeTitle" v-on:blur=""></textarea>
      </div>
      <div class="assigned-members  d-flex">
        <span v-for="member_id in task.assignedMembers">
          <span :title="`${getCompanyUserDetails(member_id).name}`" :class="`avatar mr-1 pointer`" :style="{ 'background-color': getCompanyUserDetails(member_id).color, cursor: 'pointer', display: 'inline-flex' }">
            {{ abbrName(getCompanyUserDetails(member_id).name) }}
          </span>
        </span>
      </div>
      <button @click="addTask" class="btn-primary rounded">Add task</button> <i class="icon-close ml-2" @click="completeAddTask"></i>
    </div>
  </div>
</template>
<script>
import Badge from './Badge.vue'
import { abbrName } from '@/utils/util-functions'
import moment from 'moment'
import uuid from 'uuid'
export default {
  components: {
    Badge
  },
  data() {
    return {
      new_task_title: ''
    }
  },
  props: ['task', 'idList', 'columnIndex'],
  computed: {
    task_users: function() {
      return this.$store.getters['task_users/getByTaskId'](this.task.id)
    }
  },
  mounted() {
    this.task.assignedMembers = this.$store.getters['task_users/getByTaskId'](this.task.id).map(user => user.company_user_id)
  },
  methods: {
    dueDate(date) {
      return moment(date).format('MM/DD')
    },
    dueDateDetails(due_date, return_color) {
      if (!due_date && !return_color) {
        return ''
      }
      const timezone = moment.tz.guess()
      const timezone_date = moment()
        .tz(timezone)
        .format('YYYY-MM-DD')
      const task_due_date = moment(due_date).format('YYYY-MM-DD')

      const diff = moment.duration(moment(task_due_date).diff(moment(timezone_date)))
      const days = diff.asDays()
      const near_due_date = [1, 2, 3]
      let return_value
      let color
      if (days < 0) {
        return_value = 'Past due'
        color = 'red'
      } else if (days === 0) {
        return_value = 'Due today'
        color = 'red'
      } else if (near_due_date.includes(days)) {
        return_value = `Due in ${days} ${days === 1 ? 'day' : 'days'}`
        color = 'orange'
      } else {
        return_value = `Due on ${moment(due_date).format('MMMM DD')}`
        if (due_date === '0000-00-00 00:00:00') {
          return_value = 'No due date selected'
        }
        color = '#17a2b8'
      }
      if (!due_date) {
        color = '#28a745'
      }
      if (return_color) {
        return_value = color
      }
      return return_value
    },
    badgeColor(label) {
      const mappings = {
        Design: '#6f42c1',
        'Feature Request': '#20c997',
        Backend: '#007bff',
        QA: '#28a745',
        default: '#20c997',
        Urgent: '#dc3545',
        'Top Priority': '#dc3545',
        'Medimun Priority': '#ffc107',
        'Low Priority': '#28a745',
        'Very Low Priority': '#17a2b8',
        'On Staging': '#D974B0',
        Done: '#B4EFD6',
        ToDo: '#0086C0',
        Working: '#C4C4C4',
        Hold: '#FF158A',
        Testing: '#037F4C'

        // blue: '#007bff',
        // blue_back: '#007bff4b',
        // indigo: '#6610f2',
        // indigo_back: '#6610f24b',
        // purple: '#6f42c1',
        // purple_back: '#6f42c14b',
        // pink: '#e83e8c',
        // pink_back: '#e83e8c4b',
        // red: '#dc3545',
        // red_back: '#dc35454b',
        // orange: '#fd7e14',
        // orange_back: '#fd7e144b',
        // yellow: '#ffc107',
        // yellow_back: '#ffc1074b',
        // green: '#28a745',
        // green_back: '#28a7454b',
        // teal: '#20c997',
        // teal_back: '#20c9974b',
        // cyan: '#17a2b8',
        // cyan_back: '#17a2b84b',
        // white: '#fff',
        // white_back: '#fff4b',
        // gray: '#6c757d',
        // gray_back: '#6c757d4b',
        // gray_dark: '#343a40',
        // gray_dark_back: '#343a404b',
        // primary: '#007bff',
        // primary_back: '#007bff4b',
        // secondary: '#6c757d',
        // secondary_back: '#6c757d4b',
        // success: '#28a745',
        // success_back: '#28a7454b',
        // info: '#17a2b8',
        // info_back: '#17a2b84b',
        // warning: '#ffc107',
        // warning_back: '#ffc1074b',
        // danger: '#dc3545',
        // danger_back: '#dc35454b',
        // light: '#f8f9fa',
        // light_back: '#f8f9fa4b',
        // dark: '#343a40',
        // dark_back: '#343a404b',
      }
      return mappings[label] || mappings.default
    },
    showEditMoal(e) {
      console.log(e)
      if (e.target.className == 'icon-edit') {
        return
      }
      this.$emit('showEditModal')
    },
    async showTaskDetail(e) {
      if (e.target.className == 'icon-edit') {
        return
      }
      const updated_path = `/user-tasks?task=${this.task.id}&showChatSection=true`
      sessionStorage.setItem('tasks', updated_path)
      await this.$router.push({ query: { task: this.task.id, showChatSection: 'true' } })
    },
    addTask() {
      if (!this.new_task_title) {
        return
      }
      this.task['title'] = this.new_task_title
      this.task['idList'] = this.idList
      this.task['type'] = ''
      this.task['id'] = uuid.v4()
      this.$emit('completeAddTask', this.task)
    },
    addTaskWithEnter() {
      console.log('new task title', this.new_task_title)
      if (!this.new_task_title || this.new_task_title == '\n') {
        return
      }

      const projectRegex = RegExp('(?:(^([A-Z-]+):@([a-z]+))|([A-Z-]+):|@([a-z]+)|([^:@]+))', 'g')
      const acronym_matchs = this.new_task_title ? this.new_task_title.match(projectRegex) : null
      if (!acronym_matchs) {
        return
      }
      let project_captured = false
      let user_name_captured = false
      let title_captured = false
      let user_name = null
      let task_title = null
      let project_title = null

      for (let i = 0; i < acronym_matchs.length; i++) {
        const acronym_match = acronym_matchs[i]
        user_name = acronym_match.indexOf('@') >= 0 ? acronym_match.split('@')[1] : user_name
        task_title = acronym_match.indexOf('@') < 0 && acronym_match != '\n' ? acronym_match : task_title
      }

      if (user_name) {
        user_name_captured = true
        this.new_user_name = user_name
        let new_company_users = this.$store.getters['company_users/getUsersByAlias'](user_name)
        if (new_company_users.length > 0) {
          const member = new_company_users[0]
          const member_index = this.task['assignedMembers'].indexOf(member['id'])
          if (member_index < 0) {
            this.task.assignedMembers.push(member['id'])
          } else {
            this.task.assignedMembers.splice(member_index, 1)
          }
        } else {
          task_title = this.new_task_title
        }
      }
      if (task_title) {
        title_captured = true
        this.new_task_title = task_title
      } else if (!task_title || task_title == '\n') {
        this.new_task_title = ''
        return
      }
      this.task['title'] = this.new_task_title
      this.task['type'] = ''
      this.task['idList'] = this.idList
      this.task['id'] = uuid.v4()
      this.$emit('completeAddTask', this.task)
      var columnIndex = this.columnIndex
      this.$nextTick(() => {
        document.getElementById(`add-task-btn-${columnIndex}`).click()
      })
    },
    completeAddTask() {
      this.$emit('completeAddTask', '')
    },
    changeTitle: _.debounce(function(e) {
      this.task['title'] = this.new_task_title
      if (!this.$refs.new_task) {
        return
      }
      const left = this.$refs.new_task.getBoundingClientRect().left
      const top = this.$refs.new_task.getBoundingClientRect().top
      this.$emit('creatingTask', { new_task_title: this.new_task_title, left: left, top: top })
    }, 500),
    editTask() {
      const left = this.$refs.card_element.getBoundingClientRect().left
      const top = this.$refs.card_element.getBoundingClientRect().top
      const height = this.$refs.card_element.getBoundingClientRect().height
      const width = this.$refs.card_element.getBoundingClientRect().width
      const bottom = window.innerHeight - this.$refs.card_element.getBoundingClientRect().bottom
      this.$emit('editTask', { top, left, height, width, task: this.task, bottom })
    },
    abbrName,
    getCompanyUserDetails(company_user_id) {
      const user_details = this.$store.state.company_users.company_users.find(e => e.id === company_user_id)
      return user_details
    }
  }
}
</script>
<style>
.badge-container {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  margin-bottom: 4px;
}
#new-task textarea {
  width: 100%;
  border: none;
  padding: 0px 0px 10px;
  margin-bottom: 10px;
}
.icon-close {
  font-size: 27px;
  color: gray;
}
.icon-close:hover {
  color: black;
}
.card-content {
  position: relative;
}
.card-content .icon-edit {
  position: absolute;
  top: 17px;
  right: 15px;
  padding: 5px;
  color: #565252;
  background-color: rgba(200, 200, 200, 0.7);
  border-radius: 50%;
  font-size: 20px;
  visibility: hidden;
}
.card-content:hover .icon-edit {
  visibility: visible;
}

.task-card-item {
  box-shadow: 0px 0px 16px -7px white;
}
.task-card-item > div {
  background-color: rgba(0, 0, 0, 0.4);
}
</style>
