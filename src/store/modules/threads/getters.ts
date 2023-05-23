import { GetterTree } from 'vuex'
import { IRootState } from '@/store/types'
import { IModuleState } from './types'

export const getters: GetterTree<IModuleState, IRootState> = {
  getById: (state: IModuleState) => (id: any) => {
    return state.threads.filter(thread => thread.id === id)
  },
  getByTaskId: (state: IModuleState) => (task_id: any) => {
    return state.threads.filter(thread => thread.task_id === task_id)
  },
  getOpenedThreads: (state: IModuleState) => (task_id: any) => {
    return state.threads.filter(thread => thread.status === 'open' && thread.task_id == task_id)
  },
  getClosedThreads: (state: IModuleState) => (task_id: any) => {
    return state.threads.filter(thread => thread.status === 'closed' && thread.task_id == task_id)
  }
}
