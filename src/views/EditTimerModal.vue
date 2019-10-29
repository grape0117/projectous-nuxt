<template>
  <b-modal id="timer-modal" class="modal fade" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button
            type="button"
            class="close"
            data-dismiss="modal"
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </button>
          <h4 class="modal-title">Timer</h4>
        </div>
        <div class="modal-body">
          <ul id="timerModalTabs" class="nav nav-tabs" role="tablist">
            <li role="presentation" class="active">
              <a
                href="#timerEditTabShow"
                aria-controls="timerEditTabShow"
                role="tab"
                data-toggle="tab"
                >Edit Timer</a
              >
            </li>
            <li role="presentation">
              <a
                href="#timerTableTab"
                aria-controls="timerTableTab"
                role="tab"
                data-toggle="tab"
                >Timer History</a
              >
            </li>
          </ul>
          <div class="tab-content">
            <div role="tabpanel" class="tab-pane active" id="timerEditTabShow">
              <form id="editTimerForm" class="form-horizontal">
                <input
                  id="modalTimerId"
                  type="hidden"
                  name="id"
                  v-model="timer.id"
                />
                <div class="form-group">
                  <label
                    class="control-label col-sm-4"
                    for="timer-modal-project-id"
                    >Project:
                  </label>
                  <div class="col-sm-6">
                    <select
                      id="timer-modal-project-id"
                      class="form-control"
                      name="project_id"
                      v-model="timer.project_id"
                    >
                      <option>***** Select Project *****</option>
                      <option value="create">Create New Project</option>
                      <option
                        v-for="project in openprojects()"
                        :value="project.id"
                      >
                        {{ client_name(project.client_id) }} -
                        {{ project.name }}
                      </option>
                    </select>
                  </div>
                  <div class="col-sm-2">
                    <a v-on:click="editClient()">Edit Client</a>
                    <a v-on:click="editProject()">Edit Project</a>
                  </div>
                </div>
                <div v-if="isIHI()" class="form-group">
                  <label class="control-label col-sm-4" for="timerActionSelect"
                    >Action:
                  </label>
                  <div class="col-sm-8">
                    <select
                      name="action_id"
                      id="timerActionSelect"
                      class="form-control"
                      options="tasks"
                      v-model="timer.action_id"
                    >
                      <option value="">***** Select Action *****</option>
                      <option v-for="action in actions" :value="action.id"
                        >{{ action.abbreviation }} {{ action.name }}
                      </option>
                    </select>
                    <span class="help-block">Please choose an Action</span>
                  </div>
                </div>
                <div v-if="isIHI()" class="form-group">
                  <label class="control-label col-sm-4" for="timerTaskSelect"
                    >Department:
                  </label>
                  <div class="col-sm-8">
                    <select
                      name="department_id"
                      id="timerDepartmentSelect"
                      class="form-control"
                      options="tasks"
                      v-model="timer.department_id"
                    >
                      <option value="">***** Select Department *****</option>
                      <option
                        v-bind:department="department"
                        v-for="department in departments"
                        :value="department.id"
                        >{{ department.abbreviation }} {{ department.name }}
                      </option>
                    </select>
                    <span class="help-block">Please choose a Department</span>
                  </div>
                </div>
                <div v-if="isIHI()" class="form-group">
                  <label class="control-label col-sm-4" for="timerTaskSelect"
                    >System:
                  </label>
                  <div class="col-sm-8">
                    <select
                      name="system_id"
                      id="timerSystemSelect"
                      class="form-control"
                      options="tasks"
                      v-model="timer.system_id"
                    >
                      <option value="">***** Select System *****</option>
                      <option v-for="system in systems" :value="system.id"
                        >{{ system.identifier }} {{ system.name }}
                      </option>
                    </select>
                    <span class="help-block">Please choose a System</span>
                  </div>
                </div>
                <div v-if="!isIHI()" class="form-group">
                  <label class="control-label col-sm-4" for="timerTaskSelect"
                    >Task:
                  </label>
                  <div class="col-sm-8">
                    <select
                      name="task_id"
                      id="timerTaskSelect"
                      class="form-control"
                      v-model="timer.task_id"
                    >
                      <option value="0">***** Select Task *****</option>
                      <option
                        v-for="task in projecttasks(timer.project_id)"
                        :value="task.id"
                        >{{ task.title }}
                      </option>
                    </select>
                  </div>
                </div>
                <div v-if="!isIHI() && isAdmin()" class="form-group">
                  <label class="control-label col-sm-4" for="timerUserSelect"
                    >User:
                  </label>
                  <div class="col-sm-8">
                    <select
                      name="user_id"
                      id="timerUserSelect"
                      class="form-control"
                    >
                      <option value="">***** Select User *****</option>
                      <option
                        :selected="isTimerUser(user.user_id)"
                        v-for="user in users"
                        v-bind:value="user.user_id"
                      >
                        {{ user.name }}
                      </option>
                      <option
                        >Selected or Current User if Editing Timer?</option
                      >
                    </select>
                  </div>
                </div>
                <div v-if="!isIHI() && isAdmin()" class="form-group">
                  <label class="control-label col-sm-4" for="timerUserTime"
                    >Is billable?
                  </label>
                  <div class="col-sm-8">
                    <div class="checkbox">
                      <label>
                        <input
                          name="is_billable"
                          type="checkbox"
                          id="blankCheckbox"
                          value="1"
                          v-model="timer.is_billable"
                          aria-label="..."
                        />
                      </label>
                    </div>
                  </div>
                </div>
                <div v-if="!isIHI() && isAdmin()" class="form-group">
                  <label class="control-label col-sm-4" for="report_at"
                    >User Rate:
                  </label>
                  <div class="col-sm-8">
                    <input
                      name="user_rate"
                      type="datetime"
                      id="user_rate"
                      :placeholder="user_rate_placeholder()"
                      class="form-control"
                      :value="user_rate_value()"
                    />
                  </div>
                </div>
                <div v-if="!isIHI() && isAdmin()" class="form-group">
                  <label class="control-label col-sm-4" for="client_rate"
                    >Client Rate:
                  </label>
                  <div class="col-sm-8">
                    <input
                      name="client_rate"
                      type="datetime"
                      id="client_rate"
                      :placeholder="client_rate_placeholder()"
                      class="form-control"
                      :value="client_rate_value()"
                    />
                  </div>
                </div>
                <div class="form-group">
                  <label class="control-label col-sm-4" for="timerUserNotes"
                    >Notes:
                  </label>
                  <div class="col-sm-8">
                    <div
                      contenteditable="true"
                      id="timerUserNotes"
                      class="form-control"
                      style="height: auto; min-height: 35px;"
                      v-html="checkNotes(timer.notes)"
                    ></div>
                  </div>
                </div>
                <div v-if="!isIHI() && isAdmin()" class="form-group">
                  <label class="control-label col-sm-4" for="timerInvoiceNotes"
                    >Invoice Notes:
                  </label>
                  <div class="col-sm-8">
                    <div
                      contenteditable="true"
                      id="timerInvoiceNotes"
                      class="form-control"
                      style="height: auto; min-height: 35px;"
                      v-html="checkNotes(timer.invoice_notes)"
                    ></div>
                  </div>
                </div>
                <div v-if="!isIHI() && isAdmin()" class="form-group">
                  <label class="control-label col-sm-4" for="timerInvoiceNotes"
                    >Admin Notes: (visible to users, not clients)</label
                  >
                  <div class="col-sm-8">
                    <div
                      contenteditable="true"
                      id="timerAdminNotes"
                      class="form-control"
                      style="height: auto; min-height: 35px;"
                      v-html="checkNotes(timer.admin_notes)"
                    ></div>
                  </div>
                </div>
                <div v-if="isIHI()" class="form-group">
                  <label class="control-label col-sm-4" for="timerUserMaterials"
                    >Materials Used:
                  </label>
                  <div class="col-sm-8">
                    <div
                      contenteditable="true"
                      id="timerUserMaterials"
                      class="form-control"
                      style="height: auto; min-height: 35px;"
                      v-html="checkNotes(timer.materials)"
                    ></div>
                  </div>
                </div>
                <div v-if="!isIHI()" class="form-group">
                  <label class="control-label col-sm-4" for="report_at"
                    >Started at:
                  </label>
                  <div class="col-sm-8">
                    <input
                      name="report_at"
                      type="datetime"
                      id="report_at"
                      class="form-control"
                      :value="timer.report_at"
                    />
                  </div>
                </div>
                <div v-if="isIHI()" class="form-group">
                  <label class="control-label col-sm-4" for="timerUserTime"
                    >Date:
                  </label>
                  <div class="col-sm-8">
                    <input
                      type="date"
                      id="timerUserDate"
                      class="form-control"
                      :value="timerDate()"
                    />
                  </div>
                </div>
                <timer-modal-time-standard
                  v-if="!isIHI()"
                  v-bind:status="timer.status"
                  v-bind:hours="durationHours()"
                  v-bind:minutes="durationMinutes()"
                  v-bind:seconds="durationSeconds()"
                ></timer-modal-time-standard>
                <div
                  class="form-group"
                  v-if="timer.status != 'running' && !isIHI() && isAdmin()"
                >
                  <label class="control-label col-sm-4" for="timerDuration"
                    >Invoice Duration:
                  </label>
                  <div class="col-sm-6">
                    <div id="timerDuration" class="form-control-static">
                      <input
                        name="invoice_duration_hours"
                        placeholder="00"
                        style="display:inline; width: 15%;"
                        :value="invoiceDurationHours()"
                      />:<input
                        name="invoice_duration_minutes"
                        style="display:inline; width: 15%;"
                        placeholder="00"
                        :value="invoiceDurationMinutes()"
                      />:<input
                        class="btn-xs"
                        name="invoice_duration_seconds"
                        style="display:inline; width: 15%;"
                        placeholder="00"
                        :value="invoiceDurationSeconds()"
                      />
                      (hours : minutes)
                    </div>
                  </div>
                </div>
                <div v-if="isIHI()" class="form-group row">
                  <label
                    for="projectName"
                    class="control-label labelLeft col-sm-4"
                    style="line-height:46px;"
                    >Start:
                  </label>
                  <div class="col-sm-8 fieldRight">
                    <div
                      id="timesSliderStart"
                      class="carousel timesSlider slide"
                      data-ride="carousel"
                      data-interval="false"
                    >
                      <div class="carousel-inner" role="listbox">
                        <timer-fifteen-template
                          @setstarttime="setStartTime"
                          v-bind:timer="timer"
                          v-bind:type="'start'"
                          v-bind:compareto="'endSeconds'"
                          v-bind:hour="hour"
                          v-for="hour in startHours()"
                          v-bind:minute="'15'"
                        ></timer-fifteen-template>
                      </div>
                      <a
                        class="carousel-control-prev"
                        href="#timesSliderStart"
                        role="button"
                        data-slide="prev"
                      >
                        <i
                          class="glyphicon glyphicon-chevron-left"
                          aria-hidden="true"
                        ></i>
                        <span class="sr-only"></span>
                      </a>
                      <a
                        class="carousel-control-next"
                        href="#timesSliderStart"
                        role="button"
                        data-slide="next"
                      >
                        <i
                          class="glyphicon glyphicon-chevron-right"
                          aria-hidden="true"
                        ></i>
                        <span class="sr-only"></span>
                      </a>
                    </div>
                  </div>
                </div>
                <div v-if="isIHI()" class="form-group row">
                  <label
                    for="projectName"
                    class="control-label labelLeft col-sm-4"
                    style="line-height:46px;"
                    >End:
                  </label>
                  <div class="col-sm-8 fieldRight">
                    <div
                      id="timesSliderEnd"
                      class="carousel timesSlider slide"
                      data-ride="carousel"
                      data-interval="false"
                    >
                      <div class="carousel-inner" role="listbox">
                        <timer-fifteen-template
                          v-on:setendtime="setendtime"
                          v-bind:timer="timer"
                          v-bind:type="'end'"
                          v-bind:compareto="'startSeconds'"
                          v-bind:hour="hour"
                          v-for="hour in endHours()"
                          v-bind:minute="'15'"
                        ></timer-fifteen-template>
                      </div>
                      <a
                        class="carousel-control-prev"
                        href="#timesSliderEnd"
                        role="button"
                        data-slide="prev"
                      >
                        <i
                          class="glyphicon glyphicon-chevron-left"
                          aria-hidden="true"
                        ></i>
                        <span class="sr-only"></span>
                      </a>
                      <a
                        class="carousel-control-next"
                        href="#timesSliderEnd"
                        role="button"
                        data-slide="next"
                      >
                        <i
                          class="glyphicon glyphicon-chevron-right"
                          aria-hidden="true"
                        ></i>
                        <span class="sr-only"></span>
                      </a>
                    </div>
                  </div>
                </div>
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
                  <tr
                    v-bind:history="history"
                    v-for="history in timer.histories"
                    is="timelog-history-row"
                  ></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            v-if="isCurrentUserOrAdmin()"
            type="button"
            @click="deleteTimer()"
            class="btn btn-danger pull-left"
          >
            Delete
          </button>
          <button type="button" class="btn btn-default" data-dismiss="modal">
            Close
          </button>
          <button
            type="button"
            class="btn btn-primary"
            v-on:click="saveTimer()"
          >
            Save changes
          </button>
        </div>
      </div>
      <!-- /.modal-content -->
    </div>
    <!-- /.modal-dialog --> </b-modal
  ><!-- /.modal -->
</template>

<script>
export default {
  name: 'timer-modal',
  computed: {
    timer: function() {
      return this.$store.state.settings.current_edit_timer
    },
    users: function() {
      return this.$store.getters['company_users/getActiveUsers'] //TODO: include inactive user if user is on the timer? And a checkbox for showing inactive users?
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
    }
  },
  data: function() {
    return {
      startSeconds: '',
      endSeconds: ''
    }
  },
  mounted: function() {
    var self = this
    $('#timer-modal').on('hidden.bs.modal', function() {
      self.$store.dispatch('settings/closedModal')
    })
  },
  watch: {
    'timer.project_id': function() {
      if (this.timer.project_id == 'create') {
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
    client_rate_placeholder: function() {
      return this.timer.default_client_rate
    },
    client_rate_value: function() {
      return this.timer.default_client_rate != this.timer.client_rate
        ? this.timer.client_rate
        : ''
    },
    user_rate_placeholder: function() {
      return this.timer.default_user_rate
    },
    user_rate_value: function() {
      return this.timer.default_user_rate != this.timer.user_rate
        ? this.timer.user_rate
        : ''
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
      if (!this.timer.invoice_duration)
        this.timer.invoice_duration = this.timer.duration
      if (typeof this.timer.invoice_duration != 'number') {
        return ''
      }
      return Math.floor(this.timer.invoice_duration / 3600)
    },
    invoiceDurationMinutes: function() {
      if (!this.timer.invoice_duration)
        this.timer.invoice_duration = this.timer.duration
      if (typeof this.timer.invoice_duration != 'number') {
        return ''
      }
      return (
        '00' + Math.floor((this.timer.invoice_duration % 3600) / 60)
      ).slice(-2)
    },
    invoiceDurationSeconds: function() {
      if (!this.timer.invoice_duration)
        this.timer.invoice_duration = this.timer.duration
      if (typeof this.timer.invoice_duration != 'number') {
        return ''
      }
      return Math.floor(this.timer.invoice_duration % 60)
    },
    isAdmin: function() {
      return this.$store.getters['settings/isAdmin']
    },
    isIHI: function() {
      return this.$store.getters['settings/isIHI']
    },
    openprojects: function() {
      return this.$store.getters['projects/openprojects']()
    },
    calculateDuration: function() {
      this.timer.duration = this.endSeconds - this.startSeconds
    },
    myCompanies: function() {
      $.each(this.my_companies, function(key, value) {
        //labeledConsole('company',value.name);
      })
      return this.my_companies
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
      return this.$store.getters['tasks/projecttasks'](project_id)
    },
    isCurrentUserOrAdmin: function() {
      return this.$store.getters['settings/isCurrentUserOrAdmin'](
        this.timer.user_id
      )
    },
    deleteTimer: function() {
      console.log(this.timer)
      this.$store.dispatch('timers/deleteTimer', this.timer.id)
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
      this.$store.dispatch('company_clients/editClient', this.timerClient())
      this.$store.commit('settings/setCheckActionStack', true)
    },
    timerClient: function() {
      var timerProject = this.timerProject()
      return this.$store.getters['company_clients/getCompanyClientByClientId'](
        timerProject.client_id
      )
    },
    timerProject: function() {
      return this.$store.getters['projects/getProjectById'](
        this.timer.project_id
      )
    },
    isTimerProjectTask: function(project_id) {
      return this.timer.project_id == project_id
    },
    isTimerUser: function(user_id) {
      return this.timer.user_id == user_id
    },
    checkInputValue: function(input) {
      if (!input.length) {
        return true //Skip over elements that aren't part of the form
      } else if (input.val() == '') {
        return false
      } else if (input.val() == null) {
        return false
      }

      return true
    },
    saveTimer: function(callback) {
      var self = this
      //console.log($('#timer-modal-project-id').val());

      //TODO: change Save button to Saving...
      //TODO: save time? or process on php side?
      labeledConsole('duration: ', this.timer.duration)
      var save = true
      if (!self.checkInputValue($('#timer-modal-project-id'))) {
        save = false
        $('#timer-modal-project-id')
          .parent()
          .addClass('has-error')
      }
      if (!self.checkInputValue($('#timerDepartmentSelect'))) {
        save = false
        $('#timerDepartmentSelect')
          .parent()
          .addClass('has-error')
      }
      if (!self.checkInputValue($('#timerSystemSelect'))) {
        save = false
        $('#timerSystemSelect')
          .parent()
          .addClass('has-error')
      }
      if (!self.checkInputValue($('#timerActionSelect'))) {
        save = false
        $('#timerActionSelect')
          .parent()
          .addClass('has-error')
      }

      if (!save) {
        //return;
      }
      var formData = $('#editTimerForm').serialize()
      console.log(formData)
      var project = self.$store.getters['projects/getProjectById'](
        $('#editTimerForm select[name=project_id]').val()
      )
      if (project) {
        //TODO: checktypeof projectKey == 'number') {
        var company_client = self.$store.getters[
          'company_clients/getCompanyClientByClientId'
        ](project.client_id)
        formData = formData + '&company_client_id=' + company_client.id
      } else {
        formData = formData
      }

      formData =
        formData +
        '&notes=' +
        encodeURIComponent($('#timerUserNotes').html()) +
        '&materials=' +
        encodeURIComponent($('#timerUserMaterials').html()) +
        '&duration=' +
        self.timer.duration

      if ($('#timerUserDate').val()) {
        var hours = Math.floor(self.startSeconds / 3600)
        var minutes = (
          '00' + Math.floor((self.startSeconds % 3600) / 60)
        ).slice(-2)
        var seconds = ('00' + (self.startSeconds % 60)).slice(-2)
        var report_at =
          $('#timerUserDate').val() +
          ' ' +
          hours +
          ':' +
          minutes +
          ':' +
          seconds
        //console.log(report_at);
        formData = formData + '&report_at=' + report_at
      }

      $('#timer-modal').modal('hide') //TODO: where should validation go?
      $('#timer-modal')
        .find('.has-error')
        .removeClass('has-error')

      this.$store.dispatch('timers/saveTimer', formData) //TODO: .then()
    },
    client_name: function(client_id) {
      var company_client = this.$store.getters[
        'company_clients/getCompanyClientByClientId'
      ](client_id)
      return company_client ? company_client.name : ''
    }
  }
}
</script>
