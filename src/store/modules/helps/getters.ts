import { GetterTree } from 'vuex'
import { IRootState } from '@/store/types'
import { IModuleState } from './types'

export const getters: GetterTree<IModuleState, IRootState> = {
  getById: (state: IModuleState) => (id: any) => {
    return state.helps.filter(help => help.id === id)
  },
  getByTaskId: (state: IModuleState) => (task_id: any) => {
    return state.helps.filter(help => help.task_id === task_id)
  },
  getByTaskIdAndUserId: (state: IModuleState) => (task_id: any, company_user_id: any) => {
    return state.helps.filter(help => help.task_id === task_id && help.company_user_id === company_user_id)
  },
  getByThreadId: (state: IModuleState) => (thread_id: any) => {
    return state.helps.filter(help => help.thread_id == thread_id)
  },
  getByThreadIdAndUserId: (state: IModuleState) => (thread_id: any, company_user_id: any) => {
    return state.helps.filter(help => help.thread_id == thread_id && help.responsibility_company_user_id === company_user_id)
  }
}
