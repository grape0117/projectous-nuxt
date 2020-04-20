import { GetterTree } from 'vuex'
import { IRootState } from '@/store/types'
import { IModuleState } from './types'

export const getters: GetterTree<IModuleState, IRootState> = {
  getById: (state: IModuleState) => (id: any) => {
    return state.project_users[state.lookup[id]]
  },
  getByProjectIdAndUserId: (state: IModuleState) => (project_id: string, company_user_id: string) => state.project_users.find(project_user => project_user.project_id === project_id && project_user.company_user_id === company_user_id)
}
