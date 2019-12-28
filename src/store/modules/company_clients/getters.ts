import { GetterTree } from 'vuex'
import { IRootState } from '@/store/types'
import { IModuleState } from './types'

export const getters: GetterTree<IModuleState, IRootState> = {
  getById: (state: IModuleState) => (id: any) => {
    return state.company_clients[state.lookup[id]]
  },
  getByClientCompanyId: (state: IModuleState) => (client_company_id: any) => {
    return
  }
}
