<template id="invoices-template">
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-12 form-group form-inline"></div>
    </div>
    <div class="d-flex">
      <!-- <ul role="tablist" class="nav nav-tabs">
        <li role="presentation" class="active" data-tab="open">
          <a href="#open" aria-controls="open" role="tab" data-toggle="tab"> Open</a>
        </li>
        <li role="presentation" data-tab="closed">
          <a href="#closed" aria-controls="open" role="tab" data-toggle="tab"> Closed </a>
        </li>
      </ul> -->
      <div class="year-buttons">
        <div class="year-button" :class="year === selectedYear ? 'selected-year' : null" v-for="year in invoices_years" :key="year" @click="selectYear(year)">
          <!-- <span class="total-closed">{{ totalByStatus(year, 'closed') }}</span> -->
          <span>{{ year }}</span>
          <span class="total-open">{{ totalByStatus(year, 'open') }}</span>
        </div>
      </div>

      <pre></pre>
    </div>
    <div></div>
    <div class="tab-content">
      <div role="tabpanel" class="tab-pane active">
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
      selectedYear: moment(new Date()).format('YYYY')
    }
  },
  computed: {
    invoice_to_show() {
      let invoices = this.invoicesByYear(this.selectedYear)
      return this.getStatus(invoices, 'open')
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
