<template>
  <div id="invoiceable" class="container-fluid">
    <div class="row">
      <div class="col-sm-12">
        <form method="get" id="invoiceable-form" class="invoiceable-form" action="/invoiceable">
          <div class="top-selects">
            <!-- here -->
            <div class="client-select">
              <div class="d-flex justify-content-between align-items-end mb-2">
                <div class="">
                  <b-form-checkbox v-model="not_clients" name="not_client" class="mr-2 color-white">
                    Not
                  </b-form-checkbox>
                </div>
                <div>
                  <ul class="nav nav-pills nav-pills-sm">
                    <li class="nav-item">
                      <a :class="!settings.show_all_clients ? 'nav-link active' : 'nav-link'" @click="settings.show_all_clients = false" href="javascript:void(0)">Active</a>
                    </li>
                    <li class="nav-item">
                      <a :class="settings.show_all_clients ? 'nav-link active' : 'nav-link'" @click="settings.show_all_clients = true" href="javascript:void(0)">All</a>
                    </li>
                  </ul>
                </div>
              </div>
              <select id="client" name="client[]" multiple="" v-model="chosen_clients">
                <option value="0">All Clients</option>
                <option v-for="(client, client_index) in clients" :client="client" :key="client_index" :value="client.id" @click="onOffSelect">{{ client.name }}</option>
              </select>
            </div>
            <!-- here -->
            <div class="project-select">
              <div class="mb-2 mt-1">
                <b-form-checkbox v-model="not_projects" name="not_project" class="mr-2 color-white">
                  Not
                </b-form-checkbox>
              </div>
              <select id="project" name="project[]" multiple="" v-model="chosen_projects">
                <option value="0">All Projects</option>
                <optgroup v-for="(client, client_index) in filteredclients(chosen_clients)" :key="client_index" :client="client" :label="client.name">
                  <option v-for="(project, project_index) in client_projects(client)" :key="project_index" :project="project" :value="project.id">{{ project.name }}</option>
                </optgroup>
              </select>
            </div>
            <!-- here -->
            <div v-if="isAdmin()" class="user-select">
              <div class="mb-2 mt-1">
                <b-form-checkbox v-model="not_users" name="not_user" class="mr-2 color-white">
                  Not
                </b-form-checkbox>
              </div>
              <!--<input type="checkbox" id="show-inactive-users" value="1" @click="toggleUsers"> Show Inactive-->
              <select name="user[]" multiple="" v-model="chosen_users">
                <option value="0">All Users</option>
                <option v-for="(user, user_index) in users" :key="user_index" :user="user" :value="user.id">{{ user.name }}</option>
              </select>
            </div>
          </div>
          <div class="bottom-selects">
            <div class="form-inline">
              <!-- {{ start }} -->
              <div class="d-flex justify-content-between w-100 flex-wrap">
                <div class="d-flex">
                  <b-form-datepicker name="start" id="start-datepicker" :value="start" @input="setStart" class="mb-2 mr-2"></b-form-datepicker>
                  <b-form-datepicker name="end" id="end-datepicker" v-model="end" @input="setEnd" class="mb-2 mr-2"></b-form-datepicker>
                </div>
                <div class="d-flex align-items-center flex-wrap color-white">
                  <b-form-checkbox v-model="anytime" name="anytime" class="mr-2">
                    Anytime
                  </b-form-checkbox>
                  <!--<b-form-checkbox v-if="isAdmin()" v-model="show_paid" name="show_paid" class="mr-2">-->
                  <!--Show paid-->
                  <!--</b-form-checkbox>-->
                  <b-form-checkbox v-if="isAdmin()" v-model="show_invoiced" name="show_invoiced">
                    Show Invoiced
                  </b-form-checkbox>
                  <input v-else type="hidden" name="is_invoiced" value="1" />
                </div>

                <div class="d-flex flex-wrap">
                  <b-button variant="primary" @click="lastMonth()" class="mr-3">Last Month</b-button>
                  <b-button variant="primary" @click="thisMonth()">This Month</b-button>
                </div>
              </div>
              <div class="inputs d-flex justify-content-start flex-wrap align-items-start w-100">
                <b-form-input class="mt-3" placeholder="task ID"></b-form-input>
                <!-- <b-form-input class="mt-3" placeholder="Paid Check #"></b-form-input>
                <b-form-input class="mt-3" placeholder="Received Check #"></b-form-input>
                <b-form-input class="mt-3" placeholder="Client Rate"></b-form-input>
                <b-form-input class="mt-3" placeholder="User Rate"></b-form-input> -->
                <b-form-input class="mt-3" placeholder="Invoice #"></b-form-input>

                <!-- <input placeholder="task ID" type="text" name="task_id" />
                <input placeholder="Paid Check #" type="text" name="paid_check_number" />
                <input placeholder="Received Check #" type="text" name="check_number" />
                <input placeholder="Client Rate" type="text" name="client_rate" />
                <input placeholder="User Rate" type="text" name="user_rate" />
                <input placeholder="Invoice #" type="text" name="invoice_id" /> -->
              </div>
            </div>
            <!--<input type="checkbox" name="UTC"> UTC?<br>-->
            <!--<a href="/invoiceable?start=2017-01-01&amp;end=2017-01-31">Last Month</a>--><!-- <a onclick="$('#start').val('')">Last Week</a><br><br>-->
            <!--Sort By:<br>
                        <input type="radio" name="sort" checked="" value="date"> Date <input type="radio" name="sort" value="projects"> Project<br>-->
            <!--#<input type="text" style="width: 40px;">-->
          </div>
        </form>
        <div class="table-responsive">
          <table class="table timer-table">
            <tbody v-if="timers" class="row-2017-2-18">
              <tr class="row-date">
                <td style="width: 20px"><input type="checkbox" v-model="checkbox_all_checked" :class="checkbox_all_checked ? '.item-action' : null" /></td>
                <td colspan="100">
                  <div class="d-flex">
                    <!-- to add: the :value="null" must be replaced with v-model="" inside b-form-select -->
                    <div class="d-flex">
                      <b-form-select id="action" v-model="invoice_action" class="mr-3">
                        <b-form-select-option :value="null" disabled>Select Action</b-form-select-option>
                        <b-form-select-option value="markpaid">Mark Paid</b-form-select-option>
                        <b-form-select-option value="markunpaid">Mark Unpaid</b-form-select-option>
                        <b-form-select-option value="resavetimers">Resave Timers</b-form-select-option>

                        <b-form-select-option value="adjust-invoice-rate">Adjust Invoice Rate</b-form-select-option>
                        <b-form-select-option value="adjust-user-rate">Adjust User Rate</b-form-select-option>
                        <b-form-select-option value="download-csv">Download CSV</b-form-select-option>
                        <b-form-select-option value="download-xls">Download XLS</b-form-select-option>
                        <b-form-select-option value="create_invoice">Create Invoice</b-form-select-option>
                      </b-form-select>
                      <b-button variant="primary" @click="applyAction()">Go</b-button>
                    </div>
                    <div style="width: 100%" class="ml-3">
                      <span id="actionLink"> </span>
                      <button style="float:right" class="btn btn-primary" @click="showInvoiceableItems" v-if="isAdmin()">Invoiceable Items</button>
                    </div>
                  </div>
                </td>
              </tr>
              <tr class="row-date">
                <td>
                  <b-badge variant="dark" style="font-size: 13px; background:none;">{{ timers.length }} {{ timers.length > 1 ? 'Entries' : 'Entry' }}</b-badge>
                </td>
                <td>
                  <b-badge variant="dark" style="font-size: 13px; background:none;">
                    Earned: {{ totalToDecimal('earned', this.total_earned) }}<br />
                    Unpaid: {{ totalToDecimal('unpaid', this.total_unpaid) }}<br />
                    Total: {{ totalToDecimal('total', this.total_invoiceable) }}
                  </b-badge>
                </td>
                <td>
                  <b-badge variant="dark" style="font-size: 13px; background:none;">Project</b-badge>
                </td>
                <td>
                  <b-badge variant="dark" style="font-size: 13px; background:none;">Date & Time</b-badge>
                </td>
                <td>
                  <b-badge variant="dark" style="font-size: 13px; background:none;">User</b-badge>
                </td>
                <td>
                  <b-badge variant="dark" style="font-size: 13px; background:none;">Unbilled ({{ this.total_unbillable }})</b-badge>
                </td>
                <td>
                  <b-badge variant="dark" style="font-size: 13px; background:none;">Time: {{ totalToDecimal('time', this.total_time) }}</b-badge>
                </td>
                <td></td>
              </tr>
            </tbody>
            <tbody v-else class="row-2017-2-18">
              <tr class="row-date">
                <td colspan="100">
                  <span style="color: darkblue">Total Time: {{ Math.trunc(total_time / 3600) }}:{{ Math.trunc((total_time % 3600) / 60) }}</span
                  >&nbsp; Total Earned: ${{ Math.trunc(total_earned * 100) / 100 }} <span v-if="total_unbillable" style="color: pink">Total Unbilled: {{ Math.trunc(total_unbillable * 100) / 100 }}</span> <span v-if="isTecharound()" style="color: lightgreen">Total Unpaid: ${{ Math.trunc(total_unpaid * 100) / 100 }}</span>
                </td>
              </tr>
              <tr class="row-date">
                <td>Earned</td>
                <td>Project</td>
                <td>Started</td>
                <td>$</td>
                <td>Duration</td>
                <td>Notes</td>
              </tr>
            </tbody>

            <tbody>
              <tr :item="item" v-for="item in invoice_items" :key="item.id" :checkbox_all_checked="checkbox_all_checked" is="invoiceable-item-row"></tr>
              <tr :timer="timer" v-for="(timer, index) in timers" :key="index" :checkbox_all_checked="checkbox_all_checked" :is_user_report="is_user_report" is="report-timer-row"></tr>
            </tbody>
            <tbody>
              <tr>
                <td>
                  <input type="checkbox" v-model="checkbox_all_checked" :class="checkbox_all_checked ? '.item-action' : null" />
                </td>
                <td colspan="100">
                  <div class="reload-icon" v-if="loading_data">
                    <i class="icon-cached color-white" :class="loading_data ? 'reload-rotate' : null" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <!-- Add Invoiceable Item Modal -->
    <invoiceable-add-item :show="isShowInvoiceableItems" @hide="hideAddInvoiceable" :clients="clients" :chosen_clients="chosen_clients" />
  </div>
</template>

<script>
import Vue from 'vue'
import moment from 'moment'
import InvoiceableTimerRow from './InvoiceableItemRow.vue'
import ReportTimerRow from './ReportTimerRow.vue'
import { timeToDecimal, totalToDecimal } from '@/utils/util-functions'

export default {
  name: 'invoiceable-template',
  components: {
    'invoiceable-timer-row': InvoiceableTimerRow,
    'report-timer-row': ReportTimerRow,
    'invoiceable-add-item': () => import('./InvoiceableAddItem.vue')
  },
  data: function() {
    return {
      invoice_action: null,
      checkbox_all_checked: false,
      isShowInvoiceableItems: false,
      total_time: 0,
      total_earned: 0,
      total_unpaid: 0,
      total_unbillable: 0,
      total_invoiceable: 0,
      anytime: this.$route.query.anytime == 1,
      show_paid: this.$route.query.is_paid == 1,
      current_date: new Date(),
      start: this.initStartDate(),
      end: this.initEndDate(),
      chosen_projects: this.$route.query['project[]'] ? (Array.isArray(this.$route.query['project[]']) ? this.$route.query['project[]'] : [this.$route.query['project[]']]) : [],
      chosen_users: this.$route.query['user[]'] ? (Array.isArray(this.$route.query['user[]']) ? this.$route.query['user[]'] : [this.$route.query['user[]']]) : [],
      chosen_clients: this.$route.query['client[]'] ? (Array.isArray(this.$route.query['client[]']) ? this.$route.query['client[]'] : [this.$route.query['client[]']]) : [],
      not_users: this.$route.query.not_user == 1,
      not_clients: this.$route.query.not_client == 1,
      not_projects: this.$route.query.not_project == 1,
      utc: this.$route.query.utc == 1,
      sort: 'date', //TODO
      show_invoiced: this.$route.query.is_invoiced == 1 ? 1 : 0,
      invoice_id: null,
      timers: [],
      invoice_items: [],
      settings: { search: '', show_inactive_users: false, show_closed_projects: false, show_all_clients: false },
      loading_data: false,
      is_user_report: false
    }
  },
  computed: {
    clients: function() {
      let self = this
      return this.$store.state.clients.clients
        .filter(function(client) {
          if (!self.settings.show_all_clients && (client.status === 'archived' || client.status === 'inactive')) {
            return false
          }
          return true //client.company_id === company_id
        })
        .sort(Vue.nameSort)
    },
    current_company: function() {
      return this.$store.state.settings.current_company
    },
    users: function() {
      return this.$store.getters['company_users/getActive']
    },
    current_company_user: function() {
      return this.$store.state.settings.current_company_user
    },
    timer_watch() {
      return this.$store.state.settings.timer_watch
    }
  },
  created() {
    this.$root.$refs.Invoiceable = this
  },
  watch: {
    timer_watch: function() {
      this.getData('timer_watch')
    },
    current_company: function() {
      let self = this
      Vue.nextTick(function() {
        self.getData('current_company')
      })
    },
    anytime: function() {
      this.getData('anytime')
    },
    show_paid: function() {
      this.getData('show_paid')
    },
    utc: function() {
      this.getData('utc')
    },
    show_invoiced: function() {
      this.getData('show_invoiced')
    },
    chosen_projects: function() {
      this.getData('chosen_projects')
    },
    chosen_users: function() {
      this.getData('chosen_users')
    },
    chosen_clients: function() {
      this.getData('chosen_clients')
    },
    not_clients: function() {
      this.getData('not_clients')
    },
    not_projects: function() {
      this.getData('not_projects')
    },
    not_users: function() {
      this.getData('not_users')
    },
    user_rate: function() {
      this.getData('user_rate')
    },
    client_rate: function() {
      this.getData('client_rate')
    },
    invoice_id: function() {
      this.getData('invoice_id')
    },
    paid_check_id: function() {
      this.getData('paid_check_id')
    },
    received_check_id: function() {
      this.getData('received_check_id')
    }
  },
  beforeCreate: function() {
    //labeledConsole('beforeCreate', $('#project').val())
    if (sessionStorage.getItem('invoiceable')) {
      this.$router.push({ path: '/invoiceable?' + new URLSearchParams(sessionStorage.getItem('invoiceable')).toString() }).catch(() => {})
    }
  },
  mounted() {
    console.log('reports mounted', this.$route.query, this.$route, this.chosen_clients, this.total_time, 'test')
    this.getData()
  },
  methods: {
    timeToDecimal,
    totalToDecimal,
    timeToDecimal,
    initStartDate() {
      const current_date = new Date()
      const start_date = this.$route.query.start ? decodeURI(this.$route.query.start) : current_date.getFullYear() + '-' + (current_date.getMonth() + 1) + '-01'
      // this.start = start_date

      return start_date
    },
    initEndDate() {
      const current_date = new Date()
      const end_date = this.$route.query.end ? decodeURI(this.$route.query.end) : current_date.getFullYear() + '-' + (current_date.getMonth() + 2) + '-00'
      // this.end = end_date

      return end_date
    },
    setStart(start) {
      this.start = start
      this.getData('start')
    },
    setEnd(end) {
      this.end = end
      this.getData('end')
    },
    // isNotDiseno() {
    //   return !this.$store.getters['settings/isDiseno']
    // },
    showInvoiceableItems() {
      // this.$store.dispatch('invoices/editInvoiceableItem')
      this.isShowInvoiceableItems = true
    },
    hideAddInvoiceable() {
      this.isShowInvoiceableItems = false
    },
    generateInvoiceButton(timers, invoice_id) {
      console.log(this.$store)
      const client = document.getElementById('client').value
      const params = {
        timers,
        invoice_id,
        start: this.start,
        end: this.end,
        client: client
      }
      this.$http()
        .post('/invoice/create', params)
        .then(function(response) {
          const view_invoice_container = document.getElementById('actionLink')
          view_invoice_container.innerHTML = ''
          view_invoice_container.innerHTML += '<a id="createInvoiceButton" target="_blank" href="https://release.projectous.com/invoice/' + invoice_id + '">View Invoice</a>'
          const create_invoice_button = document.getElementById('createInvoiceButton')
          create_invoice_button.classList.add('btn')
          create_invoice_button.classList.add('btn-primary')
          console.log('Response', response)
          // this.$store.dispatch('invoices/clearInvoiceableItems', response[0])
        })
    },
    makeToast(variant = null, title, content) {
      this.$bvToast.toast(content, {
        title: title,
        variant: variant
      })
    },
    applyAction() {
      let self = this
      const view_invoice_container = document.getElementById('actionLink')
      view_invoice_container.innerHTML = ''
      let timers = document.querySelectorAll('.timer-action:checked') //TODO: remove jquery
      let itemIds = document.querySelectorAll('.item-action:checked') //TODO: remove jquery
      console.log(itemIds, timers)
      let timer_ids = []
      for (const timer of timers) {
        const timer_id = parseInt(timer.name.replace('action[', '').replace(']', ''))
        timer_ids.push(timer_id)
      }
      timers = {
        timers: timer_ids
      }
      if (this.invoice_action == 'create_invoice') {
        //TODO: $invoice_id = Invoice::max('invoice_id') + 1
        this.$http()
          .post('/get_invoice_id', {})
          .then(function(response) {
            if (self.chosen_clients.length > 1) {
              self.makeToast(null, 'Choose one client', 'You must choose one client only.')
              return
            }
            if (timer_ids.length === 0) {
              self.makeToast(null, 'Choose one timer', 'Please select one or more timers.')
              return
            }
            let invoice_id = prompt('What ID?', response.invoice_id)
            self.getData()
            self.generateInvoiceButton(timers.timers, response.invoice_id)
          })

        return
      } else if (this.invoice_action == 'adjust-invoice-rate') {
        let new_client_rate = prompt('What rate?', '')
        if (new_client_rate == '') {
          alert('Try again.')
          return
        }
        this.$http().post('/timers/adjust-client-rate', timers + '&client_rate=' + new_client_rate, function() {
          alert('Done, reload page.')
        })
        return
      } else if (this.invoice_action == 'adjust-user-rate') {
        let new_user_rate = prompt('What rate?', '')
        if (new_user_rate == '') {
          alert('Try again.')
          return
        }
        this.$http().post('/timers/adjust-user-rate', timers + '&user_rate=' + new_user_rate, function() {
          alert('Done, reload page.')
        })
        return
      } else if (this.invoice_action == 'assigntotask') {
        let task_id = prompt('What task ID?', '')
        if (task_id == '') {
          alert('Try again.')
          return
        }
        this.$http().post('/timers/' + action, timers + '&task_id=' + task_id, function() {
          alert('Done, reload page.')
        })
        return
      } else if (this.invoice_action == 'download-csv') {
        window.open('https://release.projectous.com/timers/' + action + '?' + timers)
        return
      } else if (this.invoice_action == 'download-xls') {
        window.open('https://release.projectous.com/timers/' + action + '?' + timers + '&start=' + document.getElementById('start').value + '&end=' + document.getElementById('end').value)
        return
      } else if (this.invoice_action == 'custom-xls') {
        this.$http().get('/test/set/modaldata/' + timers)
        //TODO: what is this and remove jquery $('.projectous_modal').trigger('click')
        return
      }

      this.$http()
        .post('/timers/' + this.invoice_action, timers)
        .then(function() {
          // Do something with the response
          self.getData()
        })
    },
    isTecharound: function() {
      return this.$store.getters['settings/isTecharound']
    },
    lastMonth: function() {
      // alert('lastMonth')
      let now = new Date()
      let lastday = new Date(now.getFullYear(), now.getMonth(), 0)
      let firstday = new Date(lastday.getFullYear(), lastday.getMonth(), 1)
      this.start = firstday.getFullYear() + '-' + (firstday.getMonth() + 1) + '-' + firstday.getDate()
      this.end = lastday.getFullYear() + '-' + (firstday.getMonth() + 1) + '-' + lastday.getDate()
      this.getData('lastmonth')
    },
    thisMonth: function() {
      let now = new Date()
      let lastday = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      this.start = now.getFullYear() + '-' + (now.getMonth() + 1) + '-01'
      this.end = lastday.getFullYear() + '-' + (lastday.getMonth() + 1) + '-' + lastday.getDate()
      this.getData('thismonth')
    },
    isAdmin: function() {
      return this.$store.getters['settings/isAdmin']
    },
    //   searchMe(nt) {
    //     let force = this.search
    //     Vue.set(this.settings, 'search', event.target.value)
    //   },
    //   toggleUsers(event) {
    //     //console.log('toggle users'+ event.target.checked)
    //     Vue.set(this.settings, 'show_inactive_users', event.target.checked)
    //   },
    filteredusers() {
      /*if(self.settings.show_inactive_users) {
            return this.$store.getters['company_users/getCompanyUsers']
        } else {*/
      return this.$store.getters['company_users/getActive']
      //}
    },
    client_projects(client) {
      //labeledConsole('client', client)
      return this.$store.getters['projects/openprojects']().filter(function(project) {
        return project.client_company_id == client.client_company_id
      })
    },
    filteredclients(chosen_clients) {
      let self = this
      // return this.clients //TODO: make this work:
      return self.clients.filter(function(client) {
        if (chosen_clients.indexOf('0') === -1) {
          if (typeof chosen_clients[0] !== 'number') {
            return chosen_clients.indexOf(client.id.toString()) !== -1
          } else {
            return chosen_clients.indexOf(client.id) !== -1
          }
        }
        return true
      })
    },
    onOffSelect(e) {
      let index = this.chosen_clients.findIndex(client => client.id === e.target.value)
      if (index !== -1) {
        //this.chosen_clients.splice(index, 1)
      } else {
        //this.chosen_clients.push(e.target.value*1)
      }
      //console.log(this.chosen_clients)
    },
    async getData(where) {
      this.loading_data = true
      let self = this

      if (!this.current_company.id) {
        //return
      }
      //$('#client').val(this.chosen_clients)

      let form = await document.querySelector('#invoiceable-form')
      let data = new FormData(form)

      if (!data) {
        console.log('!!!!!!!!!!!!!!!!')
        //TODO: for some reason, if you visit invoiceable, then go to dashboard, the element is still created so this function area is triggered on emit refresh
        return
      }
      const queryString = new URLSearchParams(data).toString()
      this.$router.push({ path: '/invoiceable?' + queryString }).catch(() => {
        console.log('getData')
      })
      sessionStorage.setItem('invoiceable', queryString)

      // if (this.isAdmin()) {
      const { invoice_items, timers } = await this.$http().post('/invoiceable-timers', data)

      this.invoice_items = invoice_items
      this.timers = timers
      this.total_time = 0
      this.total_earned = 0
      this.total_unpaid = 0
      this.total_unbillable = 0
      this.total_invoiceable = 0

      for (const timer of this.timers) {
        this.total_time += timer.duration
        this.total_earned += (timer.duration / 3600) * timer.user_rate
        if (!timer.is_paid) {
          this.total_unpaid += (timer.duration / 3600) * timer.user_rate
        }
        if (!timer.is_billable) {
          this.total_unbillable++
        } else {
          this.total_invoiceable += (timer.invoice_duration / 3600) * timer.client_rate
        }
      }
      console.log(this.total_time)
      // }
      this.loading_data = false
    }
  }
}
</script>

<style lang="scss">
#invoiceable {
  padding: 20px 50px 0 50px;
  max-height: calc(100vh - 50px);
  overflow-y: auto;
  overflow-x: hidden;

  .top-selects {
    // border: 10px solid white;
    display: flex;
    justify-content: space-between;
    // height: 300px;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 30px;

    select {
      padding: 10px;
      border-radius: 6px;
      border: 1px solid rgba($color: #acabab, $alpha: 1);
      box-shadow: 0 0px 10px rgba($color: #000000, $alpha: 0.2);
      min-height: 235px;
    }

    .client-select {
      display: flex;
      flex-direction: column;
      flex: 2;
      // padding-right: 50px;
      min-width: 290px;

      select {
        flex: 1;

        option {
          white-space: pre-wrap;
        }
      }
    }
    .project-select {
      display: flex;
      flex-direction: column;
      flex: 2;
      min-width: 466px;
      // padding-right: 50px;

      select {
        flex: 1;

        optgroup {
          white-space: pre-wrap;
        }
      }
    }
    .user-select {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 177px;

      select {
        flex: 1;
      }
    }
  }
  .table-responsive {
    // box-shadow: 0 0px 10px 10px rgba($color: #FFFFFF, $alpha: 0.5);
    box-shadow: 0px 0px 10px 2px rgba($color: #ffffff, $alpha: 0.5);
  }

  .bottom-selects {
    // margin-bottom: 20px;

    .form-inline {
      .inputs {
        gap: 10px;
        // input {
        //   flex: 1;
        // }
      }
    }
  }

  .row-date {
    background-color: rgba($color: #000000, $alpha: 0.7) !important;
  }
}

.nav > li > a {
  padding-top: 3px;
  padding-bottom: 3px;
}

a.active {
  background: transparent;
}

.b-table-sticky-header {
  max-height: 500px !important;
}
#add-invoiceable-item {
  .modal-content {
    min-height: 400px;
    // height: calc(100vh - 50px) !important;
    // max-height: 700px;
  }

  .invoicable-items .dropdown-menu {
    height: 240px !important;
    max-height: 550px;
    position: relative;
    overflow-y: auto;

    .client-name-wrapper {
      margin-bottom: 10px;

      .client-name {
        font-weight: 600;
      }
    }
    .project-name-wrapper {
      cursor: pointer;
      &:hover {
        background-color: rgba($color: #000000, $alpha: 1);
      }

      .project-name {
        margin-left: 20px;
      }
    }
  }

  .clear-invoiceable-item {
    text-align: right;

    span {
      color: #007bff;
      font-size: 14px;
      cursor: pointer;
      margin-right: 7px;
    }
  }

  .add-description {
    padding: 0 7px;

    input {
      margin-top: 10px;
    }
  }
}
</style>

<style lang="scss" scoped>
.color-white {
  color: white;
}
.invoiceable-form {
  background-color: rgba($color: #000000, $alpha: 0.5);
  box-shadow: 0px 0px 10px 2px rgba($color: #ffffff, $alpha: 0.5);
  padding: 8px 8px 10px 8px;
  border-radius: 4px;
  margin-bottom: 20px;
}
.reload-icon {
  width: 100%;
  height: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  cursor: pointer;

  .icon-cached {
    font-size: 24px;
    display: flex;
    width: 24px;
    height: 24px;

    &::before {
      width: 100%;
      height: 100%;
      margin: 0 !important;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
.reload-rotate {
  -webkit-animation: spin 1s linear infinite;
  -moz-animation: spin 1s linear infinite;
  animation: spin 1s linear infinite;
}
</style>
