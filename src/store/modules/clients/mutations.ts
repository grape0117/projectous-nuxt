import Vue from 'vue'
import { MutationTree } from 'vuex'
import { IModuleState } from './types'
import { IRootState } from '@/store/types'

export const mutations: MutationTree<IModuleState> = {
  /**
   * Creates additional lookup for clients
   * NOTE: do not call this directly. Call LOOKUP from root store
   * @param {IModuleState} state
   * @param clients
   * @constructor
   */
  LOOKUP(state: IModuleState, clients: any) {
    //@ts-ignore
    clients.forEach(function(client, key) {
      //@ts-ignore
      Vue.set(state.lookup_by_client_company_id, client.client_company_id, key) //TODO: risk of having more than one client with the same company id?
    })
    console.log('lookup', state.lookup_by_client_company_id)
  }
}
