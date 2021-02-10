<template>
  <b-modal id="apply-payment-modal" class="apply-payment-modal" title="Apply Payment" style="min-height: 500px;">
    <b-card no-body>
      <b-tabs pills card>
        <!-- Apply -->
        <b-tab title="Apply" active>
          <div>
            <span class="label">Check #</span>
            <b-form-input></b-form-input>
          </div>
          <div class="mt-2">
            <span class="label">Amount</span>
            <b-form-input type="number"></b-form-input>
          </div>
          <div class="mt-2">
            <span class="label">Select Image</span>
            <b-form-file v-model="imageFile" :state="Boolean(imageFile)" placeholder="Choose a file or drop it here..." drop-placeholder="Drop file here..."></b-form-file>
          </div>
          <div class="mt-2">
            <span class="label">Choose a date</span>
            <b-form-datepicker v-model="date" class="mb-2"></b-form-datepicker>
          </div>
        </b-tab>
        <!-- View -->
        <b-tab title="View">
          <div>
            <span class="label">Check #</span>
            <b-form-input disabled></b-form-input>
          </div>
          <div class="mt-2">
            <span class="label">Amount</span>
            <b-form-input type="number" disabled></b-form-input>
          </div>
          <div class="mt-2">
            <span class="label">Select Image</span>
            <b-form-file disabled v-model="imageFile" :state="Boolean(imageFile)" placeholder="Choose a file or drop it here..." drop-placeholder="Drop file here..."></b-form-file>
          </div>
          <div class="mt-2">
            <span class="label">Choose a date</span>
            <b-form-datepicker disabled v-model="date" class="mb-2"></b-form-datepicker>
          </div>
        </b-tab>
        <!-- Edit -->
        <b-tab title="Edit">
          <div>
            <span class="label">Check #</span>
            <b-form-input></b-form-input>
          </div>
          <div class="mt-2">
            <span class="label">Amount</span>
            <b-form-input type="number"></b-form-input>
          </div>
          <div class="mt-2">
            <span class="label">Select Image</span>
            <b-form-file v-model="imageFile" :state="Boolean(imageFile)" placeholder="Choose a file or drop it here..." drop-placeholder="Drop file here..."></b-form-file>
          </div>
          <div class="mt-2">
            <span class="label">Choose a date</span>
            <b-form-datepicker v-model="date" class="mb-2"></b-form-datepicker>
          </div>
        </b-tab>
        <!-- Delete -->
        <b-tab title="Delete">
          <div class="d-flex justify-content-between align-items-center">
            <span class="">Are you sure you want to delete?</span>
            <div>
              <b-button variant="outline-danger" class="mr-3">No</b-button>
              <b-button variant="outline-primary">Yes</b-button>
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
      imageFile: [], // Must be null to make form-input red
      date: ''
    }
  },
  methods: {
    test() {
      console.log('test only')
    }
  },
  mounted() {
    EventBus.$on('apply-payment', () => {
      this.$bvModal.show('apply-payment-modal')
    })
  },
  beforeDestroy() {
    EventBus.$off('apply-payment')
  }
})
</script>

<style lang="scss" scoped>
.label {
  font-size: 12px;
}
</style>

<style lang="scss">
#apply-payment-modal___BV_modal_content_ {
  min-height: 500px;
}
</style>
