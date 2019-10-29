<template>
  <div>
    <select v-model="selectedUser">
      <option v-for="{ id, name } in company_users" :id="id">
        {{ name }}
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
  get company_users() {
    let users = this.$store.state.company_users.company_users
    console.log(users)
    return users
  }
  @Watch('company_users', { immediate: true })
  private onCompanyUsersChanged(company_users: any) {
    if (company_users.length) {
      console.log(company_users, 'changed')
      // Note: select first user by default
      this.selectedUser = company_users[0].id
    }
  }
}
</script>
