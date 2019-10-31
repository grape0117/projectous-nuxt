import { Module } from 'vuex'
import { IRootState } from '@/store/types'
import { IModuleState } from './types'

const state = {
  companies: [],
  lookup: {}
}
export const companies: Module<IModuleState, IRootState> = {
  namespaced: true,
  state
}
