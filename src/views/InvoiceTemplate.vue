<template>
  <div id="invoice-content"></div>
</template>
<script>
import Vue from 'vue'
import { EventBus } from '@/components/event-bus'

import uuid from 'uuid'
import moment from 'moment'
import draggable from 'vuedraggable'
import { each } from 'lodash'

export default Vue.extend({
  name: 'invoice-template',
  data: function() {
    return {
      changed_task_users: [],
      selectedFile: null
    }
  },

  computed: {
    active_users: function() {
      return this.$store.getters['company_users/getActive']
    },
    clients() {
      let clients = this.$store.getters['clients/getActiveCompanyClients']

      return clients.sort((a, b) => {
        return Vue.simpleSort(a.name.toLowerCase(), b.name.toLowerCase())
      })
    },
    company_users() {
      return this.$store.state.company_users.company_users
    }
  },
  mounted() {
    this.getInvoiceData()
  },
  async created() {},
  methods: {
    current_company_user_id() {
      return this.$store.state.settings.current_company_user_id
    },
    getInvoiceData() {
      let self = this
      let invoice_id = this.$route.params.invoice_id
      this.$http()
        .get(`/invoice/${invoice_id}`)
        .then(function(res) {
          document.getElementById('app').innerHTML = res
          var DOMContentLoadedEvent = document.createEvent('Event')
          DOMContentLoadedEvent.initEvent('DOMContentLoaded', true, true)
          document.dispatchEvent(DOMContentLoadedEvent)
        })
    }
  },
  watch: {}
})
</script>
<style lang="scss"></style>
