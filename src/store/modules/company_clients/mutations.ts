import { MutationTree } from 'vuex'
import { IModuleState } from './types'
import { IRootState } from '@/store/types'

export const mutations: MutationTree<IModuleState> = {
  ADD_MANY(state: IModuleState, { company_clients }: any) {
    this.commit('ADD_MANY', {
      module: 'company_clients',
      entities: company_clients
    })
    //@ts-ignore
    state.lookup_by_client_company_id = {}
    //@ts-ignore
    state.company_clients.forEach((company_client, key) => {
      //@ts-ignore
      state.lookup_by_client_company_id[company_client.client_company_id] = key
    })
  }
}
