<template>
  <div id="invoices-template">
    <div class="row">
      <div class="col-sm-12 form-group form-inline"></div>
    </div>
    <div class="d-flex justify-content-between">
      <div class="year-buttons">
        <div class="year-button" :class="year === selectedYear ? 'selected-year' : null" v-for="{ year, total } in invoice_years_data" :key="year" @click="selectYear(year)">
          <span>{{ year }}</span>
          <span class="total-open" :style="{ 'background-color': is_theme_colors ? background_colors : toRGB(background_colors[0]) }">{{ total }}</span>
        </div>
      </div>
      <div>
        <div class="invoices-total-paid">
          <span>Total Paid:</span>
          <span> {{ total_invoices_payment | numberWithCommas }}</span>
        </div>
        <!-- <b-dropdown :text="status" dropleft variant="outline-primary">
          <b-dropdown-item @click="setStatus('open')">Open</b-dropdown-item>
          <b-dropdown-item @click="setStatus('closed')">Closed</b-dropdown-item>
          <b-dropdown-item @click="setStatus('voided')">Voided</b-dropdown-item>
        </b-dropdown> -->
      </div>
    </div>

    <div class="tab-content mt-2">
      <div class="invoices-table">
        <div class="invoices-header">
          <span class="status">Status</span>
          <span class="text-right pr-3" @click="setSortBy('date_created')">
            <!-- <i class="icon-keyboard_arrow_down" /> -->
            <i :class="sortClass('date_created')" />
            Date Created
          </span>
          <span>Recipient</span>
          <span class="text-right pr-3" @click="setSortBy('invoice_id')">
            <i :class="sortClass('invoice_id')" />
            Invoice ID
          </span>
          <span class="text-right pr-3" @click="setSortBy('amount')">
            <i :class="sortClass('amount')" />
            Amount
          </span>
          <span>Note</span>
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
        <div v-for="invoice in invoiceSort" :key="invoice.id">
          <invoices-row v-bind:invoice="invoice" :bgStyle="background_colors" :bgTheme="bgTheme" @update-invoice-status="updateInvoiceStatus" />
        </div>
      </div>
    </div>
    <invoices-apply-payment />
  </div>
</template>

<script>
import moment from 'moment'
import { EventBus } from '@/components/event-bus'

import InvoicesRow from './InvoicesRow.vue'
import { getCookie } from '@/utils/util-functions'

export default {
  name: 'invoices-template',
  components: {
    'invoices-row': InvoicesRow,
    'invoices-apply-payment': () => import('./InvoicesApplyPayment.vue')
  },
  data: function() {
    return {
      invoices: [],
      invoice_years: [],
      open_invoice_count: [],
      selectedYear: moment(new Date()).format('YYYY'),
      status: 'open',
      bgStyle: null,
      bgTheme: null,
      sortBy: {}
    }
  },
  created() {
    // if (getCookie('bg-style')) {
    //   let bgStyle = getCookie('bg-style')
    //   this.bgStyle = JSON.parse(bgStyle)
    // }

    // console.log('bgStyle')
    // console.log(bgStyle)

    let bgStyle = getCookie('bg-style')
    if (bgStyle) {
      // If bgStyle is an object
      if (bgStyle && Object.keys(bgStyle).length > 0) {
        this.bgStyle = JSON.parse(bgStyle)
      } else {
        // If bgStyle is a string
        this.bgStyle = bgStyle
      }
    }
    if (getCookie('bg-theme')) {
      this.bgTheme = getCookie('bg-theme')
    }
  },
  computed: {
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

      if (sortBy.col_name === 'date_created') {
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
    },
    // invoice_to_show() {
    //   return this.getStatus(this.invoices, this.status)
    // },
    total_invoices_payment() {
      const invoices_payments = this.invoices.filter(invoice => {
        return invoice.status === 'paid'
      })

      let total_payment = 0

      for (const invoice of invoices_payments) {
        total_payment += Number(invoice.total)
      }

      return Math.round(total_payment * 100) / 100
    },
    is_theme_colors() {
      return this.bgTheme === JSON.stringify('Colors')
    },
    background_colors() {
      // If theme is 'Colors'
      if (this.is_theme_colors) {
        return this.bgStyle
      }
      // If theme is 'Images'
      return this.bgStyle.rgba_colors
    },
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
    EventBus.$on('changeBackground', ({ option, theme }) => {
      this.bgStyle = option
      this.bgTheme = theme
    })
  },
  filters: {
    numberWithCommas(value) {
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
  },
  watch: {
    current_company() {
      // alert('new company!')
      this.getData()
    }
  },
  methods: {
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
    toRGB(rgb) {
      if (!rgb) return null
      const { r, g, b } = rgb
      if (r && g && b) return `rgb(${r}, ${g}, ${b})`
    },
    updateInvoiceStatus({ id, status }) {
      const invoice = this.invoices.find(i => i.id === id)

      const index = this.invoices.indexOf(invoice)

      this.invoices[index].status = status
    },
    // filter status
    setStatus(status) {
      this.status = status
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
      const { invoices, invoice_years, open_invoice_count } = await this.getInvoicesByYear('2021')

      console.log({ invoices })

      this.invoices = invoices
      this.invoice_years = invoice_years
      this.open_invoice_count = open_invoice_count
    }
  }
}
</script>

<style lang="scss" scoped>
.invoices-total-paid {
  background-color: rgba($color: #000000, $alpha: 0.4);
  color: white;
  height: 100%;
  display: flex;
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
      width: 10px 10px;
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
    justify-content: space-around;
    border-radius: 4px;
    box-shadow: 0px 0px 8px rgba($color: #fff, $alpha: 1);

    span {
      cursor: pointer;

      i {
        font-size: 16px;
        margin-left: -20px;
      }
    }

    span:nth-child(1) {
      width: 100%;
      max-width: calc(100vw / 6);
      min-width: 200px;
    }
    span:nth-child(2) {
      width: 100%;
      max-width: calc(100vw / 12);
    }
    span:nth-child(3) {
      width: 100%;
      max-width: calc(100vw / 10);
      min-width: 100px;
    }
    span:nth-child(4) {
      width: 100%;
      max-width: calc(100vw / 14);
    }
    span:nth-child(5) {
      width: 100%;
      max-width: calc(100vw / 14);
    }
    span:nth-child(6) {
      width: 100%;
      max-width: calc(100vw / 10);
    }
    span:nth-child(7) {
      width: 100%;
      max-width: calc(100vw / 14);
    }
    span:nth-child(8) {
      width: 100%;
      max-width: calc(100vw / 14);
    }
    span:last-child {
      width: 100%;
      max-width: calc(100vw / 6);
      min-width: 320px;
    }
  }
  .invoices-items {
    display: flex;
    justify-content: space-around;
    background-color: rgba($color: #000000, $alpha: 0.6);
    color: white;
    word-break: break-word;
    padding: 10px 5px;

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
    }
    > div:nth-child(3) {
      width: 100%;
      max-width: calc(100vw / 10);
      min-width: 100px;
    }
    > div:nth-child(4) {
      width: 100%;
      max-width: calc(100vw / 14);
    }
    > div:nth-child(5) {
      width: 100%;
      max-width: calc(100vw / 14);
    }
    > div:nth-child(6) {
      width: 100%;
      max-width: calc(100vw / 10);
    }
    > div:nth-child(7) {
      width: 100%;
      max-width: calc(100vw / 14);
    }
    > div:nth-child(8) {
      width: 100%;
      max-width: calc(100vw / 14);
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
