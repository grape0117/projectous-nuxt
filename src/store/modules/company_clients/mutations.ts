import Vue from 'vue'
import { MutationTree } from 'vuex'
import { IModuleState } from './types'
import { IRootState } from '@/store/types'

export const mutations: MutationTree<IModuleState> = {
  //NOTE: do not call this directly. Call ADD_MANY from root store
  ADD_MANY(state: IModuleState, company_clients: any) {
    //@ts-ignore
    company_clients.forEach(function(company_client, key) {
      //@ts-ignore
      Vue.set(state.lookup_by_client_company_id, company_client.company_id, key) //TODO: risk of having more than one client with the same company id?
    })
  }
}
