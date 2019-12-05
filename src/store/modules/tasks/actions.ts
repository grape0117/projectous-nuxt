// @ts-ignore
import { ActionTree } from 'vuex'
import { IModuleState } from './types'
import { IRootState } from '@/store/types'

export const actions: ActionTree<IModuleState, IRootState> = {
  updateTask({ commit }: any, task: any) {
    // TODO @stephane send task to server
    commit('upsert', task)
  },

  createTask({ commit, getters }: any, task: any) {
    task.id = getters.getNextId()
    commit('create', task)
    return task.id
  }
}
