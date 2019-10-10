import { ActionTree } from 'vuex'
import { ITasksState, ITask } from './types'
import { IRootState } from '@/store/types'
import { FETCH_TASKS } from './mutations-types'

export const actions: ActionTree<ITasksState, IRootState> = {
  async fetchTasks({ commit }): Promise<ITask[]> {
    const response = await fetch('https://release.projectous.com/test-tasks')
    const { tasks } = await response.json()
    commit(FETCH_TASKS, tasks)
    return tasks
  }
}
