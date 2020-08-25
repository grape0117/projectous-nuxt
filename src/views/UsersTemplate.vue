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
          <tr v-bind:user="user" v-for="user in filteredusers" is="user-row"></tr>
        </tbody>
      </table>
    </div>
    Invited Users
    <div class="row table-responsive">
      <table class="table timer-table">
        <tbody>
          <tr v-bind:user="user" v-for="user in filteredusers" is="user-row"></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import UserRow from './UserRow.vue'
export default {
  name: 'users-template',
  components: {
    'user-row': UserRow
  },
  data() {
    return {
      invited: []
    }
  },
  computed: {
    isAdmin: function() {
      return this.$store.getters['settings/isAdmin']
    },
    users: function() {
      return this.$store.state.company_users.company_users
    },
    filteredusers: function() {
      return this.$store.getters['company_users/getActiveUsers']
    }
  },
  mounted() {
    //TODO: api call to get invites
  },
  methods: {
    inviteUser: function() {
      this.$store.dispatch('company_users/inviteUser')
    }
  }
}
</script>
