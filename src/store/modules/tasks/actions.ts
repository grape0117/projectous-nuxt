// @ts-ignore
import { ActionTree } from 'vuex'
import { IModuleState } from './types'
import { ITask } from '../tasks/types'
import { IRootState } from '@/store/types'
import { FETCH_TASKS } from '../lists/mutations-types'

export const actions: ActionTree<IModuleState, IRootState> = {
  async fetchTasks({ commit }: { commit: any }): Promise<ITask[]> {
    const response = await fetch('https://release.projectous.com/test-tasks')
    const { tasks } = await response.json()
    commit(FETCH_TASKS, tasks)
    return tasks
  }
}
