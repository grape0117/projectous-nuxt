import { Module } from 'vuex'
import { IRootState } from '@/store/types'
import { ICompanyUser, IModuleState } from './types'

const state = {
  company_users: [],
  lookup: {}
}
export const company_users: Module<IModuleState, IRootState> = {
  namespaced: true,
  state
}
