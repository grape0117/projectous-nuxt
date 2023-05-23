import { ActionTree } from 'vuex'
import { IModuleState, IThread } from './types'
import { IRootState } from '@/store/types'
import uuid from 'uuid'
import moment from 'moment'

export const actions: ActionTree<IModuleState, IRootState> = {
  async createThread({ commit }, { task_id, title, user }: IThread) {
    const thread = {
      id: uuid.v4(),
      task_id,
      title,
      status: 'open'
    }

    // @ts-ignore
    const res = await this._vm.$http().post('/thread', { task_thread: thread })
    return res
  },
  async closeThread({ commit }, { thread_id }: any) {
    // @ts-ignore
    let task_thread = await this._vm.$http().post('/thread/close', { thread_id: thread_id })
    commit('closeByThreadId', thread_id)
    return task_thread
  },
  async reopenThread({ commit }, { thread_id }: any) {
    // @ts-ignore
    let task_thread = await this._vm.$http().post('/thread/reopen', { thread_id: thread_id })
    commit('reopenByThreadId', thread_id)
    return task_thread
  },
  async changeResponsibility({ commit }, { company_user_id, thread_id }: any) {
    // @ts-ignore
    let task_thread = await this._vm.$http().post(`/thread/update_responsibility/${thread_id}`, { responsibility_company_user_id: company_user_id })
    commit('changeResponsibility', { thread_id: thread_id, responsibility_company_user_id: company_user_id })
    return task_thread
  }
}
