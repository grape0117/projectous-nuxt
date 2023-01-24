import { Module } from 'vuex'
import { IRootState } from '@/store/types'
import { IModuleState } from './types'
import { getters } from './getters'

const state = {
  pending_invites: [],
  lookup: {}
}
export const pending_invites: Module<IModuleState, IRootState> = {
  namespaced: true,
  state,
  getters
}
