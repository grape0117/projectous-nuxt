<template>
  <div>
    <select v-model="selectedCompanyUser">
      <option
        v-for="(companyUser, i) in sortedCompanyUsers"
        :value="companyUser"
        :id="companyUser.id"
        :key="`${companyUser.id}-${i}`"
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
import { Component, Vue, Watch } from 'vue-property-decorator'
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
  @TaskUsers.Action private createUserTask!: any
  @Tasks.Action private updateTask!: any
  @Tasks.Action private createTask!: any
  @Tasks.Getter('getById') private getTaskById!: any
  @Lists.Getter private getUserLists!: any
  @CompanyUsers.State(state => state.company_users) private companyUsers!: any

  get lists() {
    return !this.selectedCompanyUser
      ? []
      : this.getUserLists(this.selectedCompanyUser.id)
  }
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

  public async createItem(item: any) {
    const newTaskID = await this.createTask({ title: item.title })

    const newUserTask = cloneDeep(item)
    delete newUserTask.title
    newUserTask.task_id = newTaskID
    this.createUserTask(newUserTask)
  }

  public async updateItem({ id, task_id, title, listId, sort_order }: any) {
    console.log(id, task_id, title, listId, sort_order)
    const taskUser = cloneDeep(this.getTaskUserById(id))
    let newNextWorkDay = null
    if (listId === 'Past') {
      const date = new Date()
      newNextWorkDay = formatDateToYYYY_MM_DD(
        new Date(date.setMonth(date.getMonth() - 1))
      )

      //If listId is a date, return that I think
    } else if (!!Date.parse(listId) && isNaN(listId)) {
      newNextWorkDay = formatDateToYYYY_MM_DD(listId)

      //If listId is a number, this is a user-created list
    } else if (Number.isInteger(Number(listId))) {
      //Only user-created lists have a listId set on task_user object
      taskUser.user_task_list_id = listId
      //TODO: set next_word_day to null?
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
  @Watch('selectedCompanyUser')
  private changeRouteQueryParams(value: any) {
    if (value) {
      this.$router.push({ query: { user: value.id } }).catch(e => {})
    }
  }
  @Watch('sortedCompanyUsers')
  private onSortedCompanyUsersChanged(users: any) {
    const query = this.$route.query.user
    if (query) {
      const user = users.find(({ id }: any) => id === +query)
      if (user && !this.selectedCompanyUser) this.selectedCompanyUser = user
    }
  }
}
</script>
