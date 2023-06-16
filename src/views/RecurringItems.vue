<template>
  <b-modal id="recurring-items" class="recurring-items" scrollable title="Recurring Items" :size="tab_index === 0 ? 'xl' : 'md'">
    <b-tabs content-class="mt-3" v-model="tab_index" lazy>
      <b-tab title="Items">
        <b-table striped hover :sticky-header="true" :items="table_items" :fields="table_fields">
          <template #head(id)="data">
            <input type="checkbox" v-model="check_all" />
          </template>
          <template #cell(id)="data">
            <input type="checkbox" v-model="selected_items" :value="data.item.id" />
          </template>
          <template #cell(client)="data">
            {{ projectDetails(data.item.client, true) }}
          </template>
          <template #cell(project)="data">
            {{ projectDetails(data.item.project) }}
          </template>
          <template #cell(description)="data">
            <b-form-textarea v-model="data.item.description" style="min-width: 80px; color: black !important; padding: 0px !important" class="transparent-input-note" debounce="500" rows="0" max-rows="7" cols="60" @change="setUpdatedData($event, data.item)"></b-form-textarea>
          </template>
          <template #cell(cost)="data">
            <div style="display:flex">$ <b-form-textarea v-model="data.item.cost" @input="handledCostInput(data.item)" style="min-width: 10px; color: black !important; padding: 0px !important; margin-left: 5px" class="transparent-input-note" debounce="500" rows="0" max-rows="7" cols="10" @change="setUpdatedData($event, data.item)"></b-form-textarea></div>
          </template>
          <template #cell(action)="data">
            <b-badge variant="danger" style="cursor: pointer; margin-right: 5px" @click="deleteRecurringItems(data.item.id)"><b-icon icon="trash"></b-icon></b-badge>
            <b-badge variant="primary" style="cursor: pointer;" @click="enableEditMode(true, data.item)"><b-icon icon="pencil-square"></b-icon></b-badge>
          </template>
        </b-table>
      </b-tab>
      <b-tab title="Add/Edit Item">
        <label>Project:</label>
        <v-select :options="openProjects()" :reduce="project => project.id" v-model="new_item_project_id" label="name" :filter-by="searchProject" style="margin-bottom: 15px;">
          <template slot="selected-option" slot-scope="option">
            <div class="flex">
              <div class="col">{{ clientData(option.client_company_id) }} - {{ option.name }}</div>
            </div>
          </template>
          <template slot="option" slot-scope="option"> {{ clientData(option.client_company_id) }} - {{ option.name }} <b-badge v-if="option.is_new" variant="success">New</b-badge></template>
        </v-select>
        <b-form-group id="input-group-2" label="Description:" label-for="description">
          <b-form-input id="description" v-model="new_item_descrition" required></b-form-input>
        </b-form-group>
        <b-form-group id="input-group-2" label="Cost:" label-for="cost">
          <b-form-input type="number" id="cost" v-model="new_item_cost" required></b-form-input>
        </b-form-group>
      </b-tab>
    </b-tabs>
    <template #modal-footer>
      <div>
        <b-button variant="secondary" @click="hide" style="margin-right: 5px">Close</b-button>
        <b-button v-if="tab_index === 1" variant="primary" @click="addRecurringItems">Save</b-button>

        <b-button v-if="selected_items.length > 0" variant="primary" @click="createTimerEntry">Create entries</b-button>
      </div>
    </template>
  </b-modal>
</template>

<script>
import moment from 'moment'

export default {
  props: ['show', 'clients', 'chosen_clients', 'hideModal', 'getData'],
  data() {
    return {
      tab_index: 0,
      saving_status: '',
      table_fields: [{ key: 'id', label: '<button/>' }, { key: 'client', sortable: true }, { key: 'project', sortable: true }, { key: 'description', sortable: true }, { key: 'cost', sortable: true }, { key: 'action' }],
      table_items: [],
      new_item_project_id: null,
      new_item_descrition: '',
      new_item_cost: null,
      is_edit_mode: false,
      item_to_edit: null,
      selected_items: [],
      check_all: false
    }
  },
  watch: {
    show(val) {
      if (val) {
        this.$bvModal.show('recurring-items')
      }
    },
    tab_index() {
      if (this.tab_index === 0) {
        this.resetForm()
      }
    },
    check_all() {
      if (this.check_all === true) {
        this.selected_items = this.table_items.map(e => e.id)
      } else {
        this.selected_items = []
      }
    }
  },
  mounted() {
    this.getRecurringItems()
  },
  methods: {
    enableEditMode(edit_mode, data) {
      this.is_edit_mode = edit_mode
      if (edit_mode) {
        const { project, description, cost, id } = data
        this.new_item_project_id = project
        this.new_item_descrition = description
        this.new_item_cost = cost
        this.tab_index = 1
        this.item_to_edit = { ...data }
      } else {
        this.resetForm()
      }
    },
    openProjects: function() {
      const result = this.$store.getters['projects/getOpenProjectsSortedByClient'] || []
      const projectsUniqueById = [...new Map(result.map(item => [item['id'], item])).values()]
      return projectsUniqueById
    },
    clientData: function(client_company_id) {
      let client = this.$store.state.clients.clients.find(e => e.client_company_id === client_company_id)

      return client ? client.name : ''
    },
    hide() {
      this.tab_index = 0
      this.$bvModal.hide('recurring-items')
    },
    searchProject: function(option, label, search) {
      let search_value = search.toLowerCase()
      return (
        option.name.toLowerCase().indexOf(search_value) > -1 ||
        this.clientData(option.client_company_id)
          .toLowerCase()
          .indexOf(search_value) > -1
      )
    },
    projectDetails(project_id, return_client_company_id = false) {
      const project = this.$store.getters['projects/getById'](project_id)

      if (return_client_company_id) {
        return project ? this.clientData(project.client_company_id) : 0
      }
      return project ? project.name : ''
    },
    handledCostInput(data) {
      data.cost = data.cost.replace(/[^\d.]/g, '')

      // Remove leading zeros
      data.cost = data.cost.replace(/^0+/, '')

      // Limit to one decimal point
      const decimalCount = data.cost.split('.').length - 1
      if (decimalCount > 1) {
        data.cost = data.cost.slice(0, data.cost.lastIndexOf('.'))
      }
    },
    async getRecurringItems() {
      const { recurring_items } = await this.$http().get('/recurring_items')
      const updated_items = []
      for (const items of recurring_items.reverse()) {
        updated_items.push({
          client: items.project_id,
          project: items.project_id,
          description: items.description,
          cost: items.cost,
          id: items.id,
          action: items.id
        })
      }
      this.table_items = updated_items
      this.check_all = true
    },
    resetForm() {
      this.new_item_project_id = null
      this.new_item_descrition = ''
      this.new_item_cost = null
      this.item_to_edit = null
    },
    async addRecurringItems() {
      if (this.is_edit_mode) {
        const updated_data = {
          project: this.new_item_project_id,
          description: this.new_item_descrition,
          cost: this.new_item_cost,
          is_active: 1,
          id: this.item_to_edit.id
        }
        this.updateRecurringItems(updated_data)
      } else {
        const new_recurring_items = {
          project_id: this.new_item_project_id,
          description: this.new_item_descrition,
          cost: this.new_item_cost,
          is_active: 1
        }

        const { recurring_items, message } = await this.$http().post('/store_recurring_items', new_recurring_items)
        if (message) {
          this.resetForm()
          this.getRecurringItems()
          this.tab_index = 0
          this.is_edit_mode = false
          alert(message)
        }
      }
    },
    async createTimerEntry() {
      const selected_items = this.table_items.filter(e => this.selected_items.includes(e.id))
      const timer_entries = []
      for (const item of selected_items) {
        const project_details = this.$store.getters['projects/getById'](item.project)
        const client_data = this.$store.state.clients.clients.find(e => e.client_company_id === project_details.client_company_id)

        const timer_entry = {
          project_id: item.project,
          task_id: '',
          client_id: client_data.id,
          company_user_id: client_data.client_company_id,
          status: 'stopped',
          notes: item.description,
          client_rate: item.cost
        }
        timer_entries.push(timer_entry)
      }
      const { message } = await this.$http().post('/timer/create-recurring-entries', { timer_entries })
      if (message) {
        this.getData()
        this.$bvModal.hide('recurring-items')
        alert(message)
      }
    },
    setUpdatedData: _.debounce(function(value, updated_data) {
      this.updateRecurringItems(updated_data)
    }, 500),
    async updateRecurringItems(data) {
      const { project, description, cost, id } = data
      const updated_recurring_items = {
        project_id: project,
        description,
        cost,
        is_active: 1
      }
      const { message } = await this.$http().put('/update_recurring_items/', id, updated_recurring_items)
      if (message) {
        this.getRecurringItems()
        this.resetForm()
        this.tab_index = 0
        if (this.is_edit_mode) alert(message)
        this.is_edit_mode = false
      }
    },
    async deleteRecurringItems(id) {
      const confirm_delete = confirm('Are you sure do you want to delete this item?')
      if (confirm_delete) {
        const { message } = await this.$http().put('/delete_recurring_items/', id)
        if (message) {
          this.getRecurringItems()
          alert(message)
        }
      }
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
