<template>
  <div class="invoices-items">
    <div>
      <div class="invoices-buttons">
        <div class="invoices-button" :class="statusBackgroundStyle('open')" @click="updateInvoiceStatus(invoice.id, 'open')">Open</div>
        <div class="invoices-button" :class="statusBackgroundStyle('paid')" @click="updateInvoiceStatus(invoice.id, 'paid')">Paid</div>
        <div class="invoices-button" :class="statusBackgroundStyle('voided')" @click="updateInvoiceStatus(invoice.id, 'voided')">Voided</div>
      </div>
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
    <div>{{ invoice.start_date }}</div>
    <div>{{ invoice.end_date }}</div>
    <div class="buttons">
      <div class="invoices-buttons">
        <div class="invoices-button" :class="backgroundStyle" @click="redirect('invoice')">View</div>
        <div class="invoices-button" :class="backgroundStyle" @click="redirect('csv')">CSV</div>
        <div class="invoices-button" :class="backgroundStyle" @click="deleteInvoice(invoice)">Delete</div>
      </div>
      <div class="payment">
        <button type="button" class="btn btn-primary" @click="applyPayment()" v-if="invoice.status === 'open'">Payment</button>
      </div>
    </div>
  </div>
</template>

<script>
import { EventBus } from '@/components/event-bus'

export default {
  name: 'invoices-row',
  props: ['invoice', 'bgStyle'],
  methods: {
    redirect(to) {
      const path = 'http://release.projectous.com/'
      const invoice = `invoice/${this.invoice.invoice_id}`
      const csv = `export/csv/invoice/${this.invoice.invoice_id}`

      if (to === 'invoice') return window.open(`${path}${invoice}`, '_blank')
      if (to === 'csv') return window.open(`${path}${csv}`, '_blank')
    },
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
    },
    statusBackgroundStyle(invoice_status) {
      if (this.invoice.status !== invoice_status) return null

      // if (!this.bgStyle) return 'paletteDefault'
      return this.backgroundStyle
    }
  },
  computed: {
    backgroundStyle() {
      return this.bgStyle ? this.bgStyle : 'paletteDefault'
    }
  }
}
</script>

<style lang="scss" scoped>
// .background-opacity {
//   background-color: rgba($color: #000000, $alpha: 0.5);
// }
.invoices-items {
  .invoices-buttons {
    height: 35px;
    border-radius: 3px;
    display: flex;
    margin-right: 5px;
    background-color: rgba($color: #000000, $alpha: 0.5);
    // backdrop-filter: brightness(0.5);

    .invoices-button {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;

      &:first-child {
        border-radius: 4px 0 0 4px;
      }

      &:last-child {
        border-radius: 0 4px 4px 0;
      }

      &:hover {
        box-shadow: 0 0 10px 2px rgba($color: #ffffff, $alpha: 0.5);
      }

      a {
        color: white;
        text-decoration: none;
      }
    }
  }

  .buttons .invoices-buttons {
    width: 200px;
  }
}
</style>
