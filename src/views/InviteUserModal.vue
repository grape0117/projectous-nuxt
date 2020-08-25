<template>
  <b-modal id="invite-modal" class="modal fade" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
          <h4 class="modal-title">Invite User</h4>
        </div>
        <div class="modal-body">
          <form id="invite-user-form" class="form-horizontal">
            <div class="form-group">
              <label class="control-label col-sm-4" for="inviteName">Name: </label>
              <div class="col-sm-8">
                <input id="inviteName" class="form-control" type="text" name="name" placeholder="Name" v-model="name" />
              </div>
            </div>
            <div class="form-group">
              <label class="control-label col-sm-4" for="inviteEmail">Email: </label>
              <div class="col-sm-8">
                <input id="inviteEmail" class="form-control" type="text" name="email" placeholder="Email" v-model="email" />
              </div>
            </div>
            <div class="form-group">
              <label class="control-label col-sm-4" for="inviteRole">Role: </label>
              <div class="col-sm-8">
                <select class="form-control" id="inviteRole" name="role" v-model="user_role">
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
          <button type="button" class="btn btn-primary" v-on:click="inviteUser()">
            Invite User
          </button>
        </div>
      </div>
      <!-- /.modal-content -->
    </div>
    <!-- /.modal-dialog -->
  </b-modal>
  <!-- /.modal -->
</template>

<script>
import uuid from 'uuid'
export default {
  name: 'invite-user-modal',
  data() {
    return {
      name: '',
      user_role: 'user',
      email: ''
    }
  },
  methods: {
    inviteUser: function() {
      const token = uuid.v4()
      this.$http()
        .post('/invite', { token, name: this.name, user_role: this.user_role, email: this.email })
        .then(response => {
          //TODO: add to invites?
        })
    }
  }
}
</script>
