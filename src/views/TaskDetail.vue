<template>
  <div id="task-detail">
    <div class="left-section">
      <div class="task-detail-top-buttons">
        <button @click="saveTask">Close (ESC)</button>
        <b-button class="action-button" variant="outline-success" @click="completeTask()">
          <span>Complete</span>
        </b-button>
        <b-button class="action-button" variant="outline-danger" @click="deleteTask">
          <span>Delete</span>
        </b-button>
      </div>
      <b-tabs content-class="mt-3" style="margin-top: 10px" v-model="showTab">
        <b-tab title="Details" style="color: black">
          <b-form-group label="Task">
            <b-form-textarea type="text" v-model="task.title" placeholder="Task Title" rows="2" max-rows="4"> </b-form-textarea>
          </b-form-group>
          <b-form-group label="Resources">
            <div @click="onSelectResource(resource)" v-for="resource in getResources" :key="resource.id" :href="resource.href">
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
            <select id="timer-modal-project-id" class="form-control select2-select" name="project_id" v-model="task.project_id">
              {{
                task.project_id
              }}
              <option value="" selected>***** Select Project *****</option>
              <option value="create">Create New Project</option>
              <optgroup :label="client.name" v-bind:client="client" v-for="client in clients" :key="client.id">
                <option v-for="project in openprojects(client)" :key="project.id" v-bind:client="client" :value="project.id">{{ client_name(project.client_company_id) }} - {{ project.name }}</option>
              </optgroup>
            </select>
          </div>
          <input type="file" @change="Images_onFileChanged" />
          <button @click="Images_onUpload" v-if="selectedFile">Upload!</button>

          <!-- <div class="form-section" style="color: black;">
            Assigned to:
            <select id="task-user" class="form-control select2-select" name="task_user" v-on:change="switchAssignedUser">
              <option value="" selected>***** Select User *****</option>
              <option v-for="company_user in company_users" :key="company_user.id" v-bind:company_user="company_user" :value="company_user.id"> {{ company_user.name }} </option>
            </select>
          </div> -->

          <div class="form-group">
            <label class="control-label col-sm-4">Task Type: </label>
            <div class="col-sm-8">
              <select class="form-control select2-select" name="project_id" :value="task.settings && task.settings.task_type ? task.settings.task_type : ''" @input="e => (task['settings']['task_type'] = e.target.value)">
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
              <input id="taskDueDate" class="form-control" type="date" name="due_at" placeholder="Due Date" v-model="task.due_date" />
            </div>
          </div>

          <div class="form-group">
            <label class="control-label col-sm-4" for="taskEditEstimate">Estimate: </label>
            <div class="col-sm-8">
              <input id="taskEditEstimate" class="form-control" type="text" name="estimate" placeholder="Estimate" v-model="task.estimate" />
            </div>
          </div>

          <div class="form-group">
            <label class="control-label col-sm-4" for="taskEditEstimate">Status: </label>
            <div class="col-sm-8">
              <select class="form-control" v-model="task.status">
                <option value="open">Open</option>
                <option value="turned-in">Turned-In</option>
                <option value="reviewed">Reviewed</option>
                <option value="completed">Completed</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div class="row without-margin">
            <p style="max-width: 100%; margin-bottom: 5px; font-weight: 700">Users:</p>
          </div>
          <edit-task-modal-user v-for="user in active_users" :key="user.id" @toggle="toggleUser" v-bind:task_user="task_user(user)" v-bind:user="user" v-bind:task="task" />
        </b-tab>
        <b-tab title="Chat">
          <!-- <pre style="color: black;">
            {{ task }}
          </pre> -->
          <task-message class="task-cloud_task-message" :chat="chat"> </task-message>
        </b-tab>
      </b-tabs>
    </div>
    <div class="center-section">
      <draggable class="tab">
        <button class="tablinks" :class="{ active: resource.name === selected_tab }" v-for="resource in getResources" :key="resource.id" @click="openTab(resource.name)">
          {{ resource.name }}
        </button>
      </draggable>
      <div v-for="resource in getResources" :key="resource.id" :id="resource.name">
        <div v-if="resource.name === selected_tab" class="d-flex justify-content-between align-items-center">
          <label class="docs-path" style="white-space: nowrap; overflow: hidden">{{ resource.href }}</label>
          <div style="float: right; display: inline-block; margin-bottom: 8px; margin-top: 5px" v-if="resource.href != ''">
            <b-button @click="copyURL(resource.href)" style="margin-right: 10px">Copy URL</b-button>
            <b-button @click="openURL(resource.href)">Open in a new tab</b-button>
          </div>
        </div>
        <iframe v-if="resource.name === selected_tab" :src="resource.href" style="height: calc(100vh - 155px); width: 100%"></iframe>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { EventBus } from '@/components/event-bus'
import draggable from 'vuedraggable'
import uuid from 'uuid'

export default Vue.extend({
  name: 'task-detail',
  components: {
    'task-card': () => import('@/components/ui/TaskCard.vue'),
    'edit-task-modal-user': () => import('@/views/EditTaskModalUser.vue'),
    'task-message': () => import('@/views/TaskMessage.vue'),
    draggable
  },
  props: {
    task: {
      type: Object,
      required: false,
      default: () => {}
    }
  },
  data() {
    return {
      selected_resource: '',
      isEditResource: null,
      selectedFile: null,
      selected_tab: '',
      chat: {},
      showTab: 0
    }
  },
  computed: {
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
    getResources() {
      // return this.task.settings
      if (this.task && this.task.settings && this.task.settings.resources && this.task.settings.resources.length) {
        return this.task.settings.resources
      } else {
        return []
      }
    }
  },
  watch: {
    '$route.query': {
      immediate: true,
      handler(query) {
        if (query.task && Object.keys(query.task).length > 0) {
          this.getChat(query.task)
        }

        if (query.showChat && query.showChat === 'true') {
          this.showTab = 1
        }
      }
    }
  },
  methods: {
    async getChat(task_id) {
      if (!task_id) {
        this.chat = []
      }

      const { chat } = await this.$http().get(`/chat/${task_id}`)
      this.chat = chat
    },
    async addResource() {
      // add or update action
      console.log(this.task)
      if (!this.task.settings) {
        this.task.settings = {}
        await Vue.set(this.task.settings, 'resources', [])
      }
      if (!this.isEditResource) {
        // if add new resource
        this.task.settings.resources.push({
          name: document.getElementById('add-resource-name').value,
          href: document.getElementById('add-resource-href').value
        })
        document.getElementById('add-resource-name').value = ''
        document.getElementById('add-resource-href').value = ''
        await this.saveTask(false)
      } else {
        // if edit resource
        let me = this
        let index = await this.task.settings.resources.findIndex(function(item, i) {
          return item == me.selected_resource
        })
        if (index != -1) console.log(index)

        this.task.settings.resources[index].name = document.getElementById('add-resource-name').value
        this.task.settings.resources[index].href = document.getElementById('add-resource-href').value
      }
      console.log(this.task)
    },
    async saveTask(isRedirect = true) {
      // NOTE: uncommented temporarily since it fails to do the UPSERT with module tasks
      // await this.$store.dispatch('UPSERT', { module: 'tasks', entity: this.task })

      // console.log(this.$route.query)
      if (isRedirect) {
        this.isEditResource = null
        // EventBus.$emit('showTask', null)

        if (this.$route.query && Object.keys(this.$route.query).length > 0) {
          let query = Object.assign({}, this.$route.query)
          delete query.task
          delete query.showChat
          delete query.showChatSection
          await this.$router.replace({ query })
        }
        // will only delete the "task" in $router.query

        // this.$router.replace({ query })

        // this.task = false
        // this.$router.push({ name: 'Task Cloud' })
      }
    },
    async deleteTask() {
      this.$store.dispatch('DELETE', { module: 'tasks', entity: this.task })
      if (this.$route.query && Object.keys(this.$route.query).length > 0) {
        let query = Object.assign({}, this.$route.query)
        delete query.task
        delete query.showChat
        delete query.showChatSection
        await this.$router.replace({ query })
      }
      // await EventBus.$emit('showTask', {})

      // this.task = false
    },
    async completeTask() {
      this.task.status = 'completed'
      this.$store.dispatch('UPSERT', { module: 'tasks', entity: this.task })
      // await EventBus.$emit('showTask', {})
      // this.task = false
    },
    onSelectResource(resource) {
      this.selected_resource = resource
      this.isEditResource = true
      document.getElementById('add-resource-name').value = resource.name
      document.getElementById('add-resource-href').value = resource.href
      this.openTab(resource.name)
    },
    onDeleteResource(resource) {
      let index = this.task.settings.resources.findIndex(function(item, i) {
        return item == resource
      })
      if (index != -1) this.task.settings.resources.splice(index, 1)
    },
    onAddNewResource() {
      this.isEditResource = false
    },
    client_name: function(client_id) {
      let client = this.$store.getters['clients/getById'](client_id)
      return client ? client.name : ''
    },
    Images_onFileChanged(event) {
      console.log('adding file')
      this.selectedFile = event.target.files[0]
    },
    task_user(company_user) {
      // let self = this
      let userTask = this.$store.state.task_users.task_users.find(task_user => {
        if (task_user.task_id !== this.task.id) return false
        return task_user.company_user_id === company_user.id
      })

      return userTask !== -1 ? userTask : false
    },
    openTab(resourceName) {
      this.selected_tab = resourceName
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
    openprojects: function(client) {
      //console.log('client', client)
      return this.$store.getters['projects/getOpenCompanyProjects'](client.client_company_id)
    },
    Images_onUpload() {
      const mypostparameters = new FormData()
      mypostparameters.append('image', this.selectedFile, this.selectedFile.name)
      mypostparameters.append('project_id', this.task.project_id)
      mypostparameters.append('task_id', this.task.id)
      this.$http().post('/files/add', mypostparameters)
    },
    // I just commented this for now since this function is not used but showing terminal warnings
    // switchAssignedUser(company_user_id) {
    //   const task_user = {
    //     id: uuid.v4(), //TODO: check for existing record?
    //     task_id: this.task.id,
    //     company_user_id: company_user_id,
    //     role: 'assigned'
    //   }
    //   //
    //   // if (role) {
    //   //   this.$emit('change', { message: this.user.name + ' given role of ' + role + ' by current user' })
    //   //   this.$store.dispatch('UPSERT', { module: 'task_users', entity: task_user }, { root: true })
    //   // } else {
    //   //   this.$emit('change', { message: this.user.name + ' removed from task by current user' })
    //   //   this.$store.dispatch('DELETE', { module: 'task_users', entity: task_user }, { root: true })
    //   // }

    //   // Get all elements with class="tablinks" and remove the class "active"
    //   let tablinks = document.getElementsByClassName('tablinks')
    //   console.log(tablinks)

    //   for (let i = 0; i < tablinks.length; i++) {
    //     tablinks[i].className = tablinks[i].className.replace(' active', '')
    //     console.log(tablinks[i].innerHTML.trim(), resourceName)
    //     if (tablinks[i].innerHTML.trim() == resourceName) {
    //       tablinks[i].className += ' active'
    //     }
    //   }
    //   this.$store.dispatch('UPSERT', { module: 'task_users', entity: task_user }, { root: true })
    // },
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
    onEsc(evnt) {
      let key = evnt.key || evnt.keyCode
      if (key === 'Escape' || key === 'Esc' || key === 27) {
        this.saveTask()
      }
    }
  },
  async created() {
    if (!!this.getResources.length) {
      this.openTab(this.getResources[0].name)
    }
  },
  mounted() {
    window.addEventListener('keyup', this.onEsc)
  },
  beforeDestroy() {
    window.removeEventListener('keyup', this.onEsc)
  }
})
</script>

<style lang="scss">
#task-detail {
  overflow-y: auto;
  background-color: white;
  display: flex;
}
.center-section {
  margin-top: 10px;
  width: 100%;
}
.show-task {
  background-color: white;
  display: flex;
  /* height: 100vh;
  width: 100vw; */
}

.left-section {
  max-width: 300px;
  width: 100%;
  padding: 0 10px;
  height: calc(100vh - 50px);
  overflow-y: auto;
  color: white;
  position: relative;
}

.task-detail-top-buttons {
  display: flex;
  justify-content: space-between;
  position: sticky;
  top: 0;
  width: 100%;
  background-color: white;
  padding: 5px 15px 5px 0;
  z-index: 10;
}
.task-detail-top-buttons .action-button {
  font-size: 13px;
}

#task-detail .form-group label {
  white-space: nowrap;
}
</style>
