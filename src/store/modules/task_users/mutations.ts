import { MutationTree } from 'vuex'
import Vue from 'vue'
import { IModuleState, ITaskUser } from './types'
import { REMOVE_TEMP_TASKS_USER } from './mutations-types'

export const mutations: MutationTree<IModuleState> = {
  [REMOVE_TEMP_TASKS_USER](state: IModuleState) {
    state.task_users = state.task_users.filter(({ temp }) => !temp)
  },
  LOOKUP(state: IModuleState, task_users: any) {
    //@ts-ignore
    task_users.forEach(function(task_user, key) {
      //@ts-ignore
      if (!state.lookup_by_task_id[task_user.task_id]) {
        // @ts-ignore
        state.lookup_by_task_id[task_user.task_id] = []
      }
      // @ts-ignore
      state.lookup_by_task_id[task_user.task_id].push(key)
    })
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
      // @ts-ignore
      this.commit('UPDATE_ATTRIBUTE', { module: 'task_users', id, attribute: 'sort_order', value: index })
    })
  },
  update(state: IModuleState, taskUser: ITaskUser) {
    let updated_task_users = [...state.task_users]
    const task_user_index = updated_task_users.findIndex(({ id }) => id === taskUser.id)
    updated_task_users[task_user_index] = { ...taskUser }
    state.task_users = updated_task_users
  }
}
