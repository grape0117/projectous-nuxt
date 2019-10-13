// @ts-ignore
import { MutationTree } from 'vuex'
import { IListsState, ITask } from './types'
import { FETCH_TASKS, SET_TASKS_TO_LIST } from './mutations-types'

export const mutations: MutationTree<IListsState> = {
  [FETCH_TASKS](state: IListsState, tasks: ITask[]) {
    state.lists = state.lists.map(list => {
      if (list.name === 'tasks') {
        return { ...list, tasks }
      } else {
        return list
      }
    })
  },
  [SET_TASKS_TO_LIST](state: IListsState, payload: any) {
    state.lists = state.lists.map(list => {
      if (list.name === payload.listName) {
        return { ...list, tasks: payload.tasks }
      } else {
        return list
      }
    })
  }
}
