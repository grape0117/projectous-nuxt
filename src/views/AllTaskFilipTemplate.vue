<template>
  <div id="task-cloud">
    <div v-if="!show_task" style="padding: 20px;">
      <b-row style="margin-bottom: 10px;">
        <select v-model="project_sort" style="width: 400px;">
          <option value="">All Projects</option>
          <optgroup :label="client.name" v-for="(client, clientIndex) in clients" :key="clientIndex">
            <option :value="project.id" v-for="(project, projectIndex) in clientProjects(client)" :key="projectIndex">{{ project.name }}</option>
          </optgroup>
        </select>
        <button @click="project_sort = ''">Reset</button>
        <b-col class="t-btn-panel">
          <b-button variant="primary" @click="addClient()">Add Client</b-button>
          <b-button variant="primary" @click="addProject()">Add Project</b-button>
          <b-button variant="primary" @click="addTask()">Add Task</b-button>
        </b-col>
      </b-row>
      <b-row>
        <div style="width: 100%">Leads</div>
        <task-card @showTask="showTask(task)" v-bind:task="task" v-for="(task, taskIndex) in lead_client_tasks" :key="taskIndex" class="task-card"> </task-card>
      </b-row>

      <b-row>
        <div style="width: 100%">New</div>
        <task-card @showTask="showTask(task)" v-bind:task="task" v-for="(task, taskIndex) in new_client_tasks" :key="taskIndex" class="task-card"> </task-card>
      </b-row>

      <b-row class="border active-task-card">
        <div class="active-task-card-title">Active</div>
        <div style="margin-top: 40px;">
          <task-card @showTask="showTask(task)" v-bind:task="task" :keyid="taskIndex" v-for="(task, taskIndex) in active_client_tasks" :key="taskIndex" class="task-card"> </task-card>
        </div>
      </b-row>
    </div>
    <div v-else class="show-task">
      <div class="left-section">
        <div class="task-detail-top-buttons">
          <button @click="saveTask()">Close (ESC)</button>
          <b-button class="action-button" variant="outline-success" @click="completeTask()">
            <span>Complete</span>
          </b-button>
          <b-button class="action-button" variant="outline-danger" @click="deleteTask">
            <span>Delete</span>
          </b-button>
        </div>
        <b-tabs content-class="mt-3" style="margin-top: 10px;">
          <b-tab title="Details" active>
            <b-form-group label="Task">
              <b-form-textarea type="text" v-model="show_task.title" placeholder="Task Title" rows="2" max-rows="4"> </b-form-textarea>
            </b-form-group>
            <b-form-group label="Resources">
              <div @click="onSelectResource(resource)" v-for="(resource, resourceIndex) in getResources" :key="resourceIndex" :href="resource.href">
                <div class="resource-title">
                  <span>{{ resource.name }}</span>
                </div>
                <div class="resource-action" style="float: right">
                  <a href="#" @click="onDeleteResource(resource)">delete</a>
                </div>
              </div>
              <b-button style="float: right" variant="primary" @click="onAddNewResource()">Add new</b-button>
              <b-input-group>
                <b-form-input placeholder="Label" type="text" id="add-resource-name"></b-form-input>
                <b-form-input placeholder="https://" type="text" id="add-resource-href"></b-form-input>
                <b-input-group-append>
                  <b-button variant="primary" @click="addResource()">
                    <span v-if="!isEditResource">Add</span>
                    <span v-else>Update</span>
                  </b-button>
                </b-input-group-append>
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
            <input type="file" @change="Images_onFileChanged" /><button @click="Images_onUpload">Upload!</button>

            <div class="form-section">
              Assigned to:
              <select id="task-user" class="form-control select2-select" name="task_user" v-on:change="switchAssignedUser">
                <option value="" selected>***** Select User *****</option>
                <option v-for="company_user in company_users" :key="company_user.id" v-bind:company_user="company_user" :value="company_user.id"> {{ company_user.name }} </option>
              </select>
            </div>

            <div class="form-group">
              <label class="control-label col-sm-4">Task Type: </label>
              <div class="col-sm-8">
                <select class="form-control select2-select" name="project_id" :value="show_task.settings && show_task.settings.task_type ? show_task.settings.task_type : ''" @input="e => (task['settings']['task_type'] = e.target.value)">
                  <option value="">***** Select Task Type *****</option>
                  <option>Habit</option>
                  <option>Appointment</option>
                  <option>Recurring</option>
                  <option>Meeting</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="control-label col-sm-4" for="taskDueDate">Due Date: </label>
              <div class="col-sm-8">
                <input id="taskDueDate" class="form-control" type="date" name="due_at" placeholder="Due Date" v-model="show_task.due_date" />
              </div>
            </div>

            <div class="form-group">
              <label class="control-label col-sm-4" for="taskEditEstimate">Estimate: </label>
              <div class="col-sm-8">
                <input id="taskEditEstimate" class="form-control" type="text" name="estimate" placeholder="Estimate" v-model="show_task.estimate" />
              </div>
            </div>

            <div class="form-group">
              <label class="control-label col-sm-4" for="taskEditEstimate">Status: </label>
              <div class="col-sm-8">
                <select class="form-control" v-model="show_task.status">
                  <option value="open">Open</option>
                  <option value="turned-in">Turned-In</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="completed">Completed</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div class="row without-margin">
              <p style="max-width: 100%; margin-bottom: 5px; font-weight: 700;">
                Users:
              </p>
            </div>

            <edit-task-modal-user v-for="user in active_users" :key="user.id" @toggle="toggleUser" v-bind:task_user="task_user(user)" v-bind:user="user" v-bind:task="show_task" />
          </b-tab>
          <b-tab title="Chat">
            <task-message class="task-cloud_task-message" v-bind:task_id="show_task.id"> </task-message>
          </b-tab>
        </b-tabs>
      </div>
      <div class="center-section">
        <draggable class="tab">
          <button class="tablinks" :class="{ active: resource.name === selected_tab }" v-for="(resource, resourceIndex) in getResources" :key="resourceIndex" @click="openTab(resource.name)">
            {{ resource.name }}
          </button>
        </draggable>
        <div v-for="(resource, resourceIndex) in getResources" :key="resourceIndex" :id="resource.name">
          <div v-if="resource.name === selected_tab" class="d-flex justify-content-between align-items-center">
            <label class="docs-path" style="white-space: nowrap; overflow: hidden;">{{ resource.href }}</label>
            <div style="float: right; display: inline-block; margin-bottom: 8px; margin-top: 5px;" v-if="resource.href != ''">
              <b-button @click="copyURL(resource.href)" style="margin-right: 10px;">Copy URL</b-button>
              <b-button @click="openURL(resource.href)">Open in a new tab</b-button>
            </div>
          </div>
          <iframe v-if="resource.name === selected_tab" :src="resource.href" style="height: calc(100vh - 155px); width: 100%;"></iframe>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
// import TaskCard from '../components/ui/TaskCard.vue'
import uuid from 'uuid'
import moment from 'moment'
import draggable from 'vuedraggable'
import { each } from 'lodash'
// import TaskMessage from './TaskMessage.vue'

import EditTaskModalUser from './EditTaskModalUser.vue'

export default Vue.extend({
  name: 'all-task-filip-template',
  data: function() {
    return {
      tasks: this.$store.state.tasks.tasks,
      show_task: false,
      selected_resource: '',
      project_sort: '',
      isEditResource: null,
      scrollTop: 0,
      selected_tab: '',
      changed_task_users: [],
      selectedFile: null
    }
  },
  props: ['task_id'],
  components: {
    'task-card': () => import('../components/ui/TaskCard.vue'),
    draggable,
    'task-message': () => import('./TaskMessage.vue'),
    'edit-task-modal-user': EditTaskModalUser
  },
  computed: {
    // task: function() {
    //   let task = this.$store.state.settings.current_edit_task
    //   // console.log('modal task', task)
    //   return task
    // },
    active_users: function() {
      return this.$store.getters['company_users/getActive']
    },
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
      let taskFilter = this.tasks.filter(function(task) {
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

      let tasks = _.cloneDeep(taskFilter)
      let projects = this.$store.state.projects.projects
      let clients = this.$store.state.clients.clients
      let company_users = this.$store.state.company_users.company_users

      tasks.forEach(task => {
        let project = projects.find(({ id: projectId }) => projectId === task.project_id)
        task['project'] = project ? project : []

        if (project && project.client_id !== null) {
          task.client = clients.find(async ({ id: clientId }) => {
            return clientId === (await project.client_id)
          })
        } else {
          task.client = []
        }

        // task.users.forEach(user => {
        //   company_users.forEach(company_user => {
        //     if (company_user.id === user.company_user_id) {
        //       user.color = company_user.color
        //     }
        //   })
        // })

        return task
      })

      return tasks
    },
    getResources() {
      if (this.show_task && this.show_task.settings && this.show_task.settings.resources && this.show_task.settings.resources.length) {
        return this.show_task.settings.resources
      } else {
        return []
      }
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
  async created() {
    if (this.$route.params.task_id) {
      await this.setShowTask()
    }
    // this.$nextTick(() => {
    // this.$watch('$route', (val) => {
    //   console.log('WATCH ON CREATED');
    // })
    // })
    // if(this.$route.params.task_id) {
    //   console.log('THERE IS DATA!!!')
    //   console.log(this.$route.params);
    // }
    if (Object.keys(this.$route.params).length) {
      this.$watch('active_client_tasks', async data => {
        if (data) {
          console.log('DATA RESULT')
          this.show_task = await data.find(({ id }) => id === this.$route.params.task_id)
        }
      })
    }
  },
  methods: {
    Images_onFileChanged(event) {
      console.log('adding file')
      this.selectedFile = event.target.files[0]
    },
    Images_onUpload() {
      const mypostparameters = new FormData()
      mypostparameters.append('image', this.selectedFile, this.selectedFile.name)
      mypostparameters.append('project_id', this.task.project_id)
      mypostparameters.append('task_id', this.task.id)
      this.$http().post('/files/add', mypostparameters)
    },
    async setShowTask() {
      this.show_task = await this.tasks.find(({ id }) => id === this.$route.params.task_id)
    },
    task_user(company_user) {
      // let self = this
      let userTask = this.$store.state.task_users.task_users.find(task_user => {
        if (task_user.task_id !== this.show_task.id) return false
        return task_user.company_user_id === company_user.id
      })

      return userTask !== -1 ? userTask : false
    },
    toggleUser(user) {
      //only add each entry once into changed_task_users
      const task_user_index = this.changed_task_users.findIndex(changed_task_user => {
        //TODO: figure out why no match
        return changed_task_user.company_user_id === user.company_user_id
      })
      if (task_user_index !== -1) {
        //update only things that can change
        this.changed_task_users[task_user_index].user_rate = user.user_rate
        this.changed_task_users[task_user_index].role = user.role
        this.changed_task_users[task_user_index].user_checked = user.user_checked
      } else {
        //create
        this.changed_task_users.push(user)
      }
    },
    updateStatus(status) {
      this.show_task.status = status
      this.saveTask()
    },
    current_company_user_id() {
      return this.$store.state.settings.current_company_user_id
    },
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

      // Get all elements with class="tablinks" and remove the class "active"
      let tablinks = document.getElementsByClassName('tablinks')
      for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(' active', '')
        console.log(tablinks[i].innerHTML.trim(), resourceName)
        if (tablinks[i].innerHTML.trim() == resourceName) {
          tablinks[i].className += ' active'
        }
      }
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
    async saveTask(isRedirect = true) {
      console.log(this.show_task)
      await this.$store.dispatch('UPSERT', { module: 'tasks', entity: this.show_task })
      if (isRedirect) {
        this.show_task = false
        this.isEditResource = null
        this.$router.push({ name: 'Task Cloud' })
      }
    },
    addResource() {
      // add or update action
      console.log(this.show_task)
      if (!this.show_task.settings.resources) {
        Vue.set(this.show_task.settings, 'resources', [])
      }
      if (!this.isEditResource) {
        // if add new resource
        this.show_task.settings.resources.push({
          name: document.getElementById('add-resource-name').value,
          href: document.getElementById('add-resource-href').value
        })
        document.getElementById('add-resource-name').value = ''
        document.getElementById('add-resource-href').value = ''
        this.saveTask(false)
      } else {
        // if edit resource
        let me = this
        let index = this.show_task.settings.resources.findIndex(function(item, i) {
          return item == me.selected_resource
        })
        if (index != -1)
          this.show_task.settings.resources[index] = {
            name: document.getElementById('add-resource-name').value,
            href: document.getElementById('add-resource-href').value
          }
      }
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
      this.$store.commit('settings/setSetting', {
        setting: 'current_edit_client',
        value: { id: uuid.v4(), status: 'active' }
      })
      this.$bvModal.show('client-modal')
    },
    showTask(task) {
      console.log('show task!', task)
      this.scrollTop = document.documentElement.scrollTop
      //pop modal
      this.show_task = task
      this.t_update()
      this.$router.push({ name: 'Task_Detail', params: { task_id: task.id } })
    },
    t_update() {
      // function to use after this.show_task = task
      if (!this.show_task.settings) return (this.show_task.settings = [])

      // open first resource in right side
      if (this.show_task.settings.resources && this.show_task.settings.resources.length) {
        let me = this
        setTimeout(function() {
          me.openTab(me.show_task.settings.resources[0].name)
        }, 200)
      }
    },
    onSelectResource(resource) {
      this.selected_resource = resource
      this.isEditResource = true
      document.getElementById('add-resource-name').value = resource.name
      document.getElementById('add-resource-href').value = resource.href
      this.openTab(resource.name)
    },
    onAddNewResource() {
      this.isEditResource = false
    },
    onDeleteResource(resource) {
      let index = this.show_task.settings.resources.findIndex(function(item, i) {
        return item == resource
      })
      if (index != -1) this.show_task.settings.resources.splice(index, 1)
    },
    copyURL(url) {
      let el = document.createElement('textarea')
      el.value = url
      el.setAttribute('readonly', '')
      el.style = { position: 'absolute', left: '-9999px' }
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    },
    openURL(url) {
      window.open(url, '_blank')
    },
    openTab(resourceName) {
      this.selected_tab = resourceName

      // let i
      // // Get all elements with class="tabcontent" and hide them
      // let tabcontent = document.getElementsByClassName('tabcontent')
      // for (i = 0; i < tabcontent.length; i++) {
      //   tabcontent[i].style.display = 'none'
      // }

      // Get all elements with class="tablinks" and remove the class "active"
      // let tablinks = document.getElementsByClassName('tablinks')
      // for (i = 0; i < tablinks.length; i++) {
      //   tablinks[i].className = tablinks[i].className.replace(' active', '')
      //   if (tablinks[i].innerHTML.trim() == resourceName) {
      //     tablinks[i].className += ' active'
      //   }
      // }

      // Show the current tab, and add an "active" class to the button that opened the tab
      // if (document.getElementById(resourceName)) {
      //   document.getElementById(resourceName).style.display = 'block'
      // }
      // console.log(document.getElementById(resourceName))
    }
  },
  watch: {
    isEditResource(val) {
      if (!val) {
        document.getElementById('add-resource-name').value = ''
        document.getElementById('add-resource-href').value = ''
      }
    },
    tasks(list) {
      // after load the task list and if current page is task detail page
      if (this.task_id) {
        let me = this
        let task = list.filter(item => {
          return (item.id = me.task_id)
        })
        console.log('filter task', task)
        if (task) {
          this.show_task = task
          this.t_update()
        }
      }
    },
    async $route(to, from) {
      console.log(to)

      // console.log('ROUTE IS CHANGING')

      if (to.name == 'Task_Detail' && from.name == 'Tasks') {
        document.documentElement.scrollTop = 0
      } else if (to.name == 'Tasks' && from.name == 'Task_Detail') {
        let me = this
        setTimeout(function() {
          document.documentElement.scrollTop = me.scrollTop
        }, 100)
      }

      if (to.params.task_id) {
        await this.setShowTask()
      }
    }
  }
})
</script>
<style lang="scss">
#task-cloud {
  overflow: hidden;
}
.task-cloud_task-message {
  height: 100%;
  height: calc(100vh - 160px) !important;
}
.task-cloud_task-message .message-panel_inner {
  min-height: calc(100vh - 305px);
  max-height: calc(100vh - 305px);
  overflow-y: scroll;
  overflow-x: hidden;
}
.active-task-card {
  height: calc(100vh - 180px);
  overflow-y: scroll;
  padding: 5px 5px;
}
.active-task-card-title {
  position: fixed;
  font-weight: 500;
  color: white;
  padding: 3px 8px;
  border-radius: 3px;
  background-color: rgba($color: #000000, $alpha: 0.6);
}
.left-section {
  max-width: 300px;
  width: 100%;
  padding: 10px;
  height: calc(100vh - 39px);
  overflow-y: scroll;
  color: white;
}
.center-section {
  margin-top: 10px;
  width: 100%;
}
</style>

<style scoped>
.task-detail-top-buttons {
  /* border: 1px solid red; */
  display: flex;
  justify-content: space-between;
}
.task-detail-top-buttons .action-button {
  font-size: 13px;
}
.list-group-item {
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
  border-radius: 0;
}

.msg-content {
  padding: 8px 12px;
  border: solid 1px grey;
  border-radius: 8px;
  margin-top: 5px;
}

.t-btn-panel button {
  margin-right: 10px;
  text-transform: uppercase;
  float: right;
}
</style>
<style>
.form-section {
  margin-bottom: 20px;
}

.task-card {
  float: left;
  margin: 5px;
  min-width: 75px;
  padding: 10px 5px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  font-size: small;
  width: 200px;
  overflow-x: hidden;
  text-overflow: ellipsis;
  min-height: 105px;
  max-height: 105px;
}

.show-task {
  background-color: white;
  display: flex;
  /* height: 100vh;
  width: 100vw; */
}

.resource-title {
  display: inline-block;
}

/* Style the tab */
.tab {
  list-style: none;
  border-bottom: 1px solid #bbb;
  padding-left: 5px;
  overflow: hidden;
  /* border: 1px solid #ccc; */
  /* background-color: #f1f1f1; */
}

/* Style the buttons that are used to open the tab content */

button.tablinks {
  display: inline-block;
  height: 38px;
  padding: 0 30px;
  color: #555;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1rem;
  background-color: transparent;
  border-radius: 4px;
  border: 1px solid #bbb;
  cursor: pointer;
  transition: 0.3s;
}

.tab button {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  margin-bottom: -1px;
  border-bottom: none;
  margin-right: 5px;
  background: #ddd;
  /* background-color: inherit;
    /* float: left; */
}

/* Change background color of buttons on hover */
.tab button:hover {
  background-color: #ddd;
}

/* Create an active/current tablink class */
.tab button.active {
  color: #2323ff;
  border-color: #ddd;
  outline: 0;
  background: white;
  /* height: 45px; */
  /* border-bottom: 0.175em solid #fff; */
}

/* Style the tab content */
/* .tabcontent {
  display: none;
  border-top: none;
} */

.center-section .docs-path {
  max-width: 350px;
  width: 100%;
  text-overflow: ellipsis;
}
</style>
