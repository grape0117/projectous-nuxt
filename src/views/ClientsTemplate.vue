<template id="clients-template">
  <div class="container-fluid">
    <file-upload></file-upload>
    <div class="row">
      <div class="col-sm-12 form-group form-inline"></div>
      <div class="col-sm-12 form-group form-inline">
        <div @click="createClient()" class="btn btn-primary">Add Client</div>
      </div>
    </div>
    <ul class="nav nav-tabs" role="tablist">
      <li role="presentation" class="active">
        <a href="#active" aria-controls="open" role="tab" data-toggle="tab"
          >Active <span class="badge">{{ total_active }}</span></a
        >
      </li>
      <li role="presentation">
        <a href="#inactive" aria-controls="closed" role="tab" data-toggle="tab"
          >Inactive <span class="badge">{{ total_inactive }}</span></a
        >
      </li>
      <li role="presentation">
        <a href="#archived" aria-controls="closed" role="tab" data-toggle="tab"
          >Archived <span class="badge">{{ total_archived }}</span></a
        >
      </li>
    </ul>
    <div class="tab-content">
      <div role="tabpanel" class="tab-pane active" id="active">
        <div class="table-responsive">
          <table class="table timer-table">
            <tbody>
              <tr class="row-date">
                <td>Client</td>
              </tr>
              <tr v-bind:client="client" v-for="client in filteredclients('active')" is="clients-row"></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div role="tabpanel" class="tab-pane" id="inactive">
        <div class="table-responsive">
          <table class="table timer-table">
            <tbody>
              <tr class="row-date">
                <td>Client</td>
              </tr>
              <tr v-bind:client="client" v-for="client in filteredclients('inactive')" is="clients-row"></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div role="tabpanel" class="tab-pane" id="archived">
        <div class="table-responsive">
          <table class="table timer-table">
            <tbody>
              <tr class="row-date">
                <td>Client</td>
              </tr>
              <tr v-bind:client="client" v-for="client in filteredclients('archived')" is="clients-row"></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'clients-template',
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
          if (client.company_id != self.current_company.id) {
            return false
          }
          return client.status == status
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
