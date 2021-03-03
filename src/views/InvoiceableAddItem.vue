<template>
  <b-modal id="add-invoiceable-item" class="add-invoiceable-item" scrollable title="Add Invoiceable Item" @hidden="hide" @ok="saveInvoiceable">
    <b-dropdown :text="Object.keys(invoiceable_item.item_selected).length ? invoiceable_item.item_selected.name : 'Select Invoiceable Item'" block split split-variant="outline-primary" variant="primary" class="m-2 invoicable-items" menu-class="w-100">
      <div class="client-name-wrapper" v-for="client in filteredclients(chosen_clients)" :key="client.id">
        <span class="client-name">{{ client.name }}</span>
        <b-dropdown-item href="#" class="project-name-wrapper" v-for="project in client_projects(client)" :key="project.id" @click="invoiceable_item.item_selected = project">
          {{ project.name }}
        </b-dropdown-item>
      </div>
    </b-dropdown>
    <div class="clear-invoiceable-item" @click="clearDropdown('invoicableItem')">
      <span>Clear</span>
    </div>
    <div class="inputs" v-if="Object.keys(invoiceable_item.item_selected).length">
      <div class="input-description">
        <span class="input-warning" v-if="saving_status === 'failed' && !invoiceable_item.description">* Description must have value</span>
        <b-form-input class="form-input" placeholder="Enter description" v-model="invoiceable_item.description" />
      </div>
      <div class="input-rate">
        <span class="input-warning" v-if="saving_status === 'failed' && !invoiceable_item.rate">* Rate must have value</span>
        <b-form-input type="number" class="form-input" placeholder="Enter rate" v-model="invoiceable_item.rate" />
      </div>
      <div style="margin-top: 5px;">
        <b-form-datepicker id="example-datepicker" disabled :value="invoiceable_item.date" class="mb-2"></b-form-datepicker>
      </div>
      <b-form-checkbox id="invoiceable_repeat" v-model="invoiceable_item.repeat" name="invoiceable_repeat" class="mt-2">
        Repeat
      </b-form-checkbox>
      <div v-if="invoiceable_item.repeat">
        <b-dropdown :text="invoiceable_item.repeat_option ? invoiceable_item.repeat_option : 'Choose Repeat Option'" block split split-variant="outline-primary" variant="primary" class="mt-2 invoicable-items" menu-class="w-100">
          <b-dropdown-item href="#" class="project-name-wrapper" @click="invoiceable_item.repeat_option = option" v-for="(option, option_key) in invoiceable_item.repeat_options" :key="option_key">
            {{ option }}
          </b-dropdown-item>
        </b-dropdown>
        <div class="clear-invoiceable-item" @click="clearDropdown('repeatOption')">
          <span>Clear</span>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<script>
export default {
  props: ['show', 'clients', 'chosen_clients'],
  data() {
    return {
      saving_status: '',
      invoiceable_item: {
        item_selected: {},
        description: null,
        date: new Date(),
        rate: null,
        // repeat
        repeat: false,
        repeat_option: 'Monthly',
        repeat_options: ['Daily', 'Weekly', 'Monthly', 'Annually', 'Every weekday (Monday to Friday)', 'Custom...']
      }
    }
  },
  watch: {
    show(val) {
      if (val) {
        this.$bvModal.show('add-invoiceable-item')
      }
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      //TODO: KG make a way to edit these items
      this.$http()
        .get('/invoiceable_items')
        .then(function(response) {
          this.invoiceable_items = response.invoiceable_items
        })
    },
    hide() {
      this.$emit('hide')
    },
    async saveInvoiceable(bvModalEvt) {
      this.saving_status = 'saving'
      bvModalEvt.preventDefault()
      if (!this.invoiceable_item.description || !this.invoiceable_item.rate) {
        this.saving_status = 'failed'
        return
      }

      this.$nextTick(async () => {
        const invoiceable_item = {
          description: this.invoiceable_item.description,
          date: this.invoiceable_item.date,
          company_id: this.$store.state.settings.current_company_id,
          client_id: this.$store.getters['clients/getByClientCompanyId'](this.invoiceable_item.item_selected.client_company_id),
          project_id: this.invoiceable_item.item_selected.id,
          invoice_amount: this.invoiceable_item.rate,
          paid_amount: 0,
          company_user_id: 1, //TODO: figure out what to set here
          recurs: this.invoiceable_item.repeat ? this.invoiceable_item.repeat_option : null
        }
        // console.log(invoiceable_item);
        await this.$store.dispatch('invoiceable_items/createInvoiceableItem', invoiceable_item)

        // reset
        this.invoiceable_item = {
          item_selected: {},
          description: null,
          date: new Date(),
          rate: null,
          // repeat
          repeat: false,
          repeat_option: 'Monthly',
          repeat_options: ['Daily', 'Weekly', 'Monthly', 'Annually', 'Every weekday (Monday to Friday)', 'Custom...']
        }
        this.saving_status = ''
        this.$bvModal.hide('add-invoiceable-item')
      })
      // this.$store.dispatch('clients/createClient')
    },
    client_projects(client) {
      //labeledConsole('client', client)
      return this.$store.getters['projects/openprojects']().filter(function(project) {
        return project.client_company_id == client.client_company_id
      })
    },
    filteredclients(chosen_clients) {
      let self = this
      return this.clients //TODO: make this work:
      // return self.clients.filter(function(client) {
      //   if (chosen_clients.indexOf('0') === -1) {
      //     if (typeof chosen_clients[0] !== 'number') {
      //       return chosen_clients.indexOf(client.id.toString()) !== -1
      //     } else {
      //       return chosen_clients.indexOf(client.id) !== -1
      //     }
      //   }
      //   return true
      // })
    },
    clearDropdown(option) {
      if (option === 'invoicableItem') {
        return (this.invoiceable_item.item_selected = {})
      }
      this.invoiceable_item.repeat_option = null
    }
  }
}
</script>

<style lang="scss" scoped>
.inputs {
  .input-description,
  .input-rate {
    .input-warning {
      font-size: 14px;
      color: red;
    }
  }
  .input-rate {
    // border: 1px solid red;
    margin-top: 5px;
  }
  .form-input {
    margin-top: 0px !important;
  }
}
</style>
