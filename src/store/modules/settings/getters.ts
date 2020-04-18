import { GetterTree } from 'vuex'
import { IRootState } from '@/store/types'
import { IModuleState } from './types'

export const getters: GetterTree<IModuleState, IRootState> = {
  get_current_edit_task: function(state) {
    return state.current_edit_task
  },
  get_current_edit_project: function(state) {
    return state.current_edit_project
  },
  isAdmin: (state, _getters, rootState, rootGetters) => {
    let company_user = rootGetters['company_users/getById'](state.current_user_id)
    console.log('company_user', company_user)
    return company_user.user_role === 'admin'
  }
}
