// @ts-ignore
import { ActionTree } from 'vuex'
import { IModuleState } from './types'
import { IRootState } from '@/store/types'

export const actions: ActionTree<IModuleState, IRootState> = {
  updateTask({ dispatch, commit }: any, task: any) {
    // TODO send to server
    commit('upsert', task)
  }
}
