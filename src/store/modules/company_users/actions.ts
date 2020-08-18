import { ActionTree } from 'vuex'
import { IModuleState } from './types'
import { IRootState } from '@/store/types'
import uuid from 'uuid'

export const actions: ActionTree<IModuleState, IRootState> = {
  inviteUser(context) {
    context.dispatch('settings/openModal', 'invite', { root: true })
  },
  editUser(context, user) {
    context.commit('settings/setCurrentEditCompanyUser', user, { root: true })
    context.dispatch('settings/openModal', 'user', { root: true })
  }
}
