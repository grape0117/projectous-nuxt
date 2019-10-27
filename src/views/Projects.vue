<template>
  <div>
    <select v-model="selectedUser">
      <option v-for="{ id, name } in companyUsers" :id="id">
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
  get companyUsers() {
    return this.$store.state.companyUsers.companyUsers
  }
  @Watch('companyUsers', { immediate: true })
  private onCompanyUsersChanged(users: any) {
    if (users.length) {
      console.log(users, 'changed')
      // Note: select first user by default
      this.selectedUser = users[0].name
    }
  }
}
</script>
