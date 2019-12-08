import { ActionTree } from 'vuex'
import { IModuleState, ITaskUser } from './types'
import { IRootState } from '@/store/types'
import {
  UPDATE_TASK_USER,
  CREATE_TASK_USER
} from '@/store/modules/task_users/mutations-types'

const company_user_id: number = 1

const UUID = () => {
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
    date.getMilliseconds() +
    ' ' +
    Math.random()
  )
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
  async createUserTask({ commit, getters }, taskUser: ITaskUser) {
    // Todo: send to server
    taskUser.id = getters.getNextId()
    commit(CREATE_TASK_USER, taskUser)
  },
  async updateTaskUser({ commit }: any, taskUser: ITaskUser) {
    //Todo: @stephane send request to the server to update task user
    // @stephane - here is an example how to use http module
    // const newTaskUser = await this._vm.$http().put('/tasks-users/', taskUser.id, taskUser)
    commit(UPDATE_TASK_USER, taskUser)
  }
}
