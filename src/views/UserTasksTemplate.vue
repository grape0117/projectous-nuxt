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
          <!--<li @click="setTab('all_tasks')" :class="tabClass('all-tasks')" role="presentation"><a-->
          <!--href="#active" aria-controls="open" role="tab" data-toggle="tab">All Tasks-->
          <!--<span v-if="tasks.length > 0" class="badge alert-primary"-->
          <!--v-html="all_tasks_today().length"></span></a>-->
          <!--</li>-->
          <li @click="setTab(current_company_user.id)" :class="tabClass('tab-' + current_company_user.id)" role="presentation">
            <a aria-controls="closed" role="tab" data-toggle="tab">My Tasks <span v-if="filter_task_count(current_company_user.id) > 0" class="badge label-primary" v-html="filter_task_count(current_company_user.id).length"></span></a>
          </li>
          <!--<li @click="setTab('managing-tasks')" :class="tabClass('managing-tasks')"-->
          <!--v-if="current_company_user.user_role === 'admin'" role="presentation"><a aria-controls="closed"-->
          <!--role="tab"-->
          <!--data-toggle="tab">Managing-->
          <!--<span v-if="filter_admin_task_count(current_company_user.id) > 0" class="badge label-primary"-->
          <!--v-html="filtered_admin_tasks_today(current_company_user.id).length"></span></a></li>-->
          <li @click="setTab(user.id)" :class="tabClass(user.id)" role="presentation" v-for="user in usersNotMe" v-bind:user="user">
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
            <button @click="toggleShowCompleted()" :class="'btn btn-sm btn-' + showCompletedClass()">Show Completed</button>
            <button @click="toggleShowNotToday()" :class="'btn btn-sm btn-' + showNotTodayClass()">Show Unscheduled</button>
            <button @click="toggleHideNotes()" :class="'btn btn-sm btn-' + hideNotesClass()">Hide Notes</button>
            <div class="btn-group pull-right">
              <button :class="'btn btn-sm btn-' + viewTypeClass('calendar')" @click="setViewType('calendar')"><i class="glyphicon glyphicon-calendar"></i></button>
              <button :class="'btn btn-sm btn-' + viewTypeClass('list')" @click="setViewType('keep')"><i class="glyphicon glyphicon-phone"></i></button>
              <button :class="'btn btn-sm btn-' + viewTypeClass('list')" @click="setViewType('list')"><i class="glyphicon glyphicon-list"></i></button>
              <button :class="'btn btn-sm btn-' + viewTypeClass('table')" @click="setViewType('table')"><i class="glyphicon glyphicon-th"></i></button>
            </div>
          </li>
        </ul>
        <div role="tabpanel" class="tab-pane active" id="active">
          <h3 v-if="current_project_id">{{ getCurrentProjectNameById() }}</h3>
          <div class="table-responsive">
            <ul class="table timer-table">
              <!--Sorting fix. Not sure why, but if I remove this, the sorting that uses the exact same v-for doens't work -->
              <div v-if="view_type == 'calendar'">
                <div class="col-md-6">
                  <div v-if="show_not_today" class="col-md-4">
                    <div>Unscheduled</div>
                    <task-action-row v-on:set-current-task="setCurrentTask" v-bind:show_not_today="show_not_today" v-on:set_current_project="goToProject" v-bind:hide_notes="hide_notes" v-bind:task_filter="task_filter" v-bind:show_completed="show_completed" v-bind:current_project_id="current_project_id" v-bind:current_task="current_task" v-for="task in unscheduled_project_tasks()" draggable="true" ondragstart="drag(event)" v-bind:task="task"> </task-action-row>
                  </div>
                  <div class="col-md-4">
                    <div>{{ currentDay(0) }}</div>
                    <task-action-row v-on:set-current-task="setCurrentTask" v-bind:show_not_today="show_not_today" v-on:set_current_project="goToProject" v-bind:hide_notes="hide_notes" v-bind:task_filter="task_filter" v-bind:show_completed="show_completed" v-bind:current_project_id="current_project_id" v-bind:current_task="current_task" v-for="task in tasks" draggable="true" ondragstart="drag(event)" v-bind:task="task"> </task-action-row>
                  </div>
                  <div class="col-md-4">
                    <div>{{ currentDay(1) }}</div>
                    <task-action-row v-on:set-current-task="setCurrentTask" v-bind:show_not_today="show_not_today" v-on:set_current_project="goToProject" v-bind:hide_notes="hide_notes" v-bind:task_filter="task_filter" v-bind:show_completed="show_completed" v-bind:current_project_id="current_project_id" v-bind:current_task="current_task" v-for="task in tasks" draggable="true" ondragstart="drag(event)" v-bind:task="task"> </task-action-row>
                  </div>
                  <div v-if="!show_not_today" class="col-md-4">
                    <div>{{ currentDay(2) }}</div>
                    <task-action-row v-on:set-current-task="setCurrentTask" v-bind:show_not_today="show_not_today" v-on:set_current_project="goToProject" v-bind:hide_notes="hide_notes" v-bind:task_filter="task_filter" v-bind:show_completed="show_completed" v-bind:current_project_id="current_project_id" v-bind:current_task="current_task" v-for="task in tasks" draggable="true" ondragstart="drag(event)" v-bind:task="task"> </task-action-row>
                  </div>
                </div>
                <task-detail v-bind:task="current_task"></task-detail>
              </div>
              <div v-else-if="view_type == 'list'">
                <task-action-row v-on:set-current-task="setCurrentTask" v-bind:show_not_today="show_not_today" v-on:set_current_project="goToProject" v-bind:hide_notes="hide_notes" v-bind:task_filter="task_filter" v-bind:show_completed="show_completed" v-bind:current_project_id="current_project_id" v-bind:current_task="current_task" v-for="task in project_tasks()" draggable="true" ondragstart="drag(event)" v-bind:task="task"> </task-action-row>
                <task-detail v-bind:task="current_task"></task-detail>
              </div>

              <tasks-tab v-else-if="view_type != 'keep'" v-bind:tasks="filtered_tasks" v-bind:hide_notes="hide_notes" v-bind:tab="tab" v-bind:task_filter="task_filter" v-bind:sort="sort" v-bind:direction="direction" v-bind:show_completed="show_completed" v-bind:current_project_id="current_project_id" v-bind:user="current_user_id" v-on:sort="setSort" v-on:direction="setDirection"> </tasks-tab>
              <div v-else class="project-column">
                <project-box class="project-box" v-bind:project="project" v-for="project in active_projects"> </project-box>
              </div>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <!--<div class="col-md-3 task-project-list">
            <div @click="selectProject()" :class="allProjectsClass()" style="background:#F8F8F8; margin-right: 15px; border: solid 1px #dddddd; border-radius: 3px; padding: 5px; margin-bottom: 8px;"><h4 style="text-align: center;">All Projects</h4></div>
            <div style="overflow-y: scroll; height: calc(100vh - 100px);">
                <task-client v-for="client in active_clients_with_projects" v-bind:current_project_id="current_project_id" v-on:set-current-project-id="setCurrentProjectId" v-bind:client="client">
                </task-client>
            </div>
        </div>-->
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
      // alert('filtering tasks')
      console.log('filtered_tasks')
      let self = this
      let direction
      let user_id = null
      if (this.tab === 'all_tasks') {
      } else if (this.tab === 'my_tasks') {
        user_id = self.current_company_user.id
      } else if (this.tab === 'managing') {
      }
      if (isFinite(this.tab)) {
        user_id = this.tab
      }
      if (!user_id) {
        console.log('filtered_tasks')
      }
      //console.log(user_id);
      //console.log(this.$store.getters['tasks/filtered_tasks'](user_id));
      let tasks = user_id ? this.$store.getters['tasks/getByCompanyUserId'](user_id) : this.$store.getters['tasks/getMyTasks']

      console.log('filtered tasks', tasks)
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
          //if(self.current_project_id) console.log("order: "+a.order+' '+b.order);
          //return 1;
          //console.log(self.sort);
          if (self.direction === 'asc') {
            direction = -1
          } else {
            direction = 1
          }
          if (false) {
            //console.log('sorting');
            //console.log("order: "+a.order+' '+b.order);
            if (a.order !== b.order) {
              //console.log("order: "+a.order+' '+b.order);
              if (typeof b.order === 'object') {
                //if(self.current_project_id) console.log("::move up: "+a.order+' < '+b.order);
                return -1
              }
              if (typeof a.order === 'object') {
                //if(self.current_project_id) console.log("::move dwn: "+a.order+' > '+b.order);
                return 1
              }
              if (a.order > b.order) {
                //if(self.current_project_id) console.log("movin dwn: "+a.order+' > '+b.order);
                return 1
              }
              if (a.order < b.order) {
                //if(self.current_project_id) console.log("movin up: "+a.order+' < '+b.order);
                return -1
              }
            } else {
              //console.log('whatevs');
              return -1
              //console.log('id: '+a.id+' '+b.id);
              if (a.id > b.id) return 1
              if (a.id < b.id) return -1
            }
          } else if (self.sort === 'task') {
            if (a.title.toLowerCase() < b.title.toLowerCase()) return -1 * direction
            if (a.title.toLowerCase() > b.title.toLowerCase()) return 1 * direction
            return 0
          } else if (self.sort === 'project') {
            console.log('project sort')
            let aProjectName = a.project_id ? self.taskProjectName(a.project_id) : ''
            let bProjectName = b.project_id ? self.taskProjectName(b.project_id) : ''
            if (aProjectName.toLowerCase() < bProjectName.toLowerCase()) return -1 * direction
            if (aProjectName.toLowerCase() > bProjectName.toLowerCase()) return 1 * direction
            return 0
          } else if (self.sort == 'client') {
            let aClientName = a.project_id ? self.taskClientNameFromProject(a.project_id) : ''
            let bClientName = b.project_id ? self.taskClientNameFromProject(b.project_id) : ''
            if (aClientName.toLowerCase() < bClientName.toLowerCase()) return -1 * direction
            if (aClientName.toLowerCase() > bClientName.toLowerCase()) return 1 * direction
            return 0
          } else if (self.sort === 'priority') {
            return b.for_today - a.for_today
          } else if (self.sort === 'due_date') {
            return (new Date(b.due_date) - new Date(a.due_date)) * direction
          } else if (self.sort === 'created') {
            return (new Date(b.created_at) - new Date(a.created_at)) * direction
          } else if (self.sort === 'assigned') {
            let aUserName = ''
            a.users.forEach((index, user) => {
              aUserName = user.name
              return false
            })
            let bUserName = ''
            b.users.forEach((index, user) => {
              bUserName = user.name
              return false
            })
            if (aUserName.toLowerCase() < bUserName.toLowerCase()) return -1 * direction
            if (aUserName.toLowerCase() > bUserName.toLowerCase()) return 1 * direction
            return 0
          } else {
            return b.for_today - a.for_today
          }
        })
      if (!user_id) {
        //console.log(tasks)
      }
      return tasks
    },
    users() {
      return this.$store.getters['company_users/getActiveUsers']
    },
    usersNotMe() {
      const users = this.$store.getters['company_users/getNotMe']
      // console.log('usersNotMe', users, this.$store)
      return users
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
    },
    timers() {
      return this.$store.state.timers.timers
    },
    active_clients_with_projects() {
      return this.$store.getters['clients/active_clients_with_projects']
    },
    active_clients() {
      return this.$store.getters['clients/active_clients']
    }
  },
  data() {
    return {
      files: [],
      view_type: this.$route.query.view_type ? this.$route.query.view_type : 'table',
      current_user_id: null,
      hide_notes: this.$route.query.hide_notes ? true : false,
      show_not_today: this.$route.query.show_not_today ? true : false,
      current_project_id: this.$route.query.current_project_id ? this.$route.query.current_project_id : null,
      current_task: this.$route.query.current_task_id ? this.$store.getters['tasks/getTaskById'](this.$route.query.current_task_id) : null,
      sort: this.$route.query.sort ? this.$route.query.sort : 'priority',
      direction: this.$route.query.direction ? this.$route.query.direction : 'desc',
      task_filter: this.$route.query.task_filter ? decodeURIComponent(this.$route.query.task_filter) : '',
      show_completed: this.$route.query.start ? true : false,
      tab: this.$route.query.tab ? this.$route.query.tab : 'my_tasks',
      remote_files: {},
      new_task_title: '',
      new_task_project_id: null
    }
  },
  watch: {
    view_type() {
      //this.storeChanges();
    },
    hide_notes() {
      this.storeChanges()
    },
    show_not_today() {
      this.storeChanges()
    },
    current_project_id() {
      console.log('watching current_project_id')
      this.storeChanges()
    },
    current_task() {
      //this.storeChanges();
    },
    sort() {
      this.storeChanges()
    },
    direction() {
      //this.storeChanges();
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
    }
  },
  created() {
    let self = this
    let emojies = [':test', ':two']
    //var editor = new Textarea(document.getElementById('task'));
    //var textcomplete = new Textcomplete(editor);
  },
  beforeCreate() {
    console.log('beforeCreate')
    console.log(this.$store.state.settings.current_company)
    if (this.$store.state.settings.current_company.id) {
      console.log('current_company_id')
      if (sessionStorage.getItem('tasks')) {
        this.$router.push({ path: sessionStorage.getItem('tasks') })
      }
    }
  },
  methods: {
    taskFilterClass() {
      if (this.task_filter) {
        return 'active-search'
      }
    },
    setSort(sort) {
      this.sort = sort
    },
    setDirection(direction) {
      this.direction = direction
    },
    toggleHideNotes() {
      this.hide_notes = this.hide_notes ? false : true
    },
    hideNotesClass() {
      return this.hide_notes ? 'primary' : 'default'
    },
    setViewType(type) {
      this.view_type = type
    },
    viewTypeClass(type) {
      return this.view_type == type ? 'primary' : 'default'
    },
    toggleShowCompleted() {
      this.show_completed = this.show_completed ? false : true
      this.getData()
    },
    showCompletedClass() {
      return this.show_completed ? 'primary' : 'default'
    },
    toggleShowNotToday() {
      this.show_not_today = this.show_not_today ? false : true
    },
    showNotTodayClass() {
      return this.show_not_today ? 'primary' : 'default'
    },
    allProjectsClass() {
      if (!this.current_project_id) {
        return 'active'
      }
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
      if (this.view_type != 'calendar') {
        path += 'view_type=' + this.view_type + '&'
      }
      if (this.show_not_today) {
        path += 'show_not_today=1&'
      }
      if (this.current_project_id) {
        path += 'current_project_id=' + this.current_project_id + '&'
      }
      if (this.current_task) {
        console.log(this.current_task)
        path += 'current_task_id=' + this.current_task.id + '&'
      }
      if (this.sort != 'priority') {
        path += 'sort=' + this.sort + '&'
      }
      if (this.direction != 'desc') {
        path += 'direction=' + this.direction + '&'
      }
      if (this.task_filter) {
        path += 'task_filter=' + encodeURIComponent(this.task_filter) + '&'
      }
      if (this.show_completed) {
        path += 'show_completed=1&'
      }
      if (this.tab !== 'my_tasks') {
        path += 'tab=' + this.tab + '&'
      }
      console.log(path)
      this.$router.push({ path: path })
      sessionStorage.setItem('tasks', path)
    },
    clearSearch() {
      this.task_filter = ''
    },
    setCurrentProjectId(project_id) {
      this.current_project_id = project_id
    },
    setCurrentTask(task) {
      this.current_task = task
    },
    taskVisible(task) {
      let task_filter_trigger = this.task_filter

      if (!this.show_completed) {
        if (task.status === 'closed') {
          return false
        }
      }
      if (this.task_filter) {
        return task.title.indexOf(this.task_filter) !== -1
      }
      return true
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
    goToProject(project_id) {
      this.current_project_id = project_id
      $('.nav-tabs a[href="#active"]').tab('show')
    },
    currentDay(interval) {
      let day = new Date(new Date().getTime() + 24 * interval * 60 * 60 * 1000)
      let days_of_week = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      return days_of_week[day.getDay()]
    },
    unscheduled_project_tasks() {
      console.log('user-dashboard:unscheduled_project_tasks')
      return this.filtered_tasks.filter(task => {
        return !task.next_work_day && !task.due_date
      })
    },
    project_tasks_by_day(interval) {
      console.log('user-dashboard:project_tasks_by_day')
      //console.log(interval);
      //alert(interval);
      return this.filtered_tasks.filter(task => {
        if (!task.next_work_day && !task.due_date) {
          return false
        }
        if (!task.next_work_day && task.due_date) {
          //console.log('has due date')
          //console.log(task);
          //console.log(new Date(task.due_date) <= new Date());
        }
        let now = new Date(new Date().getTime() + 24 * interval * 60 * 60 * 1000)
        let day = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + ('0' + now.getDate()).slice(-2)
        let due_date = new Date(task.due_date)
        //var work_date = day.getFullYear() + '-' + (day.getMonth() + 1) + '-' + day.getDate();

        if (interval > 0) {
          //return true;
          // console.log('-----')
          // console.log('interval '+interval);
          // console.log(task.id);
          // console.log(task.next_work_day);
          // console.log(day);
          // console.log(day == task.next_work_day);
          if (day === due_date) {
            return true
          }
          return day === task.next_work_day
        } else {
          /*console.log('interval 0');
             console.log(task.id);
             console.log(new Date(work_date) > new Date(task.next_work_day));
             console.log(task.next_work_day);
             console.log(work_date);*/
          if (day >= due_date) {
            return true
          }
          return day >= task.next_work_day
        }
      })
    },
    old_filtered_tasks() {
      console.log('user-dashboard:filtered_tasks')
      let self = this
      let direction
      let user_id = null
      if (this.tab === 'all_tasks') {
      } else if (this.tab === 'my_tasks') {
        user_id = self.current_company_user.id
      } else if (this.tab === 'managing') {
      }
      if (isFinite(this.tab)) {
        user_id = this.tab
      }
      if (!user_id) {
        console.log('filtered_tasks')
      }
      //console.log(user_id);
      //console.log(this.$store.getters['tasks/filtered_tasks'](user_id));
      let tasks = this.$store.getters['tasks/filtered_tasks'](user_id)
        .filter(task => {
          if (self.current_project_id && task.project_id !== self.current_project_id) {
            return false
          }
          if (task.title.toLowerCase().indexOf(self.task_filter) === -1) {
            return false
          }
          return true
        })
        .sort((a, b) => {
          //if(self.current_project_id) console.log("order: "+a.order+' '+b.order);
          //return 1;
          //console.log(self.sort);
          if (self.direction === 'asc') {
            direction = -1
          } else {
            direction = 1
          }
          if (false) {
            //console.log('sorting');
            //console.log("order: "+a.order+' '+b.order);
            if (a.order !== b.order) {
              //console.log("order: "+a.order+' '+b.order);
              if (typeof b.order === 'object') {
                //if(self.current_project_id) console.log("::move up: "+a.order+' < '+b.order);
                return -1
              }
              if (typeof a.order === 'object') {
                //if(self.current_project_id) console.log("::move dwn: "+a.order+' > '+b.order);
                return 1
              }
              if (a.order > b.order) {
                //if(self.current_project_id) console.log("movin dwn: "+a.order+' > '+b.order);
                return 1
              }
              if (a.order < b.order) {
                //if(self.current_project_id) console.log("movin up: "+a.order+' < '+b.order);
                return -1
              }
            } else {
              //console.log('whatevs');
              return -1
              //console.log('id: '+a.id+' '+b.id);
              if (a.id > b.id) return 1
              if (a.id < b.id) return -1
            }
          } else if (self.sort === 'task') {
            if (a.title.toLowerCase() < b.title.toLowerCase()) return -1 * direction
            if (a.title.toLowerCase() > b.title.toLowerCase()) return 1 * direction
            return 0
          } else if (self.sort === 'project') {
            console.log('project sort')
            let aProjectName = a.project_id ? self.taskProjectName(a.project_id) : ''
            let bProjectName = b.project_id ? self.taskProjectName(b.project_id) : ''
            if (aProjectName.toLowerCase() < bProjectName.toLowerCase()) return -1 * direction
            if (aProjectName.toLowerCase() > bProjectName.toLowerCase()) return 1 * direction
            return 0
          } else if (self.sort === 'client') {
            let aClientName = a.project_id ? self.taskClientNameFromProject(a.project_id) : ''
            let bClientName = b.project_id ? self.taskClientNameFromProject(b.project_id) : ''
            if (aClientName.toLowerCase() < bClientName.toLowerCase()) return -1 * direction
            if (aClientName.toLowerCase() > bClientName.toLowerCase()) return 1 * direction
            return 0
          } else if (self.sort == 'priority') {
            return b.for_today - a.for_today
          } else if (self.sort == 'due_date') {
            return (new Date(b.due_date) - new Date(a.due_date)) * direction
          } else if (self.sort == 'created') {
            return (new Date(b.created_at) - new Date(a.created_at)) * direction
          } else if (self.sort == 'assigned') {
            let aUserName = ''
            a.users.forEach((index, user) => {
              aUserName = user.name
              return false
            })
            let bUserName = ''
            b.users.forEach((index, user) => {
              bUserName = user.name
              return false
            })
            if (aUserName.toLowerCase() < bUserName.toLowerCase()) return -1 * direction
            if (aUserName.toLowerCase() > bUserName.toLowerCase()) return 1 * direction
            return 0
          } else {
            return b.for_today - a.for_today
          }
        })
      if (!user_id) {
        //console.log(tasks)
      }
      return tasks
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
            if (task_user.company_user.id === user.id) {
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
    turnIn(task_id, user_id) {
      return this.$store.dispatch('tasks/turnIn')
    },

    forToday(task) {
      return this.$store.getters['tasks/forToday'](task)
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
    filtered_admin_tasks_today(user_id) {},
    filtered_tasks_today(user_id) {
      //labeledConsole('user_id', user_id);
      let self = this
      let rtn
      return this.tasks
        .filter(task => {
          let userMatch = false
          //console.log(task.users);
          if (user_id) {
            task.users.forEach((user, index) => {
              if (user.id === user_id && user.pivot.role === 'assigned') {
                userMatch = true
                return false
              }
            })
            return userMatch
          }
        })
        .sort((a, b) => {
          //When looking at a specific project, ignore other sorting and display by task order.
          if (self.sort === 'client') {
            a.client_name = self.taskClientNameFromProject(a.project_id)
            b.client_name = self.taskClientNameFromProject(b.project_id)

            if (a.client_name.toLowerCase() < b.client_name.toLowerCase()) return -1 * self.direction === 'desc' ? 1 : -1
            if (a.client_name.toLowerCase() > b.client_name.toLowerCase()) return 1 * self.direction === 'desc' ? 1 : -1
            return 0
          } else if (self.sort === 'project') {
            //console.log(self.direction);
            /*if(self.direction == 'desc'){
             return -1;
             } else {
             return 1;
             }*/
            //console.log('project');
            a.project_name = self.taskProjectName(a.project_id)
            b.project_name = self.taskProjectName(b.project_id)
            if (a.project_name.toLowerCase() < b.project_name.toLowerCase()) {
              ///console.log('less')
              return -1
            } else if (a.project_name.toLowerCase() > b.project_name.toLowerCase()) {
              ///console.log('greater')
              return 1
            } //* self.direction == 'desc' ? 1 : -1;
            //TODO: add client name check here
            return 0

            return rtn
          } else if (self.sort === 'task') {
            if (a.title.toLowerCase() < b.title.toLowerCase()) return -1 * self.direction === 'desc' ? 1 : -1
            if (a.title.toLowerCase() > b.title.toLowerCase()) return 1 * self.direction === 'desc' ? 1 : -1
            return 0
          } else if (self.sort === 'assigned') {
          } else {
            ///console.log(b.for_today - a.for_today);
            return b.for_today - a.for_today
          }
        })
      //return this.$store.getters['tasks/filtered_tasks_today'](user_id);
    },
    all_tasks_today() {
      return [] //this.$store.getters['tasks/all_tasks_today'];
    },
    taskProjectName(project_id) {
      return this.$store.getters['projects/projectProjectName'](project_id)
    },
    taskClientNameFromProject(project_id) {
      return this.$store.getters['projects/projectClientName'](project_id)
    },
    filter_admin_task_count(user_id) {
      return this.$store.getters['tasks/admin_filtered_tasks'](user_id).length
    },
    filter_task_count(company_user_id) {
      return this.$store.getters['task_users/getByCompanyUserId'](company_user_id).length
    },

    not_my_user() {
      return this.$store.getters['company_users/getNotMe']
    },
    client_name(client_company_id) {
      let client = this.$store.getters['clients/getByClientCompanyId'](client_company_id)
      return client ? client.name : ''
    },
    creator(task) {
      if (task.creator) {
        return task.creator.name
      }
    },
    getData() {
      return
      // let self = this
      /*
        files: [],
        view_type: this.$route.query.view_type ? this.$route.query.view_type : 'table',
        current_user_id: null,
        hide_notes: this.$route.query.hide_notes ? true : false,
        show_not_today: this.$route.query.show_not_today ? true : false,
        current_project_id: this.$route.query.current_project_id ? this.$route.query.current_project_id : null,
        current_task: this.$route.query.current_task_id ? this.$store.getters['tasks/getTaskById'](this.$route.query.current_task_id) : null,
        sort: this.$route.query.sort ? this.$route.query.sort : 'priority',
        direction: this.$route.query.direction ? this.$route.query.direction : 'desc',
        task_filter: this.$route.query.task_filter ? decodeURIComponent(this.$route.query.task_filter) : '',
        show_completed: this.$route.query.start ? true : false,
        tab: this.$route.query.tab ? this.$route.query.tab : 'my_tasks', remote_files: {}
        */
      //
      // ajax('tasks', {
      //   current_user_id: this.tab,
      //   show_not_today: this.show_not_today ? 1 : 0,
      //   show_completed: this.show_completed ? 1 : 0
      // }, response => {
      //   self.project_tasks_by_day = response.tasks
      //   /*response.tasks.forEach(function(task){
      //       self.project_tasks_by_day = response.tasks;
      //   })*/
      // })
    }
  }
}
</script>

<style scoped>
/*    tbody.scroll {
            display: block;
            overflow-y: scroll;
            height: 100px;
        }
        tbody.scroll tr {
            display: table;
            width:100%;
            table-layout:fixed;
        }*/
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
