import { GetterTree } from 'vuex'
import { IRootState } from '@/store/types'
import { IModuleState } from './types'

export const getters: GetterTree<IModuleState, IRootState> = {
  getById: (state: IModuleState) => (id: any) => {
    return state.company_users[state.lookup[id]]
  },
  getActive: (state: IModuleState) => {
    return state.company_users.filter(company_user => {
      return company_user.status == 'active'
    })
  }
}
