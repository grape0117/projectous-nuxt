import { ActionTree } from 'vuex'
import { IModuleState, ITaskUser } from './types'
import { IRootState } from '@/store/types'
import {
  UPDATE_TASK_USER,
  CREATE_TASK_USER,
  DELETE_TASK_USER,
  REMOVE_TEMP_TASKS_USER
} from '@/store/modules/task_users/mutations-types'
import { generateUniqId } from '@/utils/util-functions'

function creteDefaultTaskUser(uuid: string | null): ITaskUser {
  return {
    company_user_id: null,
    next_work_day: null,
    role: '',
    sort_order: 0,
    task_id: 0,
    task_uuid: null,
    user_rate: '0.00',
    user_task_list_id: null,
    uuid,
    work_day_position: null
  }
}

export const actions: ActionTree<IModuleState, IRootState> = {
  async createTaskUser(
    { commit },
    {
      task_id,
      uuid,
      next_work_day,
      company_user_id,
      user_task_list_id,
      sort_order,
      temp
    }: ITaskUser
  ) {
    const taskUser = {
      ...creteDefaultTaskUser(uuid),
      task_id,
      next_work_day,
      company_user_id,
      user_task_list_id,
      sort_order
    }
    let task_user
    if (temp) {
      task_user = {
        ...taskUser,
        id: generateUniqId(20),
        temp: true
      }
    } else {
      // @ts-ignore
      task_user = (await this._vm
        .$http()
        .post('/task-users', { task_user: taskUser })).task_user
      commit(REMOVE_TEMP_TASKS_USER)
    }
    commit(CREATE_TASK_USER, task_user)
    return task_user
  },
  async updateTaskUser({ commit }: any, taskUser: ITaskUser) {
    commit(UPDATE_TASK_USER, taskUser)
    // @ts-ignore
    const task_user = await this._vm
      .$http()
      .put('/task-users/', taskUser.id, { task_user: taskUser })
  },
  async deleteTaskUser({ commit }, taskUser: ITaskUser) {
    commit(DELETE_TASK_USER, taskUser)
    return
  },
  updateSortOrders({ commit }, ids) {
    // Todo: @stephane - create endpoint to update sort_order for tasks
    commit('updateTaskUsersSortOrders', ids)
    // @ts-ignore
    this._vm //@Mikhail this isn't working with put. It's not getting called at all unless I use post and not because of the id parameter (which I still don't like)
      .$http()
      .post('/task-users/sort_order', { ids: ids })
  }
}
