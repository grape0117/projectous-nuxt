import { MutationTree } from 'vuex'
import { ITasksState, ITask } from './types'
import { FETCH_TASKS } from './mutations-types'

export const mutations: MutationTree<ITasksState> = {
  [FETCH_TASKS](state, tasks: ITask[]) {
    state.tasks = tasks
  }
}
