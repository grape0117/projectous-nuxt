import { ActionTree } from 'vuex'
import { IModuleState } from './types'
import { IRootState } from '@/store/types'
import uuid from 'uuid'

export const actions: ActionTree<IModuleState, IRootState> = {
  createInvoiceableItem(context, invoiceable_item) {
    // dispatch('ADD_ONE', { module: 'project_users', entity: project_user })
    console.log('test save from vuex')

    context.commit('UPSERT', { module: 'invoiceable_item', entity: invoiceable_item }, { root: true })
  }
  // createClient(context) {
  //   context.commit('settings/setCurrentEditClient', { id: uuid.v4() }, { root: true })
  //   context.dispatch('settings/openModal', 'client')
  // }
  // editClient(context, client_id) {
  //   const client = context.getters['getById'](client_id)
  //   console.log('client', client)
  //   context.rootState.settings.current_edit_client = client
  //   context.dispatch('settings/openModal', 'client', { root: true })
  // },
  // saveClient(context, client) {
  //   context.commit('UPSERT', { module: 'clients', entity: client })
  // }
}
