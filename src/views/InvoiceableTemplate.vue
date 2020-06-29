<template id="invoiceable-template">
  <div id="invoiceable" class="container-fluid">
    <div class="row">
      <div class="col-sm-12">
        <form method="get" id="invoiceable-form" action="/invoiceable">
          <div style="display: inline-block">
            <input type="checkbox" name="not_client" v-model="not_clients" /> Not
            <div style="float: right">
              <ul class="nav nav-pills nav-pills-sm">
                <li class="nav-item">
                  <a :class="!settings.show_all_clients ? 'nav-link active' : 'nav-link'" @click="settings.show_all_clients = false" href="#">Active</a>
                </li>
                <li class="nav-item">
                  <a :class="settings.show_all_clients ? 'nav-link active' : 'nav-link'" @click="settings.show_all_clients = true" href="#">All</a>
                </li>
              </ul>
            </div>
            <br />
            <select id="client" name="client[]" style="height: 200px;" multiple="" v-model="chosen_clients">
              <option value="0">All Clients</option>
              <option v-for="client in filtered_clients(current_company.id)" v-bind:client="client" :value="client.id" @click="onOffSelect">{{ client.name }} (#{{ client.id }})</option>
            </select>
          </div>
          <div style="display: inline-block">
            <input type="checkbox" name="not_project" v-model="not_projects" /> Not
            <br />
            <select id="project" name="project[]" style="height: 200px;" multiple="" v-model="chosen_projects">
              <option value="0">All Projects</option>
              <optgroup v-for="client in filteredclients(chosen_clients)" v-bind:client="client" :label="client.name">
                <option v-for="project in client_projects(client)" v-bind:project="project" :value="project.id">{{ project.name }} (#{{ project.id }})</option>
              </optgroup>
            </select>
          </div>
          <div v-if="isAdmin()" style="display: inline-block">
            <input type="checkbox" name="not_user" v-model="not_users" /> Not
            <!--<input type="checkbox" id="show-inactive-users" value="1" @click="toggleUsers"> Show Inactive--><br />
            <select name="user[]" style="height: 200px;" multiple="" v-model="chosen_users">
              <option value="0">All Users</option>
              <option v-for="user in filteredusers()" v-bind:user="user" :value="user.id">{{ user.name }}</option>
            </select>
          </div>
          <div style="display: inline-block;">
            <div class=" form-inline">
              {{ start }}
              <b-form-datepicker name="start" id="start-datepicker" :value="start" @input="setStart(e.target.value)" class="mb-2"></b-form-datepicker>
              <b-form-datepicker name="end" id="end-datepicker" v-model="end" class="mb-2"></b-form-datepicker>
              <label for="anytime" style="font-weight: normal;"><input type="checkbox" name="anytime" id="anytime" v-model="anytime" /> Anytime</label>
              <label v-if="isAdmin() && isTecharound()" for="paid" style="font-weight: normal;"><input type="checkbox" name="is_paid" id="show_paid" v-model="show_paid" /> Show paid</label>
              <input v-else="" type="hidden" name="is_paid" value="1" />
              <label v-if="isAdmin() && isTecharound()" for="is_invoiced" style="font-weight: normal;"> <input type="checkbox" id="is_invoiced" name="is_invoiced" v-model="show_invoiced" /> Show Invoiced? </label>
              <input v-else="" type="hidden" name="is_invoiced" value="1" />
              <a class="btn btn-default btn-sm" @click="lastMonth()">Last Month</a>
              <a class="btn btn-default btn-sm" @click="thisMonth()">This Month</a>
              <input v-if="isTecharound()" placeholder="task ID" type="text" name="task_id" />
              <input v-if="isTecharound()" placeholder="Paid Check #" type="text" name="paid_check_number" />
              <input v-if="isTecharound()" placeholder="Received Check #" type="text" name="check_number" />
              <input v-if="isTecharound()" placeholder="Client Rate" type="text" name="client_rate" />
              <input v-if="isTecharound()" placeholder="User Rate" type="text" name="user_rate" />
              <input v-if="isTecharound()" placeholder="Invoice #" type="text" name="invoice_id" />
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
            <tbody v-if="isAdmin()" class="row-2017-2-18">
              <tr class="row-date">
                <td colspan="100">
                  <span style="color: darkblue">Total Time: {{ Math.trunc(total_time / 3600) }}:{{ Math.trunc((total_time % 3600) / 60) }}</span
                  >&nbsp;<span v-if="isNotDiseno()" style="color: orange;">Entries: {{ timers.length }}</span> <span v-if="isNotDiseno()" style="color: olive;">Total Earned: ${{ Math.trunc(total_earned * 100) / 100 }}</span> <span v-if="isNotDiseno() && total_unbillable" style="color: pink">Total Unbilled: {{ Math.trunc(total_unbillable * 100) / 100 }}</span> <span v-if="isTecharound() && isAdmin()" style="color: lightgreen">Total Unpaid: ${{ Math.trunc(total_unpaid * 100) / 100 }}</span> <span v-if="isNotDiseno() && isAdmin()" style="color: lightseagreen;">Total: ${{ Math.trunc(total_invoiceable * 100) / 100 }}</span>
                </td>
              </tr>
              <tr class="row-date">
                <td>
                  <input class="uncheck" type="checkbox" onclick="toggleCheckboxes($(this),'.timer-action');" />
                </td>
                <td colspan="100">
                  <select id="action">
                    <option v-if="isWHMCS()" value="create-whmcs-billable-items">Create Billable Item</option>
                    <!--<option value="mark-entries-reviewed">Mark Entries as Reviewed</option>-->
                    <option v-if="isTecharound()" value="markpaid">Mark Paid</option>
                    <option v-if="isTecharound()" value="markunpaid">Mark Unpaid</option>
                    <option v-if="isTecharound()" value="resavetimers">Resave Timers</option>
                    <!--<option value="assigntotask">Assign to Task</option>-->
                    <option value="adjust-invoice-rate">Adjust Invoice Rate</option>
                    <option value="adjust-user-rate">Adjust User Rate</option>
                    <option value="download-csv">Download CSV</option>
                    <option value="download-xls">Download XLS</option>
                    <!--<option>Display as Basic Table (useful for copy-pasting)</option>-->
                    <option v-if="isTecharound()" value="create_invoice">Create Invoice</option>
                  </select>
                  <input type="button" class="btn btn-default" value="go" @click="applyAction()" /> <span id="actionLink"></span>
                  <div style="float:right;"><button class="btn btn-primary" @click="addInvoiceableItem()" v-if="isAdmin()">Add Invoiceable Item</button></div>
                </td>
              </tr>
            </tbody>
            <tbody v-else="" class="row-2017-2-18">
              <tr class="row-date">
                <td colspan="100">
                  <span style="color: darkblue">Total Time: {{ Math.trunc(total_time / 3600) }}:{{ Math.trunc((total_time % 3600) / 60) }}</span
                  >&nbsp; Total Earned: ${{ Math.trunc(total_earned * 100) / 100 }} <span v-if="total_unbillable && isNotDiseno()" style="color: pink">Total Unbilled: {{ Math.trunc(total_unbillable * 100) / 100 }}</span> <span v-if="isTecharound()" style="color: lightgreen">Total Unpaid: ${{ Math.trunc(total_unpaid * 100) / 100 }}</span>
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
              <tr v-bind:item="item" v-for="item in invoice_items" :key="item.id" is="invoiceable-item-row"></tr>
              <tr v-bind:timer="timer" v-for="timer in timers" :key="timer.id" is="report-timer-row"></tr>
            </tbody>
            <tbody>
              <tr>
                <td>
                  <input class="uncheck" type="checkbox" onclick="toggleCheckboxes($(this),'.item-action');" />
                </td>
                <td colspan="100"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import InvoiceableTimerRow from './InvoiceableItemRow.vue'
import ReportTimerRow from './ReportTimerRow.vue'
export default {
  name: 'invoiceable-template',
  components: {
    'invoiceable-timer-row': InvoiceableTimerRow,
    'report-timer-row': ReportTimerRow
  },
  computed: {
    clients: function() {
      return this.$store.state.clients.clients
    },
    current_company: function() {
      return this.$store.state.settings.current_company
    },
    users: function() {
      return this.$store.state.company_users.company_users
    },
    current_company_user: function() {
      return this.$store.state.settings.current_company_user
    },
    timer_watch() {
      return this.$store.state.settings.timer_watch
    }
  },
  data: function() {
    return {
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
      show_invoiced: this.$route.query.is_invoiced == 1,
      invoice_id: null,
      timers: [],
      invoice_items: [],
      settings: { search: '', show_inactive_users: false, show_closed_projects: false, show_all_clients: false }
    }
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
      //labeledConsole('invoiceable',sessionStorage.getItem('invoiceable'))
      this.$router.push({ path: '/invoiceable?' + sessionStorage.getItem('invoiceable') })
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    initStartDate() {
      const current_date = new Date()
      return this.$route.query.start ? decodeURI(this.$route.query.start) : current_date.getFullYear() + '-' + (current_date.getMonth() + 1) + '-01'
    },
    initEndDate() {
      const current_date = new Date()
      return this.$route.query.start ? decodeURI(this.$route.query.start) : current_date.getFullYear() + '-' + (current_date.getMonth() + 2) + '-00'
    },
    setStart(start) {
      this.start = start
      this.getData('start')
    },
    isNotDiseno() {
      return !this.$store.getters['settings/isDiseno']
    },
    addInvoiceableItem() {
      this.$store.dispatch('invoices/editInvoiceableItem')
    },
    applyAction() {
      let self = this
      let action = $('#action').val()

      let timers = $('.timer-action:checked').serialize()
      //alert(timers)
      let itemIds = $('.item-action:checked').serialize()
      if (action == 'create_invoice') {
        //TODO: $invoice_id = Invoice::max('invoice_id') + 1
        ajax('/get_invoice_id', {}, function(response) {
          let invoice_id = prompt('What ID?', response.invoice_id)
          if ($('#client option:selected').length != 1) {
            //alert('you must choose only one client'+ $('#client option:selected').length)
            //return
          }
          if (!timers) {
            alert('Please choose 1 or more timers.')
            return
          }
          $.post('/invoice/create', timers + '&invoice_id=' + invoice_id + '&start=' + $('#start').val() + '&end=' + $('#end').val() + '&client=' + $('#client').val() + '&' + itemIds, function(r) {
            $('#actionLink').html('<a style="background: red; color: white;" target="_blank" href="/invoice/' + invoice_id + '">View Invoice</a>')
            console.log('Response', r)
            self.$store.dispatch('invoices/clearInvoiceableItems', r[0])
          })
        })
        return
      } else if (action == 'adjust-invoice-rate') {
        let new_client_rate = prompt('What rate?', '')
        if (new_client_rate == '') {
          alert('Try again.')
          return
        }
        $.post('/timers/adjust-client-rate', timers + '&client_rate=' + new_client_rate, function() {
          alert('Done, reload page.')
        })
        return
      } else if (action == 'adjust-user-rate') {
        let new_user_rate = prompt('What rate?', '')
        if (new_user_rate == '') {
          alert('Try again.')
          return
        }
        $.post('/timers/adjust-user-rate', timers + '&user_rate=' + new_user_rate, function() {
          alert('Done, reload page.')
        })
        return
      } else if (action == 'assigntotask') {
        let task_id = prompt('What task ID?', '')
        if (task_id == '') {
          alert('Try again.')
          return
        }
        $.post('/timers/' + action, timers + '&task_id=' + task_id, function() {
          alert('Done, reload page.')
        })
        return
      } else if (action == 'download-csv') {
        window.open('/timers/' + action + '?' + timers)
        return
      } else if (action == 'download-xls') {
        window.open('/timers/' + action + '?' + timers + '&start=' + $('#start').val() + '&end=' + $('#end').val())
        return
      } else if (action == 'custom-xls') {
        //$.get( "/test/set/modaldata/"+timers)
        $('.projectous_modal').trigger('click')
        return
      }

      $.post('/timers/' + action, timers, function() {
        //TODO: update checked timers? reload page?
        self.getData('applyaction')
      })
    },
    isWHMCS: function() {
      return this.$store.getters['settings/isWHMCS']
    },
    isTecharound: function() {
      return this.$store.getters['settings/isTecharound']
    },
    lastMonth: function() {
      alert('lastMonth')
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
      this.start = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate()
      this.end = lastday.getFullYear() + '-' + (lastday.getMonth() + 1) + '-' + lastday.getDate()
      this.getData('thismonth')
    },
    isAdmin: function() {
      return this.$store.getters['settings/isAdmin']
    },
    searchMe(event) {
      let force = this.search
      Vue.set(this.settings, 'search', event.target.value)
    },
    toggleUsers(event) {
      //console.log('toggle users'+ event.target.checked)
      Vue.set(this.settings, 'show_inactive_users', event.target.checked)
    },
    filteredusers() {
      /*if(self.settings.show_inactive_users) {
            return this.$store.getters['company_users/getCompanyUsers']
        } else {*/
      return this.$store.getters['company_users/getActiveUsers']
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
      //return self.clients

      //labeledConsole('chosen_clients', chosen_clients)
      /*                let selecteds = []
                        let all_clients_selected = false
                        //console.log('filtering clients')
                        $("#client option:selected").each(function(index, option){
                            if($(option).val() == 0){
                                all_clients_selected = true
                                return
                            }
                            selecteds.push($(option).val())
                        })*/
      //labeledConsole('selecteds', selecteds)
      //labeledConsole('chosen_clients', chosen_clients)
      /*if(all_clients_selected || selecteds.length == 0){
            //return self.clients
        }*/
      return self.clients.filter(function(client) {
        if (!self.settings.show_all_clients && client.status == 'archived') {
          return false
        }
        if (client.company_id != self.current_company.id) {
          //alert(client.name)
          return false
        }

        if (chosen_clients.indexOf('0') == -1) {
          if (typeof chosen_clients[0] != 'number') {
            return chosen_clients.indexOf(client.id.toString()) !== -1
          } else {
            return chosen_clients.indexOf(client.id) !== -1
          }
        }
        return true
      })
    },
    filtered_clients(company_id) {
      let self = this
      return self.clients.filter(function(client) {
        if (!self.settings.show_all_clients && (client.status == 'archived' || client.status == 'inactive')) {
          return false
        }
        return client.company_id == company_id
      })
    },
    onOffSelect(e) {
      let index = $.inArray(e.target.value, this.chosen_clients)
      if (index !== -1) {
        //this.chosen_clients.splice(index, 1)
      } else {
        //this.chosen_clients.push(e.target.value*1)
      }
      //console.log(this.chosen_clients)
    },
    getData(where) {
      console.log(where)
      //labeledConsole('where',where)
      let self = this
      //console.log(this.clients)
      //Get time entries
      //self.start = $('#start').val()
      //self.end = $('#end').val()
      //labeledConsole('project', this.$route.query['project[]'])
      if (!this.current_company.id) {
        //return
      }
      //$('#client').val(this.chosen_clients)

      let form = document.querySelector('#invoiceable-form')
      let data = new FormData(form)
      //data.append('start', this.start)
      //data.append('end', this.end)
      //labeledConsole('data', data)
      if (!data) {
        //TODO: for some reason, if you visit invoiceable, then go to dashboard, the element is still created so this function area is triggered on emit refresh
        return
      }
      console.log(where)
      //this.$router.push({ path: '/invoiceable?' + data})
      //labeledConsole('project', $('#project').val())
      sessionStorage.setItem('invoiceable', data)
      //$('.uncheck').attr('checked', false)
      if (self.isAdmin()) {
        this.$http().post('/invoiceable-timers', data, function(response) {
          self.invoice_items = response.invoice_items
          self.timers = response.timers
          console.log('getting data')
          console.log(response)
          self.total_time = 0
          self.total_earned = 0
          self.total_unpaid = 0
          self.total_unbillable = 0
          self.total_invoiceable = 0
          self.timers.forEach(function(key, timer) {
            console.log(timer.id, timer.duration, timer.notes)

            self.total_time += timer.duration
            self.total_earned += (timer.duration / 3600) * timer.user_rate
            if (!timer.is_paid) {
              self.total_unpaid += (timer.duration / 3600) * timer.user_rate
            }
            if (!timer.is_billable) {
              self.total_unbillable++
            } else {
              self.total_invoiceable += (timer.invoice_duration / 3600) * timer.client_rate
            }
          })
        })
      } else {
        this.$http().post('payable-timers', data, function(response) {
          self.timers = response.timers
          self.total_time = 0
          self.total_earned = 0
          self.total_unpaid = 0
          self.total_unbillable = 0
          $.each(self.timers, function(key, timer) {
            self.total_time += timer.duration
            self.total_earned += (timer.duration / 3600) * timer.user_rate
            if (!timer.is_paid) {
              self.total_unpaid += (timer.duration / 3600) * timer.user_rate
            }
            if (!timer.is_billable) {
              self.total_unbillable++
            }
          })
        })
      }
    }
  }
}
</script>

<style scoped>
.nav > li > a {
  padding-top: 3px;
  padding-bottom: 3px;
}

a.active {
  background: transparent;
}
</style>
