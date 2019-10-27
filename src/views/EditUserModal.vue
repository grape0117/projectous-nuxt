<template>
  <div id="edit-user-modal" class="modal fade" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button
            type="button"
            class="close"
            data-dismiss="modal"
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </button>
          <h4 class="modal-title">Edit User</h4>
        </div>
        <div class="modal-body">
          <form id="edit-user-form" class="form-horizontal">
            <div class="form-group">
              <label class="control-label col-sm-4" for="userName"
                >Name:
              </label>
              <div class="col-sm-8">
                <input
                  id="userName"
                  class="form-control"
                  type="text"
                  name="name"
                  placeholder="Name"
                  v-model="user.name"
                />
              </div>
            </div>
            <div class="form-group">
              <label class="control-label col-sm-4" for="userEmail"
                >Email:
              </label>
              <div class="col-sm-8">
                <input
                  id="userEmail"
                  class="form-control"
                  type="text"
                  name="email"
                  placeholder="Email"
                  v-model="user.email"
                />
              </div>
            </div>
            <div class="form-group">
              <label class="control-label col-sm-4" for="userRole"
                >Role:
              </label>
              <div class="col-sm-8">
                <select
                  class="form-control"
                  id="userRole"
                  name="role"
                  v-model="user.user_role"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="control-label col-sm-4" for="userAliases"
                >Aliases:
              </label>
              <div class="col-sm-8">
                <input
                  id="userAliases"
                  class="form-control"
                  type="text"
                  name="aliases"
                  placeholder="Aliases"
                  v-model="user.aliases"
                />
              </div>
            </div>
            <div class="form-group">
              <label class="control-label col-sm-4" for="defaultUserRate"
                >Default User Rate:
              </label>
              <div class="col-sm-8">
                <input
                  id="defaultUserRate"
                  class="form-control"
                  type="text"
                  name="defaultUserRate"
                  placeholder="Default User Rate"
                  v-model="user.default_user_rate"
                />
              </div>
            </div>
            <div class="form-group">
              <label class="control-label col-sm-4" for="userAddress"
                >Address:
              </label>
              <div class="col-sm-8">
                <input
                  id="userAddress"
                  class="form-control"
                  type="text"
                  name="address"
                  placeholder="Address"
                  v-model="user.address"
                />
              </div>
            </div>
            <div class="form-group">
              <label class="control-label col-sm-4" for="userPhone"
                >Phone:
              </label>
              <div class="col-sm-8">
                <input
                  id="userPhone"
                  class="form-control"
                  type="text"
                  name="phone"
                  placeholder="Phone"
                  v-model="user.phone"
                />
              </div>
            </div>
            <div class="form-group" :style="'background: ' + user.color">
              <label class="control-label col-sm-4" for="userPhone"
                >Color:
              </label>
              <div class="col-sm-8">
                <input
                  id="color"
                  class="form-control"
                  type="text"
                  name="color"
                  placeholder="Phone"
                  v-model="user.color"
                />
              </div>
            </div>
            <div class="form-group">
              <label class="control-label col-sm-4" for="userTimeZone"
                >TimeZone:
              </label>
              <div class="col-sm-8">
                <input
                  id="userTimeZone"
                  class="form-control"
                  type="text"
                  name="timeZone"
                  placeholder="TimeZone"
                  v-model="user.timezone"
                />
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">
            Close
          </button>
          <button
            type="button"
            class="btn btn-primary"
            v-on:click="saveUser()"
            v-if="isAdmin"
          >
            Save
          </button>
          <button
            type="button"
            class="btn btn-primary"
            v-on:click="makeInactive()"
            v-if="isAdmin"
          >
            Make Inactive
          </button>
          <button
            type="button"
            class="btn btn-primary"
            v-on:click="removeUser()"
            v-if="isAdmin && has_no_timers"
          >
            Remove from Company
          </button>
        </div>
      </div>
      <!-- /.modal-content -->
    </div>
    <!-- /.modal-dialog -->
  </div>
  <!-- /.modal -->
</template>

<script>
export default {
  name: 'edit-user-modal',
  computed: {
    isAdmin: function() {
      return true
      return this.$store.getters['settings/isAdmin']
    },
    user: function() {
      return this.$store.getters['settings/getCurrentEditCompanyUser']
    },
    has_no_timers: function() {
      return true
      return this.$store.getters['settings/getRemovableStatusOfCurrentEditUser']
    }
  },
  methods: {
    makeInactive: function() {
      var self = this
      var data = {
        user_id: this.user.user_id,
        company_id: this.user.company_id
      }
      self.$store.dispatch('company_users/makeInactive', self.user.id)
      ajax('make-user-inactive', data, function(response) {
        $('#edit-user-modal').modal('toggle')
        //if(response)
      })
    },
    removeUser: function() {
      var self = this
      var data = {
        user_id: this.user.user_id,
        company_id: this.user.company_id
      }
      self.$store.dispatch('company_users/removeUser', self.user.id)
      ajax('remove-user', data, function(response) {
        $('#edit-user-modal').modal('toggle')
        //if(response)
      })
    },
    saveUser: function() {
      var self = this
      var data = { user: this.user }
      if (response) self.$store.dispatch('company_users/saveUser', self.user)
      ajax('user/save', data, function(response) {
        $('#edit-user-modal').modal('toggle')
      })
    }
  }
}
</script>
