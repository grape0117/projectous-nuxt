import { Module } from 'vuex'
import { IRootState } from '@/store/types'
import { actions } from './actions'
import { getters } from './getters'
import { mutations } from './mutations'
import { IModuleState } from './types'

const state = {
  shared_projects: [],
  selectedProjectId: null,
  pinnedProjects: [],
  lookup: {},
  lookup_by_client_company_id: {},
  task_list: []
}

export const shared_projects: Module<IModuleState, IRootState> = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
