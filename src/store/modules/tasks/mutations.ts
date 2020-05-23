// @ts-ignore
import { MutationTree } from 'vuex'
import { IModuleState, ITask } from './types'
import Vue from 'vue'
import { IRootState } from '@/store/types'

export const mutations: MutationTree<IModuleState> = {
  CASCADE_DELETE(state: IModuleState, entity) {
    // @ts-ignore
    this.commit('task_users/deleteByTaskId', entity.id) //TODO: handle here?
  },
  removeTempTasks(state: IModuleState) {
    state.tasks = state.tasks.filter(({ temp }) => !temp)
  },
  updateTasksSortOrders(state: IModuleState, ids: number[]) {
    ids.forEach((id, index) => {
      const task = state.tasks[state.lookup[id]]
      console.log(index + ' updateTasksSortOrders: updating sort order for task', task)
      if (task) task.sort_order = index //Project?
    })
  },
  uuid_to_id(state: IModuleState, { uuid, id }) {
    state.tasks[state.lookup[uuid]].id = id
    state.lookup[id] = state.lookup[uuid]

    //TODO: do we need to delete from lookup? Doesn't seem to matter
  }
}
