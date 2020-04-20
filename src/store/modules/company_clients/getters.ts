import { GetterTree } from 'vuex'
import { IRootState } from '@/store/types'
import { IModuleState } from './types'

export const getters: GetterTree<IModuleState, IRootState> = {
  getById: (state: IModuleState) => (id: any) => {
    return state.company_clients[state.lookup[id]]
  },
  getByClientCompanyId: (state: IModuleState) => (client_company_id: any) => {
    return state.company_clients[state.lookup_by_client_company_id[client_company_id]]
  },
  getActiveCompanyClients: (state: IModuleState) => {
    return state.company_clients
      .filter(company_client => {
        return company_client.status == 'active'
      })
      .sort((a, b) => {
        if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
        if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
        return 0
      })
  }
}
