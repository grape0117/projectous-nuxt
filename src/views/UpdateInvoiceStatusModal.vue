<template>
  <b-modal id="update-invoice-status-modal" class="update-invoice-status-modal" scrollable title="Update invoice status" @hidden="hide" @ok="saveUpdatedInvoiceStatus">
    <div class="row">
      <div class="col-md-12">
        <label v-if="invoice_details && invoice_details.client" class="control-label" for="client_name">Client name: {{ invoice_details.client.name }}</label
        ><br />
        <div v-if="invoice_details && Object.keys(invoice_details.projects).length > 0">
          <label class="control-label" for="projects">Projects:</label>
          <ul v-for="(project, project_index) in invoice_details.projects" :key="project_index" v-bind:project="project" style="margin: 0px !important;">
            <li v-if="project">{{ project.name }}</li>
          </ul>
        </div>
        <!-- <div v-for="(project, project_index) in invoice_details.projects" :key="project_index" v-bind:project="project" style="font-size: smaller">
                <span v-if="project">{{ project.name }}</span>
            </div> -->
        <label v-if="invoice_details" class="control-label" for="amount">Amount: {{ `$${invoice_details.total}` }}</label
        ><br />
        <label v-if="invoice_details" class="control-label" style="text-transform:capitalize" for="status">Status: {{ invoice_details.status }}</label
        ><br />
      </div>
      <div class="col-md-12" style="margin-top:10px">
        <label class="control-label" for="invoice_notes">Note: </label>
        <b-form-textarea v-model="invoice_notes" rows="2" max-rows="30" cols="300" placeholder="Input note"></b-form-textarea>
      </div>
    </div>
  </b-modal>
</template>

<script>
import moment from 'moment'
import { Datetime } from 'vue-datetime'
import { getCookie } from '@/utils/util-functions'

export default {
  name: 'update-invoice-status-modal',
  components: {
    datetime: Datetime
  },
  props: ['show', 'invoice_details', 'updateInvoiceStatus'],
  data() {
    return {
      arr: [],
      invoice_notes: ''
    }
  },
  watch: {
    show(val) {
      if (val) {
        this.$bvModal.show('update-invoice-status-modal')
      }
    }
  },
  mounted() {
    // this.init()
  },
  methods: {
    hide() {
      this.$emit('hide')
    },
    getCompanyUserDetails(company_user_id) {
      const user_details = this.$store.state.company_users.company_users.find(e => e.id === company_user_id)

      return user_details
    },
    async saveUpdatedInvoiceStatus() {
      let company_user_user_id = this.$store.state.settings.current_company_user_id
      let company_user_details = this.getCompanyUserDetails(company_user_user_id)
      const current_ts = new Date()
      const timezone = moment.tz.guess()
      const timezone_date = moment.tz(current_ts, timezone)
      const gmt_date = timezone_date
        .clone()
        .tz('GMT')
        .format('YYYY-MM-DD h:mm a')
      let temp_data = { ...this.invoice_details }
      let user_id = getCookie('user_id')
      const log = `${company_user_details.name} moved invoice to ${temp_data.status} at ${gmt_date}`
      let parse_log_data = temp_data.log ? JSON.parse(temp_data.log) : []

      parse_log_data.push({
        note: this.invoice_notes,
        status: temp_data.status,
        log,
        date: gmt_date
      })
      temp_data.payment_notes = this.invoice_notes
      temp_data.log = JSON.stringify(parse_log_data)
      const { invoices } = await this.$http().put('/invoices/', this.invoice_details.id, temp_data)
      this.updateInvoiceStatus(invoices)
      this.invoice_notes = ''
      this.$emit('hide')
    },
    users: function() {
      return this.$store.getters['company_users/getActive']
    },
    formatAmounts(amount) {
      return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
  }
}
</script>

<style lang="scss" scoped>
.inputs {
  .input-description,
  .input-rate,
  .input-cost {
    .input-warning {
      font-size: 14px;
      color: red;
    }
  }
  .input-rate,
  .input-cost {
    // border: 1px solid red;
    margin-top: 5px;
  }
  .form-input {
    margin-top: 0px !important;
  }
}
</style>
