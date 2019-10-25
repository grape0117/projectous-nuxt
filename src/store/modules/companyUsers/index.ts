import { Module } from 'vuex'
import { IRootState } from '@/store/types'
import { ICompanyUser, IModuleState } from './types'

const state = {
  companyUsers: [],
  lookup: {}
}
export const companyUsers: Module<IModuleState, IRootState> = {
  namespaced: true,
  state
}
