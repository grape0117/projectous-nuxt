<template>
  <div id="client-template" class="container-fluid">
    <div class="row">
      <div class="col-sm-12 form-group form-inline"></div>
      <div class="col-sm-12 form-group form-inline">
        <div @click="createClient()" class="btn btn-primary">Add Client</div>
      </div>
    </div>
    <div class="row client-template_tabs-wrapper">
      <div class="client-template_tabs">
        <div class="client-template_tabName" v-for="(tab, tabIndex) in tabs" :key="tabIndex" @click="selectTab(tab)" :style="{ 'background-color': tab === selectedTab ? 'rgba(0,0,0, 0.4)' : '' }">
          <span>{{ tab | capitalize }}</span>
          <span v-if="filteredclients(tab).length > 0" class="client-template_item-count">
            {{ filteredclients(tab).length }}
          </span>
        </div>
      </div>
      <div class="client-template_tabItems">
        <clients-row class="client-template_items" v-for="(client, clientIndex) in filteredclients(selectedTab)" :key="clientIndex" :client="client"></clients-row>
      </div>
    </div>
    <!--     
    <b-tabs class="nav nav-tabs" role="tablist">
      <b-tab title="Lead" role="presentation" class="active">
        <table class="table timer-table">
          <tbody>
            <tr class="row-date">
              <td>Client</td>
            </tr>
            <tr v-bind:client="client" v-for="(client, clientIndex) in filteredclients('lead')" :key="clientIndex" is="clients-row"></tr>
          </tbody>
        </table>
      </b-tab>
      <b-tab title="New" role="presentation" class="active">
        <table class="table timer-table">
          <tbody>
            <tr class="row-date">
              <td>Client</td>
            </tr>
            <tr v-bind:client="client" v-for="(client, clientIndex) in filteredclients('new')" :key="clientIndex" is="clients-row"></tr>
          </tbody>
        </table>
      </b-tab>
      <b-tab title="Active" role="presentation" class="active">
        <table class="table timer-table">
          <tbody>
            <tr class="row-date">
              <td>Client</td>
            </tr>
            <tr v-bind:client="client" v-for="(client, clientIndex) in filteredclients('active')" :key="clientIndex" is="clients-row"></tr>
          </tbody>
        </table>
      </b-tab>
      <b-tab title="Inactive" role="presentation">
        <table class="table timer-table">
          <tbody>
            <tr class="row-date">
              <td>Client</td>
            </tr>
            <tr v-bind:client="client" v-for="(client, clientIndex) in filteredclients('inactive')" is="clients-row"></tr>
          </tbody>
        </table>
      </b-tab>
      <b-tab title="Archived" role="presentation">
        <table class="table timer-table">
          <tbody>
            <tr class="row-date">
              <td>Client</td>
            </tr>
            <tr v-bind:client="client" v-for="(client, clientIndex) in filteredclients('archived')" :key="clientIndex" is="clients-row"></tr>
          </tbody>
        </table>
      </b-tab>
    </b-tabs> -->
  </div>
</template>

<script>
import Vue from 'vue'
import ClientRow from './ClientRow.vue'
export default {
  name: 'clients-template',
  components: {
    'clients-row': ClientRow
  },
  data() {
    return {
      total_active: 0,
      total_inactive: 0,
      total_archived: 0,
      tabs: ['lead', 'new', 'active', 'inactive', 'archived'],
      selectedTab: ''
    }
  },
  computed: {
    clients: function() {
      return this.$store.state.clients.clients
    },
    current_company: function() {
      return this.$store.state.settings.current_company
    }
  },
  methods: {
    selectTab(tab) {
      this.selectedTab = tab
    },
    filteredclients: function(status) {
      let self = this
      let clients = self.clients
        .filter(function(client) {
          if (client.company_id !== self.current_company.id) {
            //return false
          }
          return client.status === status
        })
        .sort(Vue.nameSort)
      self['total_' + status] = clients.length
      return clients
    },
    createClient: function() {
      this.$store.dispatch('clients/createClient')
    },
    editClient: function(client) {
      this.$store.dispatch('clients/editClient', client)
    }
  },
  filters: {
    capitalize: function(value) {
      if (!value) return ''
      value = value.toString()
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
  }
}
</script>

<style lang="scss">
#client-template {
  color: white;
  padding: 0 90px;
}
.client-template_tabs-wrapper {
  display: flex;
  flex-direction: column;
}
.client-template_tabs {
  border-radius: 3px;
  display: flex;
}
.client-template_tabName {
  background-color: rgba($color: #000000, $alpha: 0.5);
  font-size: 18px;
  padding: 5px 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.client-template_tabName:hover {
  background-color: rgba($color: #000000, $alpha: 0.7);
}
.client-template_tabItems {
  display: flex;
  flex-direction: column;
  max-width: 500px;
  margin-top: 20px;
  max-height: calc(100vh - 200px);
  overflow-y: scroll;
}
.client-template_items {
  border-bottom: 1px solid white;
  padding: 8px 10px;
}
.client-template_item-count {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 10px;
  font-size: 10px;
  width: 17px;
  height: 17px;
  background-color: green;
  padding: 3px;
  border-radius: 50px;
}
</style>
