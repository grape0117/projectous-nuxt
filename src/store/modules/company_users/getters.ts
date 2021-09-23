import Vue from 'vue'
import { GetterTree } from 'vuex'
import { IRootState } from '@/store/types'
import { ICompanyUser, IModuleState } from './types'

export const getters: GetterTree<IModuleState, IRootState> = {
  getById: (state: IModuleState) => (id: any) => {
    // @ts-ignore
    return state.company_users[state.lookup[id]]
  },
  getByCompanyClientsById: (state: IModuleState) => (company_user_id: any) => {},
  getActive: (state: IModuleState) => {
    return (
      state.company_users
        .filter(company_user => {
          return company_user.status == 'active'
        })
        // @ts-ignore
        .sort(Vue.nameSort)
    )
  },
  getInactive: (state: IModuleState) => {
    return (
      state.company_users
        .filter(company_user => {
          return company_user.status != 'active'
        })
        // @ts-ignore
        .sort(Vue.nameSort)
    )
  },
  getNotMe: (state, _getters, rootState) => {
    return state.company_users.filter((user: ICompanyUser) => {
      return user.id != rootState.settings.current_company_user_id
    })
  },
  getMe: (state, _getters, rootState, rootGetters) => {
    return state.company_users.find((user: ICompanyUser) => {
      return user.id == rootState.settings.current_company_user_id
    })
  }
}
