import { ActionTree } from 'vuex'
import { IModuleState } from './types'
import { ITask } from '../tasks/types'
import { IRootState } from '@/store/types'
import { CREATE_TASK_USER, UPDATE_TASK_USER, DELETE_TASK_USER } from './mutations-types'

const company_user_id: number = 1

const UUID = () => {
  const date = new Date();
  return date.getUTCFullYear()+'-'+date.getUTCMonth()+1+'-'+date.getDate()+' '+date.getUTCHours()+':'+date.getUTCMinutes()+':'+date.getUTCSeconds()+':'+date.getMilliseconds()+' '+Math.random();
}

export const actions: ActionTree<IModuleState, IRootState> = {
  async createUserTask({dispatch, commit}:any, { list, sort_order }) {
      const task:ITask = {
          id: UUID(),
          title: 'title';
      }
      const new_task = dispatch('task/CREATE', {uuid: task_uuid, title: 'title'})
      const new_task_user = dispatch('task_user/CREATE', {task: new_task, list, sort_order})
      //@ts-ignore
      const {task_user, task}: any = await this._vm.$http().post('users/' + company_user_id + '/tasks', {
          list: list,
          sort_order: sort_order
      })

      commit('tasks/UPDATE', task)
      commit('task_users/UPDATE', task_user)


  },
}
