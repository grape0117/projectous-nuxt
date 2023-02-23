<template>
  <b-modal ref="project-modal" id="project-modal" class="modal fade" role="dialog" @ok="saveProject" ok-variant="light" ok-title="Save" @hidden="closeModal" @shown="updateButtonStyle()">
    <template #modal-title>
      <h5 class="white-text">{{ has_route_query_newProjectClientCompanyId ? 'Add' : 'Edit' }} Project</h5>
    </template>
    <slot name="content">
      <form id="editProjectForm" class="form-horizontal row ml-1 mr-1">
        <input id="projectIDEdit" class="form-control" type="hidden" name="id" v-model="project.id" />
        <div class="form-group col-sm-6">
          <label class="control-label white-text" for="projectNameEdit">Project Name: </label>
          <input id="projectNameEdit" class="form-control" type="text" name="name" placeholder="Project Name" v-model="project.name" />
        </div>
        <div class="form-group col-sm-6">
          <label class="control-label white-text" for="projectAcronymEdit">Acronym: </label>
          <input id="projectAcronymEdit" class="form-control" type="text" name="acronym" placeholder="Project Acronym" v-model="project.acronym" />
        </div>
        <div class="form-group col-sm-12">
          <label class="control-label white-text" for="projectAcronymEdit">Url: </label>
          <input id="projectAcronymEdit" class="form-control" type="text" name="url" placeholder="Project Acronym" v-model="project.url" />
        </div>
        <div class="form-group col-sm-6">
          <label class="control-label white-text" for="companyClientSelect">Status: </label>
          <select class="form-control" id="client-modal-client-id" name="status" v-model="project.status">
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div class="form-group col-sm-6">
          <label class="control-label white-text" for="projectTargetEdit">Monthly Invoice Target: </label>
          <input id="projectTargetEdit" class="form-control" type="text" name="url" placeholder="Project Target" v-model="project.monthly_target" />
        </div>
        <div class="form-group col-sm-12">
          <label class="control-label white-text" for="companyClientSelect">Client: </label>
          <v-select :options="sorted_clients" :reduce="client => client.client_company_id" label="name" v-model="project.client_company_id" placeholder="Select a client" style="background:white; border-radius: 5px">
            <template slot="selected-option" slot-scope="option">
              <div class="flex">
                <div class="col">{{ option.name }}</div>
              </div>
            </template>
            <template slot="option" slot-scope="option"> {{ option.name }} <b-badge v-if="option.is_new" variant="success">New</b-badge></template>
          </v-select>
          <b-badge variant="light" class="mr-1 mt-2" style="cursor: pointer;" @click="editClient()">Edit Client</b-badge>
          <b-badge variant="light" class="mr-1 mt-2" style="cursor: pointer;" @click="createClient()">Add Client</b-badge>
        </div>
        <div class="form-group col-sm-6">
          <label class="control-label white-text" for="projectDueDate">Due Date: </label>
          <input id="projectDueDate" class="form-control" type="date" name="due_at" placeholder="Due Date" v-model="due_date" />
        </div>
        <div class="form-group col-sm-6">
          <label class="control-label white-text" for="projectEditEstimate">Estimate: </label>
          <input id="projectEditEstimate" class="form-control" type="text" name="estimate" placeholder="Estimate" v-model="project.estimate" />
        </div>
        <div class="form-group col-sm-12">
          <label class="control-label white-text" for="projectEditDescription">Description: </label>
          <textarea id="projectEditDescription" class="form-control" name="description" placeholder="Description" v-model="project.description"> </textarea>
        </div>

        <div v-if="isAdmin()" class="form-group col-sm-12">
          <label class="control-label white-text" for="projectEditDescription">Users: </label>
          <edit-project-modal-user v-for="user in users" :key="user.id" @toggle="toggleUser" :client_user="projectClientUser(user.id)" :project="project" :project_user="projectUser(project.id, user.id)" :user="user" />
        </div>
      </form>
    </slot>
  </b-modal>
</template>

<script>
import EditProjectModalUser from './EditProjectModalUser.vue'
import Vue from 'vue'
import { applyTheme } from '@/utils/util-functions'

export default {
  name: 'project-modal',
  components: {
    'edit-project-modal-user': EditProjectModalUser
  },
  data: function() {
    return {
      changed_project_users: [],
      project: {},
      buttonStyle: ''
    }
  },
  created() {
    this.updateButtonStyle()
  },
  computed: {
    has_route_query_newProjectClientCompanyId() {
      return this.$route.query.new_project_client_company_id ? true : false
    },
    sorted_clients: function() {
      return this.$store.getters['clients/getActiveCompanyClients']
    },
    edit_project() {
      return this.$store.state.settings.current_edit_project
    },
    current_edit_project_status() {
      return this.$store.state.settings.current_edit_project_status
    },
    project_id: function() {
      return this.$store.state.settings.current_edit_project.id
    },
    clients: function() {
      return this.$store.state.clients.clients
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
  watch: {
    edit_project(edit_project) {
      // this.project = cloneDeep(edit_project)
      if (edit_project && Object.keys(edit_project).length === 1) {
        Vue.set(this.project, 'id', this.project_id)
        return
      }
      // this.project = _.cloneDeep(this.$store.state.settings.current_edit_project)
      this.project = _.cloneDeep(edit_project)
    },
    '$route.query': {
      immediate: true,
      handler(query) {
        if (query.new_project_client_company_id && Object.keys(query.new_project_client_company_id).length > 0) {
          this.setClient(query.new_project_client_company_id)
        }
      }
    },
    'project.client_id': function() {
      if (this.project.client_id === 'create') {
        this.$store.dispatch('settings/closeModal', {
          modal: 'project',
          object: this.project,
          pop: false,
          push: true
        })
        this.$store.dispatch('clients/createClient')
      }
    }
  },
  methods: {
    applyTheme,
    checkProject() {},
    reset_project() {
      this.project = {}
    },
    setClient(client_company_id) {
      Vue.set(this.project, 'client_company_id', client_company_id)
    },
    async closeModal() {
      this.reset_project()
      if (this.has_route_query_newProjectClientCompanyId) {
        let query = Object.assign({}, this.$route.query)
        delete query.new_project_client_company_id
        await this.$router.replace({ query })
        return
      }
    },
    projectClientUser(company_user_id) {
      const client = this.$store.getters['clients/getByClientCompanyId'](this.project.client_company_id)
      return client ? this.$store.getters['client_users/getByClientIdAndCompanyUserId']({ client_id: client.id, company_user_id }) : null
    },
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
      return this.$store.getters['project_users/getByProjectIdAndCompanyUserId']({ project_id, company_user_id })
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
      return this.$store.getters['clients/clientRate'](this.project.client_company_id)
    },
    clientUserRate: function() {
      return this.$store.getters['clients/userRate'](this.project.client_company_id)
    },
    due_date: function() {
      return '' //dateTimeToInput(this.project.due_at)
    },
    editClient: function() {
      // alert()
      // this.$store.dispatch('settings/closeModal', {
      //   modal: 'project',
      //   object: this.project,
      //   pop: false,
      //   push: true
      // })

      const project_client = this.projectClient()
      this.$store.dispatch('clients/editClient', project_client.id)
    },
    projectClient: function() {
      return this.$store.getters['clients/getByClientCompanyId'](this.project.client_company_id)
    },
    async saveProject(callback) {
      const project = await this.$store.dispatch('UPSERT', { module: 'projects', entity: this.project })
      if (this.current_edit_project_status === 'add') {
        this.$store.state.projects.projects.push(project)
        return
      }
    },
    createClient: function() {
      this.$store.dispatch('clients/createClient')
    },
    updateButtonStyle: function() {
      const updated_style = this.applyTheme()
      this.buttonStyle = updated_style
      const header = document.querySelector('.modal-header')
      if (header) {
        header.style = updated_style
        const body = document.querySelector('.modal-body')
        body.style = updated_style
        const footer = document.querySelector('.modal-footer')
        footer.style = updated_style
      }
    }
  }
}
</script>
