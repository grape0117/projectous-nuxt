<template>
  <div id="invite-user-modal" class="modal fade" role="dialog">
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
          <h4 class="modal-title">Invite User</h4>
        </div>
        <div class="modal-body">
          <form id="invite-user-form" class="form-horizontal">
            <div class="form-group">
              <label class="control-label col-sm-4" for="inviteName"
                >Name:
              </label>
              <div class="col-sm-8">
                <input
                  id="inviteName"
                  class="form-control"
                  type="text"
                  name="name"
                  placeholder="Name"
                />
              </div>
            </div>
            <div class="form-group">
              <label class="control-label col-sm-4" for="inviteEmail"
                >Email:
              </label>
              <div class="col-sm-8">
                <input
                  id="inviteEmail"
                  class="form-control"
                  type="text"
                  name="email"
                  placeholder="Email"
                />
              </div>
            </div>
            <div class="form-group">
              <label class="control-label col-sm-4" for="inviteRole"
                >Role:
              </label>
              <div class="col-sm-8">
                <select class="form-control" id="inviteRole" name="role">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
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
            v-on:click="inviteUser()"
          >
            Invite User
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
  name: 'invite-user-modal',
  methods: {
    inviteUser: function() {
      var self = this
      ajax('invite', $('#invite-user-form').serialize(), function(response) {
        $('#inviteName').val('')
        $('#inviteEmail').val('')
        $('#inviteRole').val('user')
        $('#invite-user-modal').modal('toggle')
        if (response)
          self.$store.dispatch('company_users/addInvitedUser', response[0])
      })
    }
  }
}
</script>
