// @ts-ignore
import { ActionTree } from 'vuex'
import { IModuleState, ITask } from './types'
import { IRootState } from '@/store/types'
// @ts-ignore
import { uuid } from 'vue-uuid'

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
    project_next_work_day: null,
    sort_order: 0,
    status: 'open',
    title: '',
    users: [],
    uuid: null,
    workflowy_id: null
  }
}

export const actions: ActionTree<IModuleState, IRootState> = {
  async createTask({ commit, getters }: any, { title, project_id, project_sort_order }: any) {
    const task = {
      ...createDefaultTask(),
      title,
      project_id,
      project_sort_order
    }
    //TODO: should we do this? task.id = uuid.v4();
    // @ts-ignore
    const { task: newTask } = await this._vm.$http().post('/tasks', { task })
    commit('create', newTask)
    return newTask
  },
  async updateTask({ commit }: any, task: any) {
    // @ts-ignore
    await this._vm.$http().put('/tasks/', task.id, { task })
    // TODO @stephane send task to server
    commit('upsert', task)
  },
  /**
   * @param commit - vuex mutation
   * @param { number[] } ids - list of tasks ids, where index is equal sort_order
   * @description: update tasks sort order
   */
  updateSortOrder({ commit }, ids) {
    // Todo: @stephane - create endpoint to update project_sort_order for tasks
    commit('updateTasksSortOrder', ids)
    // @ts-ignore
    this._vm.$http.post('/tasks/sort_order', { ids: ids })
  }
}
