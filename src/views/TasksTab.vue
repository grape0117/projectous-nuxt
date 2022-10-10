<template>
  <!-- <div role="tabpanel" :class="'tab-pane active'" :id="'tab-' + tab">
    <div class="table-responsive">
      <table class="table timer-table">
        <thead>
          <tr class="row-date">
            <td>Client</td>
            <td>Project</td>
            <td>Task</td>
            <td>Assigned</td>
            <td>Actions</td>
            <td>Due</td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in tasks" v-bind:task="task" is="tasks-tab-row"></tr>
        </tbody>
      </table>
    </div>
  </div> -->

  <div class="row">
    <user-task-row v-for="task in task_list" v-bind:task="task" :isAdmin="isAdmin()" is="user-task-row" @showModal="showModal" @updateStatus="updateStatus" @showUpdateModal="showUpdateModal"></user-task-row>
    <b-modal v-model="show_udpate_status" id="update-status-modal" class="update-status-modal" style="min-height: 500px" :size="'lg'">
      <template #modal-header>
        <div class="header">
          <div class="d-flex justify-content-between">
            <h5></h5>
          </div>
        </div>
      </template>
      <div no-body>
        <div class="form">
          <v-select class="mb-5" :options="companyUsers()" @input="changeUser" :reduce="user => user.id" label="name" :filter-by="searchUsers" v-model="selected_user" placeholder="Select a user" id="assign-user">
            <template v-slot:option="option">{{ option.name }} </template>
          </v-select>

          <vue-bootstrap-typeahead class="mb-5" id="step" v-model="selected_step" :minMatchingChars="1" :data="steps" @hit="selected_step = $event" placeholder="Select a step" ref="updateStatusTypeahead" />

          <v-select class="mb-5" :options="status" @input="changeStatus" :reduce="user => user" label="name" :filter-by="searchStatus" v-model="selected_status" placeholder="Select a status" id="step-status">
            <template v-slot:option="option">{{ option.name }} </template>
          </v-select>

          <div class="textarea-grow-wrap mb-5">
            <textarea name="text" id="notes" v-model="task_notes" @input="updateNotes" placeholder="Notes:"></textarea>
          </div>

          <b-form-group id="fieldset-user-rate" label="User Rate:" label-for="user-rate">
            <b-form-input id="user-rate" v-model="user_rate" type="text" readonly="readonly"></b-form-input>
          </b-form-group>
        </div>
      </div>
      <div slot="modal-footer" class="w-100">
        <b-button variant="primary" size="md" class="float-right ml-2" @click="updateUserStatus">
          OK
        </b-button>
        <b-button variant="secondary" size="md" class="float-right ml-2" @click="show_udpate_status = false">
          Cancel
        </b-button>
        <b-button variant="outline-warning" size="md" class="float-right ml-2" @click="deleteStep">
          Delete Step
        </b-button>
      </div>
    </b-modal>
    <b-modal id="add-user-modal" v-model="show_add_user" class="add-user-modal" style="min-height: 500px" :size="'lg'">
      <template #modal-header>
        <div class="header">
          <div class="d-flex justify-content-between"></div>
        </div>
      </template>
      <div no-body>
        <div class="form">
          <b-form-group class="mb-5" id="fieldset-user-select" label="Select users:" label-for="select-user">
            <div class="d-flex" id="select-user">
              <span v-for="user in notAssignedUsers()" :title="user.name" @click="addUser(user.id)" :class="`ml-2 select-user ${assigned_users.indexOf(user.id) > -1 ? 'selected' : ''}`">
                <b-avatar :text="abbrName(user.name)" :style="{ 'background-color': getCompanyUserDetails(user.id).color }"></b-avatar>
              </span>
            </div>
          </b-form-group>
          <!-- <v-select class="mb-5" :options="companyUsers()" @input="changeUser" :reduce="user => user.id" label="name" :filter-by="searchUsers" v-model="selected_user" placeholder="Select a user" id="assign-user">
            <template v-slot:option="option"> - {{ option.name }} </template>
          </v-select> -->

          <vue-bootstrap-typeahead class="mb-5" id="step" placeholder="Select a step" v-model="selected_step" :minMatchingChars="1" :data="steps" @hit="selected_step = $event" ref="assignTypeahead" />
          <div class="textarea-grow-wrap mb-5">
            <textarea placeholder="Notes" name="text" id="notes" v-model="task_notes" @input="updateNotes"></textarea>
          </div>

          <b-form-group class="mb-5" id="fieldset-user-rate" label="User Rate:" label-for="user-rate">
            <b-form-input id="user-rate" v-model="user_rate" type="text" readonly="readonly"></b-form-input>
          </b-form-group>
        </div>
      </div>
      <div slot="modal-footer" class="w-100">
        <b-button variant="primary" size="md" class="float-right ml-2" @click="assignUser">
          OK
        </b-button>
        <b-button variant="secondary" size="md" class="float-right ml-2" @click="show_add_user = false">
          Cancel
        </b-button>
      </div>
    </b-modal>
  </div>
</template>

<script>
import TasksTabRow from './TasksTabRow'
import UserTaskRow from './UserTaskRow'
import { abbrName } from '@/utils/util-functions'
export default {
  props: ['tasks', 'tab'],
  name: 'tasks-tab',
  components: {
    'tasks-tab-row': TasksTabRow,
    'user-task-row': UserTaskRow
  },

  data() {
    return {
      company_users: [],
      steps: ['publish', 'test', 'get client feedback', 'notify client'],
      status: ['assigned', 'completed', 'in progressing'],
      notes: '',
      selected_user: null,
      selected_task: null,
      selected_step: null,
      selected_status: null,
      task_notes: '',
      user_rate: '0.00',
      task_list: this.tasks,
      show_add_user: false,
      show_udpate_status: false,
      assigned_users: [],
      working_users: []
    }
  },
  watch: {
    tasks(newTasks, oldTasks) {
      this.task_list = this.tasks
    }
  },

  methods: {
    addUser(user_id) {
      const user_index = this.assigned_users.indexOf(user_id)

      if (user_index > -1) {
        this.assigned_users.splice(user_index, 1)
      } else {
        this.assigned_users.push(user_id)
      }
    },
    makeToast(variant = null, content = '') {
      this.$bvToast.toast(content, {
        title: `${variant === 'success' ? 'Success' : 'Error'}`,
        variant: variant,
        solid: true
      })
    },
    isAdmin() {
      return this.$store.getters['settings/isAdmin']
    },
    abbrName,
    getCompanyUserDetails(company_user_id) {
      const user_details = this.$store.state.company_users.company_users.find(e => e.id === company_user_id)

      return user_details
    },
    updateStatus(statusInfo) {
      const current_user_id = this.$store.state.settings.current_company_user_id
      const task_index = this.tasks.findIndex(task => task.id === statusInfo.task_id)
      const user_index = this.task_list[task_index].users.findIndex(user => user.company_user_id === current_user_id)
      this.task_list[task_index].users[user_index].status = statusInfo.status
      this.makeToast('success', 'Status changed!')
    },
    updateNotes(e) {
      this.notes = e.target.value
    },
    companyUsers() {
      this.company_users = this.$store.getters['company_users/getActive']
      return this.company_users
    },
    notAssignedUsers() {
      this.company_users = this.$store.getters['company_users/getActive']
      const not_assigned_users = this.company_users.filter(user => this.working_users.indexOf(user.id) < 0)
      return not_assigned_users
    },
    async assignUser(bvModalEvent) {
      bvModalEvent.preventDefault()

      const task_progress_info = {
        task_id: this.selected_task,
        assigned_users: this.assigned_users,
        step: this.selected_step || this.$refs.assignTypeahead.inputValue,
        notes: this.task_notes
      }
      const result = await this.$http().post('/tasks-progress', task_progress_info)
      if (result.status === 'success') {
        this.makeToast('success', 'Assigned a user!')
        const task_index = this.tasks.findIndex(task => task.id === this.selected_task)
        this.task_list[task_index].users = result.users
        this.$forceUpdate()
        this.$bvModal.hide('add-user-modal')
        this.selected_task = null
        this.selected_user = null
        this.selected_step = null
        this.task_notes = null
        this.assigned_users = []
        this.user_rate = ''
      } else {
        this.makeToast('danger', result.message)
      }
    },
    changeUser(value) {
      const selected_user = this.company_users.filter(user => user.id === value)[0]
      this.user_rate = selected_user.default_user_rate
      this.selected_user = selected_user
    },
    searchUsers(option, label, search) {
      let search_value = search.toLowerCase()
      return option.name.toLowerCase().indexOf(search_value) > -1
    },
    changeStatus(status) {
      this.selected_status = status
    },
    searchStatus(option, label, search) {
      let search_value = search.toLowerCase()
      return option.toLowerCase().indexOf(search_value) > -1
    },
    async updateUserStatus(bvModalEvent) {
      if (!this.selected_user) {
        this.makeToast('danger', 'You must select a user')

        bvModalEvent.preventDefault()
        return
      }
      const task_progress_info = {
        task_id: this.selected_task,
        company_user_id: this.selected_user.id,
        step: this.selected_step || this.$refs.updateStatusTypeahead.inputValue,
        notes: this.task_notes,
        status: this.selected_status
      }
      const result = await this.$http().post(`/tasks-progress/${this.selected_task}`, task_progress_info)
      if (result.status === 'success') {
        this.makeToast('success', `Status changed to ${status}`)
        const task_index = this.tasks.findIndex(task => task.id === this.selected_task)
        const user_index = this.tasks[task_index].users.findIndex(user => user.company_user_id === result.user.company_user_id)
        let users = [...this.tasks[task_index].users]
        users[user_index] = { ...result.user }
        this.task_list[task_index].users = [...users]
        this.$forceUpdate()
        this.$bvModal.hide('update-status-modal')
        this.selected_task = null
        this.selected_user = null
        this.selected_step = null
        this.task_notes = null
        this.user_rate = ''
      } else {
        this.makeToast('Error', result.message)
      }
    },
    async deleteStep(bvModalEvent) {
      const title = this.$createElement('span', { class: ['text-info'] }, 'Delete step')
      const message = 'Are you sure want to delete this step?'
      const response = await this.$bvModal.msgBoxConfirm(message, {
        title: [title],
        noFade: true
      })
      if (!response) {
        return
      }

      const task_progress_info = {
        task_id: this.selected_task,
        company_user_id: this.selected_user.id
      }
      const result = await this.$http().post(`/tasks-progress/del/${this.selected_task}`, task_progress_info)
      if (result.status === 'success') {
        const task_index = this.tasks.findIndex(task => task.id === this.selected_task)
        const users = this.tasks[task_index].users.filter(user => user.company_user_id !== this.selected_user.id)
        this.tasks[task_index].users = users
        this.task_list = this.tasks
        this.$bvModal.hide('update-status-modal')
        this.selected_task = null
        this.selected_user = null
        this.selected_step = null
        this.task_notes = null
        this.user_rate = ''
      }
    },

    showUpdateModal(user_info) {
      const selected_user = this.company_users.filter(user => user.id === user_info.company_user_id)[0]
      this.selected_user = selected_user
      this.user_rate = selected_user.default_user_rate
      this.selected_step = user_info.step
      setTimeout(() => {
        this.$refs.updateStatusTypeahead.inputValue = user_info.step
      }, 500)
      this.task_notes = user_info.notes
      this.selected_task = user_info.task_id
      this.selected_status = user_info.status
      this.$bvModal.show('update-status-modal')
    },
    showModal(task_id) {
      this.selected_task = task_id
      this.selected_user = null
      this.selected_step = null
      this.task_notes = null
      this.user_rate = ''
      this.$bvModal.show('add-user-modal')
      const task_index = this.tasks.findIndex(task => task.id === task_id)
      this.working_users = this.task_list[task_index].users.map(user => user.company_user_id)
    }
  }
}
</script>

<style type="text/css">
.textarea-grow-wrap {
  display: grid;
}
.textarea-grow-wrap::after {
  content: attr(data-replicated-value) ' ';
  white-space: pre-wrap;
  visibility: hidden;
}
.textarea-grow-wrap > textarea {
  resize: none;
  overflow: hidden;
}
.textarea-grow-wrap > textarea,
.textarea-grow-wrap::after {
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  padding: 0.5rem;
  font: inherit;
  grid-area: 1 / 1 / 2 / 2;
}
.select-user:hover {
  cursor: pointer;
}
.select-user:hover > span,
.select-user.selected:hover > span {
  background-color: #28a745 !important;
}
.select-user.selected > span {
  /* background-color: #055718; */
}

.select-user.selected {
  position: relative;
}

.select-user.selected::before {
  background: url(../assets/icons/select.png) no-repeat;
  content: '';
  display: block;
  width: 20px;
  height: 20px;
  top: 0px;
  background-size: contain;
  left: 24px;
  position: absolute;
  z-index: 9;
}
</style>
