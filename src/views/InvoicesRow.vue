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
    <div style="padding: 3px">{{ invoice.start_date }}</div>
    <div style="padding: 3px">{{ invoice.end_date }}</div>
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

<style lang="scss">
#invoices-row {
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
