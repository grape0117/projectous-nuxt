<template id="user-dashboard-template">
  <div class="container-fluid">
    <div class="row-no-padding" v-if="isAdmin">
      <div class="col-md-12">
        <ul class="nav nav-tabs" role="tablist">
          <li @click="setTab('my_tasks')" :class="tabClass('my_tasks')" role="presentation">
            <a aria-controls="closed" role="tab" data-toggle="tab"
              >My Tasks
              <span v-if="my_tasks.length > 0" class="badge badge-secondary label-primary" v-html="my_tasks.length"></span>
              <span v-if="my_high_count > 0" class="badge badge-danger label-primary" v-html="my_high_count"></span>
            </a>
          </li>
          <li @click="setTab('all')" :class="tabClass('all')" role="presentation">
            <a aria-controls="closed" role="tab" data-toggle="tab"
              >All
              <span v-if="all_count > 0 || all_tasks.length > 0" class="badge badge-secondary label-primary" v-html="all_count || all_tasks.length"></span>
              <span v-if="all_high_count > 0" class="badge badge-danger label-primary" v-html="all_high_count"></span>
            </a>
          </li>
          <li @click="setTab('others')" :class="tabClass('others')" role="presentation">
            <a aria-controls="closed" role="tab" data-toggle="tab"
              >Assigned to Others
              <span v-if="others_count > 0 || others_tasks.length > 0" class="badge badge-secondary label-primary" v-html="others_count || others_tasks.length"></span>
              <span v-if="others_high_count > 0" class="badge badge-danger label-primary" v-html="others_high_count"></span>
            </a>
          </li>
          <li @click="setTab('today_tasks')" :class="tabClass('today_tasks')" role="presentation">
            <a aria-controls="closed" role="tab" data-toggle="tab"
              >Today
              <span v-if="today_count > 0 || for_today_tasks.length > 0" class="badge badge-secondary label-primary" v-html="today_count || for_today_tasks.length"></span>
              <span v-if="today_high_count > 0" class="badge badge-danger label-primary" v-html="today_high_count"></span>
            </a>
          </li>
          <li @click="setTab('past_due')" :class="tabClass('past_due')" role="presentation">
            <a aria-controls="closed" role="tab" data-toggle="tab"
              >Due
              <span v-if="past_due_count > 0 || due_tasks.length > 0" class="badge badge-secondary label-primary" v-html="past_due_count || due_tasks.length"></span>
              <span v-if="past_due_high_count > 0" class="badge badge-danger label-primary" v-html="past_due_high_count"> </span>
            </a>
          </li>
        </ul>
        <ul class="nav nav-tabs" role="tablist">
          <li @click="setCompanyUserId(user.id)" :class="tabClass(user.id)" role="presentation" v-for="user in usersNotMe" v-bind:user="user">
            <a aria-controls="closed" role="tab" data-toggle="tab"
              ><span v-if="user.id" :title="`${user.name}`" :class="`mr-1 pointer ${user.status}`" :style="{ color: 'white', cursor: 'pointer', display: 'inline-flex' }">
                {{ user.name }}
              </span>
              <span v-if="filter_task_count(user.id) > 0" :class="badgeClass(user)" v-html="filter_task_count(user.id)"></span>
              <span v-if="filter_task_high_count(user.id).length > 0 && filter_task_high_count(user.id)[0]['count'] > 0" class="badge badge-danger label-primary" v-html="filter_task_high_count(user.id)[0]['count']"></span>
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div class="col-md-12" v-if="isAdmin">
      <div class="tab-content">
        <ul>
          <li>
            <div class="mb-2 form-inline">
              <b-form-checkbox v-if="tab == 'my_tasks'" v-model="is_owner" name="check-button" switch variant="warning">
                Owner
              </b-form-checkbox>
              <button class="btn btn-primary mx-2" @click="showBulkAction()">Bulk Action</button>
              <!-- <label class="mr-sm-2" for="action-list">Action:</label> -->
              <select id="action-list" class="form-control select2-select" v-model="action_name" v-if="show_checkbox" @change="changeBulk">
                <option value="" selected> Select Action </option>
                <option value="complete">Complete</option>
                <option value="delete">Delete</option>
                <option value="high_priority">High Priority</option>
                <option value="regular_priority">Regular Priority</option>
                <option value="low_priority">Low Priority</option>
                <option value="hold_priority">Hold Priority</option>
                <option value="remove_due_date">Remove Due Date</option>
                <option value="set_due_date">Set Due Date</option>
              </select>
            </div>
          </li>
          <li>
            <b-input-group prepend="Search" style="width:30%">
              <b-form-input v-model="task_filter" :class="'form-control input-sm ' + taskFilterClass()"></b-form-input>
              <b-input-group-append>
                <b-button variant="light" @click="clearSearch()"><i class="icon-close"/></b-button>
              </b-input-group-append>
            </b-input-group>
          </li>
        </ul>
        <b v-for="project_id in project_list">
          <b-badge @click="updateProjectFilter(project_id)" variant="primary" class="mr-1" :style="{ 'background-color': getClientAcronymColor(project_id), color: 'white', cursor: 'pointer', border: isActiveProjectFilter(project_id) ? 'none' : 'solid 2px white' }" :title="taskProjectName(project_id) && taskProjectName(project_id)">
            {{ getProjectDetails(project_id) }}
          </b-badge>
        </b>
        <!--<div>
          <b style="font-size:13px;">Status: </b>
          <b-badge @click="updateStatusFilter('open')" :variant="isActiveStatusFilter('open') ? 'secondary' : 'light'" class="mr-1" style="cursor:pointer">Open</b-badge>
          <b-badge @click="updateStatusFilter('turned-in')" :variant="isActiveStatusFilter('turned-in') ? 'info' : 'light'" class="mr-1" style="cursor:pointer">Turned-In</b-badge>
          <b-badge @click="updateStatusFilter('reviewed')" :variant="isActiveStatusFilter('reviewed') ? 'primary' : 'light'" class="mr-1" style="cursor:pointer">Reviewed</b-badge>
          <b-badge @click="updateStatusFilter('completed')" :variant="isActiveStatusFilter('completed') ? 'success' : 'light'" class="mr-1" style="cursor:pointer">Completed</b-badge>
          <b-badge @click="updateStatusFilter('closed')" :variant="isActiveStatusFilter('closed') ? 'danger' : 'light'" class="mr-1" style="cursor:pointer">Closed</b-badge>
        </div>
        <div>
          <b style="font-size:13px;">Step: </b>
          <b-badge @click="updateStepFilter('publish')" :variant="isActiveStepFilter('publish') ? 'secondary' : 'light'" class="mr-1" style="cursor:pointer">Publish</b-badge>
          <b-badge @click="updateStepFilter('test')" :variant="isActiveStepFilter('test') ? 'info' : 'light'" class="mr-1" style="cursor:pointer">Test</b-badge>
          <b-badge @click="updateStepFilter('get client feedback')" :variant="isActiveStepFilter('get client feedback') ? 'primary' : 'light'" class="mr-1" style="cursor:pointer">Get Client Feedback</b-badge>
          <b-badge @click="updateStepFilter('notify client')" :variant="isActiveStepFilter('notify client') ? 'success' : 'light'" class="mr-1" style="cursor:pointer">Notify Client</b-badge>
        </div>-->
        <div role="tabpanel" class="tab-pane active" id="active">
          <h3 v-if="current_project_id">{{ getCurrentProjectNameById() }}</h3>
          <tasks-tab v-bind:tasks="filtered_tasks" v-bind:tab="tab" @updateData="updateData" v-bind:showCheckbox="show_checkbox"> </tasks-tab>
        </div>
      </div>
    </div>
    <div v-if="!isAdmin">
      <b-form-checkbox v-model="is_owner" name="check-button" switch variant="warning">
        Owner
      </b-form-checkbox>
      <tasks-tab v-bind:tasks="my_tasks" @updateData="updateData"> </tasks-tab>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import { EventBus } from '@/components/event-bus'
import TasksTab from './TasksTab'
import TaskActionRow from './TaskActionRow.vue'
export default {
  name: 'user-dashboard-template',
  components: {
    'tasks-tab': TasksTab
  },
  mounted() {
    EventBus.$on('update', async ({ company_user_id, task_id }) => {
      await this.setTab(company_user_id)
      document.getElementById(`task_${task_id}`).scrollIntoView()
    })
  },
  computed: {
    current_company_user() {
      const me = this.$store.getters['company_users/getMe']
      return me
    },
    isAdmin() {
      return this.$store.getters['settings/isAdmin']
    },
    my_tasks() {
      this.my_high_count = this.$store.state.tasks.my_tasks.filter(({ priority, status }) => priority == 'high' && status !== 'completed').length
      const current_user_id = this.$store.state.settings.current_company_user_id
      if (this.is_owner) {
        return this.$store.state.tasks.tasks.filter(({ owner }) => owner == current_user_id)
      }
      let my_tasks = this.$store.state.tasks.my_tasks.filter(({ status }) => status !== 'completed')
      // let my_tasks = this.$store.getters['tasks/getByCompanyUserId'](current_user_id)
      let self = this
      var now = new Date().getTime()
      const distantFuture = new Date(8640000000000000)

      let dueTasks = my_tasks
        .filter(task => {
          let dueDate = task['due_date'] ? new Date(task['due_date']) : distantFuture
          if (dueDate.getTime() && dueDate.getTime() <= now) {
            return true
          } else {
            return false
          }
        })
        .sort((a, b) => {
          let dateA = a['due_date'] ? new Date(a['due_date']) : distantFuture
          let dateB = b['due_date'] ? new Date(b['due_date']) : distantFuture
          if (dateA !== dateB) {
            return dateA.getTime() - dateB.getTime()
          } else if (a.priority !== b.priority) {
            return self.getNumericPriority(b.priority) - self.getNumericPriority(a.priority)
          }
        })
      let notDueTasks = my_tasks
        .filter(task => {
          let dueDate = task['due_date'] ? new Date(task['due_date']) : distantFuture
          if (!dueDate.getTime() || dueDate.getTime() > now) {
            return true
          } else {
            return false
          }
        })
        .sort((a, b) => {
          let dateA = a['due_date'] ? new Date(a['due_date']) : distantFuture
          let dateB = b['due_date'] ? new Date(b['due_date']) : distantFuture
          if (a.priority !== b.priority) {
            return self.getNumericPriority(b.priority) - self.getNumericPriority(a.priority)
          } else {
            return dateA.getTime() - dateB.getTime()
          }
        })
      my_tasks = [...dueTasks, ...notDueTasks]
      let tmp_priority = my_tasks.length > 0 ? my_tasks[0].priority : ''
      my_tasks.forEach((task, i) => {
        if (task.priority !== tmp_priority) {
          task['hasMargin'] = true
          tmp_priority = task.priority
        } else {
          task['hasMargin'] = false
        }
      })
      return my_tasks
    },
    all_tasks() {
      this.all_high_count = this.$store.state.tasks.all_tasks.filter(({ priority, status }) => priority == 'high' || status !== 'completed').length
      return this.$store.state.tasks.all_tasks
    },
    others_tasks() {
      this.others_high_count = this.$store.state.tasks.others_tasks.filter(({ priority, status }) => priority == 'high' || status !== 'completed').length
      return this.$store.state.tasks.others_tasks
    },
    for_today_tasks() {
      this.others_high_count = this.$store.state.tasks.today_tasks.filter(({ priority, status }) => priority == 'high' || status !== 'completed').length
      return this.$store.state.tasks.today_tasks
    },
    due_tasks() {
      this.others_high_count = this.$store.state.tasks.past_due_tasks.filter(({ priority, status }) => priority == 'high' || status !== 'completed').length
      return this.$store.state.tasks.past_due_tasks
    },
    getUserProjects(user_tasks) {},
    filtered_tasks() {
      let self = this
      let user_id = null
      let tasks = []
      const current_user_id = this.$store.state.settings.current_company_user_id

      if (this.tab === 'all') {
        tasks = this.$store.state.tasks.tasks
        // this.all_count = this.$store.state.tasks.all_tasks.length
        this.all_high_count = tasks.filter(({ priority, status }) => priority == 'high' && status !== 'completed').length
      } else if (this.tab === 'others') {
        tasks = this.$store.state.tasks.others_tasks
        this.others_high_count = tasks.filter(({ priority, status }) => priority == 'high' && status !== 'completed').length
      } else if (this.tab === 'my_tasks') {
        user_id = self.current_company_user.id
        if (this.is_owner) {
          tasks = this.$store.state.tasks.tasks.filter(({ owner }) => owner == current_user_id)
        } else {
          tasks = this.$store.state.tasks.my_tasks
        }
        this.my_high_count = tasks.filter(({ priority, status }) => priority == 'high' && status !== 'completed').length
      } else if (this.tab === 'today_tasks') {
        user_id = self.current_company_user.id
        tasks = this.$store.state.tasks.today_tasks
        this.today_count = tasks.length
        this.today_high_count = tasks.filter(({ priority, status }) => priority == 'high' && status !== 'completed').length
      } else if (this.tab === 'past_due') {
        user_id = self.current_company_user.id
        tasks = this.$store.state.tasks.past_due_tasks
        this.past_due_count = tasks.length
        this.past_due_high_count = tasks.filter(({ priority, status }) => priority == 'high' && status !== 'completed').length
      } else if (this.tab === 'managing') {
      } else if (isFinite(this.tab)) {
        user_id = this.tab
        tasks = user_id ? this.$store.getters['tasks/getByCompanyUserId'](user_id) : this.$store.getters['tasks/getMyTasks']
      }

      tasks = tasks.filter(task => {
        if (!task || (self.current_project_id && task.project_id !== self.current_project_id) || (task.title && !task.title.toLowerCase().includes(self.task_filter)) || task.status === 'completed') {
          return false
        }
        if (self.project_filter.length > 0 || self.status_filter.length > 0 || self.step_filter.length > 0) {
          const check_project_filter = self.project_filter.includes(task.project_id)
          const check_status_filter = self.status_filter.includes(task.status)
          let check_step_filter = false
          for (let i = 0; i < task.users.length; i++) {
            const user = task.users[i]
            if (user.step === self.step_filter[0]) {
              check_step_filter = true
              break
            }
          }
          if (check_project_filter || check_status_filter || check_step_filter) {
            return true
          } else {
            return false
          }
        }
        return true
      })
      var now = new Date().getTime()
      const distantFuture = new Date(8640000000000000)
      let dueTasks = tasks
        .filter(task => {
          let dueDate = task['due_date'] ? new Date(task['due_date']) : distantFuture
          if (dueDate.getTime() && dueDate.getTime() <= now) {
            return true
          } else {
            return false
          }
        })
        .sort((a, b) => {
          let dateA = a['due_date'] ? new Date(a['due_date']) : distantFuture
          let dateB = b['due_date'] ? new Date(b['due_date']) : distantFuture
          if (dateA !== dateB) {
            return dateA.getTime() - dateB.getTime()
          } else if (a.priority !== b.priority) {
            return self.getNumericPriority(b.priority) - self.getNumericPriority(a.priority)
          }
        })
      let notDueTasks = tasks
        .filter(task => {
          let dueDate = task['due_date'] ? new Date(task['due_date']) : distantFuture
          if (!dueDate.getTime() || dueDate.getTime() > now) {
            return true
          } else {
            return false
          }
        })
        .sort((a, b) => {
          let dateA = a['due_date'] ? new Date(a['due_date']) : distantFuture
          let dateB = b['due_date'] ? new Date(b['due_date']) : distantFuture
          if (a.priority !== b.priority) {
            return self.getNumericPriority(b.priority) - self.getNumericPriority(a.priority)
          } else {
            return dateA.getTime() - dateB.getTime()
          }
        })
      tasks = [...dueTasks, ...notDueTasks]
      let tmp_priority = tasks.length > 0 ? tasks[0].priority : ''
      tasks.forEach((task, i) => {
        const { project_id } = task
        if (typeof project_id !== 'undefined') {
          if (!self.project_list.includes(project_id)) {
            if (project_id) {
              self.project_list.push(project_id)
            }
          }
        }
        if (task.priority !== tmp_priority) {
          task['hasMargin'] = true
          tmp_priority = task.priority
        } else {
          task['hasMargin'] = false
        }
        const task_user = this.$store.getters['task_users/getByTaskIdAndCompanyUserId']({ task_id: task.id, company_user_id: current_user_id })[0]
        task['isToday'] = task_user && task_user['next_work_day'] && moment(task_user['next_work_day']).format('yyyy-MM-DD') <= moment().format('yyyy-MM-DD')
      })

      if (this.tab === 'all') {
        this.all_count = tasks.length
      } else if (this.tab === 'others') {
        this.others_count = tasks.length
      }
      return tasks
    },

    usersNotMe() {
      this.other_users = this.$store.getters['company_users/getActiveNotMe']
      return this.other_users
    },
    tasks() {
      return this.$store.state.tasks.tasks
    },
    projects() {
      return this.$store.state.projects.projects //getters['projects/openprojects'];
    },
    active_projects() {
      return this.$store.getters['projects/active_projects']
    },
    current_company() {
      return this.$store.state.settings.current_company
    }
  },
  data() {
    return {
      current_user_id: null,
      current_company_user_id: null,
      hide_notes: !!this.$route.query.hide_notes,
      current_project_id: this.$route.query.current_project_id ? this.$route.query.current_project_id : null,
      current_task: this.$route.query.current_task_id ? this.$store.getters['tasks/getTaskById'](this.$route.query.current_task_id) : null,
      sort: 'priority',
      direction: 'desc',
      task_filter: this.$route.query.task_filter ? decodeURIComponent(this.$route.query.task_filter) : '',
      show_completed: !!this.$route.query.start,
      tab: this.$route.query.tab ? this.$route.query.tab : 'my_tasks',
      new_task_title: '',
      new_task_project_id: null,
      other_users: null,
      status_filter: [],
      step_filter: [],
      project_filter: [],
      project_list: [],
      my_high_count: 0,
      high_count_of_users: [],
      all_count: 0,
      all_high_count: 0,
      others_count: 0,
      others_high_count: 0,
      today_count: 0,
      today_high_count: 0,
      past_due_count: 0,
      past_due_high_count: 0,
      is_owner: false,
      show_checkbox: false,
      action_name: ''
    }
  },
  watch: {
    current_project_id() {
      this.storeChanges()
    },
    task_filter() {
      this.storeChanges()
    },
    show_completed() {
      this.storeChanges()
    },
    current_company() {
      if (sessionStorage.getItem('tasks')) {
        this.$router.push({ path: sessionStorage.getItem('tasks') })
      }
    },
    tab() {
      this.getData()
      this.storeChanges()
    },
    other_users() {
      const { tab } = this.$route.query
      if (tab) {
        this.setCompanyUserId(parseInt(tab))
      }
    }
  },
  beforeCreate() {
    if (this.$store.state.settings.current_company.id) {
      if (sessionStorage.getItem('tasks')) {
        this.$router.push({ path: sessionStorage.getItem('tasks') })
      }
    }
  },
  methods: {
    showBulkAction() {
      this.show_checkbox = !this.show_checkbox
    },
    abbrName(name) {
      if (!name) return ''
      let matches = name.match(/\b(\w)/g) // ['J','S','O','N']
      if (matches) {
        let acronym = matches.join('') // JSON
        return acronym.toUpperCase()
      }
    },
    getCompanyUserDetails(company_user_id) {
      const user_details = this.$store.state.company_users.company_users.find(e => e.id === company_user_id)

      return user_details
    },
    getClientAcronymColor(project_id) {
      return this.getProjectDetails(project_id, true)
    },
    getProjectDetails(project_id, is_color) {
      const project = this.$store.getters['projects/getById'](project_id)
      let client_data = null
      if (is_color && project) {
        client_data = this.$store.getters['clients/getByClientCompanyId'](project.client_company_id)
        return client_data.color
      } else if (!project) {
        return is_color ? 'gray' : 'No project'
      }
      return project.acronym ? project.acronym : project.name
    },
    updateStatusFilter(status) {
      if (this.status_filter.includes(status)) {
        this.status_filter = this.status_filter.filter(e => e !== status)
      } else {
        this.status_filter = [status]
      }
    },
    updateStepFilter(step) {
      if (this.step_filter.includes(step)) {
        this.step_filter = this.step_filter.filter(e => e !== step)
      } else {
        this.step_filter = [step]
      }
    },
    isActiveStatusFilter(status) {
      let is_selected
      if (this.status_filter.includes(status)) {
        is_selected = false
      } else {
        is_selected = true
      }

      return is_selected
    },
    isActiveStepFilter(step) {
      let is_selected
      if (this.step_filter.includes(step)) {
        is_selected = false
      } else {
        is_selected = true
      }

      return is_selected
    },
    updateProjectFilter(project_id) {
      if (this.project_filter.includes(project_id)) {
        this.project_filter = this.project_filter.filter(e => e !== project_id)
      } else {
        this.project_filter = [project_id]
      }
    },
    isActiveProjectFilter(project_id) {
      let is_selected
      if (this.project_filter.includes(project_id)) {
        is_selected = false
      } else {
        is_selected = true
      }

      return is_selected
    },
    taskProjectName(project_id) {
      return this.$store.getters['projects/projectProjectName'](project_id)
    },
    getNumericPriority(priority) {
      switch (priority) {
        case 'high':
        case 'today':
          return 5
        case 'regular':
          return 4
        case 'active':
        case 'this week':
          return 3
        case 'low':
        case 'when possible':
          return 2
        case 'hold':
          return 1
        default:
          return 0
      }
    },
    taskFilterClass() {
      if (this.task_filter) {
        return 'active-search'
      }
    },
    setCompanyUserId(company_user_id) {
      this.current_company_user_id = company_user_id
      this.setTab(company_user_id)
    },
    async setTab(tab) {
      this.project_list = []
      this.project_filter = []
      this.tab = tab
      this.current_company_user_id = tab
      const data = await this.getData()
    },
    tabClass(tab) {
      if (this.tab === tab) {
        return 'active'
      }
    },
    storeChanges() {
      let path = '/user-tasks?'
      if (this.hide_notes) {
        path += 'hide_notes=1&'
      }
      if (this.current_project_id) {
        path += 'current_project_id=' + this.current_project_id + '&'
      }
      if (this.current_task) {
        path += 'current_task_id=' + this.current_task.id + '&'
      }

      if (this.task_filter) {
        path += 'task_filter=' + encodeURIComponent(this.task_filter) + '&'
      }
      if (this.tab !== 'my_tasks') {
        path += 'tab=' + this.tab + '&'
      }
      const query = this.$router.history.current.query
      if (query.task) {
        path += `task=${query.task}&showChatSection=${query.showChatSection}&`
      }

      this.$router.push({ path })
      sessionStorage.setItem('tasks', path)
    },
    clearSearch() {
      this.task_filter = ''
    },
    getCurrentProjectNameById() {
      let project
      if (this.current_project_id) {
        project = this.$store.getters['projects/getById'](this.current_project_id)
        if (project) {
          return project.name
        }
      }
    },
    createProject() {
      this.$store.dispatch('projects/createProject')
    },
    badgeClass(user) {
      let self = this
      let badgeClass = ''
      self.tasks.forEach(task => {
        if (task && task.for_today && task.users && task.users.length) {
          task.users.forEach(task_user => {
            if (task_user.company_user_id === user.id) {
              badgeClass = 'badge for-today'
              //return false;
            }
          })
        }
        if (badgeClass !== '') {
          //return false;
        }
      })
      if (badgeClass === '') {
        return 'badge badge-secondary' //badgeClass = 'badge for-today';
      } else {
        return badgeClass
      }
    },
    openprojects() {
      return this.$store.getters['projects/openprojects']()
    },
    createTask() {
      this.$store.dispatch('tasks/createTask', {
        title: this.new_task_title,
        project_id: this.new_task_project_id,
        sort_order: 0,
        status: 'open',
        temp: false
      })
      this.new_task_title = ''
      this.new_task_project_id = null
    },
    filter_task_count(company_user_id) {
      return this.$store.getters['tasks/getOnlyAssignedTasksByCompanyUserId'](company_user_id).length
    },
    filter_task_high_count(company_user_id) {
      return this.high_count_of_users.filter(({ user_id }) => user_id == company_user_id)
    },
    client_name(client_company_id) {
      let client = this.$store.getters['clients/getByClientCompanyId'](client_company_id)
      return client ? client.name : ''
    },
    async changeBulk(e) {
      let task_ids = []
      $('[name="task_checkbox"]:checked').each(function() {
        task_ids.push(this.id)
      })
      if (task_ids.length == 0) {
        // this.makeToast('danger', 'Please select at least one task')
        alert('Please select at least one task')
        this.action_name = ''
      }
      for (let i = 0; i < task_ids.length; i++) {
        const task_id = task_ids[i]
        let task = this.$store.getters['tasks/getById'](task_id)

        if (this.action_name == 'delete') {
          await this.$store.dispatch('DELETE', { module: 'tasks', entity: task }, { root: true })
        } else {
          switch (this.action_name) {
            case 'complete':
              task.status = 'completed'
              break
            case 'delete':
              break
            case 'high_priority':
              task.priority = 'high'
              break
            case 'regular_priority':
              task.priority = 'regular'
              break
            case 'low_priority':
              task.priority = 'low'

              break
            case 'hold_priority':
              task.priority = 'hold'
              break
            case 'remove_due_date':
              task.due_date = ''
              break
            default:
              break
          }
          await this.$store.dispatch('UPDATE', { module: 'tasks', entity: task }, { root: true })
        }
      }
      $('[name="task_checkbox"]:checked').prop('checked', false)
    },
    makeToast(variant = null, title, content) {
      this.$bvToast.toast(content, {
        title: title,
        variant: variant
      })
    },
    async getData() {
      if (this.current_company_user_id) {
        const response = await this.$http().get('/company_users/' + this.current_company_user_id + '/tasks')
        let count_of_heigh = response.tasks.filter(({ priority, status }) => priority == 'high' && status !== 'completed').length
        if (this.high_count_of_users.filter(({ user_id }) => user_id == this.current_company_user_id).length == 0) {
          this.high_count_of_users.push({
            user_id: this.current_company_user_id,
            count: count_of_heigh
          })
        }
        const update_result = await this.$store.dispatch('PROCESS_INCOMING_DATA', response)
        // const update_result = await this.$store.dispatch('PROCESS_INCOMING_DATA', { task_users: response.task_users, tasks: response.tasks, all_tasks: response.tasks })
      }
    },
    async updateData() {
      // const result = await this.getData();
    }
  }
}
</script>

<style scoped>
ul {
  padding: 0;
}

.active-search {
  border: red solid 1px;
}
.dragtarget {
  font-size: 20px;
  height: 20px;
}
li {
  list-style: none;
}

.task-title {
  color: black;
  min-height: 20px;
}

.task-title:focus {
  outline: none;
}

.task-note {
  color: lightgrey;
  min-height: 15px;
}

.task-container {
  padding: 0 7px;
}

.task-bullet {
  float: left;
  font-size: 20px;
  margin-left: -14px;
  margin-top: -3px;
}

.task-option-hidden {
  visibility: hidden;
}

.task-container:hover .task-option-hidden {
  visibility: visible;
}

table,
td {
  border: 1px solid #ddd;
  background: white;
}

thead td {
  background: #eeeeee;
  color: black;
}

.table-responsive {
  /*margin-right: 15px;*/
  border-radius: 3px;
  border: solid 1px #dddddd;
}

table {
  background: #eeeeee;
  border: solid 5px #eeeeee;
  margin-bottom: 8px;
}

.project-name {
  font-size: 11px;
  padding: 10px 0 10px 10px;
}

.project-details {
  background: white;
}

.task-project-list h4 {
  font-size: 12px;
  margin-top: 4px;
}

.project-details.active:hover,
.project-details.active {
  background: #337ab7;
  color: white;
}

.client-container {
  background: #eeeeee;
  border: solid 1px #dddddd;
  border-radius: 3px;
  padding: 5px;
  margin-bottom: 8px;
}

.client-containers.active .client-container {
  background: #aaa;
  border: solid 1px #ccccff;
  margin-bottom: 8px;
}

.client-containers.active .client-container h4 {
  color: white;
}

.nav-tabs {
  border-bottom: 1px solid #bb7c08;
}
.nav-tabs li {
  /* border-radius: 2px !important; */
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  border-top: solid 3px rgba(0, 0, 0, 0.4);
  background: rgba(0, 0, 0, 0.4);
  margin-bottom: 0;
  margin-right: 2px;
  cursor: pointer;
  padding: 4px;
}
.nav-tabs li:hover {
  background: rgba(0, 0, 0, 0.8) !important;
}

.nav-tabs li a {
  color: #dbc0c0;
  border-radius: 0 !important;
  margin-right: 0 !important;
}

.nav-tabs li.active {
  background: rgba(0, 0, 0, 0.1);
  border-top: solid 3px rgba(0, 0, 0, 0.4);
  border-left: solid 2px rgba(0, 0, 0, 0.4);
  border-right: solid 2px rgba(0, 0, 0, 0.4);
  margin-bottom: 1px;
  font-weight: bold;
}
.nav-tabs li.active a {
  color: #242222 !important;
}

.nav-tabs li:hover {
  border-top: solid 3px #fff;
  background: #eee;
}

.nav-tabs li:hover a {
  color: #23527c;
}

.table > tbody > tr > td,
.table > tbody > tr > th,
.table > tfoot > tr > td,
.table > tfoot > tr > th,
.table > thead > tr > td,
.table > thead > tr > th {
  padding-bottom: 2px;
}

.nav-tabs {
  margin-bottom: 15px;
}

.task-project-list > div {
  background: white;
}

.task-project-list > div.active {
  border-right: solid 3px #337ab7 !important;
}

td {
  background: white;
}

.project-column {
  -moz-column-count: 5;
  -moz-column-gap: 30px;
  -webkit-column-count: 5;
  -webkit-column-gap: 30px;
  column-count: 5;
  column-gap: 30px;
  list-style: none;
}

.project-box {
  -webkit-column-break-inside: avoid; /* Chrome, Safari, Opera */
  page-break-inside: avoid; /* Firefox */
  break-inside: avoid; /* IE 10+ */
  list-style: none !important;
  margin-bottom: 30px;
}
</style>
