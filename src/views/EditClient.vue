<template>
  <b-modal id="client-modal" class="modal fade" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
          <h4 class="modal-title">Client Modal</h4>
        </div>
        <div class="modal-body">
          <form id="editClientForm" class="form-horizontal">
            <input type="hidden" name="company_client_id" :value="client.id" />
            <div class="form-group">
              <label class="col-sm-3 control-label" for="inputClientName">Client Name: </label>
              <div class="col-sm-9">
                <input id="inputClientName" class="form-control" type="text" name="name" :value="client.name" />
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-3 control-label" for="companyAcronymInput">Acronym:</label>
              <div class="col-sm-9">
                <input id="companyAcronymInput" class="form-control" type="text" size="5" name="acronym" :value="client.acronym" />
              </div>
            </div>
            <div class="form-group">
              <label class="control-label col-sm-3" for="companyClientSelect">Status: </label>
              <div class="col-sm-9">
                <select class="form-control" id="client-modal-client-id" name="status">
                  <option :selected="isStatus('active')" value="active">Active</option>
                  <option :selected="isStatus('inactive')" value="inactive">Inactive</option>
                  <option :selected="isStatus('archived')" value="archived">Archived</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-3 control-label" for="companyAcronymInput">Client Rate:</label>
              <div class="col-sm-9">
                <input class="form-control" type="text" name="default_client_rate" :value="client.default_client_rate" />
              </div>
            </div>
            <!--<div class="form-group">
                            <label class="col-sm-3 control-label" for="defaultUserRateInput">Default User Rate: </label>
                            <div class="col-sm-9">
                                <input id="defaultUserRateInput" class="form-control" type="text" name="default_user_rate" :value="client.default_user_rate">
                            </div>
                        </div>-->
            <!--<div class="form-group">
                            <label class="col-sm-3 control-label" for="defaultUserMultiplier">Default User Multiplier: </label>
                            <div class="col-sm-9">
                                <input id="defaultUserMultiplier" class="form-control" type="text" name="default_multiplier" placeholder="1.0">
                            </div>
                        </div>-->
            <!--<div class="form-group">
                            <label class="col-sm-3 control-label" for="workFlowyIDInput">Workflowy Id: </label>
                            <div class="col-sm-9">
                                <input id="workFlowyIDInput" class="form-control" type="text" name="workflowy_id" :value="client.workflowy_id">
                            </div>
                        </div>-->
            <div class="form-group">
              <label class="col-sm-3 control-label" for="address1">Address 1: </label>
              <div class="col-sm-9">
                <input id="address1" class="form-control" type="text" name="address1" :value="client.address1" />
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-3 control-label" for="address2">Address 2: </label>
              <div class="col-sm-9">
                <input id="address2" class="form-control" type="text" name="address2" :value="client.address2" />
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-3 control-label" for="city">City: </label>
              <div class="col-sm-9">
                <input id="city" class="form-control" type="text" name="city" :value="client.city" />
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-3 control-label" for="state">State: </label>
              <div class="col-sm-9">
                <input id="state" class="form-control" type="text" name="state" :value="client.state" />
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-3 control-label" for="zip">Zip: </label>
              <div class="col-sm-9">
                <input id="zip" class="form-control" type="text" name="zip" :value="client.zip" />
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-3 control-label" for="phone">Phone: </label>
              <div class="col-sm-9">
                <input id="phone" class="form-control" type="text" name="phone" :value="client.phone" />
              </div>
            </div>
            <!--<div class="form-group checkbox">
                            <label>
                                <input id="allUserCheck" type="checkbox" name="default_all_users"> Default All Users?
                            </label>
                        </div>-->
            <div class="form-group" v-for="user in active_users">
              <label class="control-label col-sm-4">{{ user.name }}: </label>
              <div class="col-sm-8">
                <input type="checkbox" :checked="userChecked(user.id)" :name="'user[' + user.id + ']'" value="1" />
                <input class="" type="text" :name="'default_user_rate[' + user.id + ']'" :value="userRate(user.id)" />
                <select :name="'role[' + user.id + ']'">
                  <option value="assigned" :selected="userSelected('assigned', user.id)">Assigned </option>
                  <option value="reviewer" :selected="userSelected('reviewer', user.id)">Reviewer </option>
                  <option value="manager" :selected="userSelected('manager', user.id)">Manager </option>
                </select>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">
            Close
          </button>
          <button type="button" class="btn btn-primary" v-on:click="saveClient()">
            Save Client
          </button>
        </div>
      </div>
      <!-- /.modal-content -->
    </div>
    <!-- /.modal-dialog --> </b-modal
  ><!-- /.modal -->
</template>

<script>
export default {
  name: 'client-modal',
  computed: {
    client: function() {
      return this.$store.state.settings.current_edit_company_client
    },
    active_users: function() {
      return this.$store.getters['company_users/getActive']
    }
  },
  mounted: function() {
    let self = this
    $('#client-modal').on('hidden.bs.modal', function() {
      self.$store.dispatch('settings/closedModal')
    })
  },
  methods: {
    isStatus: function(status) {
      if (status == this.client.status) {
        return 'selected'
      }
    },
    userSelected: function(user_type, user_id) {
      let self = this
      let userSelected = false
      if (!self.client.users) {
        return false
      }
      $.each(self.client.users, function(key, user) {
        if (user.id == user_id) {
          if (user_type == user.pivot.role) {
            userSelected = 'selected'
            return false
          }
        }
      })

      return userSelected
    },
    userChecked: function(user_id) {
      let self = this
      let userChecked = false
      if (!self.client.users) {
        return false
      }

      $.each(self.client.users, function(key, user) {
        if (user.id == user_id) {
          userChecked = true
          return false
        }
      })
      return userChecked
    },
    userRate: function(user_id) {
      let self = this
      let userRate = ''
      if (!self.client.users) {
        return
      }
      $.each(self.client.users, function(key, user) {
        if (user.id == user_id) {
          //console.log('user rate found');
          //console.log(user);
          userRate = user.pivot.default_user_rate
          return false
        }
      })
      return userRate
    },
    saveClient: function() {
      //TODO: change Save button to Saving...
      let formData = $('#editClientForm').serialize()
      this.$store.dispatch('company_clients/saveClient', formData)
    }
  }
}
</script>
