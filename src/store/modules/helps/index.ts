import { Module } from 'vuex'
import { IRootState } from '@/store/types'
import { actions } from './actions'
import { getters } from './getters'
import { mutations } from './mutations'
import { IModuleState } from './types'

const state = {
  helps: []
}

export const helps: Module<IModuleState, IRootState> = {
  namespaced: true,
  state,
  actions,
  getters,
  mutations
}
