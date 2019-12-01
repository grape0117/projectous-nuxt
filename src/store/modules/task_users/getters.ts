import { GetterTree } from 'vuex'
import { IRootState } from '@/store/types'
import { IModuleState } from './types'
import { resetTime } from '@/utils/dateFunctions'
import { getListId } from '@/utils/util-functions'

export const getters: GetterTree<IModuleState, IRootState> = {
  getById: (state: IModuleState) => (id: any) => {
    return state.task_users[state.lookup[id]]
  },
  getByCompanyUserId: (state: IModuleState) => (id: any) => {
    return state.task_users.filter(
      ({ company_user_id }) => company_user_id === id
    )
  },
  sortedByDays: (state: IModuleState, _, rootState) => (companyUserId: any) => {
    const { tasks: allTasks, lookup } = rootState.tasks
    const lists = rootState.lists.user_tasks_list
    const today = resetTime(new Date())
    return state.task_users
      .filter(({ company_user_id }) => company_user_id === companyUserId)
      .map(({ id, task_id, company_user_id, next_work_day }: any) => ({
        id,
        task_id,
        title: allTasks[lookup[task_id]].title,
        company_user_id,
        next_work_day,
        listId: !next_work_day
          ? 'Unmarked'
          : resetTime(next_work_day).getTime() < today.getTime()
          ? 'Past'
          : getListId(next_work_day, lists)
      }))
      .sort(({ sort_order: a }: any, { sort_order: b }: any) => a - b)
  }
}
