import { ActionTree } from 'vuex'
import { IModuleState } from './types'
import { IRootState } from '@/store/types'
import uuid from 'uuid'

export const actions: ActionTree<IModuleState, IRootState> = {
  createClient(context) {
    context.commit('settings/setCurrentEditClient', { id: uuid.v4() }, { root: true })
    context.dispatch('settings/openModal', 'client', { root: true })
  },
  editClient(context, client_id) {
    const client = context.getters['getById'](client_id)
    console.log('client', client)
    context.rootState.settings.current_edit_client = client
    context.dispatch('settings/openModal', 'client', { root: true })
  },
  saveClient(context, client) {
    context.commit('UPSERT', { module: 'clients', entity: client })
  }
}
