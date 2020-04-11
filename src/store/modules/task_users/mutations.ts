import { MutationTree } from 'vuex'
import Vue from 'vue'
import { IModuleState, ITaskUser } from './types'
import {
  CREATE_TASK_USER,
  UPDATE_TASK_USER,
  DELETE_TASK_USER,
  REMOVE_TEMP_TASKS_USER
} from './mutations-types'

export const mutations: MutationTree<IModuleState> = {
  [CREATE_TASK_USER](state: IModuleState, task_user: ITaskUser) {
    state.task_users.push(task_user)
    // @ts-ignore
    this.commit('LOOKUP', { module: 'task_users' })
  },
  [UPDATE_TASK_USER](state: IModuleState, task_user: ITaskUser) {
    // @ts-ignore
    state.task_users.splice(state.lookup[task_user.id], 1, task_user)
  },
  [DELETE_TASK_USER](state: IModuleState, task_user: ITaskUser) {
    //@Mikhail not sure if I should use deleted_at. I'm wondering if it's faster and better to not change the keys
    // const lookup: any = {}
    // for (let i = 0; i >= state.task_users.length; i++) {
    //   if (state.task_users[i].uuid !== task_user.uuid) {
    //     lookup[i] = state.task_users[i].uuid
    //   } else {
    //     state.task_users.slice(i, 1)
    //   }
    // }
    // state.lookup = lookup
    // @Stephane I implemented it like this for now, later we can change
    state.task_users = state.task_users.filter(
      ({ id }: any) => id !== task_user.id
    )
  },
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
  },
  task_uuid_to_id(state: IModuleState, { uuid, id }) {
    state.task_users[state.lookup[uuid]].id = id
    state.lookup[id] = state.lookup[uuid]

    //TODO: do we need to delete from lookup? Doesn't seem to matter
  }
}
