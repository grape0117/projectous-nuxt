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
  },
  updateClient(state: IModuleState, client: any) {
    //@ts-ignore
    let prevClients = [...state.clients]
    let updatedClientIndex = prevClients.findIndex(({ id }) => id == client.id)
    if (updatedClientIndex >= 0) {
      prevClients[updatedClientIndex] = client
      state.clients = prevClients
    } else {
      let newClients = [...prevClients, client]
      state.clients = newClients
    }
  }
}
