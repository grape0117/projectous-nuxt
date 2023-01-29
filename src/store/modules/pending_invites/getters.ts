import Vue from 'vue'
import { GetterTree } from 'vuex'
import { IRootState } from '@/store/types'
import { IPendingInvite, IModuleState } from './types'

export const getters: GetterTree<IModuleState, IRootState> = {
  getById: (state: IModuleState) => (id: any) => {
    // @ts-ignore
    return state.pending_invites[state.lookup[id]]
  },
  getAllInvites: (state: IModuleState) => {
    return (
      state.pending_invites
        // @ts-ignore
        .sort(Vue.nameSort)
    )
  }
}
