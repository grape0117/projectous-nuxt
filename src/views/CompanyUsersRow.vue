<template>
  <tr @click="editCompanyUser" class="company-user-row">
    <td :style="{ background: user.color }" :class="{ 'color-black': !!user.color }">{{ user.name }}</td>
    <td>{{ user.user_role }}</td>
    <td>{{ user.address }}</td>
  </tr>
</template>

<script>
export default {
  name: 'company-users-row',
  props: ['user'],
  methods: {
    editCompanyUser: function() {
      this.$store.dispatch('company_users/editUser', this.user)
    }
  }
}
</script>

<style lang="scss">
.company-user-row {
  background: rgba($color: #000000, $alpha: 0.4);
  cursor: pointer;
}
.company-user-row:hover {
  background: rgba($color: #000000, $alpha: 0.6);
}
.company-user-row td {
  // border: 5px solid red !important;
  font-weight: 500;
  color: white;
}
.color-black {
  color: black !important;
}
</style>
