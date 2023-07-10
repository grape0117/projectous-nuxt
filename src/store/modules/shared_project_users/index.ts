import { Module } from 'vuex'
import { IRootState } from '@/store/types'
import { actions } from './actions'
import { getters } from './getters'
import { mutations } from './mutations'
import { IModuleState } from './types'

const state = {
  shared_project_users: [],
  lookup: {},
  lookup_by_project_id: {},
  lookup_by_company_user_id: {}
}
export const shared_project_users: Module<IModuleState, IRootState> = {
  namespaced: true,
  state,
  actions,
  getters,
  mutations
}
