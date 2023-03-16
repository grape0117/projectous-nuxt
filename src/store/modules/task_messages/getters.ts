import { GetterTree } from 'vuex'
import { IRootState } from '@/store/types'
import { IModuleState } from './types'

export const getters: GetterTree<IModuleState, IRootState> = {
  getById: (state: IModuleState) => (id: any) => {
    return state.task_messages[state.lookup[id]]
  },
  getByCompanyUserId: (state: IModuleState) => (id: any) => {
    return state.task_messages.filter(({ company_user_id }) => company_user_id === id)
  },
  getByTaskId: (state: IModuleState) => (task_id: any) => {
    return state.task_messages.filter(task_message => task_message.task_id === task_id && !task_message.thread_id)
  },
  getByThreadId: (state: IModuleState) => (thread_id: any) => {
    return state.task_messages.filter(task_message => task_message.thread_id === thread_id)
  },
  getNextId: (state: IModuleState) => () => {
    return state.lookup.length
  }
}
