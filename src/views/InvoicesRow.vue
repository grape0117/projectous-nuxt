<template>
  <div class="invoices-items">
    <div class="pr-3">
      <div class="invoices-buttons">
        <div class="invoices-button" :style="{ background: backgroundColor('open') }" @click="updateInvoiceStatus(invoice.id, 'open')">Open</div>
        <div class="invoices-button" :style="{ background: backgroundColor('paid') }" @click="updateInvoiceStatus(invoice.id, 'paid')">Paid</div>
        <div class="invoices-button" :style="{ background: backgroundColor('voided') }" @click="updateInvoiceStatus(invoice.id, 'voided')">Voided</div>
      </div>
    </div>
    <div class="text-right pr-3" style="min-width: 135px">{{ invoice.date }}</div>
    <div>
      <b v-if="invoice && invoice.client">{{ invoice.client.name }}</b>
      <div v-for="(project, project_index) in invoice.projects" :key="project_index" v-bind:project="project" style="font-size: smaller">
        <span v-if="project">{{ project.name }}</span>
      </div>
    </div>
    <div class="text-right pr-3">{{ invoice.invoice_id }}</div>
    <div class="text-right pr-3">{{ invoice.total }}</div>
    <div v-html="invoice.note ? invoice.note : 'No notes...'" contenteditable="true" @input="setNoteValue"></div>
    <div class="text-right pr-3">{{ invoice.start_date }}</div>
    <div class="text-right pr-3">{{ invoice.end_date }}</div>
    <div class="buttons">
      <div class="invoices-buttons">
        <div class="invoices-button" :style="{ background: is_theme_colors ? bgStyle : toRGB(bgStyle[0]) }" @click="redirect('invoice')">
          <i class="icon-open_in_new" />
        </div>
        <div class="invoices-button" :style="{ background: is_theme_colors ? bgStyle : toRGB(bgStyle[0]) }" @click="redirect('csv')">CSV</div>
        <div class="invoices-button" :style="{ background: is_theme_colors ? bgStyle : toRGB(bgStyle[0]) }" @click="deleteInvoice(invoice)">
          <!-- <i class="icon-delete_forever" />
          <i class="icon-delete" /> -->
          <i class="icon-delete_outline" />
        </div>
      </div>
      <div class="payment">
        <button type="button" class="btn btn-primary" @click="applyPayment()">{{ payments_count ? `Payments (${payments_count})` : 'Payments' }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { EventBus } from '@/components/event-bus'
import _ from 'lodash'

export default {
  name: 'invoices-row',
  props: ['invoice', 'bgStyle', 'bgTheme'],
  data() {
    return {
      note: null
    }
  },
  computed: {
    payments_count() {
      return this.invoice.payments.length > 0 ? this.invoice.payments.length : null
    },
    is_theme_colors() {
      return this.bgTheme === JSON.stringify('Colors')
    }
  },
  methods: {
    setNoteValue: _.debounce(function(e) {
      let note = e.target.innerText
      this.saveNotes(note)
    }, 500),
    async saveNotes(note) {
      const { id } = this.invoice

      const { invoices } = await this.$http().patch('/invoices/', id, { attribute: 'note', value: note })

      this.invoice.note = invoices.note
    },
    redirect(to) {
      const path = 'http://release.projectous.com/'
      const invoice = `invoice/${this.invoice.invoice_id}`
      const csv = `export/csv/invoice/${this.invoice.invoice_id}`

      if (to === 'invoice') return window.open(`${path}${invoice}`, '_blank')
      if (to === 'csv') return window.open(`${path}${csv}`, '_blank')
    },
    async updateInvoiceStatus(id, status) {
      const { invoices } = await this.$http().patch('/invoices/', id, { attribute: 'status', value: status })

      this.$emit('update-invoice-status', invoices)
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
    backgroundColor(status, color_index = 0) {
      return this.is_theme_colors ? this.statusBgStyle(status) : this.toRGB(this.statusBgStyle(status) && this.statusBgStyle(status)[color_index])
    },
    toRGB(rgb) {
      if (!rgb) return null
      const { r, g, b } = rgb
      if (r && g && b) return `rgb(${r}, ${g}, ${b})`
    },
    statusBgStyle(invoice_status) {
      if (this.invoice.status !== invoice_status) return null

      return this.bgStyle
    }
  }
}
</script>

<style lang="scss" scoped>
// .background-opacity {
//   background-color: rgba($color: #000000, $alpha: 0.5);
// }
* {
  font-size: 14px;
}
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
  .payment {
    min-width: 110px;

    button {
      width: 100%;
    }
  }
}
</style>
