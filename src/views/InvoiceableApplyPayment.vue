<template>
  <b-modal @ok="save" id="apply-payment-modal" class="apply-payment-modal" title="Apply Payment" style="min-height: 500px;">
    <pre>
      {{ invoice }}
    </pre>
    <b-card no-body>
      <b-tabs v-model="active_tab" pills card>
        <!-- Apply -->
        <b-tab title="Apply" active class="forms">
          <div class="form" v-for="(form, form_index) in apply_form" :key="form_index">
            <div>
              <span class="label">Check #</span>
              <b-form-input v-model="form.check_number"></b-form-input>
            </div>
            <div class="mt-2">
              <span class="label">Amount</span>
              <b-form-input type="number" v-model="form.amount"></b-form-input>
            </div>
            <div class="mt-2">
              <span class="label">Select Image</span>
              <b-form-file v-model="form.image" :state="Boolean(form.image)" placeholder="Choose a file or drop it here..." drop-placeholder="Drop file here..."></b-form-file>
            </div>
            <div class="mt-2">
              <span class="label">Choose a date</span>
              <b-form-datepicker v-model="form.date" class="mb-2"></b-form-datepicker>
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

              <div v-if="form_index === apply_form.length - 1" class="add-icon" v-b-tooltip.hover.top="'Add Form'" @click="addApplyForm">
                <b-icon icon="plus-circle" />
              </div>
            </div>
          </div>
        </b-tab>
        <!-- View -->
        <b-tab title="View" class="forms">
          <!-- will be removed later -->
          <div class="form" v-for="(form, form_index) in apply_form" :key="form_index">
            <div>
              <span class="label">Check #</span>
              <b-form-input disabled v-model="invoice.check_no"></b-form-input>
            </div>
            <div class="mt-2">
              <span class="label">Amount</span>
              <b-form-input type="number" disabled v-model="invoice.total"></b-form-input>
            </div>
            <div class="mt-2">
              <span class="label">Select Image</span>
              <b-form-file disabled v-model="form.image" :state="Boolean(form.image)" placeholder="Choose a file or drop it here..." drop-placeholder="Drop file here..."></b-form-file>
            </div>
            <div class="mt-2">
              <span class="label">Choose a date</span>
              <b-form-datepicker disabled v-model="invoice.date" class="mb-2"></b-form-datepicker>
            </div>
          </div>
        </b-tab>
        <!-- Edit -->
        <b-tab title="Edit" class="forms">
          <div class="form" v-for="(form, form_index) in apply_form" :key="form_index">
            <div>
              <span class="label">Check #</span>
              <b-form-input v-model="invoice.check_no"></b-form-input>
            </div>
            <div class="mt-2">
              <span class="label">Amount</span>
              <b-form-input type="number" v-model="invoice.total"></b-form-input>
            </div>
            <div class="mt-2">
              <span class="label">Select Image</span>
              <b-form-file v-model="form.image" :state="Boolean(form.image)" placeholder="Choose a file or drop it here..." drop-placeholder="Drop file here..."></b-form-file>
            </div>
            <div class="mt-2">
              <span class="label">Choose a date</span>
              <b-form-datepicker v-model="invoice.date" class="mb-2"></b-form-datepicker>
            </div>
          </div>
        </b-tab>
        <!-- Delete -->
        <b-tab title="Delete" class="forms">
          <div class="form" v-for="(form, form_index) in apply_form" :key="form_index">
            <div>
              <span class="label">Check #</span>
              <b-form-input v-model="invoice.check_no" disabled></b-form-input>
            </div>
            <div class="mt-2">
              <span class="label">Amount</span>
              <b-form-input type="number" v-model="invoice.total" disabled></b-form-input>
            </div>
            <div class="mt-2">
              <span class="label">Select Image</span>
              <b-form-file v-model="form.image" :state="Boolean(form.image)" placeholder="Choose a file or drop it here..." drop-placeholder="Drop file here..." disabled></b-form-file>
            </div>
            <div class="mt-2">
              <span class="label">Choose a date</span>
              <b-form-datepicker v-model="invoice.date" class="mb-2" disabled></b-form-datepicker>
            </div>
            <div v-if="!form.toDelete" @click="form.toDelete = true">
              <!-- <span class="">Are you sure you want to delete?</span> -->
              <div class="d-flex justify-content-end align-items-center">
                <b-button variant="outline-primary">Delete</b-button>
              </div>
            </div>
            <div v-else class="d-flex justify-content-between align-items-center">
              <span>Are you sure you want to delete?</span>
              <div>
                <b-button variant="outline-danger" class="mr-3" @click="form.toDelete = false">No</b-button>
                <b-button variant="outline-primary">Yes</b-button>
              </div>
            </div>
          </div>
        </b-tab>
      </b-tabs>
    </b-card>
  </b-modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { EventBus } from '@/components/event-bus'

export default Vue.extend({
  data() {
    return {
      date: '',
      apply_form: [
        {
          check_number: '',
          amount: '',
          image: [], // Must be null to make form-input red
          date: '',
          toDelete: false, // Only for Delete
          removeForm: false // Only for Apply
        }
      ],
      invoice: null,
      active_tab: 0
    }
  },
  methods: {
    save() {
      const tab_index = this.active_tab

      if (tab_index === 0) {
        console.log('Apply')
      }
      if (tab_index === 1) {
        console.log('View')
      }
      if (tab_index === 2) {
        console.log('Edit')
      }
      if (tab_index === 3) {
        console.log('Delete')
      }
    },
    fromIndex(form: any) {
      let apply_form = this.apply_form

      const index = apply_form.indexOf(form)

      return index
    },
    addApplyForm() {
      const APPLY_FORM: any = { check_number: '', amount: '', image: [], date: '', toDelete: false, removeForm: false }
      this.apply_form.push(APPLY_FORM)
    },
    removeApplyForm(form: any) {
      let apply_form = this.apply_form

      const index = apply_form.indexOf(form)

      apply_form.splice(index, 1)
    }
  },
  mounted() {
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
.forms {
  // background-color: red;
  padding: 0 !important;

  .form {
    padding-bottom: 15px;
    padding: 1.25rem;

    .remove-button {
      .remove-icon {
        font-size: 24px;
        color: red;
        cursor: pointer;
      }
    }

    .add-icon {
      font-size: 24px;
      color: #007bff;
      cursor: pointer;
      display: flex;
    }

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
