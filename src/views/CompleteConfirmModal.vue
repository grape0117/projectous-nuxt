<template>
  <b-modal ref="complete-confirm-modal" id="complete-confirm-modal" class="modal fade" role="dialog" @ok="close" ok-variant="light" ok-title="OK" @shown="updateButtonStyle()">
    <template #modal-title>
      <h5 class="white-text">Confirm</h5>
    </template>
    <slot name="content">
      <div class="form-group col-sm-12">
        <h5 class="white-text">Please upload a video or screenshot and leave a message.</h5>
      </div>
    </slot>
  </b-modal>
</template>

<script>
import Vue from 'vue'
import { applyTheme } from '@/utils/util-functions'

export default {
  name: 'complete-confirm-modal',
  components: {},
  props: {
    task_id: null
  },
  data: function() {
    return {
      thread_title: ''
    }
  },
  computed: {},
  methods: {
    applyTheme,
    async close() {
      $('.close').click()
    },
    updateButtonStyle: function() {
      this.thread_title = ''
      const updated_style = this.applyTheme()
      this.buttonStyle = updated_style
      const header = document.querySelector('.modal-header')
      if (header) {
        header.style = updated_style
        const body = document.querySelector('.modal-body')
        body.style = updated_style
        const footer = document.querySelector('.modal-footer')
        footer.style = updated_style
      }
    }
  }
}
</script>

<style>
.modal-header {
  margin: inherit;
}
</style>
