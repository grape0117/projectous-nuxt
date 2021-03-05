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
          <a href="#closed" aria-controls="open" role="tab" data-toggle="tab">
            Closed
          </a>
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
        <invoices-row :invoices="openinvoices()" />
      </div>
      <div role="tabpanel" id="closed" class="tab-pane">
        <div class="table-responsive">
          <invoices-row :invoices="closedinvoices()" />
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
    async getData() {
      const { invoices } = await this.$http().get('/getInvoices')

      this.invoices = invoices

      console.log('[invoices] :')
      console.log(invoices)
    }
  }
}
</script>

<style lang="scss" scoped>
.row-date {
  border: 10px solid red !important;
}
</style>
