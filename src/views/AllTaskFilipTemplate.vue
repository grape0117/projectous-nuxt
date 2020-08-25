<template>
  <div>
    <div v-if="!show_task">
      <b-row>
        <b-col>
          <b-button @click="addTask()">Add Task</b-button>
          <b-button @click="addProject()">Add Project</b-button>
          <b-button @click="addClient()">Add Client</b-button>
          <!--<b-button>Add Team Member</b-button>-->
        </b-col>
        <select v-model="project_sort">
          <option value="">All Projects</option>
          <optgroup :label="client.name" v-for="client in clients">
            <option :value="project.id" v-for="project in clientProjects(client)">{{ project.name }}</option>
          </optgroup>
        </select>
        <button @click="project_sort = ''">Reset</button>
      </b-row>
      <b-row
        ><div style="width: 100%">Leads</div>
        <task-card @showTask="showTask(task)" v-bind:task="task" v-for="task in lead_client_tasks" class="task-card"> </task-card>
      </b-row>

      <b-row
        ><div style="width: 100%">New</div>
        <task-card @showTask="showTask(task)" v-bind:task="task" v-for="task in new_client_tasks" class="task-card"> </task-card>
      </b-row>

      <b-row
        ><div style="width: 100%">Active</div>
        <task-card @showTask="showTask(task)" v-bind:task="task" v-for="task in active_client_tasks" class="task-card"> </task-card>
      </b-row>
    </div>
    <div v-else class="task-full-screen">
      <div style="max-width: 300px; padding-right: 15px;">
        <button @click="saveTask">Close (ESC)</button>
        <b-form-group label="Task">
          <b-form-textarea type="text" v-model="show_task.title" placeholder="Task Title" rows="2" max-rows="4"></b-form-textarea>
        </b-form-group>
        <b-form-group label="Resources">
          <div @click="selected_resource = resource" v-for="resource in getResources()" :href="resource.href">{{ resource.name }}</div>
          <b-input-group>
            <b-form-input placeholder="Label" type="text" id="add-resource-name"></b-form-input><b-form-input placeholder="https://" type="text" id="add-resource-href"></b-form-input> <b-input-group-append><b-button variant="primary" @click="addResource()">Add</b-button></b-input-group-append>
          </b-input-group>
        </b-form-group>
        <div class="form-section">
          Project:
          <select id="timer-modal-project-id" class="form-control select2-select" name="project_id" v-on:change="isCreateProject()" v-model="show_task.project_id"
            >{{
              show_task.project_id
            }}
            <option value="" selected>***** Select Project *****</option>
            <option value="create">Create New Project </option>
            <optgroup :label="client.name" v-bind:client="client" v-for="client in clients" :key="client.id">
              <option v-for="project in openprojects(client)" :key="project.id" v-bind:client="client" :value="project.id"> {{ client_name(project.client_company_id) }} - {{ project.name }} </option>
            </optgroup>
          </select>
        </div>
        <div class="form-section">
          Assigned to:
          <select id="task-user" class="form-control select2-select" name="task_user" v-on:change="switchAssignedUser">
            <option value="" selected>***** Select User *****</option>
            <option v-for="company_user in company_users" :key="company_user.id" v-bind:company_user="company_user" :value="company_user.id"> {{ company_user.name }} </option>
          </select>
        </div>
        <b-button variant="primary" @click="completeTask()">Complete</b-button> <b-button variant="warning" @click="deleteTask">Delete</b-button>
      </div>
      <div style="width: calc(100vw - 300px)">
        <div>{{ selected_resource.name }} ({{ selected_resource.href }})</div>
        <iframe :src="selected_resource.href" style="height: 100vh; width: 100%"></iframe>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import TaskCard from '../components/ui/TaskCard.vue'
import uuid from 'uuid'
import moment from 'moment'
export default {
  name: 'all-task-filip-template',
  data: function() {
    return {
      tasks: this.$store.state.tasks.tasks,
      show_task: false,
      selected_resource: '',
      project_sort: ''
    }
  },
  components: {
    'task-card': TaskCard
  },
  computed: {
    clients() {
      let clients = this.$store.getters['clients/getActiveCompanyClients']
      //console.log('clients', clients)
      return clients.sort((a, b) => {
        return Vue.simpleSort(a.name.toLowerCase(), b.name.toLowerCase())
      })
    },
    company_users() {
      return this.$store.state.company_users.company_users
    },
    lead_client_tasks() {
      let self = this
      return this.tasks.filter(function(task) {
        if (task.status === 'completed') {
          return false
        }
        if (task.project_id) {
          let project = self.$store.getters['projects/getById'](task.project_id)
          if (!project || (self.project_sort != '' && task.project_id != self.project_sort)) {
            return false
          }
          let client = self.$store.getters['clients/getByClientCompanyId'](project.client_company_id)
          return client.status === 'lead'
        } else {
          return false
        }
      })
    },
    new_client_tasks: function() {
      let self = this
      return this.tasks.filter(function(task) {
        if (task.status === 'completed') {
          return false
        }
        if (task.project_id) {
          let project = self.$store.getters['projects/getById'](task.project_id)
          if (!project || (self.project_sort != '' && task.project_id != self.project_sort)) {
            return false
          }
          let client = self.$store.getters['clients/getByClientCompanyId'](project.client_company_id)
          return client.status === 'new'
        } else {
          return false
        }
      })
    },
    active_client_tasks: function() {
      let self = this
      return this.tasks.filter(function(task) {
        if (task.status === 'completed') {
          return false
        }
        if (task.project_id) {
          let project = self.$store.getters['projects/getById'](task.project_id)
          if (!project || (self.project_sort != '' && task.project_id != self.project_sort)) {
            return false
          }
          let client = self.$store.getters['clients/getByClientCompanyId'](project.client_company_id)
          return client.status === 'active'
        } else {
          return true
        }
      })
    }
  },
  mounted() {
    console.log('moment', moment('2010-10-20'))
    window.addEventListener('keyup', ev => {
      if (ev.keyCode === 27) {
        //* Note keyCode 27 is ESC
        this.saveTask()
      }
    })
  },
  methods: {
    switchAssignedUser(company_user_id) {
      const task_user = {
        id: uuid.v4(), //TODO: check for existing record?
        task_id: this.show_task.id,
        company_user_id: company_user_id,
        role: 'assigned'
      }
      //
      // if (role) {
      //   this.$emit('change', { message: this.user.name + ' given role of ' + role + ' by current user' })
      //   this.$store.dispatch('UPSERT', { module: 'task_users', entity: task_user }, { root: true })
      // } else {
      //   this.$emit('change', { message: this.user.name + ' removed from task by current user' })
      //   this.$store.dispatch('DELETE', { module: 'task_users', entity: task_user }, { root: true })
      // }

      let self = this
      const task_users = this.$store.getters['task_users/getByTaskId'](this.show_task.id)
      task_users.forEach(function(task_user) {
        console.log(task_user)
        self.$store.dispatch('DELETE', { module: 'task_users', entity: task_user }, { root: true })
      })

      this.$store.dispatch('UPSERT', { module: 'task_users', entity: task_user }, { root: true })
    },
    getTaskUser() {
      const task_users = this.$store.getters['task_users/getByTaskId'](this.show_task.id)
      if (task_users.length) return task_users[0]
    },
    completeTask() {
      this.show_task.status = 'completed'
      this.$store.dispatch('UPSERT', { module: 'tasks', entity: this.show_task })
      this.show_task = false
    },
    deleteTask() {
      this.$store.dispatch('DELETE', { module: 'tasks', id: this.show_task.id })
      this.show_task = false
    },
    clientProjects(client) {
      return this.$store.getters['projects/getOpenCompanyProjects'](client.client_company_id)
    },
    client_name: function(client_id) {
      let client = this.$store.getters['clients/getById'](client_id)
      return client ? client.name : ''
    },
    openprojects: function(client) {
      //console.log('client', client)
      return this.$store.getters['projects/getOpenCompanyProjects'](client.client_company_id)
    },
    saveTask() {
      console.log(this.show_task)
      this.$store.dispatch('UPSERT', { module: 'tasks', entity: this.show_task })
      this.show_task = false
    },
    getResources() {
      console.log(this.show_task)
      if (this.show_task && this.show_task.settings && this.show_task.settings.resources && this.show_task.settings.resources.length) {
        return this.show_task.settings.resources
      } else {
        return []
      }
    },

    addResource() {
      console.log(this.show_task)
      if (!this.show_task.settings.resources) {
        Vue.set(this.show_task.settings, 'resources', [])
      }
      this.show_task.settings.resources.push({ name: document.getElementById('add-resource-name').value, href: document.getElementById('add-resource-href').value })
      console.log(this.show_task)
    },
    addTask() {
      this.show_task = { id: uuid.v4() }
    },
    addProject() {
      this.$store.state.settings.current_edit_project = { id: uuid.v4() }
      this.$store.dispatch('settings/openModal', 'project')
      //this.$bvModal.show('project-modal')
    },
    addClient() {
      //TODO move to dispatch
      this.$store.commit('settings/setSetting', { setting: 'current_edit_client', value: { id: uuid.v4(), status: 'active' } })
      this.$bvModal.show('client-modal')
    },
    showTask(task) {
      //pop modal
      this.show_task = task
      console.log('task!')
    }
  }
}
</script>

<style>
.form-section {
  margin-bottom: 20px;
}
.task-card {
  float: left;
  min-height: 30px;
  margin: 5px;
  min-width: 75px;
}
.task-full-screen {
  display: flex;
  height: 100vh;
  width: 100vw;
}
</style>
