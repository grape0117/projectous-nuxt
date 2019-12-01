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
    <pj-draggable :data="sortedUserTasks" :lists="lists" @update="updateItem" />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { IList } from '@/store/modules/lists/types'
import { sortUserTasksByDay } from '@/utils/util-functions'
import { cloneDeep } from 'lodash'
import { formatDateToYYYY_MM_DD } from '@/utils/dateFunctions'

const CompanyUsers = namespace('company_users')
const TaskUsers = namespace('task_users')
const Tasks = namespace('tasks')
const Lists = namespace('lists')

@Component
export default class Custom extends Vue {
  @TaskUsers.Getter private getByCompanyUserId!: any
  @TaskUsers.Getter('getById') private getTaskUserById!: any
  @TaskUsers.Action private updateTaskUser!: any
  @Tasks.Action private updateTask!: any
  @Tasks.Getter('getById') private getTaskById!: any
  @Lists.State(state => state.user_tasks_list) private lists!: IList
  @CompanyUsers.State(state => state.company_users) private companyUsers!: any
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
  private selectedCompanyUser: any = null
  public async updateItem(item: any) {
    const userTask = cloneDeep(this.getTaskUserById(item.id))
    let newNextWorkDay = null
    if (item.listId === 'Past') {
      const date = new Date()
      newNextWorkDay = formatDateToYYYY_MM_DD(
        new Date(date.setMonth(date.getMonth() - 1))
      )
    } else if (!!Date.parse(item.listId)) {
      newNextWorkDay = formatDateToYYYY_MM_DD(item.listId)
    }
    userTask.next_work_day = newNextWorkDay
    await this.updateTaskUser(userTask)
    // Todo: update task
    const task = cloneDeep(this.getTaskById(item.task_id))
    if (task.title !== item.title) {
      task.title = item.title
      await this.updateTask(task)
    }
  }
}
</script>
