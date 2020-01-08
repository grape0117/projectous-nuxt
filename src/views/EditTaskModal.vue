<template>
  <b-modal
    :title="task.title"
    id="task-modal"
    class="modal fade"
    role="dialog"
    @ok="saveTask"
  >
    <form id="editTaskForm" class="form-horizontal">
      <input
        id="taskIDEdit"
        class="form-control"
        type="hidden"
        name="id"
        :value="task.id"
      />
      <div class="form-group">
        <label class="control-label col-sm-4" for="projecNameEdit"
          >Task:
        </label>
        <div class="col-sm-8">
          <input
            id="taskTitledit"
            class="form-control"
            type="text"
            name="title"
            placeholder="Task"
            v-model="task.title"
          />
        </div>
      </div>
      <div class="form-group">
        <label class="control-label col-sm-4">Project: </label>
        <div class="col-sm-8">
          <select
            id="timer-modal-project-id"
            class="form-control select2-select"
            name="project_id"
            v-on:change="isCreateProject()"
            v-model="task.project_id"
          >
            <option value="">***** Select Project *****</option>
            <option v-if="isAdmin()" value="create">Create New Project </option>
            <optgroup
              :label="company_client.name"
              v-bind:company_client="company_client"
              v-for="company_client in company_clients"
            >
              <option
                v-for="project in openprojects(company_client)"
                v-bind:company_client="company_client"
                v-bind:value="project.id"
              >
                {{ client_name(project.client_id) }} - {{ project.name }}
              </option>
            </optgroup>
          </select>
        </div>
      </div>
      <!--<div class="form-group">
              <label  class="control-label col-sm-4" >Task Type: </label>
              <div class="col-sm-8">
                  <select :name="'task_type['+task.id+']'" id="taskTypeSelect" class="form-control" :value="task.task_type_id" v-on:change="isEditTaskTypes">
                      <option value="0">***** Select Task Type *****</option>
                      <option v-bind:task_type="task_type" v-for="task_type in task_types">@{{ task_type.name }}</option>
                  </select>
              </div>
          </div>-->
      <div class="form-group">
        <label class="control-label col-sm-4" for="taskDueDate"
          >Due Date:
        </label>
        <div class="col-sm-8">
          <input
            id="taskDueDate"
            class="form-control"
            type="date"
            name="due_at"
            placeholder="Due Date"
            v-model="task.due_date"
          />
        </div>
      </div>
      <div class="form-group">
        <label class="control-label col-sm-4" for="taskEditEstimate"
          >Estimate:
        </label>
        <div class="col-sm-8">
          <input
            id="taskEditEstimate"
            class="form-control"
            type="text"
            name="estimate"
            placeholder="Estimate"
            v-model="task.estimate"
          />
        </div>
      </div>
      <div class="row without-margin">
        <p style="max-width: 100%; margin-bottom: 5px; font-weight: 700;">
          Users:
        </p>
      </div>
      <edit-task-modal-user
        @toggle="toggleUser"
        v-bind:task_users="task_users"
        v-bind:user="user"
        v-bind:task="task"
        v-for="user in active_users()"
      ></edit-task-modal-user>
    </form>

    <!-- /.modal-dialog --> </b-modal
  ><!-- /.modal -->
</template>

<script>
import EditTaskModalUser from './EditTaskModalUser.vue'
import uuid from 'uuid'

export default {
  name: 'task-modal',
  components: {
    'edit-task-modal-user': EditTaskModalUser
  },
  data: function() {
    return {
      local_task_users: []
    }
  },
  computed: {
    task: function() {
      return this.$store.state.settings.current_edit_task
    },
    users: function() {
      return this.$store.state.company_users.company_users
    },
    projects: function() {
      const projects = this.$store.state.projects.projects
      console.log(projects)
      return projects
    },
    task_types: function() {
      return this.$store.state.task_types.task_types
    },
    company_clients: function() {
      const company_clients = this.$store.getters[
        'company_clients/getActiveCompanyClients'
      ]
      return company_clients
    },
    current_company: function() {
      return this.$store.state.settings.current_company
    },
    current_company_user: function() {
      return this.$store.state.settings.current_company_user
    },
    task_users: function() {
      let task_users = this.$store.state.task_users.task_users.filter(
        task_user => task_user.task_id === this.task.id
      )
      console.log(task_users)
      console.log(this.$store.state.task_users.task_users.pop())
      return task_users
    }
  },
  mounted: function() {
    //let self = this
    console.log(this.$store.state.task_users.task_users)
    //TODO $('#task-modal').on('hidden.bs.modal', function () {
    //self.$store.dispatch('settings/closedModal')
    //})
  },
  methods: {
    toggleUser(user) {
      console.log('toggle', user)
      console.log('task', this.task)

      //each through local data of task_users?
      const task_user_index = this.local_task_users.findIndex(task_user => {
        console.log(user)
        return task_user.company_user_id === user.company_user_id
      })
      if (task_user_index !== -1) {
        //update
        this.local_task_users[task_user_index].user_rate = user.user_rate
        this.local_task_users[task_user_index].role = user.role
        this.local_task_users[task_user_index].user_checked = user.user_checked
      } else {
        //create
        user.id = uuid.v4()
        this.local_task_users.push(user)
      }
    },
    isCreateProject: function() {},
    isEditTaskTypes: function(event) {
      if (event.target.value == 'edit') {
        this.$store.dispatch('task_types/createTaskType')
      }
    },
    isAdmin: function() {
      return this.$store.getters['settings/isAdmin']
    },
    active_users: function() {
      return this.$store.getters['company_users/getActive']
    },
    clientName: function(client_id) {
      let company_client = this.$store.getters[
        'company_clients/getByClientCompanyId'
      ](client_id)
      return company_client ? company_client.name : ''
    },
    openprojects: function(company) {
      //labeledConsole('company', company);
      return this.$store.getters['projects/getOpenCompanyProjects'](
        company.client_company_id
      )
    },
    due_date: function() {
      if (this.task.due_date == '0000-00-00 00:00:00') {
        return ''
      }
      return '' //dateTimeToInput(this.task.due_date)
    },
    saveTask: function(callback) {
      /*const task_users = this.local_task_users.filter((task_user) => {
          return task_user.user_checked === true
        })
        console.log('const task_users', task_users)*/
      return this.$store.dispatch('tasks/saveTask', {
        task: this.task,
        task_users: this.local_task_users
      })
    },
    client_name: function(client_id) {
      let company_client = this.$store.getters[
        'company_clients/getByClientCompanyId'
      ](client_id)
      return company_client ? company_client.name : ''
    }
  }
}
</script>
