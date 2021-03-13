<template>
  <div class="company-users container-fluid">
    <div class="row company-users-top">
      <div class="col-sm-12 form-group form-inline"></div>
      <div class="col-sm-12 form-group form-inline d-flex justify-content-between" v-if="isAdmin">
        <div class="d-flex">
          <span class="filterUsers" :class="selectedFilter === 'active' ? 'selected' : null" @click="selectedFilter = 'active'">
            Active
            <span class="userCount">{{ activeUsers.length }}</span>
          </span>
          <span class="filterUsers" :class="selectedFilter === 'inactive' ? 'selected' : null" @click="selectedFilter = 'inactive'">
            Inactive
            <span class="userCount">{{ inactiveUsers.length }}</span>
          </span>
        </div>
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
          <div v-for="user in selectedFilter === 'active' ? activeUsers : inactiveUsers" :key="user.id" :user="user" is="company-users-row" />
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import CompanyUsersRow from './CompanyUsersRow.vue'
export default {
  name: 'users-template',
  data() {
    return {
      selectedFilter: 'active'
    }
  },
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
    activeUsers: function() {
      return this.$store.getters['company_users/getActive']
    },
    inactiveUsers() {
      return this.$store.getters['company_users/getInactive']
    }
  },
  methods: {
    inviteUser: function() {
      this.$store.dispatch('company_users/inviteUser')
    }
  }
}
</script>

<style lang="scss">
.userCount {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 10px;
  font-size: 10px;
  width: 17px;
  height: 17px;
  background-color: green;
  padding: 3px;
  border-radius: 50px;
}
.selected {
  background-color: rgba(0, 0, 0, 0.4) !important;
}
.filterUsers {
  user-select: none;
  background-color: rgba(0, 0, 0, 0.5);
  font-size: 18px;
  padding: 5px 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: white;

  &:hover {
    background-color: rgba(0, 0, 0, 0.7) !important;
  }
}
.company-users {
  padding: 0 65px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.company-users-top {
  width: 100%;
}
.row-date {
  background-color: rgba($color: #000000, $alpha: 0.6) !important;
}
.row-date td {
  color: white !important;
  font-weight: 500;
}
</style>
