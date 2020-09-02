import { ActionTree } from 'vuex'
import { IModuleState, ITaskMessages } from './types'
import { IRootState } from '@/store/types'
import uuid from 'uuid'
import moment from 'moment'

function createDefaultTaskMessage(task_id: number): ITaskMessages {
  return {
    id: uuid.v4(),
    task_id,
    company_user_id: null,
    message: null,
    created_at: moment().format('YYYY-MM-DD HH:mm:ss')
  }
}

export const actions: ActionTree<IModuleState, IRootState> = {
  async createTaskMessage({ commit }, { task_id, company_user_id, message }: ITaskMessages) {
    const taskMessage = {
      ...createDefaultTaskMessage(task_id),
      company_user_id: company_user_id,
      message: message
    }

    // @ts-ignore
    this._vm
      .$http()
      .post('/task_messages', { task_message: taskMessage })
      .then(res => {
        console.log(res)
        commit('ADD_ONE', { module: 'task_messages', entity: res.task_messages }, { root: true })
      }) //.task_messages

    // commit(REMOVE_TEMP_TASKS_MESSAGE)
    //return task_message
  },
  async updateTaskMessage({ commit }: any, taskMessage: ITaskMessages) {
    commit('UPDATE', { module: 'task_messages', entity: taskMessage }, { root: true })
    // @ts-ignore
    const task_message = await this._vm.$http().put('/task_messages/', taskMessage.id, { task_message: taskMessage })
  }
}
