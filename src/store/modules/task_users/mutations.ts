import { MutationTree } from 'vuex'
import Vue from 'vue'
import { IModuleState, ITaskUser } from './types'
import { REMOVE_TEMP_TASKS_USER } from './mutations-types'

export const mutations: MutationTree<IModuleState> = {
  [REMOVE_TEMP_TASKS_USER](state: IModuleState) {
    state.task_users = state.task_users.filter(({ temp }) => !temp)
  },
  deleteByTaskId(state: IModuleState, task_id) {
    state.task_users.forEach(task_user => {
      if (task_user.task_id === task_id) {
        // @ts-ignore
        this.commit('DELETE', { module: 'task_users', entity: task_user }, { root: true })
      }
    })
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
