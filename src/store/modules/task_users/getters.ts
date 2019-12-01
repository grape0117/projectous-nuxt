import { GetterTree } from 'vuex'
import { IRootState } from '@/store/types'
import { IModuleState } from './types'

export const getters: GetterTree<IModuleState, IRootState> = {
  getById: (state: IModuleState) => (id: any) => {
    return state.task_users[state.lookup[id]]
  },
  getByCompanyUserId: (state: IModuleState) => (id: any) => {
    return state.task_users.filter(
      ({ company_user_id }) => company_user_id === id
    )
  }
}
