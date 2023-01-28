<template>
  <b-modal id="timer-modal" tabindex="-1" :title="title" class="modal fade" role="dialog" @ok="saveTimer" @hidden="close" @shown="updateButtonStyle()">
    <template #modal-title>
      <copy-url-template :link="timer_link" :title="title"></copy-url-template>
    </template>
    <div class="b-tabs">
      <div role="tabpanel" class="b-tab active" title="Details" id="timerEditTabShow">
        <!--START OF TAB IMPLEMENTATION-->
        <div class="row">
          <div class="col-sm-12">
            <div>
              <b-tabs content-class="mt-3 scrollable">
                <b-tab title="Details" active>
                  <form id="editTimerForm" class="form-horizontal">
                    <input id="modalTimerId" type="hidden" name="id" v-model="timer.id" />
                    <div class="form-group">
                      <label class="control-label col-sm-4" for="timer-modal-project-id">Project: </label>
                      <div class="col-sm-12">
                        <!-- <select id="timer-modal-project-id" class="form-control" name="project_id" v-model="timer.project_id">
                          <option :value="null">***** Select Project *****</option>
                          <option value="create">Create New Project</option>
                          <option v-for="(project, projectIndex) in openprojects()" :key="projectIndex" v-bind:project="project" :value="project.id">
                            {{ client_name(project.client_company_id) }} -
                            {{ project.name }}
                          </option> 
                        </select> -->
                        <v-select :options="openprojects()" :reduce="project => project.id" label="name" :filter-by="searchProject" v-model="timer_data.project_id" placeholder="Select a project">
                          <template slot="selected-option" slot-scope="option">
                            <div class="flex">
                              <div class="col">{{ client_name(option.client_company_id) }} - {{ option.name }}</div>
                            </div>
                          </template>
                          <template slot="option" slot-scope="option"> {{ client_name(option.client_company_id) }} - {{ option.name }} <b-badge v-if="option.is_new" variant="success">New</b-badge></template>
                        </v-select>
                      </div>
                      <!-- <div class="col-sm-2 edit-ClientProject">
                        <a v-on:click="editClient()" class="edit-ClientProject-a-tag">Edit Client</a>
                        <a v-on:click="editProject()" class="edit-ClientProject-a-tag">Edit Project</a>
                      </div> -->
                      <div class="col-sm-12">
                        <b-badge variant="primary" :style="buttonStyle" class="mr-1 mt-2" style="cursor: pointer;" @click="editClient()">Edit Client</b-badge>
                        <b-badge variant="primary" :style="buttonStyle" class="mr-1" style="cursor: pointer;" @click="editProject()">Edit Project</b-badge>
                        <b-badge variant="primary" :style="buttonStyle" class="mr-1" style="cursor: pointer;" @click="addProject()">Add Project</b-badge>
                      </div>
                    </div>
                    <div class="form-group">
                      <timer-modal-time-standard v-if="!isIHI()" v-bind:timer="timer_data" @update-duration="updateDuration" @update-invoice-duration="updateInvoiceDuration"></timer-modal-time-standard>
                    </div>

                    <div class="form-group">
                      <label class="control-label col-sm-4" for="timerUserNotes">Notes: </label>
                      <div class="timer-modal_notes" style="padding-left: 14px">
                        <b-form-textarea v-model="timer_data.notes" rows="2" max-rows="30" cols="300"></b-form-textarea>
                      </div>
                    </div>

                    <div v-if="isAdmin" class="form-group">
                      <label class="control-label col-sm-4" for="timerInvoiceId">Invoice Number:</label>
                      <input name="invoice_id" id="timerInvoiceId" v-model="timer_data.invoice_id" />
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
                        <b-form-textarea style="overflow-y: hidden;" v-model="timer_data.invoice_notes" rows="2" max-rows="30" cols="300"></b-form-textarea>
                        <div class="clear-set-input">
                          <a href="javascript:void(0)" @click="clearInvoiceNotes">Clear and hide</a>
                        </div>
                      </div>
                    </div>

                    <!-- Admin Notes: (visible to users, not clients) -->
                    <div v-if="isAdmin" class="form-group">
                      <label v-if="showAdminNotes" class="control-label col-sm-4" for="timerInvoiceNotes">Admin Notes:</label>
                      <div v-if="showAdminNotes" class="col-sm-12" style="padding-right: 0;">
                        <b-form-textarea style="overflow-y: hidden;" v-model="timer_data.admin_notes" rows="2" max-rows="30" cols="300"></b-form-textarea>
                        <div class="clear-set-input">
                          <a href="javascript:void(0)" @click="clearAdminNotes">Clear and hide</a>
                        </div>
                      </div>
                    </div>
                    <div class="form-group">
                      <label class="control-label col-sm-4" for="timerTaskSelect">Task: </label>
                      <div class="col-sm-8">
                        <select name="task_id" id="timerTaskSelect" class="form-control" v-model="timer_data.task_id">
                          <option value="0">***** Select Task *****</option>
                          <option v-for="task in projecttasks(timer_data.project_id)" :value="task.id" :key="task.id">{{ task.title }}</option>
                        </select>
                      </div>
                    </div>
                    <div v-if="isAdmin" class="form-group">
                      <label class="control-label col-sm-4" for="timerUserSelect">User: </label>
                      <div class="col-sm-8">
                        <select name="user_id" id="timerUserSelect" class="form-control" v-model="timer_data.user_id">
                          <option value="">***** Select User *****</option>
                          <option :selected="isTimerUser(company_user.user_id)" v-for="company_user in company_users.filter(u => u.user_type === 'user')" :key="company_user.id" :value="company_user.user_id">
                            {{ company_user.name }}
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
                            <input name="is_billable" type="checkbox" id="blankCheckbox" value="1" v-model="timer_data.is_billable" aria-label="..." />
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
                        <!-- <input name="report_at" type="datetime" id="report_at" class="form-control" v-model="timer_data.report_at" /> -->
                        <datetime input-id="started_at" type="datetime" v-model="timer_data.report_at" class="form-control" format="yyyy-MM-dd HH:mm:ss"></datetime>
                      </div>
                    </div>
                  </form>
                </b-tab>
                <b-tab title="History">
                  <div role="tabpanel" class="b-tab" id="timerTableTab">
                    <table class="table timer-table">
                      <tbody>
                        <tr class="row-date">
                          <td>Notes</td>
                          <td>Status</td>
                          <td>Duration</td>
                          <td>Updated</td>
                        </tr>
                        <tr v-for="h in history" :key="h.id">
                          <td>{{ h.notes }}</td>
                          <td>{{ h.status }}</td>
                          <td>{{ durationHours(h.duration) }}:{{ durationMinutes(h.duration) }}</td>
                          <td>{{ h.updated_at }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </b-tab>
              </b-tabs>
            </div>
          </div>
        </div>
        <!--END OF TAB IMPLEMENTATION-->

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
import CopyUrlTemplate from './CopyUrlTemplate.vue'
import Vue from 'vue'
import { getCookie, applyTheme } from '@/utils/util-functions'
import { cloneDeep, groupBy } from 'lodash'
import uuid from 'uuid'
import { Datetime } from 'vue-datetime'
import 'vue-datetime/dist/vue-datetime.css'
import moment from 'moment'

export default {
  name: 'timer-modal',
  components: {
    'timer-modal-time-standard': TimerModalTimeStandard,
    'timer-fifteen-template': TimerFifteenTemplate,
    'copy-url-template': CopyUrlTemplate,
    datetime: Datetime
  },
  data: function() {
    return {
      history: [],
      startSeconds: '',
      endSeconds: '',
      showInvoiceNotes: false,
      showAdminNotes: false,
      timer_link: null,
      buttonStyle: '',
      client: null,
      timer_data: {},
      started_at: null
    }
  },
  created() {
    this.buttonStyle = this.applyTheme()
  },
  computed: {
    title() {
      if (this.editTimerStatus === 'add') {
        this.timer_data.notes = ''
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
    company_users: function() {
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
    'timer.id': async function() {
      this.timer_data = { ...this.timer }
      const timezone = moment.tz.guess()
      let gmt_date = moment.tz(this.timer_data.report_at, 'GMT')
      let actual_datetime = gmt_date
        .clone()
        .tz(timezone)
        .format('YYYY-MM-DD HH:mm:ss')
      this.timer_data.report_at = new Date(actual_datetime).toISOString()

      this.buttonStyle = this.applyTheme()
      const timer_url = `${window.location.origin}?timer_id=${this.timer.id}`
      this.timer_link = timer_url
      const resp = await this.$http().get('/timer/' + this.timer.id + '/history')
      console.log(resp.history)
      resp.history.sort(function(a, b) {
        return b.id - a.id
      })
      this.history = resp.history
    },
    'timer.project_id': function() {
      const all_projects = this.openprojects()
      const project_id = this.timer.project_id
      if (!project_id) {
        return
      }
      const client_company_id = all_projects.filter(e => e.id == project_id)[0].client_company_id
      this.client = this.clients.filter(e => e.client_company_id == client_company_id)[0]

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
    applyTheme,
    updateDuration(duration) {
      this.timer_data.duration = duration
    },
    updateInvoiceDuration(invoice_duration) {
      this.timer_data.invoice_duration = invoice_duration
    },
    close() {
      this.$store.commit('settings/setCurrentEditTimerStatus', null)
    },
    clearInvoiceNotes() {
      this.showInvoiceNotes = !this.showInvoiceNotes
      this.timer_data.invoice_notes = null
    },
    clearAdminNotes() {
      this.showAdminNotes = !this.showAdminNotes
      this.timer_data.admin_notes = null
    },
    client_rate_placeholder: function() {
      return this.timer_data.default_client_rate
    },
    client_rate_value: function() {
      if (this.timer_data.invoice_id) {
        return this.timer_data.client_rate
      }
      return this.timer_data.default_client_rate != this.timer_data.client_rate ? this.timer_data.client_rate : ''
    },
    user_rate_placeholder: function() {
      return this.timer_data.default_user_rate
    },
    user_rate_value: function() {
      if (this.timer_data.invoice_id) {
        return this.timer_data.user_rate
      }
      return this.timer_data.default_user_rate != this.timer_data.user_rate ? this.timer_data.user_rate : ''
    },
    isBillable: function() {
      return this.timer_data.is_billable == 1 ? 'checked' : ''
    },
    checkNotes: function(notes) {
      if (notes) {
        return notes
      } else {
        return ''
      }
    },
    isIHI: function() {
      return this.$store.getters['settings/isIHI']
    },
    openprojects: function() {
      const result = this.$store.getters['projects/getOpenProjectsSortedByClient'] || []
      const projectsUniqueById = [...new Map(result.map(item => [item['id'], item])).values()]
      return projectsUniqueById
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
    durationHours(duration) {
      if (typeof duration === 'number') {
        return Math.floor(duration / 3600)
      }
      if (typeof this.timer.duration != 'number') {
        return ''
      }
      return Math.floor(this.timer.duration / 3600)
    },
    durationMinutes(duration) {
      if (typeof duration === 'number') {
        return ('00' + Math.floor((duration % 3600) / 60)).slice(-2)
      }
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
      // this.$store.dispatch('settings/closeModal', {
      //   modal: 'timer',
      //   object: this.timer,
      //   pop: false,
      //   push: true
      // })
      // console.log(timer_project.id)
      const timer_project = this.timerProject()
      this.$store.commit('settings/setCurrentEditProject', cloneDeep(timer_project))
      this.$store.commit('settings/setCurrentEditProjectStatus', 'edit')
    },
    editClient: function() {
      // this.$store.dispatch('settings/closeModal', {
      //   modal: 'timer',
      //   object: this.timer,
      //   pop: false,
      //   push: true
      // })
      const timer_client = this.timerClient()
      console.log(timer_client)
      this.$store.dispatch('clients/editClient', timer_client.id)
      this.$store.commit('settings/setCheckModalStack', true)
    },
    timerClient: function() {
      let timerProject = this.timerProject()
      return this.$store.getters['clients/getByClientCompanyId'](timerProject.client_company_id)
    },
    timerProject: function() {
      return this.$store.getters['projects/getById'](this.timer.project_id)
    },
    isTimerProjectTask: function(project_id) {
      return this.timer.project_id === project_id
    },
    isTimerUser: function(user_id) {
      console.log(this.timer.user_id, user_id)
      return this.timer.user_id === user_id
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
    setInvoiceNotes(e) {
      let invoiceNotes = e.target.innerHTML
      if (!invoiceNotes) return (this.timer_data.invoice_notes = '')
      this.timer_data.invoice_notes = invoiceNotes
    },
    setAdminNotes(e) {
      let adminNotes = e.target.innerHTML
      if (!adminNotes) return (this.timer_data.admin_notes = '')
      this.timer_data.admin_notes = adminNotes
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
      let self = this
      if (this.timer_data.project_id) {
        let project = this.$store.getters['projects/getById'](this.timer_data.project_id)
        if (project) {
          let client = this.$store.getters['clients/getByClientCompanyId'](project.client_company_id)
          if (client) {
            this.timer_data.client_id = client.id
          }
        }
      }

      try {
        this.timer_data.user_rate = document.getElementById('user_rate').value
        this.timer_data.client_rate = document.getElementById('client_rate').value
        const updated_date = new Date(document.getElementById('started_at').value).toISOString()
        const timezone = moment.tz.guess()
        const timezone_date = moment.tz(updated_date, timezone)
        const gmt_date = timezone_date
          .clone()
          .tz('GMT')
          .format('YYYY-MM-DD HH:mm:ss')
        this.timer_data.report_at = gmt_date
      } catch (err) {
        console.log(err)
      }

      this.$store.dispatch('timers/saveTimer', this.timer_data).then(function(response) {
        if (self.timer_data.notes != self.timer.notes) {
          self.$store.dispatch('UPDATE_ATTRIBUTE', {
            module: 'timers',
            id: self.timer.id,
            attribute: 'notes',
            value: self.timer_data.notes
          })
        }
        if (self.timer_data.duration != self.timer.duration) {
          self.$store.dispatch('UPDATE_ATTRIBUTE', {
            module: 'timers',
            id: self.timer.id,
            attribute: 'duration',
            value: self.timer_data.duration
          })
        }

        if (self.timer_data.invoice_duration != self.timer.invoice_duration) {
          self.$store.dispatch('UPDATE_ATTRIBUTE', {
            module: 'timers',
            id: self.timer.id,
            attribute: 'invoice_duration',
            value: self.timer_data.invoice_duration
          })
        }
      })
    },
    client_name: function(client_company_id) {
      let client = this.$store.getters['clients/getByClientCompanyId'](client_company_id)
      return client ? client.name : ''
    },
    searchProject: function(option, label, search) {
      let search_value = search.toLowerCase()
      return (
        option.name.toLowerCase().indexOf(search_value) > -1 ||
        this.client_name(option.client_company_id)
          .toLowerCase()
          .indexOf(search_value) > -1
      )
    },
    addProject: function() {
      this.$router.push({ query: { new_project_client_company_id: this.client.client_company_id } })
      this.$store.state.settings.current_edit_project = { id: uuid.v4() }
      this.$store.commit('settings/setCurrentEditProjectStatus', 'add')
      this.$store.dispatch('settings/openModal', 'project')
    },
    updateButtonStyle: function() {
      this.buttonStyle = this.applyTheme()
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
.scrollable {
  height: 600px;
  overflow-y: auto;
}
</style>
