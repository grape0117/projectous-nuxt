<template>
  <div id="invoices-template">
    <div class="row">
      <div class="col-sm-12 form-group form-inline"></div>
    </div>
    <div>
      <div class="d-flex justify-content-between mb-2">
        <div class="year-buttons">
          <div class="year-button" :class="'open' === selectedYear ? 'selected-year' : null" @click="selectYear('open')">
            <span>Open</span>
            <span class="total-open" :style="{ 'background-color': default_theme_color }">{{ total_open_invoice_count }}</span>
          </div>
          <div class="year-button" :class="year === selectedYear ? 'selected-year' : null" v-for="{ year, total } in invoice_years_data" :key="year" @click="selectYear(year)">
            <span>{{ year }}</span>
            <span class="total-open" :style="{ 'background-color': default_theme_color }">{{ total }}</span>
          </div>
        </div>
        <!-- <div>
          <div style="float:right">
            <div class="year-buttons">
              <div class="year-button">
                <span>Paid: </span>
                <span> ${{ total_invoices_payment('paid') | numberWithCommas }}</span>
              </div>
              <div class="year-button">
                <span>Unpaid: </span>
                <span> ${{ total_invoices_payment('open') | numberWithCommas }}</span>
              </div>
            </div>
          </div>
        </div> -->
      </div>
      <div class="mb-2">
        <b-badge variant="secondary" class="mr-1 invoice-breakdown-badge">Unsent: ${{ unsent_total }}</b-badge>
        <b-badge variant="secondary" class="mr-1 invoice-breakdown-badge">Unpaid: ${{ unpaid_total }}</b-badge>
        <b-badge variant="secondary" class="mr-1 invoice-breakdown-badge">Paid: ${{ paid_total }}</b-badge>
        <b-badge variant="secondary" class="mr-1 invoice-breakdown-badge">Voided: ${{ voided_total }}</b-badge>
      </div>
      <b-table responsive :items="invoice_filter" :fields="fields" thead-class="table-header-background" tbody-class="table-header-background" :busy="is_busy" style="max-height: 86vh; overflow: auto;">
        <template #thead-top="data">
          <b-tr>
            <b-th colspan="1">
              <div style="display:flex;align-items:center;">
                <b-form-checkbox id="checkbox-all" v-model="check_all" name="checkbox-all" />
                <b-form-select id="action" v-model="action">
                  <b-form-select-option :value="null" disabled>Select Action</b-form-select-option>
                  <b-form-select-option value="export">Export to quickbooks</b-form-select-option>
                </b-form-select>
              </div>
            </b-th>
            <b-th colspan="1">
              <b-button @click="applyAction()">Go</b-button>
            </b-th>
            <b-th colspan="9"></b-th>
          </b-tr>
        </template>
        <template #table-busy>
          <div class="text-center my-2">
            <b-spinner class="align-middle"></b-spinner>
            <strong>Loading...</strong>
          </div>
        </template>
        <template #head(id)="data">
          <span class="status d-flex">
            <div class="switch mr-2">
              <div class="checkbox-switch" @click="toggleShowAllStatus" :style="{ 'background-color': show_all_status ? (is_theme_colors ? background_colors : toRGB(background_colors[0])) : null }">
                <div :style="{ 'margin-left': show_all_status ? '10px' : null }"></div>
              </div>
              <span class="checkbox-switch-title" @click="toggleShowAllStatus">All</span>
            </div>
            <div class="status-buttons">
              <b-button-group size="sm" style="height:30px">
                <b-button @click="setStatusFilter('open')" :style="{ 'background-color': status_filter === 'open' ? (is_theme_colors ? background_colors : toRGB(background_colors[0])) : 'transparent', border: 'none', display: 'flex' }">
                  Open
                  <b-badge variant="light" style="margin-top: 4px; margin-left: 4px;">{{ open_count }}</b-badge>
                </b-button>
                <b-button @click="setStatusFilter('sent')" :style="{ 'background-color': status_filter === 'sent' ? (is_theme_colors ? background_colors : toRGB(background_colors[0])) : 'transparent', border: 'none', display: 'flex' }">
                  Sent
                  <b-badge variant="light" style="margin-top: 4px; margin-left: 4px;">{{ sent_count }}</b-badge>
                </b-button>
                <b-button @click="setStatusFilter('paid')" :style="{ 'background-color': status_filter === 'paid' ? (is_theme_colors ? background_colors : toRGB(background_colors[0])) : 'transparent', border: 'none', display: 'flex' }">
                  Paid
                  <b-badge variant="light" style="margin-top: 4px; margin-left: 4px;">{{ paid_count }}</b-badge>
                </b-button>
                <b-button @click="setStatusFilter('voided')" :style="{ 'background-color': status_filter === 'voided' ? (is_theme_colors ? background_colors : toRGB(background_colors[0])) : 'transparent', border: 'none', display: 'flex' }">
                  Voided
                  <b-badge variant="light" style="margin-top: 4px; margin-left: 4px;">{{ voided_count }}</b-badge>
                </b-button>
              </b-button-group>
            </div>
          </span>
        </template>
        <template #cell(id)="data">
          <span class="status d-flex">
            <!-- <input type="checkbox" :value="data.item.id" class="invoice-checkbox" :name="'item[' + data.item.id + ']'" /> -->
            <b-form-checkbox name="selected-invoice" v-model="selected_invoice_id" :value="data.item.invoice_id"> </b-form-checkbox>
            <b-button-group size="sm" style="height:30px">
              <b-button @click="updateStatus(data.item.id, 'open', data.item)" :style="{ background: backgroundColor('open', data.item), border: 'none' }">Open</b-button>
              <b-button @click="updateStatus(data.item.id, 'sent', data.item)" :style="{ background: backgroundColor('sent', data.item), border: 'none' }">Sent</b-button>
              <b-button @click="updateStatus(data.item.id, 'paid', data.item)" :style="{ background: backgroundColor('paid', data.item), border: 'none' }">Paid</b-button>
              <b-button @click="updateStatus(data.item.id, 'voided', data.item)" :style="{ background: backgroundColor('voided', data.item), border: 'none' }">Voided</b-button>
            </b-button-group>
          </span>
        </template>
        <template #cell(age)="data">
          <span :style="{ color: invoice_age(data.item, true) }">{{ invoice_age(data.item) }}</span>
        </template>
        <template #cell(date_created)="data">
          {{ formatDate(data.item.created_at) }}
        </template>
        <template #cell(recipient)="data">
          <b v-if="data && data.item.client">{{ data.item.client.name }}</b>
          <div v-for="(project, project_index) in data.item.projects" :key="project_index" v-bind:project="project" style="font-size: smaller">
            <span v-if="project">{{ project.name }}</span>
          </div>
        </template>
        <template #cell(amount)="data">
          {{ `$${data.item.total}` }}
        </template>
        <template #cell(note)="data">
          <b-form-textarea style="min-width: 100px" class="transparent-input-note" v-model="data.item.note" debounce="500" rows="0" max-rows="7" cols="300" @change="setNoteValue($event, data.item)"></b-form-textarea>
        </template>
        <template #cell(payment_notes)="data">
          {{ data.item.payment_notes }}
        </template>
        <template #cell(start_date)="data">
          {{ formatDate(data.item.start_date) }}
        </template>
        <template #cell(end_date)="data">
          {{ formatDate(data.item.end_date) }}
        </template>
        <template #cell(options)="data">
          <span class="status d-flex">
            <b-button-group size="sm" style="height:30px">
              <b-button :style="{ background: 'rgb(68 64 55)', border: 'none' }" @click="redirect('task_invoice', data.item.invoice_id)"><i class="icon-open_in_new"/></b-button>
              <b-button :style="{ background: default_theme_color, border: 'none' }" @click="redirect('invoice', data.item.invoice_id)"><i class="icon-open_in_new"/></b-button>
              <b-button :style="{ background: default_theme_color, border: 'none' }" @click="redirect('csv', data.item.invoice_id)">CSV</b-button>
              <b-button style="border:none" variant="danger" @click="deleteInvoice(data.item)"><i class="icon-delete_outline"/></b-button>
              <b-button style="border:none" variant="primary" @click="applyPayment(data.item)">Payment</b-button>
            </b-button-group>
          </span>
        </template>
      </b-table>
    </div>
    <invoices-apply-payment />
    <update-invoice-status-modal :show="show_update_status_modal" @hide="hideUpdateStatusModal" :invoice_details="invoice_details" :updateInvoiceStatus="updateInvoiceStatus" />
    <invoice-logs-modal :show="show_logs_modal" @hide="hideInvoiceLogsModal" :logs="selected_invoice_logs" />
  </div>
</template>

<script>
import moment from 'moment'
import { colorThemes } from '@/mixins/colorThemes'

import InvoicesRow from './InvoicesRow.vue'
import { EventBus } from '@/components/event-bus'
import { getCookie } from '@/utils/util-functions'

export default {
  name: 'invoices-template',
  components: {
    'invoices-row': InvoicesRow,
    'invoices-apply-payment': () => import('./InvoicesApplyPayment.vue'),
    'update-invoice-status-modal': () => import('./UpdateInvoiceStatusModal.vue'),
    'invoice-logs-modal': () => import('./InvoiceLogsModal.vue')
  },
  mixins: [colorThemes],
  data: function() {
    return {
      invoices: [],
      invoice_years: [],
      open_invoice_count: [],
      total_open_invoice_count: 0,
      selectedYear: 'open', //moment(new Date()).format('YYYY'),
      client_search: '',
      bgStyle: null,
      bgTheme: null,
      sortBy: {},
      show_all_status: false,
      selected_invoice_id: [],
      check_all: null,
      fields: [
        { key: 'id', sortable: false },
        { key: 'invoice_id', sortable: true },
        {
          key: 'age',
          sortable: true,
          sortByFormatted: (value, key, item) => {
            const age = this.invoice_age(item)
            return age.replace(' Days', '')
          }
        },
        {
          key: 'date_created',
          sortable: true,
          sortByFormatted: (value, key, item) => {
            return this.formatDate(item.created_at)
          }
        },
        {
          key: 'recipient',
          sortable: true,
          sortByFormatted: (value, key, item) => {
            return item.client.name
          }
        },
        {
          key: 'amount',
          sortable: true,
          sortByFormatted: (value, key, item) => {
            return parseInt(item.total)
          }
        },
        {
          key: 'note',
          sortable: true
        },
        {
          key: 'payment_notes',
          sortable: true
        },
        { key: 'start_date', sortable: true },
        { key: 'end_date', sortable: true },
        { key: 'options', sortable: false }
      ],
      items: [{ id: 'radio here', invoice_id: 1234, recipient: 'someone', amount: 222, note: 'test', age: '2 days', date_created: 'Aug 19', start_date: 'Aug 19', end_date: 'Aug 30', options: 'wqewwe' }],
      is_busy: false,
      action: null,
      open_count: 0,
      sent_count: 0,
      paid_count: 0,
      voided_count: 0,
      unsent_total: 0,
      unpaid_total: 0,
      paid_total: 0,
      voided_total: 0,
      invoice_count_per_year: [],
      show_update_status_modal: false,
      invoice_details: null,
      show_logs_modal: false,
      selected_invoice_logs: null
    }
  },
  created() {
    EventBus.$on('updateInvoice', ({}) => {
      console.log('update INvoice')
      this.getData()
    })
  },
  computed: {
    invoice_filter() {
      if (this.show_all_status) return this.invoiceSort
      this.is_busy = false
      return this.invoiceSort.filter(invoice => invoice.status === this.status_filter && (!invoice.client || invoice.client.name.indexOf(this.client_search) !== -1))
    },
    status_filter: {
      get() {
        return this.$store.state.settings.invoices_status
      },
      set(status_value) {
        this.$store.state.settings.invoices_status = status_value
      }
    },
    sortAsc() {
      return this.sortBy && this.sortBy.type === 'asc'
    },
    sortDesc() {
      return this.sortBy && this.sortBy.type === 'desc'
    },
    invoiceSort() {
      let sortBy = this.sortBy
      let ASC = sortBy.type === 'asc'

      // default
      if (sortBy && !Object.keys(sortBy).length)
        return this.invoices.sort((a, b) => {
          let date_1 = new Date(a.date)
          let date_2 = new Date(b.date)

          return date_1 > date_2 ? -1 : date_1 < date_2 ? 1 : 0
        })

      if (sortBy.col_name === 'date_created' || sortBy.col_name === 'age') {
        return this.invoices.sort((a, b) => {
          let date_1 = new Date(a.date)
          let date_2 = new Date(b.date)

          if (ASC) {
            return date_1 > date_2 ? 1 : date_1 < date_2 ? -1 : 0
          } else {
            return date_1 > date_2 ? -1 : date_1 < date_2 ? 1 : 0
          }
        })
      }
      if (sortBy.col_name === 'invoice_id') {
        return this.invoices.sort((a, b) => {
          let id_ = Number(a.invoice_id)
          let id_2 = Number(b.invoice_id)

          if (ASC) {
            return id_ > id_2 ? 1 : id_ < id_2 ? -1 : 0
          } else {
            return id_ > id_2 ? -1 : id_ < id_2 ? 1 : 0
          }
        })
      }
      if (sortBy.col_name === 'amount') {
        return this.invoices.sort((a, b) => {
          let amount_1 = Number(a.total)
          let amount_2 = Number(b.total)

          if (ASC) {
            return amount_1 > amount_2 ? 1 : amount_1 < amount_2 ? -1 : 0
          } else {
            return amount_1 > amount_2 ? -1 : amount_1 < amount_2 ? 1 : 0
          }
        })
      }
      if (sortBy.col_name === 'date_start') {
        return this.invoices.sort((a, b) => {
          let date_1 = new Date(a.start_date)
          let date_2 = new Date(b.start_date)

          if (ASC) {
            return date_1 > date_2 ? 1 : date_1 < date_2 ? -1 : 0
          } else {
            return date_1 > date_2 ? -1 : date_1 < date_2 ? 1 : 0
          }
        })
      }
      if (sortBy.col_name === 'date_end') {
        return this.invoices.sort((a, b) => {
          let date_1 = new Date(a.end_date)
          let date_2 = new Date(b.end_date)

          if (ASC) {
            return date_1 > date_2 ? 1 : date_1 < date_2 ? -1 : 0
          } else {
            return date_1 > date_2 ? -1 : date_1 < date_2 ? 1 : 0
          }
        })
      }
      if (sortBy.col_name === 'client') {
        return this.invoices.sort((a, b) => {
          let client_1 = a.client ? a.client.name : ''
          let client_2 = b.client ? b.client.name : ''

          if (ASC) {
            return client_1 > client_2 ? 1 : client_1 < client_2 ? -1 : 0
          } else {
            return client_1 > client_2 ? -1 : client_1 < client_2 ? 1 : 0
          }
        })
      }
    },
    // invoice_to_show() {
    //   return this.getStatus(this.invoices, this.status)
    // },

    current_company: function() {
      return this.$store.state.settings.current_company_user_id
    },
    invoice_years_data() {
      let invoice = []
      let total_open_invoice_count = 0
      for (const { year } of this.invoice_years) {
        let open_year = this.open_invoice_count.find(function(year_count) {
          return year_count.year === year
        })

        let count_per_year = this.invoice_count_per_year.find(function(year_count) {
          return year_count.year === year
        })
        if (open_year) {
          total_open_invoice_count += open_year['count(id)']
        }

        invoice.push({ year: year.toString(), total: count_per_year && count_per_year['status_count'] ? count_per_year['status_count'] : '' })
      }

      this.total_open_invoice_count = total_open_invoice_count

      return invoice
    }
  },
  mounted: function() {
    this.getData()
    // EventBus.$on('changeBackground', ({ option, theme }) => {
    //   if (theme === 'Colors') {
    //     this.bgTheme = JSON.stringify(theme)
    //   } else {
    //     this.bgTheme = theme
    //   }
    //   this.bgStyle = option
    // })
  },
  filters: {
    numberWithCommas(value) {
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
  },
  watch: {
    current_company() {
      // this.getData()
    },
    selected_invoice_id() {},
    check_all() {
      if (this.check_all) {
        this.selected_invoice_id = this.invoice_filter.filter(e => e.invoice_id).map(({ invoice_id }) => invoice_id)
      } else {
        this.selected_invoice_id = []
      }
    },
    show_update_status_modal: function() {
      if (this.show_update_status_modal == false) {
        this.getData()
        this.invoice_details = null
        return
      }
    },
    show_logs_modal: function() {
      if (this.show_logs_modal == false) {
        this.selected_invoice_logs = null
        return
      }
    }
  },
  methods: {
    showInvoiceLogsModal(logs) {
      this.show_logs_modal = true
      this.selected_invoice_logs = logs ? JSON.parse(logs) : []
    },
    hideInvoiceLogsModal() {
      this.show_logs_modal = false
    },
    showUpdateStatusModal() {
      this.show_update_status_modal = true
    },
    hideUpdateStatusModal() {
      this.show_update_status_modal = false
    },
    async get_count() {
      const counts = await this.$http().get('/invoices/counts')
      this.invoice_years = counts.invoice_years
      this.open_invoice_count = counts.open_invoice_count
    },
    invoice_age(invoice, return_color) {
      if (invoice.status === 'open') {
        const invoice_date = moment(invoice.created_at, 'YYYY-MM-DD')
        const today = moment().startOf('day')

        //Difference in number of days
        const days_diff = Math.floor(moment.duration(today.diff(invoice_date)).asDays())
        let return_data
        if (return_color) {
          if (days_diff <= 30) {
            return_data = 'white'
          } else if (days_diff > 30 && days_diff <= 60) {
            return_data = 'yellow'
          } else if (days_diff > 60) {
            return_data = 'red'
          }
        } else {
          return_data = Math.floor(days_diff) + ' Days'
        }
        return return_data
      } else {
        return null
      }
    },
    total_invoices_payment(filter) {
      const invoices_payments = () => {
        if (this.status_filter) {
          return this.invoices.filter(invoice => {
            return invoice.status === filter
          })
        }

        return this.invoices
      }

      let total_payment = 0

      for (const invoice of invoices_payments()) {
        total_payment += Number(invoice.total)
      }

      return Math.round(total_payment * 100) / 100
    },
    toggleShowAllStatus() {
      this.show_all_status = !this.show_all_status

      if (this.show_all_status) {
        this.status_filter = null
        return
      }
      this.status_filter = 'open'
    },
    setStatusFilter(filter_value) {
      if (this.show_all_status) {
        this.show_all_status = false
      }
      this.status_filter = filter_value
      this.getData()
    },
    sortClass(sortBy_colName) {
      const sortBy = this.sortBy

      if (sortBy && sortBy_colName === 'date_created' && !Object.keys(sortBy).length) {
        return 'icon-keyboard_arrow_down'
      }

      if (sortBy && sortBy.col_name === sortBy_colName) {
        if (this.sortAsc) return 'icon-keyboard_arrow_up'
        if (this.sortDesc) return 'icon-keyboard_arrow_down'
      }

      return null
    },
    setSortBy(option) {
      let sortBy = this.sortBy
      let sortBy_length = sortBy && Object.keys(sortBy).length

      if (sortBy.col_name === 'date_created' && option === 'date_created') {
        return (this.sortBy = {})
      }

      if (!sortBy_length || (sortBy_length > 0 && sortBy.col_name !== option)) {
        return (this.sortBy = { col_name: option, type: 'asc' })
      }

      if (sortBy_length > 0 && sortBy.col_name === option) {
        if (sortBy.type === 'desc') return (this.sortBy = {})

        return (sortBy.type = 'desc')
      }
    },
    updateInvoiceStatus({ id, status }) {
      const invoice = this.invoices.find(i => i.id === id)

      const index = this.invoices.indexOf(invoice)

      this.invoices[index].status = status

      this.get_count()
    },
    processBreakdownPerStatus(total_per_status) {
      this.unsent_total = total_per_status
        .filter(e => e.status === 'open')
        .reduce((total, obj) => total + parseFloat(obj.total), 0)
        .toFixed(2)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      this.unpaid_total = total_per_status
        .filter(e => e.status === 'open' || e.status === 'sent')
        .reduce((total, obj) => total + parseFloat(obj.total), 0)
        .toFixed(2)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      this.paid_total = total_per_status
        .filter(e => e.status === 'paid')
        .reduce((total, obj) => total + parseFloat(obj.total), 0)
        .toFixed(2)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      this.voided_total = total_per_status
        .filter(e => e.status === 'voided')
        .reduce((total, obj) => total + parseFloat(obj.total), 0)
        .toFixed(2)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    // getStatus(invoices, status) {
    //   return invoices.filter(i => i.status === status)
    // },
    async selectYear(year) {
      this.open_count = 0
      this.sent_count = 0
      this.paid_count = 0
      this.voided_count = 0
      this.is_busy = true
      if (this.selectedYear === year) return

      this.selectedYear = year

      const { invoices, invoice_years, open_invoice_count } = await this.$http().get(`/invoices/${year}`)

      this.invoices = invoices
      this.processBreakdownPerStatus(invoices)
      this.invoice_years = invoice_years
      this.open_invoice_count = open_invoice_count
      this.getCountPerStatus(year)
    },
    async getInvoicesByYear(year) {
      const { invoices, invoice_years, open_invoice_count, invoice_count_per_year } = await this.$http().get(`/invoices/${year}`)

      return { invoices, invoice_years, open_invoice_count, invoice_count_per_year }
    },
    async getData() {
      const { invoices, invoice_years, open_invoice_count, invoice_count_per_year } = await this.getInvoicesByYear(this.selectedYear) //new Date().getFullYear()

      this.invoices = invoices
      this.processBreakdownPerStatus(invoices)
      this.invoice_years = invoice_years
      this.open_invoice_count = open_invoice_count
      this.invoice_count_per_year = invoice_count_per_year
      this.getCountPerStatus(this.selectedYear)
    },
    async getCountPerStatus() {
      const { count, total_per_status } = await this.$http().get(`/invoices_count_per_status/${this.selectedYear}`)
      const check_open_count = count.find(e => e.status === 'open')
      const check_sent_count = count.find(e => e.status === 'sent')
      const check_paid = count.find(e => e.status === 'paid')
      const check_voided = count.find(e => e.status === 'voided')
      if (check_open_count) {
        this.open_count = check_open_count.count
      }

      if (check_sent_count) {
        this.sent_count = check_sent_count.count
      }

      if (check_paid) {
        this.paid_count = check_paid.count
      }

      if (check_voided) {
        this.voided_count = check_voided.count
      }
    },
    formatDate(date) {
      return moment(date).format('MMM DD YYYY')
    },
    applyAction() {
      let self = this
      if (this.action === 'export') {
        this.$http()
          .post('/invoices/quickbooks', this.selected_invoice_id)
          .then(function() {
            // Do something with the response
          })
      }
    },
    getCompanyUserDetails(company_user_id) {
      const user_details = this.$store.state.company_users.company_users.find(e => e.id === company_user_id)

      return user_details
    },
    async updateStatus(id, status, data) {
      let company_user_user_id = this.$store.state.settings.current_company_user_id
      let company_user_details = this.getCompanyUserDetails(company_user_user_id)

      let temp_data = { ...data }
      temp_data.status = status

      if (status != this.status_filter && ['paid', 'voided'].includes(status)) {
        this.showUpdateStatusModal()
        this.invoice_details = temp_data
      } else {
        const current_ts = new Date()
        const timezone = moment.tz.guess()
        const timezone_date = moment.tz(current_ts, timezone)
        const gmt_date = timezone_date
          .clone()
          .tz('GMT')
          .format('YYYY-MM-DD h:mm a')
        const log = `${company_user_details.name} moved invoice to ${status} at ${gmt_date}`
        let parse_log_data = temp_data.log ? JSON.parse(temp_data.log) : []
        parse_log_data.push({ note: '', status, log, date: gmt_date })
        temp_data.log = JSON.stringify(parse_log_data)

        const { invoices } = await this.$http().put('/invoices/', id, temp_data)
        this.updateInvoiceStatus(invoices)
        this.getData()
      }
    },
    redirect(to, invoice_id) {
      const path = 'http://old.projectous.com/'
      const invoice = `invoice/${invoice_id}`
      const task_invoice = `task_invoice/${invoice_id}`
      const csv = `export/csv/invoice/${invoice_id}`

      if (to === 'invoice') return window.open(`/${invoice}`, '_blank')
      if (to === 'task_invoice') return window.open(`/${task_invoice}`, '_blank')
      if (to === 'csv') return window.open(`${path}${csv}`, '_blank')
    },
    applyPayment(selected_invoice) {
      EventBus.$emit('apply-payment', selected_invoice)
    },
    backgroundColor(status, invoice) {
      return this.is_theme_colors ? this.statusBgStyle(status, invoice) : invoice.status === status ? this.default_theme_color : false
    },
    statusBgStyle(invoice_status, invoice) {
      if (invoice.status !== invoice_status) return 'rgba(0, 0, 0, 0.6)'
      return this.bgStyle
    },
    async deleteInvoice(data) {
      let invoice_id = data.invoice_id
      let id = data.id
      if (confirm('Are you sure you want to delete invoice ' + invoice_id + '?')) {
        await this.$http().delete('/invoices', id)
      }
    },
    setNoteValue: _.debounce(function(value, invoice) {
      this.saveNotes(value, invoice)
    }, 500),
    async saveNotes(note, invoice) {
      const { id } = invoice

      const { invoices } = await this.$http().patch('/invoices/', id, { attribute: 'note', value: note })
    },
    getLatestLog(log) {
      const parse_log = log ? JSON.parse(log) : ''
      if (log == null) {
        return ''
      }

      return parse_log.legth == 1 ? parse_log[0] : parse_log[parse_log.length - 1]
    }
  }
}
</script>

<style lang="scss" scoped>
.switch {
  display: flex;
  max-width: 60px;
  align-items: center;

  .checkbox-switch {
    min-width: 28px;
    width: 28px;
    height: 16px;
    border: 1px solid white;
    border-radius: 50px;
    display: flex;
    align-items: center;
    padding: 2px;
    margin-right: 5px;

    div {
      width: 12px;
      height: 12px;
      background-color: white;
      border-radius: 50px;
      // margin-left: 10px;
      transition: 0.2s;
    }
  }

  .checkbox-switch-title {
    font-size: 14px;
    font-weight: 400;
  }
}

.status-buttons {
  font-size: 14px;
  font-weight: 400;
  background-color: rgba($color: #000000, $alpha: 0.5);
  overflow: hidden;
  border-radius: 4px;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.invoices-total-paid {
  background-color: rgba($color: #000000, $alpha: 0.4);
  color: white;
  height: 100%;
  display: inline-block;
  justify-content: center;
  align-items: center;
  padding: 2px 10px;
  border-radius: 5px;

  :first-child {
    font-weight: 500;
    margin-right: 10px;
  }
}
.row-date {
  border: 10px solid red !important;
}
.year-buttons {
  display: flex;
  border-radius: 5px;
  overflow: hidden;

  .year-button {
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    background-color: rgba($color: #000000, $alpha: 0.4);
    font-size: 18px;
    padding: 5px 15px;
    user-select: none;
    cursor: pointer;

    .total-closed {
      background-color: red;
    }

    .total-closed,
    .total-open {
      margin: 5px 5px;
      /*width: 10px;*/
      font-size: 12px;
      border-radius: 4px;
      padding: 0 5px;
    }
  }

  .year-button:hover,
  .selected-year {
    background-color: rgba($color: #000000, $alpha: 0.5);
  }
}
</style>

<style lang="scss">
#invoices-template {
  padding: 10px;
  width: 100%;
  max-height: calc(100vh - 50px);
  overflow-y: auto;
  overflow-x: hidden;
}

.invoice-breakdown-badge {
  background: rgba(0, 0, 0, 0.4) !important;
}

.invoices-table {
  .invoices-header {
    background-color: rgba($color: #000000, $alpha: 0.6);
    color: white;
    height: 50px;
    font-size: 16px;
    font-weight: 500;
    padding: 10px 5px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    // justify-content: space-around;
    border-radius: 4px;
    box-shadow: 0 0 8px rgba($color: #fff, $alpha: 1);

    span {
      cursor: pointer;

      i {
        font-size: 16px;
        margin-left: -20px;
      }
    }

    > span:nth-child(1) {
      width: 100%;
      max-width: calc(100vw / 6);
      min-width: 200px;
    }
    > span:nth-child(2) {
      width: 100%;
      max-width: calc(100vw / 12);
      min-width: 120px;

      i::before {
        margin-right: -5px;
      }
    }
    > span:nth-child(3) {
      width: 100%;
      max-width: calc(100vw / 10);
      min-width: 120px;
    }
    > span:nth-child(4) {
      width: 100%;
      max-width: calc(100vw / 14);
      min-width: 100px;

      i::before {
        margin-right: -5px;
      }
    }
    > span:nth-child(5) {
      width: 100%;
      max-width: calc(100vw / 14);
      min-width: 100px;

      i::before {
        margin-right: -5px;
      }
    }
    > span:nth-child(6) {
      width: 100%;
      max-width: calc(100vw / 20);
      min-width: 60px;
    }
    > span:nth-child(7) {
      width: 100%;
      max-width: calc(100vw / 10);
      min-width: 135px;
    }
    > span:nth-child(8) {
      width: 100%;
      max-width: calc(100vw / 14);
      min-width: 100px;

      i::before {
        margin-right: -5px;
      }
    }
    > span:nth-child(9) {
      width: 100%;
      max-width: calc(100vw / 14);
      min-width: 100px;

      i::before {
        margin-right: -5px;
      }
    }
    > span:last-child {
      width: 100%;
      max-width: calc(100vw / 6);
      min-width: 320px;
    }
  }
  .invoices-items {
    display: flex;
    // justify-content: space-around;
    background-color: rgba($color: #000000, $alpha: 0.6);
    color: white;
    word-break: break-word;
    padding: 3px 5px;

    &:hover {
      background-color: rgba($color: #000000, $alpha: 0.7);
    }

    > div:nth-child(1) {
      width: 100%;
      max-width: calc(100vw / 6);
      min-width: 200px;
    }
    > div:nth-child(2) {
      width: 100%;
      max-width: calc(100vw / 12);
      min-width: 120px;
    }
    > div:nth-child(3) {
      width: 100%;
      max-width: calc(100vw / 10);
      min-width: 120px;
    }
    > div:nth-child(4) {
      width: 100%;
      max-width: calc(100vw / 14);
      min-width: 100px;
    }
    > div:nth-child(5) {
      width: 100%;
      max-width: calc(100vw / 14);
      min-width: 100px;
    }
    > div:nth-child(6) {
      width: 100%;
      max-width: calc(100vw / 20);
      min-width: 60px;
    }
    > div:nth-child(7) {
      width: 100%;
      max-width: calc(100vw / 10);
      min-width: 135px;
    }
    > div:nth-child(8) {
      width: 100%;
      max-width: calc(100vw / 14);
      min-width: 100px;
    }
    > div:nth-child(9) {
      width: 100%;
      max-width: calc(100vw / 14);
      min-width: 100px;
    }
    > div:last-child {
      width: 100%;
      max-width: calc(100vw / 6);
      min-width: 320px;
      display: flex;
      // border: 1px solid red;
      justify-content: space-between;

      .options {
        // display: flex;
        height: 38px;
        // border: 1px solid red;
        a:not(:last-child) {
          margin-right: 5px;
        }
        // justify-content: space-around;
      }
      .payment {
        // border: 1px solid red;
        height: 38px;
        width: 87px;
      }
    }
  }
}
</style>
