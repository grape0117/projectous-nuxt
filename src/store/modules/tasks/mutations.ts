// @ts-ignore
import { MutationTree } from 'vuex'
import { IModuleState, ITask } from './types'
import Vue from 'vue'
import { IRootState } from '@/store/types'

export const mutations: MutationTree<IModuleState> = {
  DELETE(state: IModuleState, { entity: task }) {
    console.log(
      'task deleted, but are task_users and other task tables getting updated?'
    )
  },
  removeTempTasks(state: IModuleState) {
    state.tasks = state.tasks.filter(({ temp }) => !temp)
  },
  updateTasksSortOrder(state: IModuleState, ids: number[]) {
    ids.forEach((id, index) => {
      const task = state.tasks[state.lookup[id]]
      if (task) task.sort_order = index //Project?
    })
  },
  uuid_to_id(state: IModuleState, { uuid, id }) {
    state.tasks[state.lookup[uuid]].id = id
    state.lookup[id] = state.lookup[uuid]

    //TODO: do we need to delete from lookup? Doesn't seem to matter
  }
}
