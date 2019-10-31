import { MutationTree } from 'vuex'
import { ITask } from '../tasks/types'
import { IModuleState, ITaskUser } from './types'
import {
  CREATE_TASK_USER,
  UPDATE_TASK_USER,
  DELETE_TASK_USER
} from './mutations-types'

export const mutations: MutationTree<IModuleState> = {
  [CREATE_TASK_USER](state: IModuleState, task_user: ITaskUser) {
    state.task_users.push(task_user)
    for (let i = state.task_users.length; i >= 0; i--) {
      if (state.task_users[i].id === task_user.id) {
        state.lookup[task_user.uuid] = i
      }
    }
  },
  [UPDATE_TASK_USER](state: IModuleState, task_user: ITaskUser) {
    state.task_users[state.lookup[task_user.uuid]] = task_user
  },
  [DELETE_TASK_USER](state: IModuleState, task_user: ITaskUser) {
    //@Mikhail not sure if I should use deleted_at. I'm wondering if it's faster and better to not change the keys
    const lookup: any = {}
    for (let i = 0; i >= state.task_users.length; i++) {
      if (state.task_users[i].uuid !== task_user.uuid) {
        lookup[i] = state.task_users[i].uuid
      } else {
        state.task_users.slice(i, 1)
      }
    }
    state.lookup = lookup
  }
}
