<template>
  <b-modal id="add-invoiceable-item" class="add-invoiceable-item" scrollable title="Invoiceable Items" :size="tab_index === 0 ? 'lg' : 'md'" @hidden="hide" @ok="saveInvoiceable">
    <b-tabs content-class="mt-3" v-model="tab_index" lazy>
      <b-tab title="List">
        <b-table striped hover :sticky-header="true" :items="table_items" :fields="table_fields">
          <template #cell(Edit)="row">
            <b-button size="sm" @click="row.toggleDetails" class="mr-2"> {{ row.detailsShowing ? 'Hide' : 'Show' }} Details </b-button>

            <!-- As `row.showDetails` is one-way, we call the toggleDetails function on @change -->
            <!-- <b-form-checkbox v-model="row.detailsShowing" @change="row.toggleDetails">
              Details via check
            </b-form-checkbox> -->
          </template>

          <template #row-details="row">
            <b-card>
              <b-row class="mb-2">
                <b-col sm="3" class="text-sm-right"><b>Description:</b></b-col>
                <!-- <b-col>{{ row.item.Description }}</b-col> -->
                <b-col sm="9">
                  <b-form-input type="text" placeholder="Enter Description" v-model="row.item.Description"></b-form-input>
                </b-col>
              </b-row>
              <b-row class="mb-2">
                <b-col sm="3" class="text-sm-right"><b>Rate:</b></b-col>
                <b-col sm="9">
                  <b-form-input type="number" placeholder="Enter Rate" v-model="row.item.Rate"></b-form-input>
                </b-col>
              </b-row>
              <b-row class="mb-2">
                <b-col sm="3" class="text-sm-right"><b>Cost:</b></b-col>
                <b-col sm="9">
                  <b-form-input type="number" placeholder="Enter Cost" v-model="row.item.Cost"></b-form-input>
                </b-col>
              </b-row>
              <b-row class="mb-2">
                <b-col sm="3" class="text-sm-right"><b>Quantity:</b></b-col>
                <b-col sm="9">
                  <b-form-input type="number" placeholder="Enter Quantity" v-model="row.item.Quantity"></b-form-input>
                </b-col>
              </b-row>
              <b-row class="mb-2">
                <b-col sm="3" class="text-sm-right"><b>Date:</b></b-col>
                <b-col sm="9">
                  <b-form-input type="date" placeholder="Enter Date" v-model="row.item.Date"></b-form-input>
                </b-col>
              </b-row>

              <!-- Save -->
              <b-row class="mb-2 px-4 d-flex justify-content-end">
                <b-button size="sm" variant="outline-primary" @click="editInvoiceable(row.item)">Save</b-button>
              </b-row>

              <!-- <b-row class="mb-2">
                <b-col sm="3" class="text-sm-right"><b>Is Active:</b></b-col>
                <b-col>{{ row.item.isActive }}</b-col>
              </b-row> -->

              <!-- <b-button size="sm" @click="row.toggleDetails">Hide Details</b-button> -->
            </b-card>
          </template>
        </b-table>
      </b-tab>
      <b-tab title="Add Item">
        <b-dropdown :text="Object.keys(invoiceable_item.item_selected).length ? invoiceable_item.item_selected.name : 'Select Project'" block variant="primary" class="m-2 invoicable-items" menu-class="w-100">
          <div class="client-name-wrapper" v-for="client in filteredclients(chosen_clients)" :key="client.id">
            <span class="client-name">{{ client.name }}</span>
            <b-dropdown-item href="#" class="project-name-wrapper" v-for="project in client_projects(client)" :key="project.id" @click="invoiceable_item.item_selected = project">
              {{ project.name }}
            </b-dropdown-item>
          </div>
        </b-dropdown>
        <div class="clear-invoiceable-item">
          <span @click="clearDropdown('invoicableItem')">Clear</span>
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
          <div class="input-cost">
            <span class="input-warning" v-if="saving_status === 'failed' && !invoiceable_item.paid_amount">* Cost must have value</span>
            <b-form-input type="number" class="form-input" placeholder="Enter cost" v-model="invoiceable_item.paid_amount" />
          </div>
          <div class="input-cost">
            <span class="input-warning" v-if="saving_status === 'failed' && !invoiceable_item.quantity">* Quantity must have value</span>
            <b-form-input type="number" class="form-input" placeholder="Enter quantity" v-model="invoiceable_item.quantity" />
          </div>
          <div style="margin-top: 5px;">
            <b-form-datepicker id="example-datepicker" :value="invoiceable_item.date" class="mb-2"></b-form-datepicker>
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
      </b-tab>
    </b-tabs>
  </b-modal>
</template>

<script>
import moment from 'moment'

export default {
  props: ['show', 'clients', 'chosen_clients'],
  data() {
    return {
      tab_index: 0,
      saving_status: '',
      table_fields: [
        { key: 'Description', sortable: true },
        { key: 'Rate', sortable: true },
        { key: 'Cost', sortable: true },
        { key: 'Date', sortable: true },
        { key: 'Edit', sortable: false }
      ],
      table_items: [],
      invoiceable_items: [],
      invoiceable_item: {
        item_selected: {},
        description: null,
        date: moment(new Date()).format('YYYY-MM-DD'),
        rate: null,
        paid_amount: null,
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
    async init() {
      //TODO: KG make a way to edit these items
      const { invoiceable_items } = await this.$http().get('/invoiceable_items')

      for (const invoiceable_item of invoiceable_items) {
        const items = {
          id: invoiceable_item.id,
          Description: invoiceable_item.description,
          Rate: invoiceable_item.invoice_amount,
          Cost: invoiceable_item.paid_amount,
          Quantity: invoiceable_item.quantity,
          Date: invoiceable_item.date
        }
        this.table_items.push(items)
      }
      this.invoiceable_items = invoiceable_items
    },
    hide() {
      this.$emit('hide')
    },
    async editInvoiceable(item) {
      const { Description, Rate, Cost, Date } = item
      let invoiceable_item = this.invoiceable_items.find(itm => itm.id === item.id)
      invoiceable_item.description = Description
      invoiceable_item.invoice_amount = Rate
      invoiceable_item.paid_amount = Cost
      invoiceable_item.date = Date

      this.$store.dispatch('UPDATE', { module: 'invoiceable_items', entity: invoiceable_item }, { root: true })
    },
    async saveInvoiceable(bvModalEvt) {
      if (this.tab_index === 1) {
        this.saving_status = 'saving'
        bvModalEvt.preventDefault()
        if (!this.invoiceable_item.description || !this.invoiceable_item.rate || !this.invoiceable_item.paid_amount) {
          this.saving_status = 'failed'
          return
        }

        this.$nextTick(async () => {
          const invoiceable_item = {
            description: this.invoiceable_item.description,
            date: this.invoiceable_item.date,
            company_id: this.$store.state.settings.current_company_id,
            client_id: this.$store.getters['clients/getByClientCompanyId'](this.invoiceable_item.item_selected.client_company_id).id,
            project_id: this.invoiceable_item.item_selected.id,
            invoice_amount: this.invoiceable_item.rate,
            paid_amount: this.invoiceable_item.paid_amount,
            quantity: this.invoiceable_item.quantity,
            company_user_id: 1, //TODO: figure out what to set here
            recurs: this.invoiceable_item.repeat ? this.invoiceable_item.repeat_option : null
          }
          console.log(invoiceable_item)
          await this.$store.dispatch('ADD_ONE', { module: 'invoiceable_items', entity: invoiceable_item })

          // reset
          this.invoiceable_item = {
            item_selected: {},
            description: null,
            date: moment(new Date()).format('YYYY-MM-DD'),
            rate: null,
            // repeat
            repeat: false,
            repeat_option: 'Monthly',
            repeat_options: ['Daily', 'Weekly', 'Monthly', 'Annually', 'Every weekday (Monday to Friday)', 'Custom...']
          }
          this.saving_status = ''
          this.$bvModal.hide('add-invoiceable-item')
        })
      }
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
