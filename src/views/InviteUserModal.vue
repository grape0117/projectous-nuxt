<template>
  <b-modal id="invite-modal" class="modal fade" role="dialog">
    <template #modal-title> Invite User </template>
    <div class="modal-dialog" role="document">
      <div class="modal-content">
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
      </div>
      <!-- /.modal-content -->
    </div>
    <template #modal-footer>
      <b-button class="btn btn-default mt-3" @click="$bvModal.hide('invite-modal')">
        Close
      </b-button>
      <b-button class="mt-3" variant="primary" @click="inviteUser()">
        Invite User
      </b-button>
    </template>
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
          this.$store.dispatch('settings/closeModal', {
            modal: 'invite',
            object: null,
            pop: false,
            push: true
          })
        })
    }
  }
}
</script>
