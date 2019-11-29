<template>
  <div>
    <select v-model="selectedCompanyUser">
      <option
        v-for="companyUser in sortedCompanyUsers"
        :value="companyUser"
        :id="companyUser.id"
      >
        {{ companyUser.name }}
      </option>
    </select>
    <hr />
    <pj-draggable :data="tasks" :lists="lists" />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

const CompanyUsers = namespace('company_users')

@Component
export default class Custom extends Vue {
  @CompanyUsers.State(state => state.company_users) private companyUsers!: any
  private selectedCompanyUser: any = null
  private tasks: any = [
    { id: 1, title: 'My task 1', listId: 1 },
    { id: 2, title: 'My task 2', listId: 1 },
    { id: 3, title: 'My task 3', listId: 2 },
    { id: 4, title: 'My task 4', listId: 2 },
    { id: 5, title: 'My task 5', listId: 2 },
    { id: 6, title: 'My task 6', listId: 2 },
    { id: 7, title: 'My task 7', listId: 3 },
    { id: 8, title: 'My task 8', listId: 3 },
    { id: 9, title: 'My task 9', listId: 3 }
  ]
  private lists: any = [
    { id: 1, title: 'First List' },
    { id: 2, title: 'Second List' },
    { id: 3, title: 'Third List' },
    { id: 4, title: 'Forth List' },
    { id: 5, title: 'Fifth List' }
  ]
  get sortedCompanyUsers() {
    return this.companyUsers.sort(
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
}
</script>
