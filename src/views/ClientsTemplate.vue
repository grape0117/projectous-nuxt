<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-12 form-group form-inline"></div>
      <div class="col-sm-12 form-group form-inline">
        <div @click="createClient()" class="btn btn-primary">Add Client</div>
      </div>
    </div>
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
    </b-tabs>
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
  computed: {
    clients: function() {
      return this.$store.state.clients.clients
    },
    current_company: function() {
      return this.$store.state.settings.current_company
    }
  },
  data: function() {
    return {
      total_active: 0,
      total_inactive: 0,
      total_archived: 0
    }
  },
  methods: {
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
  }
}
</script>
