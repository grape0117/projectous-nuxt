import { Module } from 'vuex'
import { IRootState } from '@/store/types'
import { actions } from './actions'
import { getters } from './getters'
import { mutations } from './mutations'
import { IModuleState } from './types'

const state = {
  clients: [],
  lookup: {},
  lookup_by_client_company_id: {}
}
export const clients: Module<IModuleState, IRootState> = {
  namespaced: true,
  state,
  actions,
  getters,
  mutations
}
