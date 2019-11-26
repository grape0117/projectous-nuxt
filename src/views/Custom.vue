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
    <pj-dragzone
      :id="1"
      :options="lists[1]"
      @updateTask="updateTask"
      @changeSortOrder="changeSortOrder"
    />
    <pj-dragzone
      :id="2"
      :options="lists[2]"
      @updateTask="updateTask"
      @changeSortOrder="changeSortOrder"
    />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { groupBy, cloneDeep } from 'lodash'

const CompanyUsers = namespace('company_users')

@Component
export default class Custom extends Vue {
  @CompanyUsers.State(state => state.company_users) private companyUsers!: any
  private selectedCompanyUser: any = null
  private tasks: any = [
    { id: 1, title: 'My task 1', listId: 1 },
    { id: 2, title: 'My task 2', listId: 1 },
    { id: 3, title: 'My task 3', listId: 2 },
    { id: 4, title: 'My task 4', listId: 2 }
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
  get lists() {
    // const tasks = this.tasks.sort(({ sortOrder: orderA }: any, { sortOrder: orderB }: any) => orderA - orderB)
    return groupBy(this.tasks, 'listId')
  }
  public updateTask(task: any) {
    const index = this.tasks.findIndex(({ id }: any) => task.id === id)
    if (index > -1)
      this.tasks = Object.assign([], this.tasks, { [index]: task })
  }
  public changeSortOrder(task: any, position: number) {
    const index = this.tasks.findIndex(({ id }: any) => task.id === id)
    if (index > -1) {
      this.tasks[index].sort = position
    }
  }
}
</script>
