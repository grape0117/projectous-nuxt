import { Module } from 'vuex'
import { IRootState } from '@/store/types'
import { actions } from './actions'
import { getters } from './getters'
import { mutations } from './mutations'
import { IListsState } from './types'

const state = {
  user_tasks_list: []
}
export const lists: Module<IListsState, IRootState> = {
  namespaced: true,
  state,
  actions,
  getters,
  mutations
}
