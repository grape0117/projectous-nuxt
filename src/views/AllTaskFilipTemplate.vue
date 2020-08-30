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
      <b-row>
        <div style="width: 100%">Leads</div>
        <task-card @showTask="showTask(task)" v-bind:task="task" v-for="task in lead_client_tasks" class="task-card">
        </task-card>
      </b-row>

      <b-row>
        <div style="width: 100%">New</div>
        <task-card @showTask="showTask(task)" v-bind:task="task" v-for="task in new_client_tasks" class="task-card">
        </task-card>
      </b-row>

      <b-row>
        <div style="width: 100%">Active</div>
        <task-card @showTask="showTask(task)" v-bind:task="task" v-for="task in active_client_tasks" class="task-card">
        </task-card>
      </b-row>
    </div>
    <div v-else class="task-full-screen">
      <div style="width: 300px; padding-right: 15px; padding-top: 10px;">
        <button @click="saveTask">Close (ESC)</button>
        <b-tabs content-class="mt-3" style="margin-top: 10px;">
          <b-tab title="Details" active>
            <b-form-group label="Task">
              <b-form-textarea type="text" v-model="show_task.title" placeholder="Task Title" rows="2" max-rows="4">
              </b-form-textarea>
            </b-form-group>
            <b-form-group label="Resources">
              <div @click="onSelectResource(resource)" v-for="resource in getResources" :href="resource.href">
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
              <select id="timer-modal-project-id" class="form-control select2-select" name="project_id"
                v-on:change="isCreateProject()" v-model="show_task.project_id">{{
                  show_task.project_id
                }}
                <option value="" selected>***** Select Project *****</option>
                <option value="create">Create New Project </option>
                <optgroup :label="client.name" v-bind:client="client" v-for="client in clients" :key="client.id">
                  <option v-for="project in openprojects(client)" :key="project.id" v-bind:client="client"
                    :value="project.id"> {{ client_name(project.client_company_id) }} - {{ project.name }} </option>
                </optgroup>
              </select>
            </div>
            <div class="form-section">
              Assigned to:
              <select id="task-user" class="form-control select2-select" name="task_user" v-on:change="switchAssignedUser">
                <option value="" selected>***** Select User *****</option>
                <option v-for="company_user in company_users" :key="company_user.id" v-bind:company_user="company_user"
                  :value="company_user.id"> {{ company_user.name }} </option>
              </select>
            </div>
            <b-button variant="primary" @click="completeTask()">Complete</b-button>
            <b-button variant="warning" @click="deleteTask">Delete</b-button>
          </b-tab>
          <b-tab title="Chat">
            <div class="message-panel">
              <b-form-textarea type="text" v-model="s_message" placeholder="Write you message" rows="2" max-rows="4">
              </b-form-textarea>
              <b-button pill variant="primary" @click="saveMessage()" style='margin-top: 5px; margin-left: 210px;'>Save</b-button>
              <b-list-group style="max-height:500px; overflow-y: auto;">
                <b-list-group-item v-for="message in getMessages">
                  <div class="msg-header">
                    <span>{{ getUserNameWithCompanyUserId(message.company_user_id) }}</span> / <span>{{ formatTime(message.timestamp) }}</span>
                  </div>
                  <label class="msg-content">{{ message.message }}</label>
                  <div class="msg-action" v-if="current_company_user_id == message.company_user_id">
                    <b-button variant="primary" @click="editMessage(message)" style="margin-right: 10px;">Edit</b-button>
                    <b-button variant="warning" @click="deleteMessage(message)">Delete</b-button>
                  </div>
                </b-list-group-item>
              </b-list-group>
            </div>
            </b-form-group>
          </b-tab>
        </b-tabs>
        
      </div>
      <div style="width: calc(100vw - 380px); margin-top: 10px;">
        <draggable class="tab">
          <button class="tablinks active" v-for="resource in getResources" @click="openTab(resource.name)">
            {{ resource.name }}
          </button>
        </draggable>
        <!-- Tab content -->
        <div v-for="resource in getResources" class="tabcontent" :id="resource.name">
          <label
              style="width: calc(100% - 280px); white-space: nowrap; overflow: hidden; margin-top: 8px; padding-left: 10px;">{{resource.href}}</label>
            <div style="float: right; display: inline-block; margin-bottom: 8px; margin-top: 5px;" v-if="resource.href != ''">
              <b-button @click="copyURL(resource.href)" style="margin-right: 10px;">Copy URL</b-button>
              <b-button @click="openURL(resource.href)">Open in a new tab</b-button>
            </div>
          <iframe :src="resource.href" style="height: 100vh; width: 100%"></iframe>
        </div>
       
        <!-- <b-tabs content-class="mt-3" v-model="tabIndex">
          <b-tab v-for="resource in getResources" :title="resource.name">
            <label
              style="width: calc(100% - 280px); white-space: nowrap; overflow: hidden; margin-top: 8px;">{{resource.href}}</label>
            <div style="float: right; display: inline-block; margin-bottom: 10px;" v-if="resource.href != ''">
              <b-button @click="copyURL(resource.href)" style="margin-right: 10px;">Copy URL</b-button>
              <b-button @click="openURL(resource.href)">Open in a new tab</b-button>
            </div>
            <iframe :src="resource.href" style="height: 100vh; width: 100%"></iframe>
          </b-tab>
          </b-tabs> -->
      </div>
    </div>
  </div>
</template>
<script>
  import Vue from 'vue'
  import TaskCard from '../components/ui/TaskCard.vue'
  import uuid from 'uuid'
  import moment from 'moment'
  import draggable from 'vuedraggable'

  export default {
    name: 'all-task-filip-template',
    data: function () {
      return {
        tasks: this.$store.state.tasks.tasks,
        show_task: false,
        selected_resource: '',
        project_sort: '',
        isEditResource: null,
        s_message: '',
        selected_message: null,
      }
    },
    props: ['task_id'],
    components: {
      'task-card': TaskCard,
      draggable
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
        return this.tasks.filter(function (task) {
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
      new_client_tasks: function () {
        let self = this
        return this.tasks.filter(function (task) {
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
      active_client_tasks: function () {
        let self = this
        return this.tasks.filter(function (task) {
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
      },
      getResources() {
        if (this.show_task && this.show_task.settings && this.show_task.settings.resources && this.show_task.settings.resources.length) {
          return this.show_task.settings.resources
        } else {
          return []
        }
      },
      getMessages() {
        if (this.show_task && this.show_task.settings && this.show_task.settings.messages && this.show_task.settings.messages.length) {
          console.log(this.show_task.settings.messages)
          return this.show_task.settings.messages
        } else {
          return []
        }
      },
      current_company_user_id() {
        return this.$store.state.settings.current_company_user_id
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
        task_users.forEach(function (task_user) {
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
      client_name: function (client_id) {
        let client = this.$store.getters['clients/getById'](client_id)
        return client ? client.name : ''
      },
      openprojects: function (client) {
        //console.log('client', client)
        return this.$store.getters['projects/getOpenCompanyProjects'](client.client_company_id)
      },
      saveTask(isRedirect = true) {
        console.log(this.show_task)
        this.$store.dispatch('UPSERT', { module: 'tasks', entity: this.show_task })
        if ( isRedirect ) {
          this.show_task = false
          this.s_message = ''
          this.selected_message = null
          this.isEditResource = null
          this.$router.push({ name: 'Tasks'})
        }
      },
      addResource() { // add or update action
        console.log(this.show_task)
        if (!this.show_task.settings.resources) {
          Vue.set(this.show_task.settings, 'resources', [])
        }
        if (!this.isEditResource) { // if add new resource
          this.show_task.settings.resources.push({ name: document.getElementById('add-resource-name').value, href: document.getElementById('add-resource-href').value })
          document.getElementById('add-resource-name').value = ''
          document.getElementById('add-resource-href').value = ''
          this.saveTask(false)
        } else { // if edit resource
          let me = this
          let index = this.show_task.settings.resources.findIndex(function (item, i) {
            return item == me.selected_resource
          })
          if (index != -1) this.show_task.settings.resources[index] = { name: document.getElementById('add-resource-name').value, href: document.getElementById('add-resource-href').value }
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
        this.$store.commit('settings/setSetting', { setting: 'current_edit_client', value: { id: uuid.v4(), status: 'active' } })
        this.$bvModal.show('client-modal')
      },
      showTask(task) {
        console.log('show task!', task)

        //pop modal
        this.show_task = task
        this.t_update()
        this.$router.push({ name: 'Task_Detail', params: { task_id: task.id}})
      },
      t_update() { // function to use after this.show_task = task
        if (!this.show_task.settings) this.show_task.settings = []
        
        // open first resource in right side
        if ( this.show_task.settings.resources && this.show_task.settings.resources.length ) {
          let me = this
          setTimeout(function() {me.openTab(me.show_task.settings.resources[0].name)}, 200)
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
        let index = this.show_task.settings.resources.findIndex(function (item, i) {
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
        let i
        // Get all elements with class="tabcontent" and hide them
        let tabcontent = document.getElementsByClassName('tabcontent')
        for (i = 0; i < tabcontent.length; i++) {
          tabcontent[i].style.display = 'none'
        }

        // Get all elements with class="tablinks" and remove the class "active"
        let tablinks = document.getElementsByClassName('tablinks')
        for (i = 0; i < tablinks.length; i++) {
          tablinks[i].className = tablinks[i].className.replace(' active', '')
          if ( tablinks[i].innerHTML.trim() == resourceName ) {
            tablinks[i].className += ' active'
          }
        }

        // Show the current tab, and add an "active" class to the button that opened the tab
        document.getElementById(resourceName).style.display = 'block'
      },
      saveMessage() {
        if (!this.show_task.settings.messages) {
          Vue.set(this.show_task.settings, 'messages', [])
        }
        if ( !this.selected_message ) {
          this.show_task.settings.messages.push({
            id: uuid.v4(),
            company_user_id: this.current_company_user_id,
            message: this.s_message,
            timestamp: moment()
          })
          this.s_message = ''
        } else {
          let me = this
          let index = this.show_task.settings.messages.findIndex(function (item, i) {
            return item.id == me.selected_message.id
          })
          this.show_task.settings.messages[index].message = this.s_message
        }
        this.saveTask(false)
        // if (!this.isEditResource) { // if add new resource
        //   this.show_task.settings.resources.push({ name: document.getElementById('add-resource-name').value, href: document.getElementById('add-resource-href').value })
        //   document.getElementById('add-resource-name').value = ''
        //   document.getElementById('add-resource-href').value = ''
        // } else { // if edit resource
        //   let me = this
        //   let index = this.show_task.settings.resources.findIndex(function (item, i) {
        //     return item == me.selected_resource
        //   })
        //   if (index != -1) this.show_task.settings.resources[index] = { name: document.getElementById('add-resource-name').value, href: document.getElementById('add-resource-href').value }
        // }
      },
      formatTime(datetime) {
        return moment(datetime).format('MM-DD HH:mm:ss')
      },
      getUserNameWithCompanyUserId(company_user_id) {
        return this.$store.state.company_users.company_users[this.$store.state.company_users.lookup[company_user_id]].name
      },
      editMessage(message) {
        this.selected_message = message
        this.s_message = message.message;
      },
      deleteMessage(message) {
        if(confirm('Are you sure to delete this message?')) {
          let index = this.show_task.settings.messages.findIndex(function (item, i) {
            return item.id == message.id
          })
          if (index != -1) this.show_task.settings.messages.splice(index, 1)
          this.selected_message = null
          this.saveTask(false)
        }
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
        if ( this.task_id ) {
          let me = this
          let task = list.filter(item => {
            return item.id = me.task_id
          })
          console.log('filter task', task)
          if ( task ) {
            this.show_task = task
            this.t_update()
          }
        }
      }
    }
  }
</script>
<style scoped>
  .list-group-item  {
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
</style>
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
    letter-spacing: .1rem;
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
  .tabcontent {
    display: none;
    border-top: none;
  }
</style>