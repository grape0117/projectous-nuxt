<template>
  <b-modal id="add-invoiceable-item" class="add-invoiceable-item" scrollable title="Add Invoiceable Item" @hidden="hide">
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
    <div class="add-description" v-if="Object.keys(invoiceable_item.item_selected).length">
      <b-form-input placeholder="Enter description"></b-form-input>
      <b-form-input type="number" placeholder="Enter rate"></b-form-input>
      <b-form-checkbox id="invoiceable_repeat" v-model="invoiceable_item.repeat" name="invoiceable_repeat" class="mt-2">
        Repeat
      </b-form-checkbox>
      <div v-if="invoiceable_item.repeat">
        <b-dropdown :text="invoiceable_item.repeat_option ? invoiceable_item.repeat_option : 'choose repeat option'" block split split-variant="outline-primary" variant="primary" class="mt-2 invoicable-items" menu-class="w-100">
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
      invoiceable_item: {
        repeat: false,
        item_selected: {},
        repeat_option: null,
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
  methods: {
    hide() {
      this.$emit('hide')
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
    }
  }
}
</script>

<style lang="scss" scoped></style>
