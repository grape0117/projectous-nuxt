import { MutationTree } from 'vuex'
import Vue from 'vue'
import { IModuleState, IProjectUser } from './types'

export const mutations: MutationTree<IModuleState> = {
  LOOKUP(state: IModuleState, project_users: any) {
    //@ts-ignore
    project_users.forEach(function(project_user, key) {
      //@ts-ignore
      if (!state.lookup_by_project_id[project_user.project_id]) {
        // @ts-ignore
        state.lookup_by_project_id[project_user.project_id] = []
      }
      // @ts-ignore
      state.lookup_by_project_id[project_user.project_id].push(key)

      //@ts-ignore
      if (!state.lookup_by_company_user_id[project_user.company_user_id]) {
        // @ts-ignore
        state.lookup_by_company_user_id[project_user.company_user_id] = []
      }
      // @ts-ignore
      state.lookup_by_company_user_id[project_user.company_user_id].push(key)
    })
  }
}
