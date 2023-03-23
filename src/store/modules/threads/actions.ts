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
    let task_thread = this._vm
      .$http()
      .post('/thread', { task_thread: thread })
      // @ts-ignore
      .then(res => {
        commit('ADD_ONE', { module: 'threads', entity: { ...res.task_thread, owner: user } }, { root: true })
      }).task_thread
    return task_thread
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
  }
}
