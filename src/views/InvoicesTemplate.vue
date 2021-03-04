<template id="invoices-template">
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-12 form-group form-inline"></div>
    </div>
    <div>
      <ul role="tablist" class="nav nav-tabs">
        <li role="presentation" class="active" data-tab="open">
          <a href="#open" aria-controls="open" role="tab" data-toggle="tab">Open<!-- <span class="badge" v-html="openinvoices.length"></span>--></a>
        </li>
        <li role="presentation" data-tab="closed"><a href="#closed" aria-controls="open" role="tab" data-toggle="tab">Closed</a></li>
      </ul>
    </div>
    <div class="tab-content">
      <div role="tabpanel" id="open" class="tab-pane active">
        <div class="table-responsive">
          <table class="table timer-table">
            <tbody class="row-2017-2-18">
              <tr class="row-date">
                <th>Status</th>
                <th>Date Created</th>
                <th>Recipient</th>
                <th>Invoice ID</th>
                <th>Amount</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th></th>
                <td></td>
              </tr>
            </tbody>
            <tr :key="invoice.id" v-for="invoice in openinvoices()" v-bind:invoice="invoice" is="invoices-row"></tr>
            <!-- <tr :key="invoice" v-for="invoice in [1,2,3]" is="invoices-row"></tr> -->
          </table>
        </div>
      </div>
      <div role="tabpanel" id="closed" class="tab-pane">
        <div class="table-responsive">
          <table class="table timer-table">
            <tbody class="row-2017-2-18">
              <tr class="row-date">
                <th>Status</th>
                <th>Date Created</th>
                <th>Recipient</th>
                <th>Invoice ID</th>
                <th>Amount</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th></th>
                <td></td>
              </tr>
            </tbody>
            <tr :key="invoice.id" v-for="invoice in closedinvoices()" v-bind:invoice="invoice" is="invoices-row"></tr>
          </table>
        </div>
      </div>
    </div>
    <invoiceable-apply-payment />
  </div>
</template>

<script>
import InvoicesRow from './InvoicesRow.vue'
import InvoiceableApplyPayment from './InvoiceableApplyPayment.vue'

export default {
  name: 'invoices-template',
  components: {
    'invoices-row': InvoicesRow,
    'invoiceable-apply-payment': InvoiceableApplyPayment
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
        return invoice.status !== 'open'
      })
    },
    openinvoices() {
      return this.invoices.filter(function(invoice) {
        return invoice.status === 'open'
      })
    },
    deleteInvoice(invoice) {
      let self = this
      if (confirm('Are you sure you want to delete invoice ' + invoice.invoice_id + '?')) {
        ajax('/invoice/delete/' + invoice.id, {}, function(response) {
          self.getData()
        })
      }
    },
    isSelected(invoice, value) {
      if (this.invoice[value]) {
        return 'selected'
      }
    },
    getData() {
      let self = this
      const invoices = this.$http()
        .get('/getInvoices')
        .then(response => {
          self.invoices = response.invoices
        })

      console.log(invoices)
    }
  }
}
</script>
