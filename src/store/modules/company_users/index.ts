import { Module } from 'vuex'
import { IRootState } from '@/store/types'
import { IModuleState } from './types'
import { getters } from './getters'
import { actions } from './actions'
import { mutations } from './mutations'

const state = {
  company_users: [],
  lookup: {}
}
export const company_users: Module<IModuleState, IRootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
