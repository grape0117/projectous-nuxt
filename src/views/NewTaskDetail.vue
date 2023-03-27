<template>
  <div id="new-task-detail" v-if="task">
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
          <b-form-group style="margin-bottom: 0">
            <span class="field-title">Task:</span>
            <b-form-textarea class="task-textarea" type="text" v-model="task.title" placeholder="Task Title" rows="2" max-rows="4"> </b-form-textarea>
          </b-form-group>
          <b-form-group style="margin-bottom: 0">
            <span class="field-title">Notes:</span>
            <b-form-textarea class="task-textarea" type="text" v-model="task.note" placeholder="Notes" rows="2" max-rows="4"> </b-form-textarea>
          </b-form-group>
          <div class="form-section">
            <span class="field-title">Project:</span>
            <select id="timer-modal-project-id" class="form-control select2-select" name="project_id" v-model="task.project_id">
              {{
                task.project_id
              }}
              <option value="" selected>***** Select Project *****</option>
              <option value="create">Create New Project</option>
              <optgroup :label="client.name" v-bind:client="client" v-for="client in clients" :key="client.id">
                <option v-for="project in openprojects(client)" :key="project.id" v-bind:client="client" :value="project.id">{{ project.name }}</option>
              </optgroup>
            </select>
          </div>
          <span class="field-title">File:</span>
          <div class="file-drag-n-drop" :style="{ 'background-color': selectedFile.length ? '#d8e9f2' : null }" @drop="drop">
            <input v-show="false" type="file" multiple name="fields[assetsFieldHandle][]" id="assetsFieldHandle" @change="onChange" ref="file" accept=".pdf,.jpg,.jpeg,.png" />

            <label for="assetsFieldHandle" class="block cursor-pointer">
              <div class="drop-area">Drop or <span class="underline">click here</span> to upload files</div>
            </label>
            <ul class="mt-4" v-if="selectedFile.length" v-cloak>
              <li class="text-sm p-1" v-for="(file, index) in selectedFile" :key="index">{{ file.name }}<button class="remove-file-button ml-2" type="button" @click="remove(selectedFile.indexOf(file))" title="Remove file">remove</button></li>
            </ul>
          </div>

          <div class="form-group mt-5">
            <label class="field-title control-label col-sm-4">Task Type: </label>
            <div class="col-sm-12">
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
            <label class="field-title control-label col-sm-4" for="taskDueDate">Due Date: </label>
            <div class="col-sm-8">
              <input id="taskDueDate" class="form-control" type="date" name="due_at" placeholder="Due Date" v-model="task.due_date" />
            </div>
          </div>

          <div class="form-group">
            <label class="field-title control-label col-sm-4" for="taskEditEstimate">Estimate: </label>
            <div class="col-sm-8">
              <input id="taskEditEstimate" class="form-control" type="text" name="estimate" placeholder="Estimate" v-model="task.estimate" />
            </div>
          </div>

          <div class="form-group">
            <label class="field-title control-label col-sm-4" for="taskEditEstimate">Status: </label>
            <div class="col-sm-12">
              <select class="form-control" v-model="task.status">
                <option value="open">Open</option>
                <option value="turned-in">Turned-In</option>
                <option value="reviewed">Reviewed</option>
                <option value="completed">Completed</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div class="row without-margin d-flex justify-content-between">
            <p style="max-width: 100%; margin-bottom: 5px; font-weight: 700">Users:</p>

            <b-form-checkbox v-model="user_filter">
              Filter
            </b-form-checkbox>
          </div>
          <div v-for="user in active_users" :key="user.id">
            <edit-task-modal-user :filter="user_filter" @toggle="toggleUser" :task_user="task_user(user)" :user="user" :task="task" />
          </div>
        </b-tab>
        <b-tab title="Chat">
          <splitpanes class="default-theme " style="height: 100%">
            <pane min-size="30" max-size="50">
              <task-thread class="task-cloud_task-message" :chat="chat" :showChat="showTab == 1" :task="task" :thread_id="thread_id"> </task-thread>
            </pane>
            <pane min-size="30" v-if="showThread">
              <thread-message class="task-cloud_task-message" :chat="threadChat" :showChat="showTab == 1" :messageId="thread_message_id" :task_id="task.id" :thread_id="thread_id"> </thread-message>
            </pane>
          </splitpanes>
        </b-tab>
      </b-tabs>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { EventBus } from '@/components/event-bus'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import draggable from 'vuedraggable'
import uuid from 'uuid'

export default Vue.extend({
  name: 'new-task-detail',
  delimiters: ['${', '}'], // Avoid Twig conflicts
  components: {
    'task-card': () => import('@/components/ui/TaskCard.vue'),
    'edit-task-modal-user': () => import('@/views/EditTaskModalUser.vue'),
    'thread-message': () => import('@/views/ThreadMessage.vue'),
    'task-thread': () => import('@/views/TaskThread.vue'),
    'task-message': () => import('@/views/TaskMessage.vue'),
    multipane: () => MultiPane,
    'multipane-resizer': () => MultiPaneResizer,
    draggable,
    Splitpanes,
    Pane
  },
  props: {
    task: {
      type: Object,
      required: false,
      default: () => {}
    },
    newMessage: {
      type: Object,
      required: false,
      default: false
    },
    thread: null
  },
  data() {
    return {
      isEditUrl: false,
      selected_resource: '',
      isEditResource: null,
      selectedFile: [],
      selected_tab: '',
      chat: {},
      showTab: 1,
      newResource: false,
      user_filter: false,
      showThread: false,
      threadChat: {},
      thread_message_id: null,
      thread_id: null,
      task_id: null
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
          this.getChat(query.task, query.thread)
        }

        if (query.showChat && query.showChat === 'true') {
          this.showTab = 1
        }
      }
    },
    newMessage(newMessage, oldMessage) {
      this.chat.messages = [...this.chat.messages, newMessage]
    },
    thread(thread_id) {
      if (thread_id) {
        this.thread_id = thread_id
        this.showThread = true
      } else {
        this.showThread = false
        this.thread_id = null
      }
    }
  },
  methods: {
    saveResourceUrl(resource_index) {
      const new_url = this.$refs['resource-url'][0].value
      let resource_url = this.getResources[resource_index].href

      if (new_url === resource_url) {
        this.toggleIsEditUrl()
        return
      }

      this.getResources[resource_index].href = new_url
      this.toggleIsEditUrl()
    },
    setResourceUrl(e, url) {
      if (!this.isEditUrl) {
        e.target.value = url
      }
    },
    toggleIsEditUrl() {
      this.isEditUrl = !this.isEditUrl
    },
    toggleNewResource() {
      this.newResource = !this.newResource
    },
    async getChat(task_id, thread_id) {
      if (!task_id) {
        this.chat = []
      } else {
        this.chat = { messages: this.$store.getters['task_messages/getByTaskId'](task_id) }
      }
      const { chat } = await this.$http().get(`/chat-thread/${task_id}/${thread_id}`)

      this.chat = chat
      // this.$store.dispatch('task_messages/updateChats')
      this.$store.dispatch('PROCESS_INCOMING_DATA', { task_messages: chat.messages })
      this.$store.dispatch('tasks/updateChats')
    },
    async addResource() {
      if (!this.task.settings) {
        this.task.settings = {}
        await Vue.set(this.task.settings, 'resources', [])
      }
      if (!this.isEditResource) {
        this.task.settings.resources.push({
          name: document.getElementById('add-resource-name').value,
          href: document.getElementById('add-resource-href').value
        })
        document.getElementById('add-resource-name').value = ''
        document.getElementById('add-resource-href').value = ''
        await this.saveTask(false)
      } else {
        let me = this
        let index = await this.task.settings.resources.findIndex(function(item, i) {
          return item == me.selected_resource
        })
        if (index != -1) console.log(index)

        this.task.settings.resources[index].name = document.getElementById('add-resource-name').value
        this.task.settings.resources[index].href = document.getElementById('add-resource-href').value
      }
    },
    async saveTask(isRedirect = true) {
      this.task.files = this.selectedFile
      await this.$store.dispatch('UPSERT', { module: 'tasks', entity: this.task })
      if (isRedirect) {
        this.isEditResource = null

        if (this.$route.query && Object.keys(this.$route.query).length > 0) {
          let query = Object.assign({}, this.$route.query)
          delete query.task
          delete query.showChat
          delete query.showChatSection
          await this.$router.replace({ query })
        }
      }
      this.$store.dispatch('tasks/updateChats')
    },
    async deleteTask(e) {
      let to_delete = await this.$bvModal.msgBoxConfirm('Are you sure you want to delete?', {
        title: 'Please Confirm',
        size: 'md',
        buttonSize: 'sm',
        okVariant: 'danger',
        okTitle: 'YES',
        cancelTitle: 'NO',
        footerClass: 'p-2',
        hideHeaderClose: false,
        centered: true
      })

      if (to_delete) {
        this.$store.dispatch('DELETE', { module: 'tasks', entity: this.task })

        if (this.$route.query && Object.keys(this.$route.query).length > 0) {
          let query = Object.assign({}, this.$route.query)
          delete query.task
          delete query.showChat
          delete query.showChatSection
          await this.$router.replace({ query })
        }
      }
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
      return this.$store.getters['projects/getOpenCompanyProjects'](client.client_company_id)
    },
    Images_onUpload() {
      const mypostparameters = new FormData()
      mypostparameters.append('image', this.selectedFile, this.selectedFile.name)
      mypostparameters.append('project_id', this.task.project_id)
      mypostparameters.append('task_id', this.task.id)
      this.$http().post('/files/add', mypostparameters)
    },
    toggleUser(user) {
      const task_user_index = this.changed_task_users.findIndex(changed_task_user => {
        return changed_task_user.company_user_id === user.company_user_id
      })
      if (task_user_index !== -1) {
        this.changed_task_users[task_user_index].user_rate = user.user_rate
        this.changed_task_users[task_user_index].role = user.role
        this.changed_task_users[task_user_index].user_checked = user.user_checked
      } else {
        this.changed_task_users.push(user)
      }
    },
    onEsc(evnt) {
      let key = evnt.key || evnt.keyCode
      if (key === 'Escape' || key === 'Esc' || key === 27) {
        this.saveTask()
      }
    },
    onChange() {
      this.selectedFile = [...this.$refs.file.files]
    },
    remove(i) {
      this.selectedFile.splice(i, 1)
    },
    drop(event) {
      event.preventDefault()

      this.$refs.file.files = event.dataTransfer.files
      this.onChange()
      event.currentTarget.classList.add('bg-gray-100')
      event.currentTarget.classList.remove('bg-green-300')
    }
  },
  async created() {
    if (this.thread) {
      this.thread_id = this.thread
      this.showThread = true
    }
    if (!!this.getResources.length) {
      this.openTab(this.getResources[0].name)
    }
    EventBus.$on('show-thread', message => {
      this.thread_message_id = message.id
      this.showThread = true
    })
    EventBus.$on('open-thread', thread => {
      this.thread_id = thread.id
      this.showThread = true
    })
    EventBus.$on('close-thread', () => {
      this.showThread = false
      this.thread_id = null
    })
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
#new-task-detail {
  overflow-y: auto;
  background-color: white;
  display: flex;

  .form-control {
    border: transparent;
    padding: 0 !important;

    &:focus {
      box-shadow: none !important;
    }

    &::placeholder {
      color: rgba($color: #000000, $alpha: 0.4);
    }
  }

  .field-title {
    font-size: 12px;
    font-weight: bold;
  }
  .task-textarea {
    overflow-y: auto !important;
  }
}
.center-section {
  margin-top: 10px;
  width: 100%;
}
.show-task {
  background-color: white;
  display: flex;
}

.left-section {
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

.task-detail__add-button {
  background-color: #2323ff !important;
}
</style>

<style lang="scss" scoped>
.pointer {
  cursor: pointer;
}

.icon {
  &-check {
    font-size: 20px;
    color: yellowgreen;
  }

  &-delete {
    font-size: 20px;
    color: red;
  }

  &-copy {
    font-size: 20px;
  }

  &-open_in_new {
    font-size: 20px;
  }
}

.file-drag-n-drop {
  // p-12 bg-gray-100 border border-gray-300
  padding: 20px 12px;
  background-color: #ececec;
  border: 1px solid gray;
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;

  label {
    margin-bottom: 0 !important;
  }

  .drop-area {
    cursor: pointer;
    border: 1px dashed gray;
    width: 100%;
    padding: 5px;

    .underline {
      text-decoration: underline;
    }
  }

  .remove-file-button {
  }
}

[v-cloak] {
  display: none;
}

.splitpanes__pane {
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: Helvetica, Arial, sans-serif;
  color: rgba(255, 255, 255, 0.6);
}
</style>
