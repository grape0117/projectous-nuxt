import { Module } from 'vuex'
import { IRootState } from '@/store/types'
import { IModuleState } from './types'
import { getters } from './getters'

const state = {
  company_users: [],
  lookup: {}
}
export const company_users: Module<IModuleState, IRootState> = {
  namespaced: true,
  state,
  getters
}
