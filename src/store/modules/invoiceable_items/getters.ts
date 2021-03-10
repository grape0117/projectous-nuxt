import { GetterTree } from 'vuex'
import { IRootState } from '@/store/types'
import { IModuleState } from './types'

export const getters: GetterTree<IModuleState, IRootState> = {
  // getById: (state: IModuleState) => (id: any) => {
  //   return state.invoice_items[state.lookup[id]]
  // }
  // getByClientCompanyId: (state: IModuleState) => (client_company_id: any) => {
  //   const client = state.invoice_items[state.lookup_by_client_company_id[client_company_id]]
  //   //console.log('client', client, 'client_company_id', client_company_id, 'key', state.lookup_by_client_company_id[client_company_id])
  //   return client
  // },
  // getActiveCompanyClients: (state: IModuleState) => {
  //   return state.invoice_items
  //     .filter(invoice_items => {
  //       return invoice_items.status === 'lead' || invoice_items.status === 'new' || invoice_items.status === 'active'
  //     })
  //     .sort((a, b) => {
  //       if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
  //       if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
  //       return 0
  //     })
  // }
}
