<template>
  <b-modal id="expense-modal" class="modal fade" tabindex="-1" role="dialog">
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
          <h4 class="modal-title">Expense</h4>
        </div>
        <div class="modal-body">
          <ul id="expenseModalTabs" class="nav nav-tabs" role="tablist">
            <li role="presentation" class="active">
              <a
                href="#expenseEditTabShow"
                aria-controls="expenseEditTabShow"
                role="tab"
                data-toggle="tab"
                >Edit Expense</a
              >
            </li>
            <li role="presentation">
              <a
                href="#expenseTableTab"
                aria-controls="expenseTableTab"
                role="tab"
                data-toggle="tab"
                >Expense History</a
              >
            </li>
          </ul>
          <div class="tab-content">
            <div
              role="tabpanel"
              class="tab-pane active"
              id="expenseEditTabShow"
            >
              <form id="editExpenseForm" class="form-horizontal">
                <input
                  id="modalExpenseId"
                  type="hidden"
                  name="id"
                  v-model="expense.id"
                />
                <div class="form-group">
                  <label
                    class="control-label col-sm-4"
                    for="expense-modal-project-id"
                    >Project:
                  </label>
                  <div class="col-sm-6">
                    <select
                      id="expense-modal-project-id"
                      class="form-control"
                      name="project_id"
                      v-model="expense.project_id"
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
                <div class="form-group">
                  <label class="control-label col-sm-4" for="expenseTaskSelect"
                    >Task:
                  </label>
                  <div class="col-sm-8">
                    <select
                      name="task_id"
                      id="expenseTaskSelect"
                      class="form-control"
                      v-model="expense.task_id"
                    >
                      <option value="0">***** Select Task *****</option>
                      <option
                        v-for="task in projecttasks(expense.project_id)"
                        :value="task.id"
                        >{{ task.title }}
                      </option>
                    </select>
                  </div>
                </div>
                <div v-if="isAdmin()" class="form-group">
                  <label class="control-label col-sm-4" for="expenseUserSelect"
                    >User:
                  </label>
                  <div class="col-sm-8">
                    <select
                      name="user_id"
                      id="expenseUserSelect"
                      class="form-control"
                    >
                      <option value="">***** Select User *****</option>
                      <option
                        :selected="isExpenseUser(user.user_id)"
                        v-for="user in users"
                        v-bind:value="user.user_id"
                      >
                        {{ user.name }}
                      </option>
                      <option
                        >Selected or Current User if Editing Expense?</option
                      >
                    </select>
                  </div>
                </div>
                <div v-if="isAdmin()" class="form-group">
                  <label class="control-label col-sm-4" for="expenseUserTime"
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
                          v-model="expense.is_billable"
                          aria-label="..."
                        />
                      </label>
                    </div>
                  </div>
                </div>
                <div v-if="isAdmin()" class="form-group">
                  <label class="control-label col-sm-4" for="report_at"
                    >Paid Amount:
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
                <div v-if="isAdmin()" class="form-group">
                  <label class="control-label col-sm-4" for="client_rate"
                    >Invoice Amount:
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
                  <label class="control-label col-sm-4" for="expenseUserNotes"
                    >Notes:
                  </label>
                  <div class="col-sm-8">
                    <div
                      contenteditable="true"
                      id="expenseUserNotes"
                      class="form-control"
                      style="height: auto; min-height: 35px;"
                      v-html="checkNotes(expense.notes)"
                    ></div>
                  </div>
                </div>
                <div v-if="isAdmin()" class="form-group">
                  <label
                    class="control-label col-sm-4"
                    for="expenseInvoiceNotes"
                    >Invoice Notes:
                  </label>
                  <div class="col-sm-8">
                    <div
                      contenteditable="true"
                      id="expenseInvoiceNotes"
                      class="form-control"
                      style="height: auto; min-height: 35px;"
                      v-html="checkNotes(expense.invoice_notes)"
                    ></div>
                  </div>
                </div>
                <div v-if="isAdmin()" class="form-group">
                  <label
                    class="control-label col-sm-4"
                    for="expenseInvoiceNotes"
                    >Admin Notes: (visible to users, not clients)</label
                  >
                  <div class="col-sm-8">
                    <div
                      contenteditable="true"
                      id="expenseAdminNotes"
                      class="form-control"
                      style="height: auto; min-height: 35px;"
                      v-html="checkNotes(expense.admin_notes)"
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
                      :value="expense.report_at"
                    />
                  </div>
                </div>
              </form>
            </div>
            <div role="tabpanel" class="tab-pane" id="expenseTableTab">
              <table class="table expense-table">
                <tbody>
                  <tr class="row-date">
                    <td>Notes</td>
                    <td>RestartedAt</td>
                    <td>Status</td>
                    <td>UpdatedAt</td>
                  </tr>
                  <tr
                    v-bind:history="history"
                    v-for="history in expense.histories"
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
            @click="deleteExpense()"
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
            v-on:click="saveExpense()"
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
  name: 'expense-modal',
  computed: {
    expense: function() {
      return this.$store.state.settings.current_edit_expense
    },
    users: function() {
      return this.$store.getters['company_users/getActiveUsers'] //TODO: include inactive user if user is on the expense? And a checkbox for showing inactive users?
    },
    current_company_user: function() {
      return this.$store.state.settings.current_company_user
    },
    current_expense: function() {
      return this.$store.state.settings.current_edit_expense
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
    let self = this
    $('#expense-modal').on('hidden.bs.modal', function() {
      self.$store.dispatch('settings/closedModal')
    })
  },
  watch: {
    'expense.project_id': function() {
      if (this.expense.project_id == 'create') {
        this.$store.dispatch('settings/closeModal', {
          modal: 'expense',
          object: this.expense,
          pop: false,
          push: true
        })
        this.$store.dispatch('projects/createProject')
      }
    }
  },
  methods: {
    client_rate_placeholder: function() {
      return this.expense.default_client_rate
    },
    client_rate_value: function() {
      return this.expense.default_client_rate != this.expense.client_rate
        ? this.expense.client_rate
        : ''
    },
    user_rate_placeholder: function() {
      return this.expense.default_user_rate
    },
    user_rate_value: function() {
      return this.expense.default_user_rate != this.expense.user_rate
        ? this.expense.user_rate
        : ''
    },
    isBillable: function() {
      return this.expense.is_billable == 1 ? 'checked' : ''
    },
    checkNotes: function(notes) {
      if (notes) {
        return notes
      } else {
        return ''
      }
    },

    isAdmin: function() {
      return this.$store.getters['settings/isAdmin']
    },
    openprojects: function() {
      return this.$store.getters['projects/openprojects']()
    },
    myCompanies: function() {
      $.each(this.my_companies, function(key, value) {
        //labeledConsole('company',value.name);
      })
      return this.my_companies
    },
    isExpenseTask: function(task_id) {
      return task_id == this.expense.task_id
    },
    projecttasks: function(project_id) {
      return this.$store.getters['tasks/getByProjectId'](project_id)
    },
    isCurrentUserOrAdmin: function() {
      return this.$store.getters['settings/isCurrentUserOrAdmin'](
        this.expense.user_id
      )
    },
    deleteExpense: function() {
      console.log(this.expense)
      this.$store.dispatch('expenses/deleteExpense', this.expense.id)
    },
    editProject: function() {
      this.$store.dispatch('settings/closeModal', {
        modal: 'expense',
        object: this.expense,
        pop: false,
        push: true
      })
      this.$store.dispatch('settings/editProject', this.expenseProject())
    },
    editClient: function() {
      this.$store.dispatch('settings/closeModal', {
        modal: 'expense',
        object: this.expense,
        pop: false,
        push: true
      })
      this.$store.dispatch('company_clients/editClient', this.expenseClient())
      this.$store.commit('settings/setCheckActionStack', true)
    },
    expenseClient: function() {
      let expenseProject = this.expenseProject()
      return this.$store.getters['company_clients/getByClientCompanyId'](
        expenseProject.client_id
      )
    },
    expenseProject: function() {
      return this.$store.getters['projects/getProjectById'](
        this.expense.project_id
      )
    },
    isExpenseProjectTask: function(project_id) {
      return this.expense.project_id == project_id
    },
    isExpenseUser: function(user_id) {
      return this.expense.user_id == user_id
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
    saveExpense: function(callback) {
      let self = this
      //console.log($('#expense-modal-project-id').val());

      //TODO: change Save button to Saving...
      //TODO: save time? or process on php side?
      labeledConsole('duration: ', this.expense.duration)
      let save = true
      if (!self.checkInputValue($('#expense-modal-project-id'))) {
        save = false
        $('#expense-modal-project-id')
          .parent()
          .addClass('has-error')
      }

      if (!save) {
        //return;
      }
      let formData = $('#editExpenseForm').serialize()
      console.log(formData)
      let project = self.$store.getters['projects/getProjectById'](
        $('#editExpenseForm select[name=project_id]').val()
      )
      if (project) {
        //TODO: checktypeof projectKey == 'number') {
        let company_client = self.$store.getters[
          'company_clients/getByClientCompanyId'
        ](project.client_id)
        formData = formData + '&company_client_id=' + company_client.id
      } else {
        formData = formData
      }

      formData =
        formData +
        '&notes=' +
        encodeURIComponent($('#expenseUserNotes').html()) +
        '&materials=' +
        encodeURIComponent($('#expenseUserMaterials').html()) +
        '&duration=' +
        self.expense.duration

      if ($('#expenseUserDate').val()) {
        let hours = Math.floor(self.startSeconds / 3600)
        let minutes = (
          '00' + Math.floor((self.startSeconds % 3600) / 60)
        ).slice(-2)
        let seconds = ('00' + (self.startSeconds % 60)).slice(-2)
        let report_at =
          $('#expenseUserDate').val() +
          ' ' +
          hours +
          ':' +
          minutes +
          ':' +
          seconds
        //console.log(report_at);
        formData = formData + '&report_at=' + report_at
      }

      $('#expense-modal').modal('hide') //TODO: where should validation go?
      $('#expense-modal')
        .find('.has-error')
        .removeClass('has-error')

      this.$store.dispatch('expenses/saveExpense', formData) //TODO: .then()
    },
    client_name: function(client_id) {
      let company_client = this.$store.getters[
        'company_clients/getByClientCompanyId'
      ](client_id)
      return company_client ? company_client.name : ''
    }
  }
}
</script>
