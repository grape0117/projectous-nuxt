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
    <pj-draggable :data="sortedUserTasks" :lists="lists" @save="saveTask" />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { IList } from '@/store/modules/lists/types'
import { sortUserTasksByDay } from '@/utils/util-functions'

const CompanyUsers = namespace('company_users')
const TaskUsers = namespace('task_users')
const Lists = namespace('lists')

@Component
export default class Custom extends Vue {
  get userTasks() {
    if (!this.selectedCompanyUser) return []
    return this.getByCompanyUserId(this.selectedCompanyUser.id)
  }
  get sortedUserTasks() {
    return sortUserTasksByDay(this.userTasks, this.lists)
  }
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
  @TaskUsers.Getter public getByCompanyUserId!: any
  @Lists.State(state => state.user_tasks_list) public lists!: IList
  @CompanyUsers.State(state => state.company_users) private companyUsers!: any
  private selectedCompanyUser: any = null
  public saveTask(task: any) {
    console.log(task)
  }
}
</script>
