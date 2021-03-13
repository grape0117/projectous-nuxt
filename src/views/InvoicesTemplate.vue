<template id="invoices-template">
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-12 form-group form-inline"></div>
    </div>
    <div>
      <ul role="tablist" class="nav nav-tabs">
        <li role="presentation" class="active" data-tab="open">
          <a href="#open" aria-controls="open" role="tab" data-toggle="tab"> Open<!-- <span class="badge" v-html="openinvoices.length"></span>--> </a>
        </li>
        <li role="presentation" data-tab="closed">
          <a href="#closed" aria-controls="open" role="tab" data-toggle="tab"> Closed </a>
        </li>
      </ul>
    </div>
    <div>
      <!-- <pre>
        {{ invoices.filter(invoice => invoice.payments.length > 0) }}
      </pre> -->
    </div>
    <div class="tab-content">
      <div role="tabpanel" id="open" class="tab-pane active">
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
        <div class="invoices-items" v-for="invoice in openinvoices()" :key="invoice.id">
          <invoices-row v-bind:invoice="invoice" />
        </div>
      </div>
      <div role="tabpanel" id="closed" class="tab-pane">
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
          <div class="invoices-items" v-for="invoice in closedinvoices()" :key="invoice.id">
            <invoices-row v-bind:invoice="invoice" />
          </div>
        </div>
      </div>
    </div>
    <invoices-apply-payment />
  </div>
</template>

<script>
import InvoicesRow from './InvoicesRow.vue'

export default {
  name: 'invoices-template',
  components: {
    'invoices-row': InvoicesRow,
    'invoices-apply-payment': () => import('./InvoicesApplyPayment.vue')
  },
  computed: {
    current_company: function() {
      return this.$store.state.settings.current_company_user_id
    }
  },
  data: function() {
    return {
      invoices: []
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
    closedinvoices() {
      return this.invoices.filter(function(invoice) {
        return invoice.status !== 'open' && !invoice.deleted_at
      })
    },
    openinvoices() {
      return this.invoices.filter(function(invoice) {
        return invoice.status === 'open' && !invoice.deleted_at
      })
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
</style>
