<template>
  <div id="invoices-template">
    <div class="row">
      <div class="col-sm-12 form-group form-inline"></div>
    </div>
    <div class="d-flex justify-content-between">
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
      <div>
        <div class="invoices-total-paid">
          <span>Paid:</span>
          <span> ${{ total_invoices_payment('paid') | numberWithCommas }}</span>
        </div>
        <div class="invoices-total-paid">
          <span>Unpaid:</span>
          <span> ${{ total_invoices_payment('open') | numberWithCommas }}</span>
        </div>
      </div>
    </div>
    <div class="tab-content mt-2">
      <div class="invoices-table">
        <div class="invoices-header">
          <span class="status d-flex justify-content-between">
            <div class="switch">
              <div class="checkbox-switch" @click="toggleShowAllStatus" :style="{ 'background-color': show_all_status ? (is_theme_colors ? background_colors : toRGB(background_colors[0])) : null }">
                <div :style="{ 'margin-left': show_all_status ? '10px' : null }"></div>
              </div>
              <span class="checkbox-switch-title" @click="toggleShowAllStatus">All</span>
            </div>

            <div class="status-buttons">
              <span class="p-1" @click="setStatusFilter('open')" :style="{ 'background-color': status_filter === 'open' ? (is_theme_colors ? background_colors : toRGB(background_colors[0])) : null }">
                Open
              </span>
              <span class="p-1" @click="setStatusFilter('paid')" :style="{ 'background-color': status_filter === 'paid' ? (is_theme_colors ? background_colors : toRGB(background_colors[0])) : null }">
                Paid
              </span>
              <span class="p-1" @click="setStatusFilter('voided')" :style="{ 'background-color': status_filter === 'voided' ? (is_theme_colors ? background_colors : toRGB(background_colors[0])) : null }">
                Voided
              </span>
            </div>
          </span>
          <span class="text-right pr-3" @click="setSortBy('invoice_id')">
            <i :class="sortClass('invoice_id')" />
            Invoice ID
          </span>
          <span class="text-right pr-3" @click="setSortBy('client')">
            <i :class="sortClass('client')"/>
            Recipient <input v-model="client_search"
          /></span>

          <span class="text-right pr-3" @click="setSortBy('amount')">
            <i :class="sortClass('amount')" />
            Amount
          </span>
          <span>Note</span>
          <span class="text-right pr-3" @click="setSortBy('age')">
            <i :class="sortClass('age')" class="" />
            Age</span
          >
          <span class="text-right pr-3" @click="setSortBy('date_created')">
            <!-- <i class="icon-keyboard_arrow_down" /> -->
            <i :class="sortClass('date_created')" class="" />
            Date Created
          </span>
          <span class="text-right pr-3" @click="setSortBy('date_start')">
            <i :class="sortClass('date_start')" />
            Start Date
          </span>
          <span class="text-right pr-3" @click="setSortBy('date_end')">
            <i :class="sortClass('date_end')" />
            End Date
          </span>
          <span>Options</span>
        </div>
        <div v-for="invoice in invoice_filter" :key="invoice.id">
          <invoices-row v-bind:invoice="invoice" @update-invoice-status="updateInvoiceStatus" />
        </div>
      </div>
    </div>
    <invoices-apply-payment />
  </div>
</template>

<script>
import moment from 'moment'
import { colorThemes } from '@/mixins/colorThemes'

import InvoicesRow from './InvoicesRow.vue'
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
      total_open_invoice_count: 0,
      selectedYear: 'open', //moment(new Date()).format('YYYY'),
      client_search: '',
      bgStyle: null,
      bgTheme: null,
      sortBy: {},
      show_all_status: false
    }
  },
  created() {
    // if (getCookie('bg-style')) {
    //   let bgStyle = getCookie('bg-style')
    //   this.bgStyle = JSON.parse(bgStyle)
    // }
    // console.log('bgStyle')
    // console.log(bgStyle)
    // let bgStyle = getCookie('bg-style')
    // if (bgStyle) {
    //   // If bgStyle is an object
    //   if (bgStyle && Object.keys(bgStyle).length > 0) {
    //     this.bgStyle = JSON.parse(bgStyle)
    //   } else {
    //     // If bgStyle is a string
    //     this.bgStyle = bgStyle
    //   }
    // }
    // if (getCookie('bg-theme')) {
    //   this.bgTheme = getCookie('bg-theme')
    // }
  },
  computed: {
    invoice_filter() {
      if (this.show_all_status) return this.invoiceSort

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
          console.log(year_count.year, ' === ', year)
          return year_count.year === year
        })
        if (open_year) {
          total_open_invoice_count += open_year['count(id)']
        }

        invoice.push({ year: year.toString(), total: open_year ? open_year['count(id)'] : '' })
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
      this.getData()
    }
  },
  methods: {
    async get_count() {
      const counts = await this.$http().get('/invoices/counts')
      this.invoice_years = counts.invoice_years
      this.open_invoice_count = counts.open_invoice_count
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
      this.get_count()
    },
    // getStatus(invoices, status) {
    //   return invoices.filter(i => i.status === status)
    // },
    async selectYear(year) {
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
      const { invoices, invoice_years, open_invoice_count } = await this.getInvoicesByYear('open') //new Date().getFullYear()

      console.log({ invoices })

      this.invoices = invoices
      this.invoice_years = invoice_years
      this.open_invoice_count = open_invoice_count
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
