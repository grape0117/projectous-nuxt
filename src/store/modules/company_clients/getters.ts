import { GetterTree } from 'vuex'
import { IRootState } from '@/store/types'
import { IModuleState } from './types'

export const getters: GetterTree<IModuleState, IRootState> = {
  getById: (state: IModuleState) => (id: any) => {
    return state.company_clients[state.lookup[id]]
  },
  getByClientCompanyId: (state: IModuleState) => (client_company_id: any) => {
    console.log(client_company_id)
    console.log(
      'lookup_by_client_company_id',
      state.lookup_by_client_company_id
    )
    let company =
      state.company_clients[
        state.lookup_by_client_company_id[client_company_id]
      ]
    console.log(company.name)
    return company
  },
  getActiveCompanyClients: (state: IModuleState) => {
    return state.company_clients.filter(company_client => {
      return company_client.status == 'active'
    })
  }
}
