<template>
  <b-modal id="project-modal" class="modal fade" role="dialog" @ok="saveProject">
    <form id="editProjectForm" class="form-horizontal">
      <input id="projectIDEdit" class="form-control" type="hidden" name="id" v-model="project.id" />
      <div class="form-group">
        <label class="control-label col-sm-4" for="projectNameEdit">Project Name: </label>
        <div class="col-sm-8">
          <input id="projectNameEdit" class="form-control" type="text" name="name" placeholder="Project Name" v-model="project.name" />
        </div>
      </div>
      <div class="form-group">
        <label class="control-label col-sm-4" for="projectAcronymEdit">Project Name: </label>
        <div class="col-sm-8">
          <input id="projectAcronymEdit" class="form-control" type="text" name="acronym" placeholder="Project Acronym" v-model="project.acronym" />
        </div>
      </div>
      <div class="form-group">
        <label class="control-label col-sm-4" for="companyClientSelect">Client: </label>
        <div class="col-sm-6">
          <select class="form-control" id="client-modal-client-id" name="client_id" v-model="project.client_id" v-on:change="isCreateClient()">
            <option>***** Choose Client *****</option>
            <option value="create">Create New Client</option>
            <option v-for="company_client in sorted_company_clients" v-bind:value="company_client.client_id" v-bind:company_client="company_client">
              {{ company_client.name }}
            </option>
          </select>
        </div>
        <div class="col-sm-2">
          <a v-on:click="editClient()">Edit Client</a>
        </div>
      </div>
      <div class="form-group">
        <label class="control-label col-sm-4" for="projectDueDate">Due Date: </label>
        <div class="col-sm-8">
          <input id="projectDueDate" class="form-control" type="date" name="due_at" placeholder="Due Date" v-model="due_date" />
        </div>
      </div>
      <div class="form-group">
        <label class="control-label col-sm-4" for="projectEditEstimate">Estimate: </label>
        <div class="col-sm-8">
          <input id="projectEditEstimate" class="form-control" type="text" name="estimate" placeholder="Estimate" v-model="project.estimate" />
        </div>
      </div>
      <div class="form-group">
        <label class="control-label col-sm-4" for="projectEditDescription">Description: </label>
        <div class="col-sm-8">
          <textarea id="projectEditDescription" class="form-control" name="description" placeholder="Description" v-model="project.description"> </textarea>
        </div>
      </div>
      <!--<div v-if="isAdmin()" class="form-group">
                            <label  class="control-label col-sm-4" for="defaultClientRateProjEdit">Default Client Rate: </label>
                            <div class="col-sm-8">
                                <div class="input-group">
                                    <span class="input-group-addon">$</span>
                                    <input id="defaultClientRateProjEdit" class="form-control" type="text" name="default_client_rate" :placeholder="clientClientRate()" :value="project.default_client_rate">
                                </div>
                            </div>
                        </div>
                        <div v-if="isAdmin()" class="form-group">
                            <label class="control-label col-sm-4" for="defaultUserRateProjEdit">Default User Rate: </label>
                            <div class="col-sm-8">
                                <div class="input-group">
                                    <span class="input-group-addon">$</span>
                                    <input id="defaultUserRateProjEdit" class="form-control" type="text" name="default_user_rate" :placeholder="clientUserRate()" :value="project.default_user_rate">
                                </div>
                            </div>
                        </div>-->
      <h4 v-if="project.id">Tasks</h4>
      <project-modal-task v-if="project.id" v-for="task in projecttasks()" v-bind:project="project" v-bind:task_types="task_types" v-bind:task="task"></project-modal-task>
      <div v-if="project.id" class="row without-margin">
        <div class="col-sm-8 col-sm-offset-4">
          <a @click="addTask()">Add Task</a>
        </div>
      </div>

      <div v-if="isAdmin()" class="form-group">
        <label class="control-label col-sm-4" for="projectEditDescription">Users: </label>
        <div class="col-sm-8">
          <edit-project-modal-user v-for="user in users" :key="user.id" @toggle="toggleUser" v-bind:project="project" v-bind:project_user="projectUser(project.id, user.id)" v-bind:user="user" />

          <!--<table class="row without-margin" v-if="isAdmin()">
                        <tr>
                            <th>Name</th>
                            <th>Project Rate</th>
                            <th>Role</th>
                        </tr>
                        <tr
                                v-for="user in users"
                                v-bind:user="user"
                                v-bind:project="project"
                                is="user-project-row"
                        ></tr>
                    </table>-->
        </div>
      </div>
    </form>
  </b-modal>
</template>

<script>
import EditProjectModalUser from './EditProjectModalUser.vue'

export default {
  name: 'project-modal',
  components: {
    'edit-project-modal-user': EditProjectModalUser
  },
  data: function() {
    return {
      changed_project_users: []
    }
  },
  computed: {
    sorted_company_clients: function() {
      return this.$store.getters['company_clients/getActiveCompanyClients']
    },
    project: function() {
      return this.$store.getters['settings/getCurrentEditProject']
    },
    company_clients: function() {
      return this.$store.state.company_clients.company_clients
    },
    users: function() {
      return this.$store.getters['company_users/getActive']
    },
    current_company: function() {
      return this.$store.state.settings.current_company
    },
    tasks: function() {
      return this.$store.state.tasks.tasks
    },
    task_types: function() {
      return this.$store.state.task_types.task_types
    },
    projects: function() {
      return this.$store.state.projects.projects
    },
    current_company_user: function() {
      return this.$store.state.settings.current_company_user
    }
  },
  mounted() {
    /* let self = this
      $('#project-modal').on('hidden.bs.modal', function() {
        self.$store.dispatch('settings/closedModal')
      })*/
  },
  watch: {
    'project.client_id': function() {
      if (this.project.client_id === 'create') {
        this.$store.dispatch('settings/closeModal', {
          modal: 'project',
          object: this.project,
          pop: false,
          push: true
        })
        this.$store.dispatch('projects/createClient')
      }
    }
  },
  methods: {
    toggleUser(user) {
      //only add each entry once into changed_project_users
      const project_user_index = this.changed_project_users.findIndex(changed_project_user => {
        //TODO: figure out why no match
        return changed_project_user.company_user_id === user.company_user_id
      })
      if (project_user_index !== -1) {
        //update only things that can change
        this.changed_project_users[project_user_index].user_rate = user.user_rate
        this.changed_project_users[project_user_index].role = user.role
        this.changed_project_users[project_user_index].user_checked = user.user_checked
      } else {
        //create
        this.changed_project_users.push(user)
      }
    },
    projectUser(project_id, company_user_id) {
      return this.$store.getters['project_users/getByProjectIdAndUserId']({ project_id, company_user_id })
    },
    closeProject() {
      this.$store.dispatch('projects/closeProject', this.project)
    },
    projecttasks() {
      if (!this.project_id) {
        return []
      }
      return this.$store.getters['tasks/getByProjectId'](this.project.id)
    },
    addTask: function() {
      this.$store.dispatch('tasks/createTask', { project_id: this.project.id })
    },
    isAdmin: function() {
      return this.$store.getters['settings/isAdmin']
    },
    clientClientRate: function() {
      return this.$store.getters['company_clients/clientRate'](this.project.client_id)
    },
    clientUserRate: function() {
      return this.$store.getters['company_clients/userRate'](this.project.client_id)
    },
    due_date: function() {
      return '' //dateTimeToInput(this.project.due_at)
    },
    isProjectClient: function(client_id) {
      return this.project.client_id === client_id
    },
    isCreateClient: function() {
      if (document.getElementById('client-modal-client-id').value === 'create') {
        this.$store.dispatch('company_clients/createClient')
      }
    },
    editClient: function() {
      this.$store.dispatch('settings/closeModal', {
        modal: 'project',
        object: this.project,
        pop: false,
        push: true
      })
      this.$store.dispatch('company_clients/editClient', this.projectClient())
    },
    projectClient: function() {
      return this.$store.getters['company_clients/getByClientCompanyId'](this.project.client_id)
    },
    saveProject: function(callback) {
      this.$store.dispatch('projects/saveProject', { project: this.project, project_users: this.changed_project_users })
    }
  }
}
</script>
