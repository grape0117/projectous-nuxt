<template>
  <div class="invoices-items">
    <div>
      <b-button-group>
        <b-button variant="primary" @click="updateInvoiceStatus(invoice.id, 'open')">Open</b-button>
        <b-button variant="success" @click="updateInvoiceStatus(invoice.id, 'paid')">Paid</b-button>
        <b-button variant="danger" @click="updateInvoiceStatus(invoice.id, 'voided')">Voided</b-button>
      </b-button-group>
    </div>
    <div>{{ invoice.date }}</div>
    <div>
      <b v-if="invoice && invoice.client">{{ invoice.client.name }}</b>
      <div v-for="(project, project_index) in invoice.projects" :key="project_index" v-bind:project="project" style="font-size: smaller">
        <span v-if="project">{{ project.name }}</span>
      </div>
    </div>
    <div>{{ invoice.invoice_id }}</div>
    <div>{{ invoice.total }}</div>
    <div>{{ invoice.note ? invoice.note : 'No notes...' }}</div>
    <div>{{ invoice.start_date }}</div>
    <div>{{ invoice.end_date }}</div>
    <div class="buttons">
      <div class="options">
        <a class="btn btn-xs btn-info" target="_blank" :href="'/invoice/' + invoice.invoice_id"> View </a>
        <a class="btn btn-xs btn-primary" target="_blank" :href="'/export/csv/invoice/' + invoice.invoice_id"> CSV </a>
        <!--<a class="btn btn-xs btn-default">Export</a>-->
        <a class="btn btn-xs btn-danger" @click="deleteInvoice(invoice)">Delete</a>
        <!--<div data-toggle="popover" :data-content="'select projects.name, round(invoice_duration/3600,2) as time, client_rate, report_at, notes from timelog left join projects on project_id = projects.id where invoice_id = '+invoice.invoice_id">Query</div>-->
      </div>
      <div class="payment">
        <!--<span v-if="invoice.payments.length > 0">payment available</span>-->
        <button type="button" class="btn btn-primary" @click="applyPayment()" v-if="invoice.status === 'open'">Payment</button>
      </div>
    </div>
  </div>
</template>

<script>
import { EventBus } from '@/components/event-bus'

export default {
  name: 'invoices-row',
  props: ['invoice'],
  methods: {
    async updateInvoiceStatus(id, status) {
      const { invoice } = await this.$http().patch('/invoices/', id, { attribute: 'status', value: status })
      this.invoice = invoice
    },
    applyPayment() {
      EventBus.$emit('apply-payment', this.invoice)
      console.log(this.invoice)
    },
    async deleteInvoice() {
      if (confirm('Are you sure you want to delete invoice ' + this.invoice.invoice_id + '?')) {
        const { invoice } = await this.$http().delete('/invoices', this.invoice.id)
        this.invoice = invoice
      }
    }
  }
}
</script>
