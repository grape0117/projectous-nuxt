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
        <label class="control-label col-sm-4" for="taskTitledit">Task: </label>
        <div class="col-sm-8">
          <div
            contenteditable="true"
            style="height: auto;"
            id="taskTitledit"
            class="form-control"
            type="text"
            name="title"
            placeholder="Task"
            v-html="task.title"
            @blur="setTitle"
          ></div>
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
              :key="company_client.id"
            >
              <option
                v-for="project in openprojects(company_client)"
                :key="projects.id"
                v-bind:company_client="company_client"
                :value="project.id"
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
        v-for="user in active_users()"
        :key="user.id"
        @toggle="toggleUser"
        v-bind:task_user="task_user(user)"
        v-bind:user="user"
        v-bind:task="task"
      />
    </form>
    <template v-slot:modal-footer="{ ok, cancel }">
      <button style="float: left" class="btn btn-danger">Delete</button>
      <button class="btn btn-info" @click="ok()">Save</button>
      <button class="btn" @click="cancel()">Cancel</button>
    </template>

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
      changed_task_users: []
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
      let self = this
      let task_users = this.$store.state.task_users.task_users.filter(
        task_user => task_user.task_id === this.task.id
      )
      // console.log('task_users', task_users)
      //console.log(this.$store.state.task_users.task_users.pop())
      return task_users
    }
  },
  mounted: function() {
    //let self = this
    //TODO $('#task-modal').on('hidden.bs.modal', function () {
    //self.$store.dispatch('settings/closedModal')
    //})
  },
  methods: {
    toggleUser(user) {
      //only add each entry once into changed_task_users
      const task_user_index = this.changed_task_users.findIndex(
        changed_task_user => {
          //TODO: figure out why no match
          return changed_task_user.company_user_id === user.company_user_id
        }
      )
      if (task_user_index !== -1) {
        //update only things that can change
        this.changed_task_users[task_user_index].user_rate = user.user_rate
        this.changed_task_users[task_user_index].role = user.role
        this.changed_task_users[task_user_index].user_checked =
          user.user_checked
      } else {
        //create
        this.changed_task_users.push(user)
      }
    },
    setTitle(e) {
      let title = e.target.innerHTML
      this.task.title = title
    },
    task_user(company_user) {
      let self = this
      let userTask = this.$store.state.task_users.task_users.find(function(
        task_user
      ) {
        if (task_user.task_id !== self.task.id) return false
        return task_user.company_user_id === company_user.id
      })

      return userTask !== -1 ? userTask : false
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
      return this.$store.getters['projects/getOpenCompanyProjects'](
        company.client_id
      )
    },
    due_date: function() {
      if (this.task.due_date == '0000-00-00 00:00:00') {
        return ''
      }
      return '' //dateTimeToInput(this.task.due_date)
    },
    saveTask: function(callback) {
      /*const task_users = this.changed_task_users.filter((task_user) => {
          return task_user.user_checked === true
        })
        console.log('const task_users', task_users)*/
      this.$store.dispatch('tasks/saveTask', {
        task: this.task,
        task_users: this.changed_task_users
      })

      this.$store.commit('settings/setCurrentEditTask', {})
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

<style>
#task-modal___BV_modal_footer_ button {
  float: right;
}
#task-modal___BV_modal_footer_ {
  display: block;
  flex: none;
}
</style>
