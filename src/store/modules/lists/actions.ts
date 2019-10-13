// @ts-ignore
import { ActionTree } from 'vuex'
import { IListsState, ITask } from './types'
import { IRootState } from '@/store/types'
import { FETCH_TASKS, SET_ALL_TASKS } from './mutations-types'

export const actions: ActionTree<IListsState, IRootState> = {
  async fetchTasks({ commit }: { commit: any }): Promise<ITask[]> {
    const response = await fetch('https://release.projectous.com/test-tasks')
    const { user_tasks, tasks } = await response.json()
    commit(FETCH_TASKS, user_tasks)
    commit(SET_ALL_TASKS, tasks)
    return user_tasks
  }
}
