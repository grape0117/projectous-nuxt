import { Module } from 'vuex'
import { IRootState } from '@/store/types'
import { IModuleState } from './types'
import { actions } from './actions'
import { getters } from './getters'
import { mutations } from './mutations'

export const timers: Module<IModuleState, IRootState> = {
  namespaced: true,
  state: {
    timers: [],
    other_timers: [],
    lookup: {}
  },
  mutations,
  actions,
  getters
}
