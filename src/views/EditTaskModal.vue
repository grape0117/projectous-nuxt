<template>
  <b-modal :title="task.title" id="task-modal" class="modal fade" role="dialog">
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
            :value="task.title"
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
            :value="due_date()"
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
            :value="task.estimate"
          />
        </div>
      </div>
      <div class="row without-margin">
        <p style="max-width: 100%; margin-bottom: 5px; font-weight: 700;">
          Users:
        </p>
      </div>
      <div class="form-group" v-for="user in active_users()">
        <label class="control-label col-sm-4">{{ user.name }}: </label>
        <div class="col-sm-8">
          <input
            type="checkbox"
            :checked="userChecked(user.id)"
            :name="'user[' + user.id + ']'"
            value="1"
          />
          <input
            class=""
            type="text"
            :name="'user_rate[' + user.id + ']'"
            :value="userRate(user.id)"
          />
          <select :name="'user_type[' + user.id + ']'">
            <option
              value="assigned"
              :selected="userSelected('assigned', user.id)"
              >Assigned
            </option>
            <option
              value="reviewer"
              :selected="userSelected('reviewer', user.id)"
              >Reviewer
            </option>
            <option value="manager" :selected="userSelected('manager', user.id)"
              >Manager
            </option>
          </select>
        </div>
      </div>
    </form>

    <!-- /.modal-dialog --> </b-modal
  ><!-- /.modal -->
</template>

<script>
export default {
  name: 'task-modal',
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
      console.log('company_clients', company_clients)
      return company_clients
    },
    current_company: function() {
      return this.$store.state.settings.current_company
    },
    current_company_user: function() {
      return this.$store.state.settings.current_company_user
    }
  },
  mounted: function() {
    let self = this
    //TODO $('#task-modal').on('hidden.bs.modal', function () {
    //self.$store.dispatch('settings/closedModal')
    //})
  },
  methods: {
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
    userSelected: function(user_type, user_id) {
      let self = this
      let userSelected = false
      if (!self.task.users) {
        return false
      }
      self.task.users.forEach((key, user) => {
        if (user.id == user_id) {
          if (user_type == user.pivot.role) {
            userSelected = 'selected'
            return false
          }
        }
      })

      return userSelected
    },
    userChecked: function(user_id) {
      let self = this
      let userChecked = false
      if (!self.task.users) {
        return false
      }

      self.task.users.forEach((key, user) => {
        if (user.id == user_id) {
          userChecked = true
          return false
        }
      })
      return userChecked
    },
    userRate: function(user_id) {
      let self = this
      let userRate = ''
      if (!self.task.users) {
        return
      }
      self.task.users.forEach((key, user) => {
        if (user.id == user_id) {
          //console.log('user rate found');
          //console.log(user);
          userRate = user.pivot.user_rate
          return false
        }
      })
      return userRate
    },
    saveTask: function(callback) {
      return this.$store.dispatch(
        'tasks/saveTask'
        //TODO: $('#editTaskForm').serialize()
      )
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
