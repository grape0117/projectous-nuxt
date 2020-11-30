<template>
  <b-modal id="client-modal" class="modal fade" tabindex="-1" role="dialog" title="Edit Client" @ok="saveClient">
    <div v-if="client.history !== 'null'" v-for="event in client.history">{{ event.message }} | {{ event.timestamp }}</div>
    <form id="editClientForm" class="form-horizontal">
      <!-- {{ client.id }} -->
      <div class="form-group">
        <label class="col-sm-3 control-label" for="inputClientName" @blur="updateClient('name')" style="white-space: nowrap;">Client Name: </label>
        <div class="col-sm-9">
          <input id="inputClientName" class="form-control" type="text" name="name" v-model="client.name" />
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-3 control-label" for="companyAcronymInput">Acronym:</label>
        <div class="col-sm-9">
          <input id="companyAcronymInput" class="form-control" type="text" size="5" name="acronym" v-model="client.acronym" />
        </div>
      </div>
      <div class="form-group">
        <label class="control-label col-sm-3" for="companyClientSelect">Status: </label>
        <div class="col-sm-9">
          <select class="form-control" id="client-modal-client-id" name="status" v-model="client.status">
            <option value="lead">Lead</option>
            <option value="new">New</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-3 control-label" for="companyAcronymInput">Client Rate:</label>
        <div class="col-sm-9">
          <input class="form-control" type="text" name="default_client_rate" v-model="client.default_client_rate" />
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-3 control-label" for="address1">Address 1: </label>
        <div class="col-sm-9">
          <input id="address1" class="form-control" type="text" name="address1" v-model="client.address1" />
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-3 control-label" for="address2">Address 2: </label>
        <div class="col-sm-9">
          <input id="address2" class="form-control" type="text" name="address2" v-model="client.address2" />
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-3 control-label" for="city">City: </label>
        <div class="col-sm-9">
          <input id="city" class="form-control" type="text" name="city" v-model="client.city" />
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-3 control-label" for="state">State: </label>
        <div class="col-sm-9">
          <input id="state" class="form-control" type="text" name="state" v-model="client.state" />
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-3 control-label" for="zip">Zip: </label>
        <div class="col-sm-9">
          <input id="zip" class="form-control" type="text" name="zip" v-model="client.zip" />
        </div>
      </div>
      <div class="form-group">
        <label class="col-sm-3 control-label" for="phone">Phone: </label>
        <div class="col-sm-9">
          <input id="phone" class="form-control" type="text" name="phone" v-model="client.phone" />
        </div>
      </div>
      <!--<div class="form-group checkbox">
                      <label>
                          <input id="allUserCheck" type="checkbox" name="default_all_users"> Default All Users?
                      </label>
                  </div>-->
      <client-modal-user :key="user.id" @change="updateHistory" v-bind:client="client" v-for="user in active_users" v-bind:client_user="clientUser(client.id, user.id)" v-bind:user="user"> </client-modal-user>
    </form>
    <!-- /.modal-dialog --> </b-modal
  ><!-- /.modal -->
</template>

<script>
import EditClientModalUser from './EditClientUserModal.vue'

export default {
  name: 'client-modal',
  components: {
    'client-modal-user': EditClientModalUser
  },
  computed: {
    client: function() {
      return this.$store.state.settings.current_edit_client
    },
    active_users: function() {
      return this.$store.getters['company_users/getActive']
    }
  },
  mounted: function() {
    let self = this
    /* $('#client-modal').on('hidden.bs.modal', function() {
      self.$store.dispatch('settings/closedModal')
    })*/
  },
  methods: {
    updateClient(property) {
      this.updateHistory({ message: '' })
    },
    updateHistory({ message }) {
      console.log('message', message, typeof this.client.history)
      let history = this.client.history
      if (history === 'null') {
        history = []
      }
      history.push({ message, timestamp: new Date() })
      console.log(history)
      this.client.history = history
      this.$store.dispatch('UPDATE_ATTRIBUTE', { module: 'clients', id: this.client.id, attribute: 'history', value: history })
    },
    clientUser(client_id, company_user_id) {
      return this.$store.getters['client_users/getByClientIdAndCompanyUserId']({ client_id, company_user_id })
    },
    saveClient: function() {
      //TODO: change Save button to Saving...
      console.log('client save', this.client)
      this.$store.dispatch('UPSERT', { module: 'clients', entity: this.client })
    }
  }
}
</script>
