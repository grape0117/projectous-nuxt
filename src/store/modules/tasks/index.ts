import { Module } from 'vuex'
import { IRootState } from '@/store/types'
import { actions } from './actions'
import { getters } from './getters'
import { mutations } from './mutations'
import { ITasksState } from './types'

const state = {
  tasks: []
}
export const tasks: Module<ITasksState, IRootState> = {
  namespaced: true,
  state,
  actions,
  getters,
  mutations
}
