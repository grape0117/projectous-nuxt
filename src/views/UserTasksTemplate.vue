<template id="user-dashboard-template">
  <div class="container-fluid">
    <div class="row-no-padding">
      <div class="col-sm-12 form-group form-inline"></div>
      <div class="col-sm-12 form-group form-inline">
        <div class="input-group">
          <select v-model="new_task_project_id" id="task-project-id" class="form-control select2-select" name="project_id" style="width: 30%;">
            <option value="">No Project</option>
            <option>Personal</option>
            <option v-for="project in openprojects()" :value="project.id"> {{ client_name(project.client_company_id) }} - {{ project.name }} </option>
          </select>
          <input type="text" id="task" v-model="new_task_title" class="form-control" placeholder="@assign" @keyup.enter="createTask()" style="width: 70%;" />
          <span class="input-group-btn">
            <button @click="createTask()" class="btn btn-primary" type="button">Add Task</button>
          </span>
          <span class="input-group-btn" style="margin-left: 5px;">
            <button @click="createProject()" class="btn btn-success" type="button">Add Project</button>
          </span>
        </div>
      </div>
    </div>
    <div class="row-no-padding" v-if="isAdmin">
      <div class="col-md-12">
        <ul class="nav nav-tabs" role="tablist">
          <li @click="setTab(current_company_user.id)" :class="tabClass('tab-' + current_company_user.id)" role="presentation">
            <a aria-controls="closed" role="tab" data-toggle="tab">My Tasks <span v-if="filter_task_count(current_company_user.id) > 0" class="badge label-primary" v-html="filter_task_count(current_company_user.id).length"></span></a>
          </li>
          <li @click="setCompanyUserId(user.id)" :class="tabClass(user.id)" role="presentation" v-for="user in usersNotMe" v-bind:user="user">
            <a aria-controls="closed" role="tab" data-toggle="tab">{{ user.name }} <span v-if="filter_task_count(user.id) > 0" :class="badgeClass(user)" v-html="filter_task_count(user.id)"></span></a>
          </li>
        </ul>
      </div>
    </div>
    <div class="col-md-12">
      <div class="tab-content">
        <ul>
          <li>
            <span class="input-group" style="display: inline;">
              <input v-model="task_filter" :class="'form-control input-sm ' + taskFilterClass()" style="width: 200px; background: transparent;" /><button v-if="task_filter" class="btn btn-sm btn-default" @click="clearSearch()">&times;</button><button class="btn btn-sm btn-default"><i class="glyphicon glyphicon-search"></i></button>
            </span>
          </li>
        </ul>
        <div role="tabpanel" class="tab-pane active" id="active">
          <h3 v-if="current_project_id">{{ getCurrentProjectNameById() }}</h3>
          <div class="table-responsive">
            <ul class="table timer-table">
              <tasks-tab v-bind:tasks="filtered_tasks" v-bind:tab="tab"> </tasks-tab>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TasksTab from './TasksTab'
export default {
  name: 'user-dashboard-template',
  components: {
    'tasks-tab': TasksTab
  },
  computed: {
    current_company_user() {
      const me = this.$store.getters['company_users/getMe']
      console.log('me', me)
      return me
    },
    isAdmin() {
      return this.$store.getters['settings/isAdmin']
    },
    filtered_tasks() {
      let self = this
      let user_id = null
      if (this.tab === 'all_tasks') {
      } else if (this.tab === 'my_tasks') {
        user_id = self.current_company_user.id
      } else if (this.tab === 'managing') {
      }
      if (isFinite(this.tab)) {
        user_id = this.tab
      }

      let tasks = user_id ? this.$store.getters['tasks/getByCompanyUserId'](user_id) : this.$store.getters['tasks/getMyTasks']

      return tasks
        .filter(task => {
          if (self.current_project_id && task.project_id != self.current_project_id) {
            return false
          }
          if (!task.title.toLowerCase().includes(self.task_filter)) {
            return false
          }
          return true
        })
        .sort((a, b) => {
          if (a.priority !== b.priority) {
            return self.getNumericPriority(b.priority) - self.getNumericPriority(a.priority)
          }
          if (a.due_date || b.due_date) {
            return new Date(b.due_date) - new Date(a.due_date)
          }
          return new Date(b.created_at) - new Date(a.created_at)
        })
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
      hide_notes: this.$route.query.hide_notes ? true : false,
      current_project_id: this.$route.query.current_project_id ? this.$route.query.current_project_id : null,
      current_task: this.$route.query.current_task_id ? this.$store.getters['tasks/getTaskById'](this.$route.query.current_task_id) : null,
      sort: 'priority',
      direction: 'desc',
      task_filter: this.$route.query.task_filter ? decodeURIComponent(this.$route.query.task_filter) : '',
      show_completed: this.$route.query.start ? true : false,
      tab: this.$route.query.tab ? this.$route.query.tab : 'my_tasks',
      new_task_title: '',
      new_task_project_id: null,
      other_users: null
    }
  },
  watch: {
    current_project_id() {
      console.log('watching current_project_id')
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
      console.log('current_company_id')
      if (sessionStorage.getItem('tasks')) {
        this.$router.push({ path: sessionStorage.getItem('tasks') })
      }
    }
  },
  methods: {
    getNumericPriority(priority) {
      switch (priority) {
        case 'high':
        case 'today':
          return 3
        case 'active':
        case 'regular':
        case 'this week':
          return 2
        case 'low':
        case 'when possible':
          return 1
        case 'hold':
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
    setTab(tab) {
      console.log('tab: ' + tab)
      this.tab = tab
      this.getData()
    },
    tabClass(tab) {
      if (this.tab == tab) {
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
        console.log(this.current_task)
        path += 'current_task_id=' + this.current_task.id + '&'
      }

      if (this.task_filter) {
        path += 'task_filter=' + encodeURIComponent(this.task_filter) + '&'
      }
      if (this.tab !== 'my_tasks') {
        path += 'tab=' + this.tab + '&'
      }
      this.$router.push({ path: path })
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
        if (task.for_today && task.users.length) {
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
        return 'badge' //badgeClass = 'badge for-today';
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
      return this.$store.getters['task_users/getByCompanyUserId'](company_user_id).length
    },
    client_name(client_company_id) {
      let client = this.$store.getters['clients/getByClientCompanyId'](client_company_id)
      return client ? client.name : ''
    },
    async getData() {
      if (this.current_company_user_id) {
        const response = await this.$http().get('/company_users/' + this.current_company_user_id + '/tasks')
        console.log(response)

        this.$store.dispatch('PROCESS_INCOMING_DATA', response)
      }
      return
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

.nav-tabs li {
  border-radius: 0 !important;
  border-top: solid 3px #fff;
  background: #f8f8f8;
  margin-bottom: 0;
  margin-right: 2px;
}

.nav-tabs li a {
  color: #363636;
  border-radius: 0 !important;
  margin-right: 0 !important;
}

.nav-tabs li.active {
  background: #f8f8f8;
  border-top: solid 3px #337ab7;
  margin-bottom: 1px;
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
