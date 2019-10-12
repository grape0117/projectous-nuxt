// @ts-ignore
import { MutationTree } from 'vuex'
import { IListsState, ITask, IList } from './types'
import { FETCH_TASKS, SET_TASKS_TO_LIST, SET_LISTS, ADD_NEW_LIST } from './mutations-types'

export const mutations: MutationTree<IListsState> = {
  [FETCH_TASKS](state: IListsState, tasks: ITask[]) {
    state.lists = state.lists.map(list => list.name === 'tasks' ? { ...list, tasks } : list)
  },
  [SET_TASKS_TO_LIST](state: IListsState, payload: any) {
    state.lists = state.lists.map(list => list.name === payload.listName ? { ...list, tasks: payload.tasks } : list)
  },
  [SET_LISTS](state: IListsState, lists: any) {
    state.lists = lists
  },
  [ADD_NEW_LIST](state: IListsState, newNameList: string) {
    state.lists = [...state.lists, { name: newNameList, tasks: [] }]
  }
}
