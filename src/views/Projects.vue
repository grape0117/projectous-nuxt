<template>
  <div>
    <select v-model="company_user">
      <option
        v-for="company_user in company_users"
        :value="company_user"
        :id="company_user.id"
      >
        {{ company_user.name }}
      </option>
    </select>
    <Draggable :selectedCompanyUser="selectedCompanyUser" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import Draggable from './Draggable.vue'

@Component({
  components: { Draggable }
})
export default class Projects extends Vue {
  private selectedCompanyUser: any = null
  get company_user() {
    return this.selectedCompanyUser
  }
  set user(user) {
    this.selectedCompanyUser = user
  }
  get companyUsers() {
    return this.$store.state.company_users.company_users
  }
  @Watch('company_users', { immediate: true })
  private onCompanyUsersChanged(users: any) {
    if (users.length) {
      // Note: select first user by default
      this.selectedCompanyUser = users[0]
    }
  }
}
</script>
