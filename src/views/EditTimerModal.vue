<template>
  <b-modal id="timer-modal" tabindex="-1" :title="title" class="modal fade" role="dialog" @ok="saveTimer" @hidden="close">
    <!-- <template v-slot:modal-header="{ ok, cancel }"> </template> -->
    <!-- <div class="col-sm-8">
      <select name="user_id" id="timerUserSelect" class="form-control" v-model="timer.company_user_id">
        <option value="">***** Select User *****</option>
        <option :selected="isTimerUser(user.user_id)" v-for="user in users.filter(u => u.user_type === 'user')" :key="user.id" v-bind:value="user.user_id">
          {{ user.name }}
          {{ isTimerUser(user.id) }}
        </option>
        <option>Selected or Current User if Editing Timer?</option>
      </select>
    </div> -->
    <div class="tab-content">
      <div role="tabpanel" class="tab-pane active" id="timerEditTabShow">
        <form id="editTimerForm" class="form-horizontal">
          <input id="modalTimerId" type="hidden" name="id" v-model="timer.id" />
          <div class="form-group">
            <label class="control-label col-sm-4" for="timer-modal-project-id">Project: </label>
            <div class="col-sm-12">
              <select id="timer-modal-project-id" class="form-control" name="project_id" v-model="timer.project_id">
                <option :value="null">***** Select Project *****</option>
                <option value="create">Create New Project</option>
                <option v-for="(project, projectIndex) in openprojects()" :key="projectIndex" v-bind:project="project" :value="project.id">
                  {{ client_name(project.client_company_id) }} -
                  {{ project.name }}
                </option>
              </select>
            </div>
            <div class="col-sm-2 edit-ClientProject">
              <a v-on:click="editClient()" class="edit-ClientProject-a-tag">Edit Client</a>
              <a v-on:click="editProject()" class="edit-ClientProject-a-tag">Edit Project</a>
            </div>
          </div>
          <div class="form-group">
            <timer-modal-time-standard v-if="!isIHI()" v-bind:timer="timer" @update-duration="updateDuration" @update-invoice-duration="updateInvoiceDuration"></timer-modal-time-standard>
          </div>
          <div class="form-group">
            <label class="control-label col-sm-4" for="timerUserNotes">Notes: </label>
            <div class="timer-modal_notes" style="padding-left: 14px">
              <div contenteditable="true" id="timerUserNotes" class="form-control" style="min-height: 60px; height: auto;" v-html="checkNotes(timer.notes)" @blur="setNotes"></div>
            </div>
          </div>

          <div class="form-group">
            <span class="set-button" :style="{ 'background-color': !showInvoiceNotes ? '#6c8eff' : '#231F20' }" @click="clearInvoiceNotes()">
              Set Invoice Notes
            </span>
            <span class="set-button" :style="{ 'background-color': !showAdminNotes ? '#6c8eff' : '#231F20' }" @click="clearAdminNotes()">
              Set Admin Notes
            </span>
          </div>
          <!-- [ Set Invoice Notes ] [ Set Admin Notes (internal company notes, not visible to client) ] -->
          <div v-if="isAdmin" class="form-group">
            <label v-if="showInvoiceNotes" class="control-label col-sm-4" for="timerInvoiceNotes">Invoice Notes: </label>
            <div v-if="showInvoiceNotes" class="col-sm-12 invoice-notes" style="padding-right: 0;">
              <div contenteditable="true" id="timerInvoiceNotes" class="form-control" style="min-height: 60px; max-height: 90px; overflow-y: auto;" v-html="getInvoiceNotes" @blur="setInvoiceNotes"></div>
              <div class="clear-set-input">
                <a href="javascript:void(0)" @click="clearInvoiceNotes">Clear and hide</a>
              </div>
            </div>
          </div>

          <!-- Admin Notes: (visible to users, not clients) -->
          <div v-if="isAdmin" class="form-group">
            <label v-if="showAdminNotes" class="control-label col-sm-4" for="timerInvoiceNotes">Admin Notes:</label>
            <div v-if="showAdminNotes" class="col-sm-12" style="padding-right: 0;">
              <div contenteditable="true" id="timerAdminNotes" class="form-control" style="min-height: 60px; max-height: 90px; overflow-y: auto" v-html="getAdminNotes" @blur="setAdminNotes"></div>
              <div class="clear-set-input">
                <a href="javascript:void(0)" @click="clearAdminNotes">Clear and hide</a>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="control-label col-sm-4" for="timerTaskSelect">Task: </label>
            <div class="col-sm-8">
              <select name="task_id" id="timerTaskSelect" class="form-control" v-model="timer.task_id">
                <option value="0">***** Select Task *****</option>
                <option v-for="task in projecttasks(timer.project_id)" :value="task.id" :key="task.id">{{ task.title }}</option>
              </select>
            </div>
          </div>
          <div v-if="isAdmin" class="form-group">
            <label class="control-label col-sm-4" for="timerUserSelect">User: </label>
            <div class="col-sm-8">
              <select name="user_id" id="timerUserSelect" class="form-control" v-model="timer.company_user_id">
                <option value="">***** Select User *****</option>
                <option :selected="isTimerUser(user.id)" v-for="user in users.filter(u => u.user_type === 'user')" :key="user.id" :value="user.id">
                  {{ user.name }}
                </option>
                <option>Selected or Current User if Editing Timer?</option>
              </select>
            </div>
          </div>
          <div v-if="isAdmin" class="form-group">
            <label class="control-label col-sm-4" for="timerUserTime">Is billable? </label>
            <div class="col-sm-8">
              <div class="checkbox">
                <label>
                  <input name="is_billable" type="checkbox" id="blankCheckbox" value="1" v-model="timer.is_billable" aria-label="..." />
                </label>
              </div>
            </div>
          </div>
          <div v-if="isAdmin" class="form-group">
            <label class="control-label col-sm-4" for="report_at">User Rate: </label>
            <div class="col-sm-8">
              <input name="user_rate" type="datetime" id="user_rate" :placeholder="user_rate_placeholder()" class="form-control" :value="user_rate_value()" />
            </div>
          </div>
          <div v-if="isAdmin" class="form-group">
            <label class="control-label col-sm-4" for="client_rate">Client Rate: </label>
            <div class="col-sm-8">
              <input name="client_rate" type="datetime" id="client_rate" :placeholder="client_rate_placeholder()" class="form-control" :value="client_rate_value()" />
            </div>
          </div>
          <!-- <div class="form-group">
            <label class="control-label col-sm-4" for="timerUserNotes">Notes: </label>
            <div class="col-sm-8">
              <div contenteditable="true" id="timerUserNotes" class="form-control" style="height: auto; min-height: 35px;" v-html="checkNotes(timer.notes)" @blur="setNotes"></div>
            </div>
          </div> -->

          <div class="form-group">
            <label class="control-label col-sm-4" for="report_at">Started at: </label>
            <div class="col-sm-8">
              <input name="report_at" type="datetime" id="report_at" class="form-control" v-model="timer.report_at" />
            </div>
          </div>
          <!--          <div v-if="isIHI()" class="form-group">
            <label class="control-label col-sm-4" for="timerUserTime">Date: </label>
            <div class="col-sm-8">
              <input type="date" id="timerUserDate" class="form-control" :value="timerDate()" />
            </div>
          </div>-->
          <!-- <timer-modal-time-standard v-if="!isIHI()" v-bind:timer="timer"></timer-modal-time-standard> -->

          <!--<div v-if="isIHI()" class="form-group row">
            <label for="projectName" class="control-label labelLeft col-sm-4" style="line-height:46px;">Start: </label>
            <div class="col-sm-8 fieldRight">
              <div id="timesSliderStart" class="carousel timesSlider slide" data-ride="carousel" data-interval="false">
                <div class="carousel-inner" role="listbox">
                  <timer-fifteen-template @setstarttime="setStartTime" v-bind:timer="timer" v-bind:type="'start'" v-bind:compareto="'endSeconds'" v-bind:hour="hour" v-for="hour in startHours()" :key="hour" v-bind:minute="'15'"></timer-fifteen-template>
                </div>
                <a class="carousel-control-prev" href="#timesSliderStart" role="button" data-slide="prev">
                  <i class="glyphicon glyphicon-chevron-left" aria-hidden="true"></i>
                  <span class="sr-only"></span>
                </a>
                <a class="carousel-control-next" href="#timesSliderStart" role="button" data-slide="next">
                  <i class="glyphicon glyphicon-chevron-right" aria-hidden="true"></i>
                  <span class="sr-only"></span>
                </a>
              </div>
            </div>
          </div>
          <div v-if="isIHI()" class="form-group row">
            <label for="projectName" class="control-label labelLeft col-sm-4" style="line-height:46px;">End: </label>
            <div class="col-sm-8 fieldRight">
              <div id="timesSliderEnd" class="carousel timesSlider slide" data-ride="carousel" data-interval="false">
                <div class="carousel-inner" role="listbox">
                  <timer-fifteen-template v-on:setendtime="setendtime" v-bind:timer="timer" v-bind:type="'end'" v-bind:compareto="'startSeconds'" v-bind:hour="hour" v-for="hour in endHours()" :key="hour" v-bind:minute="'15'"></timer-fifteen-template>
                </div>
                <a class="carousel-control-prev" href="#timesSliderEnd" role="button" data-slide="prev">
                  <i class="glyphicon glyphicon-chevron-left" aria-hidden="true"></i>
                  <span class="sr-only"></span>
                </a>
                <a class="carousel-control-next" href="#timesSliderEnd" role="button" data-slide="next">
                  <i class="glyphicon glyphicon-chevron-right" aria-hidden="true"></i>
                  <span class="sr-only"></span>
                </a>
              </div>
            </div>
          </div>-->
        </form>
      </div>
      <div role="tabpanel" class="tab-pane" id="timerTableTab">
        <table class="table timer-table">
          <tbody>
            <tr class="row-date">
              <td>Notes</td>
              <td>RestartedAt</td>
              <td>Status</td>
              <td>UpdatedAt</td>
            </tr>
            <tr v-bind:history="history" v-for="history in timer.histories" :key="history" is="timelog-history-row"></tr>
          </tbody>
        </table>
      </div>
    </div>
    <template v-slot:modal-footer="{ ok, cancel }">
      <button style="float: left" class="btn btn-danger" @click="deleteTimer">Delete</button>
      <button class="btn btn-info" @click="ok()">Save</button>
      <button class="btn" @click="cancel()">Cancel</button>
    </template>
  </b-modal>
</template>

<script>
import TimerModalTimeStandard from './TimerModalTimeStandard.vue'
import TimerFifteenTemplate from './TimerFifteenTemplate.vue'
import Vue from 'vue'

export default {
  name: 'timer-modal',
  components: {
    'timer-modal-time-standard': TimerModalTimeStandard,
    'timer-fifteen-template': TimerFifteenTemplate
  },
  data: function() {
    return {
      startSeconds: '',
      endSeconds: '',
      showInvoiceNotes: false,
      showAdminNotes: false
    }
  },
  computed: {
    title() {
      if (this.editTimerStatus === 'add') {
        return 'Add Timer'
      }
      return 'Edit Timer'
    },
    editTimerStatus() {
      return this.$store.state.settings.current_edit_timer_status
    },
    getInvoiceNotes() {
      let invoice_notes = this.timer.invoice_notes
      if (invoice_notes) return invoice_notes
      return ''
    },
    getAdminNotes() {
      let admin_notes = this.timer.admin_notes
      if (admin_notes) return admin_notes
      return ''
    },
    isAdmin: function() {
      return this.$store.getters['settings/isAdmin']
    },
    timer: function() {
      return this.$store.state.settings.current_edit_timer
    },
    users: function() {
      return this.$store.state.company_users.company_users //TODO: include inactive user if user is on the timer? And a checkbox for showing inactive users?
    },
    current_company_user: function() {
      return this.$store.state.settings.current_company_user
    },
    current_timer: function() {
      return this.$store.state.settings.current_edit_timer
    },
    departments: function() {
      return this.$store.state.timers.departments
    },
    systems: function() {
      return this.$store.state.timers.systems
    },
    actions: function() {
      return this.$store.state.timers.actions
    },
    my_companies: function() {
      return this.$store.state.companies.companies //TODO
    },
    clients: function() {
      const clients = this.$store.getters['clients/getActiveCompanyClients']
      return clients
    }
  },
  mounted: function() {
    // let self = this
    // $('#timer-modal').on('hidden.bs.modal', function() {
    //   self.$store.dispatch('settings/closedModal')
    // })
  },
  watch: {
    'timer.project_id': function() {
      if (this.timer.project_id === 'create') {
        this.$store.dispatch('settings/closeModal', {
          modal: 'timer',
          object: this.timer,
          pop: false,
          push: true
        })
        this.$store.dispatch('projects/createProject')
      }
    }
  },
  methods: {
    updateDuration(duration) {
      this.timer.duration = duration
    },
    updateInvoiceDuration(invoice_duration) {
      this.timer.invoice_duration = invoice_duration
    },
    close() {
      this.$store.commit('settings/setCurrentEditTimerStatus', null)
    },
    clearInvoiceNotes() {
      this.showInvoiceNotes = !this.showInvoiceNotes
      this.timer.invoice_notes = null
    },
    clearAdminNotes() {
      this.showAdminNotes = !this.showAdminNotes
      this.timer.admin_notes = null
    },
    client_rate_placeholder: function() {
      return this.timer.default_client_rate
    },
    client_rate_value: function() {
      return this.timer.default_client_rate != this.timer.client_rate ? this.timer.client_rate : ''
    },
    user_rate_placeholder: function() {
      return this.timer.default_user_rate
    },
    user_rate_value: function() {
      return this.timer.default_user_rate != this.timer.user_rate ? this.timer.user_rate : ''
    },
    isBillable: function() {
      return this.timer.is_billable == 1 ? 'checked' : ''
    },
    checkNotes: function(notes) {
      if (notes) {
        return notes
      } else {
        return ''
      }
    },
    invoiceDurationHours: function() {
      if (!this.timer.invoice_duration) this.timer.invoice_duration = this.timer.duration
      if (typeof this.timer.invoice_duration !== 'number') {
        return ''
      }
      return Math.floor(this.timer.invoice_duration / 3600)
    },
    invoiceDurationMinutes: function() {
      if (!this.timer.invoice_duration) this.timer.invoice_duration = this.timer.duration
      if (typeof this.timer.invoice_duration !== 'number') {
        return ''
      }
      return ('00' + Math.floor((this.timer.invoice_duration % 3600) / 60)).slice(-2)
    },
    invoiceDurationSeconds: function() {
      if (!this.timer.invoice_duration) this.timer.invoice_duration = this.timer.duration
      if (typeof this.timer.invoice_duration !== 'number') {
        return ''
      }
      return Math.floor(this.timer.invoice_duration % 60)
    },
    isIHI: function() {
      return this.$store.getters['settings/isIHI']
    },
    openprojects: function() {
      return this.$store.getters['projects/getOpenProjectsSortedByClient']
    },
    calculateDuration: function() {
      this.timer.duration = this.endSeconds - this.startSeconds
    },
    isTimerAction: function(action_id) {
      return action_id == this.timer.action_id
    },
    isTimerDepartment: function(department_id) {
      return department_id == this.timer.department_id
    },
    isTimerSystem: function(system_id) {
      return system_id == this.timer.system_id
    },
    isTimerTask: function(task_id) {
      return task_id == this.timer.task_id
    },
    projecttasks: function(project_id) {
      return this.$store.getters['tasks/getByProjectId'](project_id)
    },
    isCurrentUserOrAdmin: function() {
      return this.$store.getters['settings/isCurrentUserOrAdmin'](this.timer.user_id)
    },
    deleteTimer: async function() {
      await this.$store.dispatch('DELETE', { module: 'timers', entity: this.timer })
      await this.$store.commit('settings/setCurrentEditTimer', {})
    },
    durationHours: function() {
      if (typeof this.timer.duration != 'number') {
        return ''
      }
      return Math.floor(this.timer.duration / 3600)
    },
    durationMinutes: function() {
      if (typeof this.timer.duration != 'number') {
        return ''
      }
      return ('00' + Math.floor((this.timer.duration % 3600) / 60)).slice(-2)
    },
    durationSeconds: function() {
      if (typeof this.timer.duration != 'number') {
        return ''
      }
      return ('00' + Math.floor(this.timer.duration % 60)).slice(-2)
    },
    editProject: function() {
      this.$store.dispatch('settings/closeModal', {
        modal: 'timer',
        object: this.timer,
        pop: false,
        push: true
      })
      this.$store.dispatch('settings/editProject', this.timerProject())
    },
    editClient: function() {
      this.$store.dispatch('settings/closeModal', {
        modal: 'timer',
        object: this.timer,
        pop: false,
        push: true
      })
      this.$store.dispatch('clients/editClient', this.timerClient())
      this.$store.commit('settings/setCheckModalStack', true)
    },
    timerClient: function() {
      let timerProject = this.timerProject()
      return this.$store.getters['clients/getByClientCompanyId'](timerProject.client_id)
    },
    timerProject: function() {
      return this.$store.getters['projects/getById'](this.timer.project_id)
    },
    isTimerProjectTask: function(project_id) {
      return this.timer.project_id === project_id
    },
    isTimerUser: function(id) {
      return this.timer.company_user_id === id
    },
    checkInputValue: function(input) {
      if (!input.length) {
        return true //Skip over elements that aren't part of the form
      } else if (input.val() === '') {
        return false
      } else if (input.val() == null) {
        return false
      }

      return true
    },
    setNotes(e) {
      let notes = e.target.innerHTML
      this.timer.notes = notes
    },
    setInvoiceNotes(e) {
      let invoiceNotes = e.target.innerHTML
      if (!invoiceNotes) return (this.timer.invoice_notes = '')
      this.timer.invoice_notes = invoiceNotes
    },
    setAdminNotes(e) {
      let adminNotes = e.target.innerHTML
      if (!adminNotes) return (this.timer.admin_notes = '')
      this.timer.admin_notes = adminNotes
    },
    async startTimer() {
      const { client_id, project_id, task_id, report_at } = this.timer

      await this.$store.dispatch('timers/startTimer', {
        current_company_id: this.$store.state.settings.current_company.id,
        client_id: client_id,
        project_id: project_id,
        task_id: task_id,
        is_billable: 1,
        report_at: report_at
      })
    },

    async saveTimer() {
      if (this.timer.project_id) {
        let project = this.$store.getters['projects/getById'](this.timer.project_id)
        if (project) {
          let client = this.$store.getters['clients/getByClientCompanyId']()
          if (client) {
            this.timer.client_id = client.id
          }
        }
      }

      let result = this.$store.dispatch('timers/saveTimer', this.timer)
      console.log('result')
      console.log(result)

      if (this.editTimerStatus === 'add') {
        this.startTimer()
      }
    },
    client_name: function(client_company_id) {
      let client = this.$store.getters['clients/getByClientCompanyId'](client_company_id)
      return client ? client.name : ''
    }
  }
}
</script>

<style lang="scss">
.timer-modal_header-section {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.edit-ClientProject {
  :first-child {
    margin-right: 5px;
  }
  .edit-ClientProject-a-tag {
    cursor: pointer;
    font-size: 14px;
    white-space: nowrap;
  }
}
.clear-set-input {
  display: flex;
  justify-content: flex-end;
  font-size: 14px;
}
.set-button {
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  padding: 5px 8px;
  margin-left: 14px;
  border-radius: 50px;
  color: white;
}
</style>
