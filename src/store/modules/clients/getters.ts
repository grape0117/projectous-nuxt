import { GetterTree } from 'vuex'
import { IRootState } from '@/store/types'
import { IModuleState } from './types'

export const getters: GetterTree<IModuleState, IRootState> = {
  getById: (state: IModuleState) => (id: any) => {
    return state.clients[state.lookup[id]]
  },
  getByClientCompanyId: (state: IModuleState) => (client_company_id: any) => {
    const client = state.clients[state.lookup_by_client_company_id[client_company_id]]
    //console.log('client', client, 'client_company_id', client_company_id, 'key', state.lookup_by_client_company_id[client_company_id])
    return client
  },
  getActiveCompanyClients: (state: IModuleState) => {
    return state.clients
      .filter(client => {
        return client.status === 'lead' || client.status === 'new' || client.status === 'active'
      })
      .sort((a, b) => {
        if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
        if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
        return 0
      })
  }
}
