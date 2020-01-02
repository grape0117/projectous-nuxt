import { ActionTree } from 'vuex'
import { IModuleState, ITaskUser } from './types'
import { IRootState } from '@/store/types'
import {
  UPDATE_TASK_USER,
  CREATE_TASK_USER
} from '@/store/modules/task_users/mutations-types'

export function generateUUID(): string {
  const date = new Date()
  return (
    date.getUTCFullYear() +
    '-' +
    date.getUTCMonth() +
    1 +
    '-' +
    date.getDate() +
    ' ' +
    date.getUTCHours() +
    ':' +
    date.getUTCMinutes() +
    ':' +
    date.getUTCSeconds() +
    ':' +
    date.getMilliseconds()
  )
}

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
  // async createUserTask({ dispatch, commit }: any, { list, sort_order }) {
  //   //@Mikhail: how do I both use TS with optional properties but also use TS to help avoid errors? Just use ignore with a note?
  //   const newTask: any = {
  //     id: UUID(),
  //     title: 'title'
  //   }
  //   const new_task = dispatch('task/CREATE', newTask)
  //   const new_task_user = dispatch('task_user/CREATE', {
  //     task: new_task,
  //     list,
  //     sort_order
  //   })
  //   //@ts-ignore
  //   const { task_user, task }: any = await this._vm
  //     .$http()
  //     .post('users/' + company_user_id + '/tasks', {
  //       list: list,
  //       sort_order: sort_order
  //     })
  //
  //   commit('tasks/UPDATE', task)
  //   commit('task_users/UPDATE', task_user)
  // },
  async createTaskUser(
    { commit },
    {
      task_id,
      uuid,
      next_work_day,
      company_user_id,
      user_task_list_id,
      sort_order
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
    // @ts-ignore
    const { task_user } = await this._vm
      .$http()
      .post('/task-users', { task_user: taskUser })
    commit(CREATE_TASK_USER, task_user)
    return task_user
  },
  async updateTaskUser({ commit }: any, taskUser: ITaskUser) {
    // @ts-ignore
    const { task_user } = await this._vm
      .$http()
      .put('/task-users/', taskUser.id, { task_user: taskUser })
    commit(UPDATE_TASK_USER, task_user)
  },
  updateSortOrder({ commit }, ids) {
    // Todo: @stephane - create endpoint to update sort_order for tasks
    commit('updateTaskUsersSortOrder', ids)
    // @ts-ignore
    this._vm //@Mikhail this isn't working with put. It's not getting called at all unless I use post and not because of the id parameter (which I still don't like)
      .$http()
      .post('/task-users/sort_order', { ids: ids })
  }
}
