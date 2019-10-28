import { GetterTree } from 'vuex'
import { IRootState } from '@/store/types'
import { IModuleState } from './types'

const company_user_id: any = 1

export const getters: GetterTree<IModuleState, IRootState> = {
  getById: (state, getters) => (id: any) => {
    return state.task_users[state.lookup[id]]
  }
}
