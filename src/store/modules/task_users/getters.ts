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
    let tasks = state.task_users.filter(({ company_user_id }) => company_user_id === id)
    tasks = [...new Map(tasks.map(item => [item['task_id'], item])).values()]
    return tasks
  },
  getByTaskId: (state: IModuleState) => (task_id: any) => {
    return state.task_users.filter(task_user => task_user.task_id === task_id && task_user.role == 'assigned')
  },
  getByTaskIdAndCompanyUserId: (state: IModuleState) => (info: any) => {
    return state.task_users.filter(({ task_id, company_user_id }) => task_id === info.task_id && company_user_id === info.company_user_id)
  },
  sortedByDays: (state: IModuleState, _, rootState) => (companyUserId: any) => {
    //console.log('************* GETTER USER TASKS *************')
    const { tasks: allTasks, lookup } = rootState.tasks
    const lists = rootState.lists.generalLists
    const today = setToMidnight(new Date())
    const { pinnedProjects, lookup: projectsLookup, projects } = rootState.projects
    return state.task_users
      .filter(({ company_user_id, task_id }) => {
        const task = allTasks[lookup[task_id]]
        if (task && (task.status === 'closed' || task.status === 'completed')) {
          return false
        }
        return company_user_id === companyUserId
      })
      .map(({ id, task_id, sort_order, user_task_list_id, company_user_id, next_work_day, temp }: any) => {
        const project_id = allTasks[lookup[task_id]] ? allTasks[lookup[task_id]].project_id : null
        const project = project_id ? projects[projectsLookup[allTasks[lookup[task_id]].project_id]] : null
        //const project_id = allTasks[lookup[task_id]].project_id
        //const project = projects[projectsLookup[allTasks[lookup[task_id]].project_id]]
        const project_name = project ? project.name : 'Unknown project'
        const isPinned = !!pinnedProjects.find((p: number) => p === project_id)
        let listId
        if (user_task_list_id) {
          listId = user_task_list_id
        } else if (next_work_day) {
          listId = localDate(next_work_day) < today ? 'Past' : getListId(next_work_day, lists, user_task_list_id)
        } else {
          listId = isPinned ? project_name : 'Unmarked'
        }
        return {
          id,
          task_id,
          title: allTasks[lookup[task_id]] ? allTasks[lookup[task_id]].title : '',
          company_user_id,
          project_id,
          sort_order,
          user_task_list_id,
          next_work_day,
          listId,
          temp
        }
      })
      .sort(({ sort_order: a }: any, { sort_order: b }: any) => a - b)
  },
  getNextId: (state: IModuleState) => () => {
    return state.lookup.length
  }
}
