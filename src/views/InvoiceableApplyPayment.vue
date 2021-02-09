<template>
  <b-modal id="apply-payment-modal" class="apply-payment-modal" title="Apply Payment" style="min-height: 500px;">
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
