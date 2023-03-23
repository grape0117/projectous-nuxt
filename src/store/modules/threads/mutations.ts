import { MutationTree } from 'vuex'
import Vue from 'vue'
import { IModuleState } from './types'

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
  closeByThreadId(state: IModuleState, thread_id) {
    //@ts-ignore
    let thread_index = state.threads.findIndex(({ id }) => id == thread_id)
    state.threads[thread_index].status = 'closed'
  },
  reopenByThreadId(state: IModuleState, thread_id) {
    //@ts-ignore
    let thread_index = state.threads.findIndex(({ id }) => id == thread_id)
    state.threads[thread_index].status = 'open'
  }
}
