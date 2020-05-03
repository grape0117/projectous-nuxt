import { GetterTree } from 'vuex'
import { IRootState } from '@/store/types'
import { IModuleState } from './types'

export const getters: GetterTree<IModuleState, IRootState> = {
  getById: (state: IModuleState) => (id: any) => {
    // @ts-ignore
    return state.company_users[state.lookup[id]]
  },
  getByCompanyClientsById: (state: IModuleState) => (company_user_id: any) => {},
  getActive: (state: IModuleState) => {
    return state.company_users
      .filter(company_user => {
        return company_user.status == 'active'
      })
      .sort(({ name: nameA }: { name: string }, { name: nameB }: { name: string }) => {
        if (nameA.toLowerCase() > nameB.toLowerCase()) return 1
        if (nameA.toLowerCase() < nameB.toLowerCase()) return -1
        return 0
      })
  }
}
