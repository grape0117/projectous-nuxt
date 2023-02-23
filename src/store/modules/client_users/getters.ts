import { GetterTree } from 'vuex'
import { IRootState } from '@/store/types'
import { IModuleState } from './types'

export const getters: GetterTree<IModuleState, IRootState> = {
  getById: (state: IModuleState) => (id: any) => {
    return state.client_users[state.lookup[id]]
  },
  // @ts-ignore
  getByClientIdAndCompanyUserId: (state: IModuleState) => ({ client_id, company_user_id }) => {
    if (!state.client_users.length) {
      return false
    }
    // @ts-ignore
    const found_client_user = state.client_users.find((client_user: any) => {
      return client_user.client_id === client_id && client_user.company_user_id === company_user_id
    })
    return typeof found_client_user !== 'undefined' ? found_client_user : false
  }
}
