<template>
  <div class="invoices-items">
    <div>
      <div class="invoices-buttons">
        <div class="invoices-button" :style="{ background: backgroundColor('open') }" @click="updateInvoiceStatus(invoice.id, 'open')">Open</div>
        <div class="invoices-button" :style="{ background: backgroundColor('paid') }" @click="updateInvoiceStatus(invoice.id, 'paid')">Paid</div>
        <div class="invoices-button" :style="{ background: backgroundColor('voided') }" @click="updateInvoiceStatus(invoice.id, 'voided')">Voided</div>
      </div>
    </div>
    <div class="text-right pr-3">{{ invoice.invoice_id }}</div>
    <div>
      <b v-if="invoice && invoice.client">{{ invoice.client.name }}</b>
      <div v-for="(project, project_index) in invoice.projects" :key="project_index" v-bind:project="project" style="font-size: smaller">
        <span v-if="project">{{ project.name }}</span>
      </div>
    </div>
    <div class="text-right pr-3">{{ `$${invoice.total}` }}</div>
    <div v-html="invoice.note ? invoice.note : 'No notes...'" contenteditable="true" @input="setNoteValue"></div>
    <div class="text-right pr-3">{{ invoice_age }}</div>
    <!-- <div class="text-right pr-3" style="min-width: 135px">{{ invoice.created_at }}</div> -->
    <div class="text-right pr-3">{{ invoice.created_at | moment('MMM DD') }}</div>
    <div class="text-right pr-3">{{ invoice.start_date | moment('MMM DD') }}</div>
    <!-- <div class="text-right pr-3">{{ invoice.end_date | moment('MMM do')}}</div> -->
    <div class="text-right pr-3">{{ invoice.end_date | moment('MMM DD') }}</div>
    <div class="buttons">
      <div class="invoices-buttons">
        <div class="invoices-button" :style="{ background: default_theme_color }" @click="redirect('invoice')">
          <i class="icon-open_in_new" />
        </div>
        <div class="invoices-button" :style="{ background: default_theme_color }" @click="redirect('csv')">CSV</div>
        <div class="invoices-button" :style="{ background: default_theme_color }" @click="deleteInvoice(invoice)">
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
import { colorThemes } from '@/mixins/colorThemes'
import moment from 'moment'
import _ from 'lodash'

export default {
  name: 'invoices-row',
  props: ['invoice'],
  mixins: [colorThemes],
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
    },
    invoice_age() {
      const invoice_date = moment(this.invoice.created_at, 'YYYY-MM-DD')
      const today = moment().startOf('day')

      //Difference in number of days
      return moment.duration(today.diff(invoice_date)).asDays()
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
      //
      return this.is_theme_colors ? this.statusBgStyle(status) : this.invoice.status === status ? this.default_theme_color : false
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
    // margin-right: 5px;
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
