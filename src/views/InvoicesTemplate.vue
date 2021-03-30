<template id="invoices-template">
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-12 form-group form-inline"></div>
    </div>
    <div class="d-flex justify-content-between">
      <div class="year-buttons">
        <div class="year-button" :class="year === selectedYear ? 'selected-year' : null" v-for="year in invoices_years" :key="year" @click="selectYear(year)">
          <span>{{ year }}</span>
          <span class="total-open">{{ totalByStatus(year, status) }}</span>
        </div>
      </div>
      <div>
        <b-dropdown :text="status" dropleft variant="outline-primary">
          <b-dropdown-item @click="setStatus('open')">Open</b-dropdown-item>
          <b-dropdown-item @click="setStatus('closed')">Closed</b-dropdown-item>
          <b-dropdown-item @click="setStatus('voided')">Voided</b-dropdown-item>
        </b-dropdown>
      </div>
    </div>

    <div class="tab-content mt-2">
      <div class="invoices-table tab-pane active" role="tabpanel" id="open">
        <div class="invoices-header">
          <span>Status</span>
          <span>Date Created</span>
          <span>Recipient</span>
          <span>Invoice ID</span>
          <span>Amount</span>
          <span>Start Date</span>
          <span>End Date</span>
          <span>Options</span>
        </div>
        <div v-for="invoice in invoice_to_show" :key="invoice.id">
          <invoices-row v-bind:invoice="invoice" />
        </div>
      </div>
      <div class="tab-pane invoices-table" role="tabpanel" id="closed">
        <div class="table-responsive">
          <div class="invoices-header">
            <span>Status</span>
            <span>Date Created</span>
            <span>Recipient</span>
            <span>Invoice ID</span>
            <span>Amount</span>
            <span>Start Date</span>
            <span>End Date</span>
            <span>Options</span>
          </div>
          <div class="invoices-items" v-for="invoice in invoice_to_show" :key="invoice.id">
            <invoices-row v-bind:invoice="invoice" />
          </div>
        </div>
      </div>
    </div>
    <invoices-apply-payment />
  </div>
</template>

<script>
import moment from 'moment'

import InvoicesRow from './InvoicesRow.vue'

export default {
  name: 'invoices-template',
  components: {
    'invoices-row': InvoicesRow,
    'invoices-apply-payment': () => import('./InvoicesApplyPayment.vue')
  },
  data: function() {
    return {
      invoices: [],
      selectedYear: moment(new Date()).format('YYYY'),
      status: 'open'
    }
  },
  computed: {
    invoice_to_show() {
      let invoices = this.invoicesByYear(this.selectedYear)
      return this.getStatus(invoices, this.status)
    },
    current_company: function() {
      return this.$store.state.settings.current_company_user_id
    },
    invoices_years() {
      // return [...new Set(this.invoices.map(invoice => invoice.date))]
      return [...new Set(this.invoices.map(invoice => moment(invoice.date).format('YYYY')))]
    }
  },
  mounted: function() {
    //alert('mounting invoices')
    //if (this.current_company.id) {
    this.getData()
    //}
    //initBindings()
  },
  watch: {
    current_company() {
      // alert('new company!')
      this.getData()
    }
  },
  methods: {
    setStatus(status) {
      this.status = status
    },
    getStatus(invoices, status) {
      return invoices.filter(i => i.status === status)
    },
    invoicesByYear(year) {
      return this.invoices.filter(i => moment(i.date).format('YYYY') === year)
    },
    totalByStatus(year, status) {
      let invoices = this.invoicesByYear(year)
      return this.getStatus(invoices, status).length
    },
    selectYear(year) {
      if (this.selectedYear === year) return

      this.selectedYear = year
    },
    async getData() {
      const { invoices } = await this.$http().get('/invoices')
      this.invoices = invoices
    }
  }
}
</script>

<style lang="scss" scoped>
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
    .total-open {
      background-color: green;
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

    span:nth-child(1) {
      width: 100%;
      max-width: calc(100vw / 6);
    }
    span:nth-child(2) {
      width: 100%;
      max-width: calc(100vw / 12);
    }
    span:nth-child(3) {
      width: 100%;
      max-width: calc(100vw / 6);
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
      max-width: calc(100vw / 14);
    }
    span:nth-child(7) {
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
      // flex-grow: 10;
    }
    > div:nth-child(2) {
      width: 100%;
      max-width: calc(100vw / 12);
    }
    > div:nth-child(3) {
      width: 100%;
      max-width: calc(100vw / 6);
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
      max-width: calc(100vw / 14);
    }
    > div:nth-child(7) {
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
