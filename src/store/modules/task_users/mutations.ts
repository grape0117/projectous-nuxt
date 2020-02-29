import { MutationTree } from 'vuex'
import { IModuleState, ITaskUser } from './types'
import { REMOVE_TEMP_TASKS_USER } from './mutations-types'

export const mutations: MutationTree<IModuleState> = {
  [REMOVE_TEMP_TASKS_USER](state: IModuleState) {
    state.task_users = state.task_users.filter(({ temp }) => !temp)
  },
  updateTaskUsersSortOrder(state: IModuleState, ids: number[]) {
    ids.forEach((id, index) => {
      const taskUser = state.task_users[state.lookup[id]]
      if (taskUser) taskUser.sort_order = index
    })
  }
}
