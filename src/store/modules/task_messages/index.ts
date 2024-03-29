import { Module } from 'vuex'
import { IRootState } from '@/store/types'
import { actions } from './actions'
import { getters } from './getters'
import { mutations } from './mutations'
import { IModuleState } from './types'

const state = {
  task_messages: [],
  lookup: {},
  lookup_by_task_id: {},
  message_task_ids_by_updated_at: {}
}

export const task_messages: Module<IModuleState, IRootState> = {
  namespaced: true,
  state,
  actions,
  getters,
  mutations
}
