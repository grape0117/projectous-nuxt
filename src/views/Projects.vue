<template>
  <div>
    <select v-model="selectedCompanyUser">
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

  get company_users() {
    return this.$store.state.company_users.company_users.sort(
      (
        { name: nameA }: { name: string },
        { name: nameB }: { name: string }
      ) => {
        if (nameA.toLowerCase() > nameB.toLowerCase()) return 1
        if (nameA.toLowerCase() < nameB.toLowerCase()) return -1
        return 0
      }
    )
  }

  @Watch('company_users', { immediate: true })
  private onCompanyUsersChanged(company_users: any) {
    if (company_users.length && this.selectedCompanyUser === null) {
      // Note: select first user by default
      this.selectedCompanyUser = this.$store.state.settings.current_company_user
    }
    this.updateSelectedUser()
  }

  @Watch('selectedCompanyUser', { immediate: true, deep: true })
  private onSelectedUserChanged(user: any) {
    if (user && `${user.id}` !== this.$route.query.user) {
      this.$router.replace({
        path: `${this.$route.fullPath}`,
        query: {
          ...this.$route.query,
          user: user.id
        }
      })
    }
  }

  @Watch('$route.query.user', { immediate: true })
  private onUserQueryChanged() {
    this.updateSelectedUser()
  }

  private updateSelectedUser() {
    const queryUserID = this.$route.query.user
    const matchingUser = this.company_users.find(
      (item: any) => `${item.id}` === queryUserID
    )
    if (matchingUser) {
      this.selectedCompanyUser = matchingUser
    }
  }
}
</script>
