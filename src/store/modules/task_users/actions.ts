import { ActionTree } from 'vuex'
import { IModuleState, ITaskUser } from './types'
import { IRootState } from '@/store/types'
import { REMOVE_TEMP_TASKS_USER } from '@/store/modules/task_users/mutations-types'
import { generateUniqId } from '@/utils/util-functions'
import uuid from 'uuid'

function creteDefaultTaskUser(task_id: number): ITaskUser {
  return {
    id: uuid.v4(),
    company_user_id: null,
    next_work_day: null,
    role: '',
    sort_order: 0,
    task_id,
    user_rate: '0.00',
    user_task_list_id: null,
    work_day_position: null
  }
}

export const actions: ActionTree<IModuleState, IRootState> = {
  async createUserTask({ commit }, { taskUser, task, ids_of_taskUsers_to_shift_up }: any) {
    console.log('********** ACTION *********')
    console.log(ids_of_taskUsers_to_shift_up)
    //TODO: Vue.nextTick
    //commit taskUser
    commit('ADD_ONE', { module: 'task_users', entity: taskUser }, { root: true })
    //commit task
    commit('ADD_ONE', { module: 'tasks', entity: task }, { root: true })

    //commit ids_of_taskUsers_to_shift_up
    ids_of_taskUsers_to_shift_up.forEach(function(id: any, index: any) {
      commit(
        'UPDATE_ATTRIBUTE',
        {
          module: 'task_users',
          id,
          attribute: 'sort_order',
          value: taskUser.sort_order + index + 1
        },
        { root: true }
      )
    })
    //http all

    // @ts-ignore
    const task_user = await this._vm.$http().post('/user-tasks', {
      task_user: taskUser,
      task,
      ids_of_taskUsers_to_shift_up
    })

    //TODO: I would like a common data handler for http returns
  },
  async createTaskUser({ commit }, { task_id, next_work_day, company_user_id, user_task_list_id, sort_order, temp }: ITaskUser) {
    const taskUser = {
      ...creteDefaultTaskUser(task_id),
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
      task_user = await this._vm.$http().post('/task-users', { task_user: taskUser }).task_user
      commit(REMOVE_TEMP_TASKS_USER)
    }
    commit('ADD_ONE', { module: 'task_users', entity: task_user }, { root: true })
    return task_user
  },
  async updateTaskUser({ commit }: any, taskUser: ITaskUser) {
    commit('UPDATE', { module: 'task_users', entity: taskUser }, { root: true })
    // @ts-ignore
    const task_user = await this._vm.$http().put('/task-users/', taskUser.id, { task_user: taskUser })
  },
  async deleteTaskUser({ commit }, taskUser: ITaskUser) {
    commit('DELETE', { module: 'task_users', entity: taskUser }, { root: true })
  },
  updateSortOrders({ commit }, ids) {
    // Todo: @stephane - create endpoint to update sort_order for tasks
    // ToDo: hook up indexDB
    commit('updateTaskUsersSortOrders', ids)
    // @ts-ignore
    this._vm //@Mikhail this isn't working with put. It's not getting called at all unless I use post and not because of the id parameter (which I still don't like)
      .$http()
      .post('/task-users/sort_order', { ids: ids })
  }
}
