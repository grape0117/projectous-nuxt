import { Module } from 'vuex'
import { IRootState } from '@/store/types'
import { actions } from './actions'
import { getters } from './getters'
import { mutations } from './mutations'
import { IListsState } from './types'

const state = {
  allTasks: [],
  lists: [
    {
      name: 'tasks',
      tasks: []
    },
    {
      name: 'additionalTasks',
      tasks: []
    },
    {
      name: 'againTasks',
      tasks: []
    }
  ]
}
export const lists: Module<IListsState, IRootState> = {
  namespaced: true,
  state,
  actions,
  getters,
  mutations
}
