<template id="invoices-row">
  <tr class="table-row-hover">
    <td>
      <select v-on:change="updateInvoiceStatus(invoice.id, invoice.status)" v-model="invoice.status">
        <option value="open">Open</option>
        <option value="paid">Paid</option>
        <option value="voided">Voided</option>
      </select>
    </td>
    <td>{{ invoice.date }}</td>
    <td>
      <b>{{ invoice.client.name }}</b>
      <div v-for="project in invoice.projects" v-bind:project="project" style="font-size: smaller;">{{ project.name }}</div>
    </td>
    <td>{{ invoice.invoice_id }}</td>
    <td>{{ invoice.total }}</td>
    <td style="padding: 3px;">{{ invoice.start_date }}</td>
    <td style="padding: 3px;">{{ invoice.end_date }}</td>
    <td>
      <a class="btn btn-xs btn-info" target="_blank" :href="'/invoice/' + invoice.invoice_id">View</a> <a class="btn btn-xs btn-primary" target="_blank" :href="'/export/csv/invoice/' + invoice.invoice_id">CSV</a
      ><!--<a class="btn btn-xs btn-default">Export</a>-->
      <a class="btn btn-xs btn-danger" @click="deleteInvoice(invoice)">Delete</a>
      <!--<div data-toggle="popover" :data-content="'select projects.name, round(invoice_duration/3600,2) as time, client_rate, report_at, notes from timelog left join projects on project_id = projects.id where invoice_id = '+invoice.invoice_id">Query</div>-->
    </td>
    <td><button type="button" class="btn btn-primary" v-on:click="applyPayment()" v-if="isAdmin()">Apply Payment</button></td>
  </tr>
</template>

<script>
export default {
  name: 'invoices-row',
  props: ['invoice'],
  methods: {
    updateInvoiceStatus(invoice, status) {
      console.log(status)
      $.post('/invoice/update-status', { id: invoice, status: status }, function(response) {
        let invoiceKey = store.invoiceLookup[reponse.invoice.id]
        Vue.set(store.invoices[invoiceKey], status, status)
      })
    },
    isAdmin() {
      return this.$store.getters['settings/isAdmin']
    },
    applyPayment() {
      this.$store.commit('settings/setCurrentEditInvoice', this.invoice)
      let current_edit_payment = { invoice_id: this.invoice['id'], amount: this.invoice['total'], check_no: '', note: '' }
      this.$store.commit('settings/setCurrentEditPayment', current_edit_payment)
      this.$store.dispatch('invoices/applyPayment')
    },
    deleteInvoice(invoice) {
      let self = this
      if (confirm('Are you sure you want to delete invoice ' + invoice.invoice_id + '?')) {
        ajax('/invoice/delete/' + invoice.id, {}, function(response) {
          self.getData()
        })
      }
    },
    getData() {
      let self = this
      this.$http().get('getInvoices', {}, function(response) {
        Vue.set(self, 'invoices', response.invoices)
      })
    }
  }
}
</script>
