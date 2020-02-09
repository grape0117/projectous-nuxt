import { Module } from 'vuex'
import { IRootState } from '@/store/types'
import { actions } from './actions'
import { getters } from './getters'
import { mutations } from './mutations'
import { IModuleState } from './types'

const state = {
  projects: [],
  selectedProjectId: null,
  pinnedProjects: [],
  lookup: {}
}

export const projects: Module<IModuleState, IRootState> = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
