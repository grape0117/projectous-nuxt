// @ts-ignore
import { ActionTree } from 'vuex'
import { IModuleState } from './types'
import { IRootState } from '@/store/types'
// @ts-ignore
import { uuid } from 'vue-uuid'

export const actions: ActionTree<IModuleState, IRootState> = {
  async updateTask({ commit }: any, task: any) {
    // @ts-ignore
    await this._vm.$http().put('/tasks/', task.id, { task })
    // TODO @stephane send task to server
    commit('upsert', task)
  },

  async createTask({ commit, getters }: any, task: any) {
    //TODO: should we do this? task.id = uuid.v4();
    // @ts-ignore
    const newTaskResponse = await this._vm.$http().post('/tasks', { task })
    commit('create', newTaskResponse.task)
    return newTaskResponse.task.id
  }
}
