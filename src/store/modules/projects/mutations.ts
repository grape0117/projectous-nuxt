import Vue from 'vue'
import { MutationTree } from 'vuex'
import { IModuleState, IProject } from '@/store/modules/projects/types'
import { SET_SELECTED_PROJECT, PIN_PROJECT } from '@/store/modules/projects/mutations-types'

export const mutations: MutationTree<IModuleState> = {
  LOOKUP(state: IModuleState, projects: any) {
    //@ts-ignore
    projects.forEach(function(project, key) {
      //@ts-ignore
      if (!state.lookup_by_client_company_id[project.client_company_id]) {
        // @ts-ignore
        state.lookup_by_client_company_id[project.client_company_id] = []
      }
      // @ts-ignore
      state.lookup_by_client_company_id[project.client_company_id].push(key)
    })
  },
  [SET_SELECTED_PROJECT](state: IModuleState, id: string | number | null) {
    state.selectedProjectId = id
    // @ts-ignore
    this.dispatch('projects/loadByProjectId', id)
  },
  [PIN_PROJECT](state: IModuleState, id: number) {
    if (!state.pinnedProjects.find(project => project === id)) {
      state.pinnedProjects = [...state.pinnedProjects, id]
    } else {
      state.pinnedProjects = state.pinnedProjects.filter(project => project !== id)
    }
  },
  CASCADE_DELETE(state: IModuleState, project) {
    // @ts-ignore
    this.commit('project_users/deleteByProjectId', project.id)
    // @ts-ignore
    this.commit('tasks/deleteByProjectId', project.id)
  }
}
