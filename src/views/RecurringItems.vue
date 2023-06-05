<template>
  <b-modal id="recurring-items" class="recurring-items" scrollable title="Recurring Items" :size="tab_index === 0 ? 'lg' : 'md'" @hidden="hide" @ok="saveInvoiceable">
    <b-tabs content-class="mt-3" v-model="tab_index" lazy>
      <b-tab title="Items">
        <b-table striped hover :sticky-header="true" :items="table_items" :fields="table_fields">
          <template #cell(client)="data">
            {{ data.item.client }}
          </template>
          <template #cell(description)="data">
            <b-form-textarea v-model="data.item.description" style="min-width: 80px; color: black !important; padding: 0px !important" class="transparent-input-note" debounce="500" rows="0" max-rows="7" cols="100"></b-form-textarea>
          </template>
          <template #cell(cost)="data">
            <div style="display:flex">$ <b-form-textarea v-model="data.item.cost" style="min-width: 10px; color: black !important; padding: 0px !important; margin-left: 5px" class="transparent-input-note" debounce="500" rows="0" max-rows="7" cols="30"></b-form-textarea></div>
          </template>
        </b-table>
      </b-tab>
      <b-tab title="Add Item">
        <label>Project:</label>
        <v-select :options="open_projects()" :reduce="project => project.id" label="name" :filter-by="searchProject" style="margin-bottom: 15px;">
          <template slot="selected-option" slot-scope="option">
            <div class="flex">
              <div class="col">{{ client_name(option.client_company_id) }} - {{ option.name }}</div>
            </div>
          </template>
          <template slot="option" slot-scope="option"> {{ client_name(option.client_company_id) }} - {{ option.name }} <b-badge v-if="option.is_new" variant="success">New</b-badge></template>
        </v-select>
        <b-form-group id="input-group-2" label="Description:" label-for="description">
          <b-form-input id="description" required></b-form-input>
        </b-form-group>
        <b-form-group id="input-group-2" label="Cost:" label-for="cost">
          <b-form-input id="cost" required></b-form-input>
        </b-form-group>
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
        { key: 'client', sortable: true },
        { key: 'project', sortable: true },
        { key: 'description', sortable: true },
        { key: 'cost', sortable: true }
      ],
      table_items: [
        {
          client: 'TechAround',
          project: 'Projectous',
          description: 'Test description',
          cost: '1000'
        }
      ],
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
        this.$bvModal.show('recurring-items')
      }
    }
  },
  mounted() {
    //   this.init()
  },
  methods: {
    open_projects: function() {
      const result = this.$store.getters['projects/getOpenProjectsSortedByClient'] || []
      console.log('proj result', result)
      const projectsUniqueById = [...new Map(result.map(item => [item['id'], item])).values()]
      console.log('project unique', projectsUniqueById)
      return projectsUniqueById
    },
    client_name: function(client_company_id) {
      let client = this.$store.getters['clients/getByClientCompanyId'](client_company_id)
      return client ? client.name : ''
    },
    searchProject: function(option, label, search) {
      let search_value = search.toLowerCase()
      return (
        option.name.toLowerCase().indexOf(search_value) > -1 ||
        this.client_name(option.client_company_id)
          .toLowerCase()
          .indexOf(search_value) > -1
      )
    },
    //   async init() {
    //     // const { invoiceable_items } = await this.$http().get('/invoiceable_items')

    //     // for (const invoiceable_item of invoiceable_items) {
    //     //   const items = {
    //     //     id: invoiceable_item.id,
    //     //     Description: invoiceable_item.description,
    //     //     Rate: invoiceable_item.invoice_amount,
    //     //     Cost: invoiceable_item.paid_amount,
    //     //     Quantity: invoiceable_item.quantity,
    //     //     Date: invoiceable_item.date
    //     //   }
    //     //   this.table_items.push(items)
    //     // }
    //     // this.invoiceable_items = invoiceable_items
    //   },
    hide() {
      this.$emit('hide')
    },
    //   async editInvoiceable(item) {
    //     const { Description, Rate, Cost, Date } = item
    //     let invoiceable_item = this.invoiceable_items.find(itm => itm.id === item.id)
    //     invoiceable_item.description = Description
    //     invoiceable_item.invoice_amount = Rate
    //     invoiceable_item.paid_amount = Cost
    //     invoiceable_item.date = Date

    //     this.$store.dispatch('UPDATE', { module: 'invoiceable_items', entity: invoiceable_item }, { root: true })
    //   },
    async saveInvoiceable(bvModalEvt) {
      // if (this.tab_index === 1) {
      //   this.saving_status = 'saving'
      //   bvModalEvt.preventDefault()
      //   if (!this.invoiceable_item.description || !this.invoiceable_item.rate || !this.invoiceable_item.paid_amount) {
      //     this.saving_status = 'failed'
      //     return
      //   }
      //   this.$nextTick(async () => {
      //     const invoiceable_item = {
      //       description: this.invoiceable_item.description,
      //       date: this.invoiceable_item.date,
      //       company_id: this.$store.state.settings.current_company_id,
      //       client_id: this.$store.getters['clients/getByClientCompanyId'](this.invoiceable_item.item_selected.client_company_id).id,
      //       project_id: this.invoiceable_item.item_selected.id,
      //       invoice_amount: this.invoiceable_item.rate,
      //       paid_amount: this.invoiceable_item.paid_amount,
      //       quantity: this.invoiceable_item.quantity,
      //       company_user_id: 1, //TODO: figure out what to set here
      //       recurs: this.invoiceable_item.repeat ? this.invoiceable_item.repeat_option : null
      //     }
      //     await this.$store.dispatch('ADD_ONE', { module: 'invoiceable_items', entity: invoiceable_item })
      //     // reset
      //     this.invoiceable_item = {
      //       item_selected: {},
      //       description: null,
      //       date: moment(new Date()).format('YYYY-MM-DD'),
      //       rate: null,
      //       // repeat
      //       repeat: false,
      //       repeat_option: 'Monthly',
      //       repeat_options: ['Daily', 'Weekly', 'Monthly', 'Annually', 'Every weekday (Monday to Friday)', 'Custom...']
      //     }
      //     this.saving_status = ''
      //     this.$bvModal.hide('recurring-items')
      //   })
      // }
    }
    //   client_projects(client) {
    //     //labeledConsole('client', client)
    //     return this.$store.getters['projects/openprojects']().filter(function(project) {
    //       return project.client_company_id == client.client_company_id
    //     })
    //   },
    //   filteredclients(chosen_clients) {
    //     let self = this
    //     return this.clients //TODO: make this work:
    //     // return self.clients.filter(function(client) {
    //     //   if (chosen_clients.indexOf('0') === -1) {
    //     //     if (typeof chosen_clients[0] !== 'number') {
    //     //       return chosen_clients.indexOf(client.id.toString()) !== -1
    //     //     } else {
    //     //       return chosen_clients.indexOf(client.id) !== -1
    //     //     }
    //     //   }
    //     //   return true
    //     // })
    //   },
    //   clearDropdown(option) {
    //     if (option === 'invoicableItem') {
    //       return (this.invoiceable_item.item_selected = {})
    //     }
    //     this.invoiceable_item.repeat_option = null
    //   }
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
