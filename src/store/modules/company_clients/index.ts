import { Module } from 'vuex'
import { IRootState } from '@/store/types'
import { actions } from './actions'
import { getters } from './getters'
import { mutations } from './mutations'
import { IModuleState } from './types'

const state = {
  company_clients: [],
  lookup: {}
}
export const company_clients: Module<IModuleState, IRootState> = {
  namespaced: true,
  state,
  actions,
  getters,
  mutations
}
