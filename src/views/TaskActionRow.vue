<template>
  <ul :style="styleCurrentTask()" v-if="taskVisible()" @click="setCurrentTask(task)" :id="'task-' + task.id" draggable="true" ondragstart="drag(event)">
    <li v-if="current_project_id" :id="'target-' + task.id" class="dragtarget" @drop="handleDrop" ondragover="allowDrop(event)" ondragenter="handleDragEnter(event)" ondragleave="handleDragLeave(event)"></li>
    <li class="task-container">
      <div>
        <span v-if="!current_project_id" style="font-size: 11px; color: #999;"><!--{{ task.order }} + {{task.id}}</span>: -->{{ taskClientNameFromProject(task.project_id) }} > {{ taskProjectName(task.project_id) }}</span>
        <div>
          <div :class="'task-title task-' + task.id" :data-target_task_id="task.id" :data-project_id="task.project_id" :data-id="task.id" contenteditable v-on:blur="saveTaskTitle(task.id)" v-on:keydown.enter="createAfter" v-html="task.title"></div>
          <task-note v-if="!hide_notes || show_notes" v-bind:task="task" class="task-note"></task-note>
          <div>{{ creator(task) }}</div>
        </div>
      </div>
      <div>
        <div style="color: red; border: red solid 1px; display: inline-block; font-size: 10px; padding: 3px; font-weight: bold;" v-if="due_date()">{{ due_date() }}</div>
        <div v-for="user in task_users()" :style="isUnderlined(user)"><span v-html="checkUser(user)"></span><i v-if="user && user.role == 'manager'" class="glyphicon glyphicon-flash"></i><i v-else-if="user && user.pivot.role == 'reviewer'" class="glyphicon glyphicon-thumbs-up"></i>&nbsp;{{ user.name }}</div>
      </div>
      <div>
        <div class="btn-group">
          <button class="btn btn-xs btn-default task-option-hidden" v-if="!forToday(task)" @click="markForToday(task.id)">Today</button>
          <button class="btn btn-xs btn-primary" v-else="" @click="markNotToday(task.id)">
            {{ task.next_work_day }}
          </button>
          <button class="btn btn-xs btn-default task-option-hidden" @click="markTomorrow(task.id)">
            <i class="glyphicon glyphicon-menu-right"></i>
          </button>
          <button class="btn btn-xs btn-defaul task-option-hidden" @click="markNextWeek(task.id)">
            <i class="glyphicon glyphicon-forward"></i>
          </button>
          <button :class="'btn btn-xs dropdown-toggle task-option-hidden ' + todayClass()" data-toggle="dropdown">
            <span class="caret"></span>
          </button>
          <ul class="dropdown-menu">
            <!-- dropdown menu links -->
            <li @click="setNextWorkDay(interval)" v-for="interval in [1, 2, 3, 4, 5, 6, 7]">
              <a>{{ getWorkDayName(interval) }}</a>
            </li>
          </ul>
        </div>

        <button :class="'btn btn-xs btn-' + taskStatusClass() + ' task-option-hidden'" v-if="isVisibleToUser()" @click="moveStatusForward()"><i class="glyphicon glyphicon-check"></i></button>
        <button class="btn btn-xs btn-default task-option-hidden" @click="startTaskTimer(task)"><i class="glyphicon glyphicon-play"></i></button>
        <!--<button v-if="!current_project_id" class="btn btn-xs btn-default task-option-hidden" @click="goToProject(task.project_id)">View Project
                </button>-->
        <button class="btn btn-xs btn-default task-option-hidden" @click="editTask(task)"><i class="glyphicon glyphicon-pencil"></i></button>
        <button class="btn btn-xs btn-default task-option-hidden" @click="toggle_notes()">Show Notes</button>
      </div>
    </li>
  </ul>
</template>

<script>
import TaskNote from './TaskNote'
export default {
  components: {
    'task-note': TaskNote
  },
  props: ['current_project_id', 'show_not_today', 'current_task', 'task', 'hide_notes', 'task_filter', 'show_completed'],
  data() {
    return {
      show_notes: false
    }
  },
  mounted() {
    //if(this.task.users){
    //console.log(this.task.users);
    //}
  },
  computed: {
    current_company() {
      return this.$store.state.settings.current_company
    }
  },
  methods: {
    moveStatusForward() {
      console.log(this.task.status)
      console.log(this.task)
      switch (this.task.status) {
        case 'open':
          if (this.isAdmin()) {
            this.setTaskAttribute('status', 'closed', this.task.id)
          } else {
            this.setTaskAttribute('status', 'turned-in', this.task.id)
          }
          break
        case 'turned-in':
          this.setTaskAttribute('status', 'closed', this.task.id)
          break
        case 'closed':
          this.setTaskAttribute('status', 'open', this.task.id)
          break
      }
    },
    isVisibleToUser() {
      if (this.isAdmin()) {
        return true
      } else if (this.task.status === 'open') {
        return true
      }
      return false
    },
    taskStatusClass() {
      switch (this.task.status) {
        case 'closed':
          return 'primary'
          break
        case 'open':
          return 'default'
          break
        case 'turned-in':
          return 'warning'
          break
      }
    },
    turnIn() {},
    isUnderlined(user) {
      if (user.from_project) {
        return 'font-size: 11px; color: #999; text-decoration: underline;'
      } else {
        return 'font-size: 11px; color: #999;'
      }
    },
    task_users() {
      let project = this.$store.getters['projects/getById'](this.task.project_id)
      let task_users = []
      if (project) {
        project.users.forEach(user => {
          if (user.role !== '') {
            user.from_project = true
            task_users.push(user)
          }
        })
      }
      this.task.users.forEach(user => {
        task_users.push(user)
      })
      return task_users
    },
    checkUser(user) {
      //console.log(user);
    },
    toggle_notes() {
      this.show_notes = this.show_notes ? false : true
    },
    due_date() {
      if (!this.task.due_date) return
      let date = new Date(this.task.due_date)
      //console.log(date);
      //console.log(this.task.due_date);
      if (date.getSeconds() + date.getMinutes() + date.getHours()) {
      } else {
        return date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear()
      }
    },
    todayClass() {
      if (this.task.next_work_day == null) {
        return 'btn-primary'
      } else {
        return 'btn-default'
      }
    },
    setNextWorkDay(interval) {
      let next_work_date = new Date(new Date().getTime() + 24 * interval * 60 * 60 * 1000)
      let next_work_day = next_work_date.getFullYear() + '-' + (next_work_date.getMonth() + 1) + '-' + ('0' + next_work_date.getDate()).slice(-2)
      let taskKey = this.$store.state.tasks.lookup[this.task.id]
      this.$store.state.tasks.tasks[taskKey].next_work_day = next_work_day
      this.$store.state.tasks.tasks[taskKey].for_today = 1
      this.$store.dispatch('UPDATE_ATTRIBUTE', { module: 'tasks', id: this.task.id, attribute: 'next_work_day', value: next_work_day })
      // ajax('task/setNextWorkDay', {next_work_day: next_work_day, task_id: this.task.id}, function(){})
    },
    getWorkDayName(interval) {
      return new Date(new Date().getTime() + 24 * interval * 60 * 60 * 1000).toLocaleString('en-us', { weekday: 'long' })
    },
    markTomorrow() {
      this.setNextWorkDay(1)
    },
    markNextWeek($event) {
      $event.preventDefault()
      let todays_day = new Date().getDay()
      /*
        0: 7
        1: 6
        2: 5
        3: 4
        */
      this.setNextWorkDay(7 - todays_day)
    },
    goToProject(project_id) {
      this.$emit('set_current_project', project_id)
      //this.current_project_id = project_id;
      $('.nav-tabs a[href="#active"]').tab('show')
    },
    styleCurrentTask() {
      if (this.current_task)
        if (this.task.id == this.current_task.id) {
          return 'background: yellow; border: 1px solid #ddd;'
        }
      return 'border: 1px solid #ddd;'
    },
    setCurrentTask() {
      this.$emit('set-current-task', this.task)
    },
    handleDrop(ev) {
      let self = this
      Array().forEach.call(document.querySelectorAll('.over'), el => {
        el.classList.remove('over')
      })

      ev.preventDefault()
      console.log('scripts/drop()')
      let data = ev.dataTransfer.getData('text')
      console.log('dataTransfer.getData("text")')
      console.log(data)
      /**
       * Figure out position of drop. Compare to current position. Call ajax. Update store.
       */
      let task = this.$store.getters['tasks/getTaskById'](data.replace('task-', ''))
      let target = this.$store.getters['tasks/getTaskById'](this.task.id)
      if (target.id === task.next_task_id) {
        //alert("no action needed")
        return
      }
      if (this.task.id !== data.replace('task-', '')) self.$store.dispatch('tasks/moveAbove', { task_id: data.replace('task-', ''), target_task_id: this.task.id })

      /*ev.target.insertBefore(document.getElementById(src), ev.dataTransfer.toElement);
        ev.stopPropagation();*/
      return false
    },
    taskVisible() {
      let self = this
      //return true;
      let task_filter_trigger = this.task_filter

      /*                var project = self.$store.getters['projects/getProjectById'](self.task.project_id);

                        if(project)
                        if(project.owner_company_id != self.current_company.id){
                            //console.log('not matching company')
                            //console.log(self.task.title)
                            //console.log(project.owner_company_id+' != '+self.current_company.id)
                            var company_users = self.$store.state.company_users.company_users.filter(function(company_user){
                                //if company_user.user_type == 'company && company_user.user_id == self.current_company.id
                                //if company_user.user_type == 'user' && company_user.company_id == self.current_company.id
                                return company_user.user_id == self.current_company.id;
                            });
                            //Go through task.task_users to see if assigned to anyone
                            //console.log(self.task.users);
                            if(!self.task.users.filter(function(task_user){
                                return company_users.find(function(company_user){
                                    //console.log(company_user.id+' == '+task_user.company_user_id)
                                    return company_user.id == task_user.company_user_id;
                                })
                            })){
                                //If project company not current company and not assigned to someone in current company, skip
                                return false;
                            }
                        }*/

      if (!this.show_completed && this.task.status === 'closed') {
        return false
      } else if (this.task.due_date && new Date(this.task.due_date) <= new Date()) {
        //visible
      } else if (!this.show_not_today && (!this.task.next_work_day || new Date(this.task.next_work_day) > new Date())) {
        //return false;
      }

      if (this.task_filter) {
        return this.task.title.toLowerCase().indexOf(this.task_filter.toLowerCase()) !== -1
      }
      return true
    },
    setTaskAttribute(attribute, value, task_id) {
      this.$store.dispatch('tasks/setTaskAttribute', { attribute: attribute, value: value, task_id: task_id })
    },
    taskClientNameFromProject(project_id) {
      return this.$store.getters['projects/projectClientName'](project_id)
    },
    editProject(project) {
      this.$store.dispatch('settings/editProject', project)
    },
    editTask(task) {
      this.$store.dispatch('tasks/editTask', task)
    },
    startTaskTimer(task) {
      let self = this
      let data = {
        current_company_id: this.$store.state.settings.current_company.id,
        project_id: task.project_id,
        task_id: task.id,
        is_billable: 1
      }
      this.$store.dispatch('tasks/startTaskTimer', data)
      //this.$router.push('/dashboard');
    },
    forToday(task) {
      return this.$store.getters['tasks/forToday'](task)
    },
    notToday(task) {
      return this.$store.getters['tasks/notToday'](task)
    },
    markForToday(task_id) {
      this.$store.dispatch('tasks/markForToday', task_id)
    },
    markNotToday(task_id) {
      this.$store.dispatch('tasks/markNotToday', task_id)
    },
    saveTaskTitletask_id() {
      console.log('save task title')
      this.$store.dispatch('tasks/saveTaskTitle', { id: task_id, title: $('.task-' + task_id).html() })
    },
    taskProjectName(project_id) {
      return this.$store.getters['projects/projectProjectName'](project_id)
    },
    creatortask() {
      if (task.creator) {
        return task.creator.name
      }
    },
    isAdmin() {
      return this.$store.getters['settings/isAdmin']
    },
    createAfter(e) {
      e.preventDefault()
      console.log(e)
      console.log(e.target)
      console.log(e.target.dataset)
      labeledConsole('dataset.order', e.target.dataset.order)
      console.log('createAfter')

      /*
        Get current order
        Insert one at +1
        Move others +1
        Send to DB
        Update based on project and sort

        */
      this.$store.dispatch('tasks/createTaskFromEnter', { from_id: e.target.dataset.id, next_task_id: e.target.dataset.next_task_id, project_id: e.target.dataset.project_id })
    }
  }
}
</script>

<style>
li {
  /*list-style-type: none;*/
}
</style>
