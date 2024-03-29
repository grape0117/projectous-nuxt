import { GetterTree } from 'vuex'
import { IRootState } from '@/store/types'
import { IModuleState } from './types'

export const getters: GetterTree<IModuleState, IRootState> = {
  getById: (state: IModuleState) => (id: any) => {
    return state.project_users[state.lookup[id]]
  },
  // @ts-ignore
  getByProjectIdAndUserId: (state: IModuleState) => (project_id: string, company_user_id: string) => {
    if (!state.project_users.length) {
      return []
    }
    // @ts-ignore
    const found_project_user = state.project_users.find(project_user => project_user.project_id === project_id && project_user.company_user_id === company_user_id)

    return found_project_user
  },
  getByProjectIdAndCompanyUserId: (state: IModuleState) => ({ project_id, company_user_id }: any) => {
    if (!state.project_users.length) {
      return false
    }
    // @ts-ignore
    const found_project_user = state.project_users.find((project_user: any) => {
      return project_user.project_id === project_id && project_user.company_user_id === company_user_id
    })
    return typeof found_project_user !== 'undefined' ? found_project_user : false
  }
}
