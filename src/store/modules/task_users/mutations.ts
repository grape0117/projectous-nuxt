import { MutationTree } from 'vuex'
import Vue from 'vue'
import { IModuleState, ITaskUser } from './types'
import { REMOVE_TEMP_TASKS_USER } from './mutations-types'

export const mutations: MutationTree<IModuleState> = {
  [REMOVE_TEMP_TASKS_USER](state: IModuleState) {
    state.task_users = state.task_users.filter(({ temp }) => !temp)
  },
  updateTaskUsersSortOrders(state: IModuleState, ids: number[]) {
    ids.forEach((id, index) => {
      const taskUser = state.task_users[state.lookup[id]]
      //console.log('updateTaskUsersSortOrders: updating sort order for taskUser to '+index, taskUser.id)
      if (taskUser) {
        Vue.set(taskUser, 'sort_order', index)
      }
    })
  }
}
