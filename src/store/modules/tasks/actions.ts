// @ts-ignore
import { ActionTree } from 'vuex'
import { IModuleState } from './types'
import { IRootState } from '@/store/types'

export const actions: ActionTree<IModuleState, IRootState> = {
  updateTask({ commit }: any, task: any) {
    // TODO send task to server
    commit('upsert', task)
  }
}
