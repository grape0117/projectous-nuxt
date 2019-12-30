import { GetterTree } from 'vuex'
import { IRootState } from '@/store/types'
import { IModuleState } from './types'
import { setToMidnight, localDate } from '@/utils/dateFunctions'
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
    const lists = rootState.lists.generalLists
    const today = setToMidnight(new Date())
    const pinnedProjects = rootState.projects.pinnedProjects
    return state.task_users
      .filter(({ company_user_id }) => company_user_id === companyUserId)
      .map(
        ({
          id,
          task_id,
          sort_order,
          user_task_list_id,
          company_user_id,
          next_work_day
        }: any) => ({
          id,
          task_id,
          title: allTasks[lookup[task_id]].title,
          company_user_id,
          project_id:
            allTasks[lookup[task_id]]
              .project_id /*TODO Mikhail, this isn't flexible for project tasks?*/,
          sort_order,
          user_task_list_id,
          next_work_day,
          listId: user_task_list_id
            ? user_task_list_id
            : !next_work_day
            ? 'Unmarked'
            : localDate(next_work_day) < today
            ? 'Past'
            : getListId(next_work_day, lists, user_task_list_id)
        })
      )
      .filter(task => {
        if (task.listId === 'Unmarked' && pinnedProjects.find((projects: number) => projects === task.project_id)) {
          return null
        } else return task
      })
      .sort(({ sort_order: a }: any, { sort_order: b }: any) => a - b)
  },
  getNextId: (state: IModuleState) => () => {
    return state.lookup.length
  }
}
