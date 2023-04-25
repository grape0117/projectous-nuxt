<template>
  <b-modal id="invoice-logs-modal" size="lg" class="invoice-logs-modal" scrollable title="Invoice Logs" @hidden="hide">
    <div class="row">
      <div class="col-md-12">
        <b-table striped hover :items="sortedData" :fields="fields" v-if="sortedData.length > 0"> </b-table>
        <div v-else style="text-align: center">
          <b>No logs for this invoice.</b>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<script>
import moment from 'moment'
import { Datetime } from 'vue-datetime'
import { getCookie } from '@/utils/util-functions'

export default {
  name: 'invoice-logs-modal',
  components: {
    datetime: Datetime
  },
  props: ['show', 'logs'],
  data() {
    return {
      fields: [
        {
          key: 'status'
        },
        {
          key: 'note'
        },
        {
          key: 'log'
        }
      ]
    }
  },
  watch: {
    show(val) {
      if (val) {
        this.$bvModal.show('invoice-logs-modal')
      }
    }
  },
  computed: {
    sortedData() {
      if (this.logs && this.logs.length > 0) {
        return this.logs.reverse()
      }

      return []
    }
  },
  mounted() {
    // this.init()
  },
  methods: {
    hide() {
      this.$emit('hide')
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
