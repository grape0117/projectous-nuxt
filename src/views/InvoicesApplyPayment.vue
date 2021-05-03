<template>
  <!-- <b-modal id="apply-payment-modal" class="apply-payment-modal" style="min-height: 500px" :size="(invoice && !invoice.payments.length) || active_tab === 1 ? 'md' : 'lg'" :title="(invoice && !invoice.payments.length) || active_tab === 1 ? 'Apply Payment' : 'Payments'" @ok="savePayment" @hidden="hide" :hide-footer="invoice && invoice.payments.length > 0 && active_tab === 0 ? true : false"> -->
  <b-modal id="apply-payment-modal" class="apply-payment-modal" style="min-height: 500px" :size="(invoice && !invoice.payments.length) || active_tab === 1 ? 'md' : 'lg'" @ok="savePayment" @hidden="hide" :hide-footer="invoice && invoice.payments.length > 0 && active_tab === 0 ? true : false">
    <!-- <template #modal-header="{ close }"> -->
    <template #modal-header>
      <div class="header">
        <div class="d-flex flex-column justify-content-between">
          <h5>{{ active_tab_add_payments ? 'Apply Payment' : 'Payments' }}</h5>

          <div class="d-flex flex-column" v-if="active_tab_add_payments">
            <span class="title">Invoice #: </span>
            <span class="text">{{ invoice.invoice_id }}</span>
          </div>
        </div>

        <div v-if="active_tab_add_payments">
          <div class="text-right d-flex flex-column">
            <span class="title">Invoice date: </span>
            <span class="text">{{ invoice.date }}</span>
          </div>
          <div class="text-right d-flex flex-column mt-2">
            <span class="title">Client name:</span>
            <span class="text">{{ invoice.client.name }}</span>
          </div>
        </div>
        <!-- <pre>
          {{ invoice }}
        </pre> -->
      </div>

      <!-- Emulate built in modal header close button action -->
      <!-- <b-button size="sm" variant="outline-danger" @click="close()">
        Close Modal
      </b-button>
      :title="(invoice && !invoice.payments.length) || active_tab === 1 ? 'Apply Payment' : 'Payments'" 
      <h5>Modal Header</h5> -->
    </template>
    <div no-body v-if="invoice && invoice.payments.length > 0">
      <b-tabs content-class="mt-3" v-model="active_tab" lazy>
        <b-tab title="List">
          <b-table striped hover :items="invoice.payments" :fields="table_fields">
            <template #cell(Options)="row">
              <div v-if="!row.item.toDelete">
                <b-button size="sm" @click="row.toggleDetails" class="mr-2"> {{ row.detailsShowing ? 'Hide' : 'Edit' }}</b-button>
                <b-button size="sm" class="mr-2" variant="danger" @click="toDeleteRow(row.item)"> Delete</b-button>
              </div>
              <div v-else class="d-flex flex-column align-items-end">
                <span>Are you sure you want to delete?</span>
                <div>
                  <b-button size="sm" variant="outline-primary mr-3" @click="removeToDelete(row.item)">No</b-button>
                  <b-button size="sm" variant="outline-danger" @click="deleteRow(row.item)">Yes</b-button>
                </div>
              </div>
            </template>

            <template #row-details="row">
              <b-card>
                <div class="mt-2">
                  <span class="label">Invoice #</span>
                  <b-form-input :value="invoice ? invoice.invoice_id : null" disabled></b-form-input>
                </div>
                <div class="mt-2">
                  <span class="label">Check #</span>
                  <b-form-input v-model="row.item.check_no"></b-form-input>
                  <span class="label error" v-if="edit_status === 'failed' && !row.item.check_no">* Check # must have value</span>
                </div>
                <div class="mt-2">
                  <span class="label">Amount</span>
                  <b-form-input type="number" v-model="row.item.amount"></b-form-input>
                  <span class="label error" v-if="edit_status === 'failed' && !row.item.amount">* Amount must have value</span>
                </div>
                <div class="mt-2">
                  <span class="label">Client Name</span>
                  <b-form-input :value="invoice ? invoice.client.name : null" disabled></b-form-input>
                </div>
                <div class="mt-2">
                  <span class="label">Image</span>
                  <b-form-file v-model="image" :state="Boolean(image)" placeholder="Choose a file or drop it here..." drop-placeholder="Drop file here..."></b-form-file>
                </div>
                <div class="mt-2">
                  <span class="label">Date..</span>
                  <b-form-datepicker v-model="row.item.check_date"></b-form-datepicker>
                  <span class="label error" v-if="edit_status === 'failed' && !row.item.check_date">* Date must have value</span>
                </div>
                <div class="mt-2 mb-2">
                  <span class="label">Invoice date</span>
                  <b-form-datepicker :value="invoice ? invoice.date : null" disabled></b-form-datepicker>
                </div>

                <b-row class="my-2 px-4 d-flex justify-content-end">
                  <b-button size="sm" variant="outline-primary" @click="saveEdit($event, row.item)">Save</b-button>
                </b-row>
              </b-card>
            </template>
          </b-table>
        </b-tab>
        <b-tab title="Add Payment">
          <div class="form" v-for="(form, form_index) in apply_form" :key="form_index">
            <div>
              <span class="label">Check #</span>
              <b-form-input v-model="form.check_number"></b-form-input>
              <span class="label error" v-if="saving_status === 'failed' && !form.check_number">* Check # must have value</span>
            </div>
            <div class="mt-2">
              <span class="label">Amount</span>
              <b-form-input type="number" v-model="form.amount"></b-form-input>
              <span class="label error" v-if="saving_status === 'failed' && !form.amount">* Amount must have value</span>
            </div>
            <div class="mt-2">
              <span class="label">Select Image</span>
              <b-form-file v-model="form.image" :state="Boolean(form.image)" placeholder="Choose a file or drop it here..." drop-placeholder="Drop file here..."></b-form-file>
            </div>
            <div class="mt-2">
              <span class="label">Choose a date</span>
              <b-form-datepicker v-model="form.date" class="mb-2"></b-form-datepicker>
              <span class="label error" v-if="saving_status === 'failed' && !form.date">* Date must have value</span>
            </div>
            <div class="d-flex justify-content-end">
              <div v-if="apply_form.length > 1" class="remove-button mr-3" v-b-tooltip.hover.top="'Remove Form'">
                <b-icon class="remove-icon" v-if="!form.removeForm" @click="form.removeForm = true" icon="x-circle" />
                <div v-else class="d-flex justify-content-between align-items-center">
                  <span class="mr-3">Are you sure you want to remove?</span>
                  <div>
                    <b-button variant="outline-danger" class="mr-3" @click="form.removeForm = false">No</b-button>
                    <b-button variant="outline-primary" @click="removeApplyForm(form)">Yes</b-button>
                  </div>
                </div>
              </div>

              <div v-if="form_index === apply_form.length - 1 && !form.removeForm" class="add-icon" v-b-tooltip.hover.top="'Add Form'" @click="addApplyForm">
                <b-icon icon="plus-circle" />
              </div>
            </div>
          </div>
        </b-tab>
      </b-tabs>
    </div>

    <!-- No Payments yet -->
    <div class="form" v-for="(form, form_index) in apply_form" :key="form_index" v-else>
      <div class="mt-2">
        <span class="label">Check #</span>
        <b-form-input v-model="form.check_number"></b-form-input>
        <span class="label error" v-if="saving_status === 'failed' && !form.check_number">* Check # must have value</span>
      </div>
      <div class="mt-2">
        <span class="label">Amount</span>
        <b-form-input type="number" v-model="form.amount"></b-form-input>
        <span class="label error" v-if="saving_status === 'failed' && !form.amount">* Amount must have value</span>
      </div>
      <div class="mt-2">
        <span class="label">Select Image</span>
        <b-form-file v-model="form.image" :state="Boolean(form.image)" placeholder="Choose a file or drop it here..." drop-placeholder="Drop file here..."></b-form-file>
      </div>
      <div class="mt-2">
        <span class="label">Choose a date</span>
        <b-form-datepicker v-model="form.date" class="mb-2"></b-form-datepicker>
        <span class="label error" v-if="saving_status === 'failed' && !form.date">* Date must have value</span>
      </div>
      <div class="d-flex justify-content-end">
        <div v-if="apply_form.length > 1" class="remove-button mr-3" v-b-tooltip.hover.top="'Remove Form'">
          <b-icon class="remove-icon" v-if="!form.removeForm" @click="form.removeForm = true" icon="x-circle" />
          <div v-else class="d-flex justify-content-between align-items-center">
            <span class="mr-3">Are you sure you want to remove?</span>
            <div>
              <b-button variant="outline-danger" class="mr-3" @click="form.removeForm = false">No</b-button>
              <b-button variant="outline-primary" @click="removeApplyForm(form)">Yes</b-button>
            </div>
          </div>
        </div>

        <div v-if="form_index === apply_form.length - 1 && !form.removeForm" class="add-icon" v-b-tooltip.hover.top="'Add Form'" @click="addApplyForm">
          <b-icon icon="plus-circle" />
        </div>
      </div>
    </div>
  </b-modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { EventBus } from '@/components/event-bus'

import moment from 'moment'

export default Vue.extend({
  data() {
    return {
      saving_status: null as null | string,
      edit_status: null as null | string,
      table_fields: [{ key: 'check_no', label: 'Check Number', sortable: true }, { key: 'amount', sortable: true }, { key: 'image', sortable: false }, { key: 'check_date', label: 'Date', sortable: true }, { key: 'Options' }],
      image: [], // NOTE: Only temporary as "image" property is not available in the db table yet
      apply_form: [
        {
          check_number: '',
          amount: '',
          image: [], // Must be null to make form-input red
          date: moment(new Date()).format('YYYY-MM-DD'),
          toDelete: false, // Only for Delete
          removeForm: false // Only for Apply
        }
      ],
      invoice: null as any,
      active_tab: 0
    }
  },
  computed: {
    active_tab_add_payments() {
      if ((this.invoice && !this.invoice.payments.length) || this.active_tab === 1) return true
    }
    // currentDate() {
    //   return moment(new Date()).format("YYYY-MM-DD")
    // }
  },
  methods: {
    async saveEdit(bvModalEvt: any, row_item: any) {
      bvModalEvt.preventDefault()
      this.edit_status = 'saving'

      const { id, check_no, amount, check_date } = row_item

      if (!check_no || !amount || !check_date) {
        this.edit_status = 'failed'
        return
      }

      // @ts-ignore
      await this.$http().put('/invoice_payments/', id, row_item)
    },
    savePayment(bvModalEvt: any) {
      bvModalEvt.preventDefault()
      this.saving_status = 'saving'

      for (const p of this.apply_form) {
        if (!p.check_number || !p.amount || !p.date) {
          this.saving_status = 'failed'
          return
        }
      }

      this.$nextTick(async () => {
        this.saving_status = 'success'
        for (const pay of this.apply_form) {
          const payments = {
            invoice_id: this.invoice.id,
            company_user_id: this.$store.state.settings.current_company_user_id,
            amount: pay.amount,
            check_no: pay.check_number,
            note: 0,
            check_date: moment(new Date()).format('YYYY-MM-DD')
          }

          // @ts-ignore
          const { invoice_payments } = await this.$http().post('/invoice_payments', payments)
          this.invoice.payments.push(invoice_payments)
        }

        this.$bvModal.hide('apply-payment-modal')
      })
    },
    hide() {
      // reset
      let payments = this.invoice.payments.filter((payment: any) => payment.toDelete)
      payments.forEach((p: any) => {
        this.removeToDelete(p)
      })

      this.saving_status = null
      this.apply_form = [
        {
          check_number: '',
          amount: '',
          image: [], // Must be null to make form-input red
          date: moment(new Date()).format('YYYY-MM-DD'),
          toDelete: false, // Only for Delete
          removeForm: false // Only for Apply
        }
      ]
    },
    toDeleteRow(row_item: any) {
      const index = this.invoice.payments.indexOf(row_item)
      Vue.set(this.invoice.payments[index], 'toDelete', true)
    },
    async deleteRow(row_item: any) {
      // @ts-ignore
      await this.$http().delete('/invoice_payments/', row_item.id, row_item)

      this.removeToDelete(row_item)
    },
    removeToDelete(row_item: any) {
      const index = this.invoice.payments.indexOf(row_item)

      Vue.delete(this.invoice.payments, index)
    },
    fromIndex(form: any) {
      let apply_form = this.apply_form

      const index = apply_form.indexOf(form)

      return index
    },
    addApplyForm() {
      const APPLY_FORM: any = { check_number: '', amount: '', image: [], date: new Date(), toDelete: false, removeForm: false }
      this.apply_form.push(APPLY_FORM)
    },
    removeApplyForm(form: any) {
      let apply_form = this.apply_form

      const index = apply_form.indexOf(form)

      apply_form.splice(index, 1)
    }
    // async init() {
    //   //@ts-ignore
    //   const payments = await this.$http().get('/payments')
    //   console.log(payments)
    // }
  },
  async mounted() {
    // this.init()
    EventBus.$on('apply-payment', (invoice: any) => {
      this.invoice = invoice
      this.$bvModal.show('apply-payment-modal')
    })
  },
  beforeDestroy() {
    EventBus.$off('apply-payment')
  }
})
</script>

<style lang="scss" scoped>
.header {
  width: 100%;
  display: flex;
  justify-content: space-between;

  .title {
    font-size: 14px;
    font-weight: 500;
  }

  .text {
    font-size: 14px;
  }
}

.error {
  color: red;
}
.add-icon {
  font-size: 24px;
  color: #007bff;
  cursor: pointer;
  display: flex;
}

.remove-button {
  .remove-icon {
    font-size: 24px;
    color: red;
    cursor: pointer;
  }
}
.forms {
  // background-color: red;
  padding: 0 !important;

  .form {
    padding-bottom: 15px;
    padding: 1.25rem;

    &:not(:first-child) {
      border-top: 1px solid rgba($color: #dfdfdf, $alpha: 1);
      padding-top: 15px;
    }
  }
}

.label {
  font-size: 12px;
}
</style>

<style lang="scss">
#apply-payment-modal___BV_modal_content_ {
  min-height: 500px;
}
</style>
