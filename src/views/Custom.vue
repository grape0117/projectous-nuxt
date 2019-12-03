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
    <pj-draggable
      :data="tasksUsers"
      :lists="lists"
      @create="createItem"
      @update="updateItem"
    />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { IList } from '@/store/modules/lists/types'
import { cloneDeep } from 'lodash'
import { formatDateToYYYY_MM_DD } from '@/utils/dateFunctions'

const CompanyUsers = namespace('company_users')
const TaskUsers = namespace('task_users')
const Tasks = namespace('tasks')
const Lists = namespace('lists')

@Component
export default class Custom extends Vue {
  @TaskUsers.Getter('getById') private getTaskUserById!: any
  @TaskUsers.Getter private sortedByDays!: any
  @TaskUsers.Action private updateTaskUser!: any
  @Tasks.Action private updateTask!: any
  @Tasks.Getter('getById') private getTaskById!: any
  @Lists.State(state => state.user_tasks_list) private lists!: IList
  @CompanyUsers.State(state => state.company_users) private companyUsers!: any
  get tasksUsers() {
    if (!this.selectedCompanyUser) return []
    return this.sortedByDays(this.selectedCompanyUser.id)
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
  public createItem(previousItemId: number, listId: string | number) {
    console.log(previousItemId, listId)
    // Todo: create task and task_user
  }
  public async updateItem({ id, task_id, title, listId, sort_order }: any) {
    const taskUser = cloneDeep(this.getTaskUserById(id))
    let newNextWorkDay = null
    if (listId === 'Past') {
      const date = new Date()
      newNextWorkDay = formatDateToYYYY_MM_DD(
        new Date(date.setMonth(date.getMonth() - 1))
      )
    } else if (!!Date.parse(listId) && isNaN(listId)) {
      newNextWorkDay = formatDateToYYYY_MM_DD(listId)
    } else if (Number.isInteger(Number(listId))) {
      // Note: assume that all lists with integer id are created by user and update user_task_list_id
      taskUser.user_task_list_id = listId
    }
    taskUser.next_work_day = newNextWorkDay
    taskUser.sort_order = sort_order
    await this.updateTaskUser(taskUser)
    const task = cloneDeep(this.getTaskById(task_id))
    if (task.title !== title) {
      task.title = title
      await this.updateTask(task)
    }
  }
}
</script>
