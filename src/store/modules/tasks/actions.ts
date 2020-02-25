// @ts-ignore
import { ActionTree } from 'vuex'
import { IModuleState, ITask } from './types'
import { IRootState } from '@/store/types'
// @ts-ignore
import { generateUUID } from '@/utils/util-functions'

function createDefaultTask(): ITask {
  return {
    child_task_id: null,
    company_id: null,
    completed_at: null,
    created_by_company_user_id: null,
    detail: null,
    due_date: null,
    estimate: null,
    files: [],
    for_today: 0,
    messages: [],
    next_task_id: null,
    note: null,
    order: null,
    original_due_date: null,
    parent_task_id: null,
    previous_task_id: null,
    priority: 'active',
    priority_set_at: null,
    project_id: null,
    next_work_day: null,
    sort_order: 0,
    status: 'open',
    title: '',
    users: [],
    uuid: null,
    workflowy_id: null
  }
}

export const actions: ActionTree<IModuleState, IRootState> = {
  async createTask(
    { commit, getters }: any,
    { title, project_id, sort_order, status, temp }: any
  ) {
    const task = {
      ...createDefaultTask(),
      title,
      project_id,
      sort_order,
      status
    }
    let newTask
    if (temp) {
      newTask = {
        ...task,
        id: generateUUID(),
        temp: true
      }
    } else {
      //TODO: should we do this? task.id = uuid.v4();
      await commit(
        'updateIndexDBEntity',
        { module: 'tasks', value: newTask },
        { root: true }
      )
      // @ts-ignore
      newTask = (await this._vm.$http().post('/tasks', { task })).task
      commit('removeTempTasks')
    }
    commit('create', newTask)
    return newTask
  },
  async saveTask({ commit, state, rootState }: any, { task, task_users }: any) {
    console.log('last task edited', task, task_users)
    commit('upsert', task)

    task_users.forEach((task_user: any) => {
      //if(!isNaN(task_user.id - parseFloat(task_user.id))) { //jQuery implementation of is_numeric: https://stackoverflow.com/a/21070520/193930
      if (!task_user.user_checked) {
        console.log('forget / delete from edit', task_user)
        commit(
          'DELETE',
          { module: 'task_users', entity: task_user },
          { root: true }
        )
      } else {
        console.log('upsert from edit', task_user)
        commit(
          'UPSERT',
          { module: 'task_users', entity: task_user },
          { root: true }
        )
      }
      //}
    })

    await commit(
      'updateIndexDBEntity',
      { module: 'tasks', value: task },
      { root: true }
    )
    // @ts-ignore
    const response = await this._vm
      .$http()
      .post('/tasks/' + task.id, { task, task_users })
    console.log(response)
    for (let uuid in response.new_task_user_ids) {
      if (response.new_task_user_ids.hasOwnProperty(uuid)) {
        let id = response.new_task_user_ids[uuid]
        commit('uuid_to_id', { module: 'task_users', id, uuid }, { root: true })
      }
    }
  },
  async updateTask({ commit }: any, task: any) {
    await commit(
      'updateIndexDBEntity',
      { module: 'tasks', value: task },
      { root: true }
    )
    // @ts-ignore
    await this._vm.$http().post('/tasks/' + task.id, { task })
    // TODO @stephane send task to server
    commit('upsert', task)
  },
  async deleteTask({ commit }: any, task: any) {
    await commit(
      'deleteIndexDBEntity',
      { module: 'tasks', value: task.id },
      { root: true }
    )
    commit('delete', task)
  },
  /**
   * @param commit - vuex mutation
   * @param { number[] } ids - list of tasks ids, where index is equal sort_order
   * @description: update tasks sort order
   */
  updateSortOrder({ commit }, ids) {
    // Todo: @stephane - create endpoint to update project_sort_order for tasks
    // ToDo: hook up indexDB
    commit('updateTasksSortOrder', ids)
    // @ts-ignore
    this._vm.$http().post('/tasks/sort_order', { ids: ids })
  }
}
