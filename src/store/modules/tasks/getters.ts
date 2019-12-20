import { GetterTree } from 'vuex'
import { IRootState } from '@/store/types'
import { IModuleState } from './types'

export const getters: GetterTree<IModuleState, IRootState> = {
  getById: (state: IModuleState) => (id: any) => {
    return state.tasks[state.lookup[id]]
  },

  // TODO: delete if task will be added through server
  getNextId: (state: IModuleState) => () => {
    return state.lookup.length
  },

  getByProjectId: (state: IModuleState) => (projectId: any) => {
    if (projectId) {
      return state.tasks.filter(task => task.project_id === projectId)
    }
    return []
  }
}
