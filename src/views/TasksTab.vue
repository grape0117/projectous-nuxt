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
    <b-modal id="update-status-modal" class="update-status-modal" style="min-height: 500px" :size="'lg'" @ok="updateUserStatus" @hidden="hide">
      <template #modal-header>
        <div class="header">
          <div class="d-flex justify-content-between">
            <h5>Update Status</h5>
          </div>
        </div>
      </template>
      <div no-body>
        <div class="form">
          <b-form-group id="fieldset-assign-user" description="Let us know your name." label="User:" label-for="assign-user" valid-feedback="Thank you!" :invalid-feedback="invalidFeedback" :state="state">
            <v-select :options="companyUsers()" @input="changeUser" :reduce="user => user.id" label="name" :filter-by="searchUsers" v-model="selected_user" placeholder="Select a user" id="assign-user">
              <template v-slot:option="option"> - {{ option.name }} </template>
            </v-select>
          </b-form-group>
          <b-form-group id="fieldset-step" :description="steps.join()" label="Step:" label-for="step" valid-feedback="Thank you!" :invalid-feedback="invalidFeedback" :state="state">
            <vue-bootstrap-typeahead id="step" v-model="selected_step" :minMatchingChars="1" :data="steps" @hit="selected_step = $event" @input="getCustomStep" @keyup.enter="getCustomStep" ref="typeahead" />
          </b-form-group>
          <b-form-group id="fieldset-statu" description="Let us know your name." label="Status:" label-for="step-status" valid-feedback="Thank you!" :invalid-feedback="invalidFeedback" :state="state">
            <v-select :options="status" @input="changeStatus" :reduce="user => user" label="name" :filter-by="searchStatus" v-model="selected_status" placeholder="Select a status" id="step-status">
              <template v-slot:option="option"> - {{ option.name }} </template>
            </v-select>
          </b-form-group>
          <b-form-group id="fieldset-notes" description="Let us know your name." label="Notes:" label-for="notes" valid-feedback="Thank you!" :invalid-feedback="invalidFeedback" :state="state">
            <div class="textarea-grow-wrap">
              <textarea name="text" id="notes" v-model="task_notes" @input="updateNotes"></textarea>
            </div>
          </b-form-group>
          <b-form-group id="fieldset-user-rate" description="Let us know your name." label="User Rate:" label-for="user-rate" valid-feedback="Thank you!" :invalid-feedback="invalidFeedback" :state="state">
            <b-form-input id="user-rate" v-model="user_rate" type="text" readonly="readonly"></b-form-input>
          </b-form-group>
        </div>
      </div>
    </b-modal>
    <b-modal id="add-user-modal" class="add-user-modal" style="min-height: 500px" :size="'lg'" @ok="assignUser" @hidden="hide">
      <template #modal-header>
        <div class="header">
          <div class="d-flex justify-content-between">
            <h5>Add developer</h5>
          </div>
        </div>
      </template>
      <div no-body>
        <div class="form">
          <b-form-group id="fieldset-assign-user" description="Let us know your name." label="User:" label-for="assign-user" valid-feedback="Thank you!" :invalid-feedback="invalidFeedback" :state="state">
            <v-select :options="companyUsers()" @input="changeUser" :reduce="user => user.id" label="name" :filter-by="searchUsers" v-model="selected_user" placeholder="Select a user" id="assign-user">
              <template v-slot:option="option"> - {{ option.name }} </template>
            </v-select>
          </b-form-group>
          <b-form-group id="fieldset-step" :description="steps.join()" label="Step:" label-for="step" valid-feedback="Thank you!" :invalid-feedback="invalidFeedback" :state="state">
            <vue-bootstrap-typeahead id="step" v-model="selected_step" :minMatchingChars="1" :data="steps" @hit="selected_step = $event" @input="getCustomStep" @keyup.enter="getCustomStep" ref="typeahead" />
          </b-form-group>
          <b-form-group id="fieldset-notes" description="Let us know your name." label="Notes:" label-for="notes" valid-feedback="Thank you!" :invalid-feedback="invalidFeedback" :state="state">
            <div class="textarea-grow-wrap">
              <textarea name="text" id="notes" v-model="task_notes" @input="updateNotes"></textarea>
            </div>
          </b-form-group>
          <b-form-group id="fieldset-user-rate" description="Let us know your name." label="User Rate:" label-for="user-rate" valid-feedback="Thank you!" :invalid-feedback="invalidFeedback" :state="state">
            <b-form-input id="user-rate" v-model="user_rate" type="text" readonly="readonly"></b-form-input>
          </b-form-group>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import TasksTabRow from './TasksTabRow'
import UserTaskRow from './UserTaskRow'
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
      task_list: this.tasks
    }
  },
  watch: {
    tasks(newTasks, oldTasks) {
      this.task_list = this.tasks
    }
  },

  methods: {
    isAdmin() {
      return this.$store.getters['settings/isAdmin']
    },

    updateStatus(statusInfo) {
      const current_user_id = this.$store.state.settings.current_company_user_id
      const task_index = this.tasks.findIndex(task => task.id === statusInfo.task_id)
      const user_index = this.task_list[task_index].users.findIndex(user => user.company_user_id === current_user_id)
      this.task_list[task_index].users[user_index].status = statusInfo.status
    },
    updateNotes(e) {
      this.notes = e.target.value
    },
    companyUsers() {
      this.company_users = this.$store.getters['company_users/getActive']
      return this.company_users
    },
    async assignUser(bvModalEvent) {
      bvModalEvent.preventDefault()

      if (!this.selected_user) {
        alert('You must select a user')
        bvModalEvent.preventDefault()
        return
      }
      const task_progress_info = {
        task_id: this.selected_task,
        company_user_id: this.selected_user.id,
        step: this.selected_step || this.$refs.typeahead.inputValue,
        notes: this.task_notes
      }
      const result = await this.$http().post('/tasks-progress', task_progress_info)
      this.selected_task = null
      this.selected_user = null
      this.selected_step = null
      this.task_notes = null
      this.user_rate = ''
      alert(result.message)
      if (result.status === 'success') {
        const task_index = this.tasks.findIndex(task => task.id === this.selected_task)
        this.task_list[task_index].users = result.users
        this.$forceUpdate()
        this.$bvModal.hide('add-user-modal')
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
      bvModalEvent.preventDefault()

      if (!this.selected_user) {
        alert('You must select a user')
        bvModalEvent.preventDefault()
        return
      }
      const task_progress_info = {
        task_id: this.selected_task,
        company_user_id: this.selected_user.id,
        step: this.selected_step || this.$refs.typeahead.inputValue,
        notes: this.task_notes,
        status: this.selected_status
      }
      const result = await this.$http().post(`/tasks-progress/${this.selected_task}`, task_progress_info)
      if (result.status === 'success') {
        const task_index = this.tasks.findIndex(task => task.id === this.selected_task)
        this.tasks[task_index].users = result.user
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
      debugger
      const selected_user = this.company_users.filter(user => user.id === user_info.company_user_id)[0]
      this.selected_user = selected_user
      this.user_rate = selected_user.default_user_rate
      this.selected_step = user_info.step
      this.task_notes = user_info.notes
      this.selected_task = user_info.task_id
      this.$bvModal.show('update-status-modal')
    },
    showModal(task_id) {
      this.selected_task = task_id
      this.$bvModal.show('add-user-modal')
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
</style>
