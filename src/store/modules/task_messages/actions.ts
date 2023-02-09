import { ActionTree } from 'vuex'
import { IModuleState, ITaskMessage } from './types'
import { IRootState } from '@/store/types'
import uuid from 'uuid'
import moment from 'moment'

function createDefaultTaskMessage(task_id: string): ITaskMessage {
  return {
    id: uuid.v4(),
    task_id,
    company_user_id: null,
    message: null,
    created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
    file_path: null,
    is_file: false,
    thumbnail: null
  }
}

export const actions: ActionTree<IModuleState, IRootState> = {
  async createTaskMessage({ commit }, { task_id, company_user_id, message, is_file, file_path, thumbnail }: ITaskMessage) {
    const taskMessage = {
      ...createDefaultTaskMessage(task_id),
      company_user_id: company_user_id,
      message: message,
      is_file: is_file,
      file_path: file_path,
      thumbnail: thumbnail
    }

    // @ts-ignore
    let task_message = this._vm
      .$http()
      .post('/task_messages', { task_message: taskMessage })
      // @ts-ignore
      .then(res => {
        // console.log(res.task_messages)
        commit('ADD_ONE', { module: 'task_messages', entity: res.task_messages }, { root: true })
        // return res.task_messages
      }).task_messages
    console.log(task_message)
    return task_message
    // commit(REMOVE_TEMP_TASKS_MESSAGE)
    //return task_message
  },
  async updateTaskMessage({ commit }: any, taskMessage: ITaskMessage) {
    commit('UPDATE', { module: 'task_messages', entity: taskMessage }, { root: true })
    // @ts-ignore
    const task_message = await this._vm.$http().put('/task_messages/', taskMessage.id, { task_message: taskMessage })
  }
}
