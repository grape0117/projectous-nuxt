import { ActionTree } from 'vuex'
import { IModuleState, IHelp } from './types'
import { IRootState } from '@/store/types'
import uuid from 'uuid'
import moment from 'moment'

export const actions: ActionTree<IModuleState, IRootState> = {
  async createHelp({ commit }, { task_id, thread_id, responsibility_company_user_id }: IHelp) {
    // @ts-ignore
    const result = await this._vm.$http().post(`/need_help`, {
      task_id: task_id,
      thread_id: thread_id,
      responsibility_company_user_id: responsibility_company_user_id
    })
    return result
  }
}
