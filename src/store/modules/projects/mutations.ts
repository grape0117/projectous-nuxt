import { MutationTree } from 'vuex'
import { IModuleState, IProject } from '@/store/modules/projects/types'
import {
  SET_SELECTED_PROJECT,
  PIN_PROJECT
} from '@/store/modules/projects/mutations-types'

export const mutations: MutationTree<IModuleState> = {
  [SET_SELECTED_PROJECT](state: IModuleState, id: string | number | null) {
    state.selectedProjectId = id
  },
  [PIN_PROJECT](state: IModuleState, id: number) {
    if (!state.pinnedProjects.find(project => project === id)) {
      state.pinnedProjects = [...state.pinnedProjects, id]
    } else {
      state.pinnedProjects = state.pinnedProjects.filter(
        project => project !== id
      )
    }
  }
}
