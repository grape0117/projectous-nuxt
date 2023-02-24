import Vue from 'vue'
import { MutationTree } from 'vuex'
import { IModuleState } from './types'
import { IRootState } from '@/store/types'

export const mutations: MutationTree<IModuleState> = {
  updateUser(state: IModuleState, user: any) {
    //@ts-ignore
    let prevCompanyUsers = [...state.company_users]
    let updatedUserIndex = prevCompanyUsers.findIndex(({ id }) => id == user.id)
    if (updatedUserIndex >= 0) {
      prevCompanyUsers[updatedUserIndex] = user
      state.company_users = prevCompanyUsers
    } else {
      let newCompanyUsers = [...prevCompanyUsers, user]
      state.company_users = newCompanyUsers
    }
  }
}
