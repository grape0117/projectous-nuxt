<template>
  <div id="invoices-template">
    <div class="row">
      <div class="col-sm-12 form-group form-inline"></div>
    </div>
    <div>
      <div class="d-flex justify-content-between mb-2">
        <div class="year-buttons">
          <div class="year-button" :class="year === selectedYear ? 'selected-year' : null" v-for="{ year, total } in invoice_years_data" :key="year" @click="selectYear(year)">
            <span>{{ year }}</span>
            <span class="total-open" :style="{ 'background-color': default_theme_color }">{{ total }}</span>
          </div>
        </div>
        <div>
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
        </div>
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
            <b-th colspan="8"></b-th>
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
                <b-button @click="setStatusFilter('open')" :style="{ 'background-color': status_filter === 'open' ? (is_theme_colors ? background_colors : toRGB(background_colors[0])) : 'transparent', border: 'none' }">Open</b-button>
                <b-button @click="setStatusFilter('paid')" :style="{ 'background-color': status_filter === 'paid' ? (is_theme_colors ? background_colors : toRGB(background_colors[0])) : 'transparent', border: 'none' }">Paid</b-button>
                <b-button @click="setStatusFilter('voided')" :style="{ 'background-color': status_filter === 'voided' ? (is_theme_colors ? background_colors : toRGB(background_colors[0])) : 'transparent', border: 'none' }">Voided</b-button>
              </b-button-group>
            </div>
          </span>
        </template>
        <template #cell(id)="data">
          <span class="status d-flex">
            <!-- <input type="checkbox" :value="data.item.id" class="invoice-checkbox" :name="'item[' + data.item.id + ']'" /> -->
            <b-form-checkbox name="selected-invoice" v-model="selected_invoice_id" :value="data.item.invoice_id"> </b-form-checkbox>
            <b-button-group size="sm" style="height:30px">
              <b-button @click="updateStatus(data.item.id, 'open')" :style="{ background: backgroundColor('open', data.item), border: 'none' }">Open</b-button>
              <b-button @click="updateStatus(data.item.id, 'paid')" :style="{ background: backgroundColor('paid', data.item), border: 'none' }">Paid</b-button>
              <b-button @click="updateStatus(data.item.id, 'voided')" :style="{ background: backgroundColor('voided', data.item), border: 'none' }">Voided</b-button>
            </b-button-group>
          </span>
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
          <b-form-textarea class="transparent-input-note" v-model="data.item.note" debounce="500" rows="0" max-rows="7" cols="300" @change="setNoteValue($event, data.item)"></b-form-textarea>
        </template>
        <template #cell(age)="data">
          {{ invoice_age(data.item) }}
        </template>
        <template #cell(date_created)="data">
          {{ formatDate(data.item.created_at) }}
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
  </div>
</template>

<script>
import moment from 'moment'
import { colorThemes } from '@/mixins/colorThemes'

import InvoicesRow from './InvoicesRow.vue'
import { EventBus } from '@/components/event-bus'
// import { getCookie } from '@/utils/util-functions'

export default {
  name: 'invoices-template',
  components: {
    'invoices-row': InvoicesRow,
    'invoices-apply-payment': () => import('./InvoicesApplyPayment.vue')
  },
  mixins: [colorThemes],
  data: function() {
    return {
      invoices: [],
      invoice_years: [],
      open_invoice_count: [],
      selectedYear: moment(new Date()).format('YYYY'),
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
        { key: 'start_date', sortable: true },
        { key: 'end_date', sortable: true },
        { key: 'options', sortable: false }
      ],
      items: [{ id: 'radio here', invoice_id: 1234, recipient: 'someone', amount: 222, note: 'test', age: '2 days', date_created: 'Aug 19', start_date: 'Aug 19', end_date: 'Aug 30', options: 'wqewwe' }],
      is_busy: false,
      action: null
    }
  },
  created() {},
  computed: {
    invoice_filter() {
      if (this.show_all_status) return this.invoiceSort
      this.is_busy = false
      return this.invoiceSort.filter(invoice => invoice.status === this.status_filter)
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
          let client_1 = a.client.name
          let client_2 = b.client.name

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

      for (const { year } of this.invoice_years) {
        for (const open_year of this.open_invoice_count) {
          if (open_year.year === year) {
            invoice.push({ year: year.toString(), total: open_year['count(id)'] })
          }
        }
      }

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
      this.getData()
    },
    selected_invoice_id() {
      console.log(this.selected_invoice_id)
    },
    check_all() {
      if (this.check_all) {
        this.selected_invoice_id = this.invoice_filter.filter(e => e.invoice_id).map(({ invoice_id }) => invoice_id)
      } else {
        this.selected_invoice_id = []
      }
    }
  },
  methods: {
    invoice_age(invoice) {
      if (invoice.status === 'open') {
        const invoice_date = moment(invoice.created_at, 'YYYY-MM-DD')
        const today = moment().startOf('day')

        //Difference in number of days
        return Math.floor(moment.duration(today.diff(invoice_date)).asDays()) + ' Days'
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

      console.log({ id })
      console.log({ status })
    },
    // getStatus(invoices, status) {
    //   return invoices.filter(i => i.status === status)
    // },
    async selectYear(year) {
      this.is_busy = true
      if (this.selectedYear === year) return

      this.selectedYear = year

      const { invoices, invoice_years, open_invoice_count } = await this.$http().get(`/invoices/${year}`)

      this.invoices = invoices
      this.invoice_years = invoice_years
      this.open_invoice_count = open_invoice_count
    },
    async getInvoicesByYear(year) {
      const { invoices, invoice_years, open_invoice_count } = await this.$http().get(`/invoices/${year}`)

      return { invoices, invoice_years, open_invoice_count }
    },
    async getData() {
      const { invoices, invoice_years, open_invoice_count } = await this.getInvoicesByYear(new Date().getFullYear())

      console.log({ invoices })

      this.invoices = invoices
      this.invoice_years = invoice_years
      this.open_invoice_count = open_invoice_count
    },
    formatDate(date) {
      return moment(date).format('MMM DD')
    },
    applyAction() {
      let self = this
      console.log(this.action)
      if (this.action === 'export') {
        this.$http()
          .post('/invoices/quickbooks', this.selected_invoice_id)
          .then(function() {
            // Do something with the response
          })
      }
    },
    async updateStatus(id, status) {
      const { invoices } = await this.$http().patch('/invoices/', id, { attribute: 'status', value: status })
      this.updateInvoiceStatus(invoices)
    },
    redirect(to, invoice_id) {
      const path = 'http://old.projectous.com/'
      const invoice = `invoice/${invoice_id}`
      const csv = `export/csv/invoice/${invoice_id}`

      if (to === 'invoice') return window.open(`${path}${invoice}`, '_blank')
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
