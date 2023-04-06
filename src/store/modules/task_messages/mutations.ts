import { MutationTree } from 'vuex'
import Vue from 'vue'
import { IModuleState, ITaskMessage } from './types'

export const mutations: MutationTree<IModuleState> = {
  LOOKUP(state: IModuleState, task_messages: any) {
    //@ts-ignore
    task_messages.forEach(function(task_message, key) {
      //@ts-ignore
      if (!state.lookup_by_task_id[task_message.task_id]) {
        // @ts-ignore
        state.lookup_by_task_id[task_message.task_id] = []
      }
      // @ts-ignore
      state.lookup_by_task_id[task_message.task_id].push(key)
    })
  },
  deleteByTaskId(state: IModuleState, task_id) {
    state.task_messages.forEach(task_message => {
      if (task_message.task_id === task_id) {
        // @ts-ignore
        this.commit('DELETE', { module: 'task_messages', entity: task_message }, { root: true })
      }
    })
  },
  addMessages(state: IModuleState, messages) {
    for (const message of messages) {
      const alreadyExist = state.task_messages.find(({ id }) => id == message.id)
      if (!alreadyExist) {
        state.task_messages.push(message)
      }
    }
  }
}
