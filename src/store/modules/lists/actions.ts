// @ts-ignore
import { ActionTree } from 'vuex'
import { IListsState, ITask } from './types'
import { IRootState } from '@/store/types'
import { FETCH_TASKS } from './mutations-types'

export const actions: ActionTree<IListsState, IRootState> = {
  async fetchTasks({ commit }: { commit: any }): Promise<ITask[]> {
    const response = await fetch('https://release.projectous.com/test-tasks')
    const { tasks } = await response.json()
    commit(FETCH_TASKS, tasks)
    return tasks
  }
}
