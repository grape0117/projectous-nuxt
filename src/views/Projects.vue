<template>
  <div>
    <select v-model="user">
      <option v-for="user in companyUsers" :value="user" :id="user.id">
        {{ user.name }}
      </option>
    </select>
    <Draggable :selectedUser="selectedUser" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import Draggable from './Draggable.vue'

@Component({
  components: { Draggable }
})
export default class Projects extends Vue {
  private selectedUser: any = null
  get user() {
    return this.selectedUser
  }
  set user(user) {
    this.selectedUser = user
  }
  get companyUsers() {
    return this.$store.state.companyUsers.companyUsers
  }
  @Watch('companyUsers', { immediate: true })
  private onCompanyUsersChanged(users: any) {
    if (users.length) {
      // Note: select first user by default
      this.selectedUser = users[0]
    }
  }
}
</script>
