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
        <div v-for="invoice in openinvoices()" :key="invoice.id">
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
          <div v-for="invoice in closedinvoices()" :key="invoice.id">
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
