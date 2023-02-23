<template>
  <tr class="pending-invite-row">
    <td>{{ invite.name }}</td>
    <td>{{ invite.email }}</td>
    <td>{{ invite.user_role }}</td>
    <td>
      <input type="button" @click="resendInvite" class="btn btn-primary" value="Resend Invitation" />
      <input type="button" @click="deleteInvite" class="btn btn-danger ml-3" value="Delete Invitation" />
    </td>
  </tr>
</template>

<script>
import uuid from 'uuid'
export default {
  name: 'pending-invites-row',
  props: ['invite'],
  methods: {
    resendInvite: function() {
      if (window.confirm('Are you going to resend an invitation to the user?')) {
        this.$store.state.loading = true
        this.$http()
          .post('/re-invite', {
            token: uuid.v4(),
            invite_id: this.invite.id,
            name: this.invite.name,
            email: this.invite.email
          })
          .then(response => {
            if (response.success) {
              alert('Invitation sent to the user again!')
            } else {
              alert('Error while re-sending an invitation to the user. Please contact admin')
            }
          })
        this.$store.state.loading = false
      }
    },
    async deleteInvite() {
      if (window.confirm('Are you going to delete an invitation?')) {
        this.$store.state.loading = true

        await this.$store.dispatch('DELETE', { module: 'pending_invites', entity: this.invite })
        // alert('Deleted Selected Invitation!')
        this.$store.state.loading = false
      }
    }
  }
}
</script>

<style lang="scss">
.pending-invite-row {
  background: rgba($color: #000000, $alpha: 0.4);
  // cursor: pointer;
}
.pending-invite-row:hover {
  background: rgba($color: #000000, $alpha: 0.6);
}
.pending-invite-row td {
  // border: 5px solid red !important;
  font-weight: 500;
  color: white;
}
.color-black {
  color: black !important;
}
</style>
