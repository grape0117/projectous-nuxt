<template id="users-template">
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-12 form-group form-inline"></div>
      <div class="col-sm-12 form-group form-inline" v-if="isAdmin">
        <div @click="inviteUser()" class="btn btn-primary">Invite User</div>
      </div>
    </div>
    <div class="row table-responsive">
      <table class="table timer-table">
        <tbody>
          <tr class="row-date">
            <td>Client</td>
            <td>Role</td>
            <td>Address</td>
          </tr>
          <tr
            v-for="user in filteredusers"
            :key="user.id"
            v-bind:user="user"
            is="company-users-row"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import CompanyUsersRow from './CompanyUsersRow.vue'
export default {
  name: 'users-template',
  components: {
    CompanyUsersRow
  },
  computed: {
    isAdmin: function() {
      return true
      return this.$store.getters['settings/isAdmin']
    },
    company_users: function() {
      return this.$store.state.company_users.company_users
    },
    filteredusers: function() {
      return this.company_users
      return this.$store.getters['company_users/getActiveUsers']
    }
  },
  methods: {
    inviteUser: function() {
      alert('invite')
      return
      this.$store.dispatch('company_users/inviteUser')
    }
  }
}
</script>
