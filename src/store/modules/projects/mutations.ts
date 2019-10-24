import { MutationTree } from 'vuex'
import { IModuleState, IProject } from '@/store/modules/projects/types'
import Vue from 'vue'
import {
  ADD_PROJECTS,
  UPSERT_PROJECT,
  DELETE_PROJECT,
  UPDATE_PROJECT,
  UPDATE_PROJECT_ATTRIBUTE,
  ADD_PROJECT
} from '@/store/modules/projects/mutations-types'

export const mutations: MutationTree<IModuleState> = {
  [ADD_PROJECTS](state: IModuleState, projects: any[]) {
    //@ts-ignore
    this.commit(
      'ADD_MANY',
      { module: 'projects', entities: projects },
      { root: true }
    )
  },
  [ADD_PROJECT](state: IModuleState, project: any) {
    //@ts-ignore
    this.commit(
      'ADD_ONE',
      { module: 'projects', entity: project },
      { root: true }
    )
  },
  [UPSERT_PROJECT](state: IModuleState, project: any) {
    //@ts-ignore
    this.commit(
      'UPSERT',
      { module: 'projects', entity: project },
      { root: true }
    )
  },
  [UPDATE_PROJECT](state: IModuleState, project: any) {
    //@ts-ignore
    this.commit(
      'UPDATE',
      { module: 'projects', entity: project },
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
      { root: true }
    )
  },
  [DELETE_PROJECT](state: IModuleState, project) {
    //@ts-ignore
    this.commit(
      'DELETE',
      { module: 'projects', entity: project },
      { root: true }
    )
  }
}
