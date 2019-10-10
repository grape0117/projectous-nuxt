// @ts-ignore
import { MutationTree } from 'vuex'
import { ITasksState, ITask } from './types'
import { FETCH_TASKS, SET_TASKS, SET_ADDITIONAL_TASKS } from './mutations-types'

export const mutations: MutationTree<ITasksState> = {
  [FETCH_TASKS](state: ITasksState, tasks: ITask[]) {
    state.tasks = tasks
  },
  [SET_TASKS](state: ITasksState, tasks: ITask[]) {
    state.tasks = tasks
  },
  [SET_ADDITIONAL_TASKS](state: ITasksState, tasks: ITask[]) {
    state.additionalTasks = tasks
  }
}
