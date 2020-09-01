import { ActionTree } from 'vuex'
import { IModuleState, ITaskMessages } from './types'
import { IRootState } from '@/store/types'
import { REMOVE_TEMP_TASKS_USER } from '@/store/modules/task_users/mutations-types'
import { generateUniqId } from '@/utils/util-functions'
import uuid from 'uuid'
import moment from 'moment'

function createDefaultTaskMessage(task_id: number): ITaskMessages {
  return {
    id: uuid.v4(),
    task_id,
    company_user_id: null,
    message: null,
    timestamp: moment().format('YYYY-MM-DD HH:mm:ss')
  }
}

export const actions: ActionTree<IModuleState, IRootState> = {
  async createUserTask({ commit }, { taskMessage, task }: any) {
    //commit taskMessage
    commit('ADD_ONE', { module: 'task_messages', entity: taskMessage }, { root: true })
    //commit task
    commit('ADD_ONE', { module: 'tasks', entity: task }, { root: true })

    // @ts-ignore
    const task_message = await this._vm.$http().post('/task-messages', {
      task_message: taskMessage,
      task
    })
  },
  async createTaskMessage({ commit }, { task_id, company_user_id, message }: ITaskMessages) {
    const taskMessage = {
      ...createDefaultTaskMessage(task_id),
      company_user_id: company_user_id,
      message: message
    }

    // @ts-ignore
    let task_message = await this._vm.$http().post('/task-messages', { task_message: taskMessage }).task_message
    commit(REMOVE_TEMP_TASKS_USER)
    commit('ADD_ONE', { module: 'task_messages', entity: task_message }, { root: true })
    return task_message
  },
  async updateTaskMessage({ commit }: any, taskMessage: ITaskMessages) {
    commit('UPDATE', { module: 'task_messages', entity: taskMessage }, { root: true })
    // @ts-ignore
    const task_message = await this._vm.$http().put('/task-messages/', taskMessage.id, { task_message: taskMessage })
  }
}
