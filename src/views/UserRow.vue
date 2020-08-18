<template id="users-row">
  <tr @click="editCompanyUser" class="table-row-hover">
    <td :style="'background: ' + user.color">{{ user.name }}</td>
    <td>{{ user.user_role }}</td>
    <td>{{ user.address }}</td>
  </tr>
</template>

<script>
export default {
  name: 'users-row',
  props: ['user'],
  methods: {
    editCompanyUser: function() {
      this.$store.commit('settings/setCurrentEditCompanyUser', this.user)
      this.$store.dispatch('settings/setRemovableStatusOfCurrentEditUser')
      this.$store.dispatch('company_users/editUser')
    }
  }
}
</script>
