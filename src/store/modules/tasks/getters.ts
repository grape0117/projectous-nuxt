import { GetterTree } from 'vuex'
import { IRootState } from '@/store/types'
import { IModuleState } from './types'

import { ITaskUser } from '@/store/modules/task_users/types'
import { ITask } from '@/store/modules/tasks/types'

export const getters: GetterTree<IModuleState, IRootState> = {
  getById: (state: IModuleState) => (id: any) => {
    return state.tasks[state.lookup[id]]
  },

  // TODO: delete if task will be added through server
  getNextId: (state: IModuleState) => () => {
    return state.lookup.length
  },

  getByProjectId: (state: IModuleState) => (projectId: any) => {
    if (projectId) {
      return state.tasks.filter(task => task.project_id === projectId)
    }
    return []
  },

  getByCompanyUserId: (state: IModuleState, _getters, rootState, rootGetters) => (company_user_id: any) => {
    const taskUsersByCompanyUserId = rootGetters['task_users/getByCompanyUserId'](company_user_id)
    if (!taskUsersByCompanyUserId.length) return []

    let tasks: ITask[] = []
    taskUsersByCompanyUserId.forEach((taskUser: ITaskUser) => {
      tasks.push(_getters['getById'](taskUser.task_id))
    })

    return tasks
  },
  getMyTasks: (state: IModuleState, _getters, rootState: IRootState) => {
    if (!rootState.settings.current_company_user) {
      return []
    }
    return _getters['getByCompanyUserId'](rootState.settings.current_company_user.id)
  },
  forToday: state => (task: ITask) => {
    return task.for_today == 1 || task.next_work_day
  },
  notToday: state => (task: ITask) => {
    return task.for_today != 1 && !task.next_work_day
  }
}
