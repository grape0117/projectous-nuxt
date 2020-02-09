import { MutationTree } from 'vuex'
import { IModuleState, IProject } from '@/store/modules/projects/types'
import {
  ADD_PROJECTS,
  UPSERT_PROJECT,
  DELETE_PROJECT,
  UPDATE_PROJECT,
  UPDATE_PROJECT_ATTRIBUTE,
  ADD_PROJECT,
  SET_SELECTED_PROJECT,
  PIN_PROJECT
} from '@/store/modules/projects/mutations-types'

export const mutations: MutationTree<IModuleState> = {
  [ADD_PROJECTS](state: IModuleState, projects: any[]) {
    this.commit(
      'ADD_MANY',
      { module: 'projects', entities: projects },
      //@ts-ignore
      { root: true }
    )
  },
  [ADD_PROJECT](state: IModuleState, project: any) {
    //@ts-ignore
    this.commit(
      'ADD_ONE',
      { module: 'projects', entity: project },
      //@ts-ignore
      { root: true }
    )
  },
  [UPSERT_PROJECT](state: IModuleState, project: any) {
    //@ts-ignore
    this.commit(
      'UPSERT',
      { module: 'projects', entity: project },
      //@ts-ignore
      { root: true }
    )
  },
  [UPDATE_PROJECT](state: IModuleState, project: any) {
    //@ts-ignore
    this.commit(
      'UPDATE',
      { module: 'projects', entity: project },
      //@ts-ignore
      { root: true }
    )
  },
  [UPDATE_PROJECT_ATTRIBUTE](
    state: IModuleState,
    { project_id, attribute, value }
  ) {
    //@ts-ignore
    this.commit(
      'UPDATE_ATTRIBUTE',
      { module: 'projects', id: project_id, attribute, value },
      //@ts-ignore
      { root: true }
    )
  },
  [DELETE_PROJECT](state: IModuleState, project) {
    //@ts-ignore
    this.commit(
      'DELETE',
      { module: 'projects', entity: project },
      //@ts-ignore
      { root: true }
    )
  },
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
