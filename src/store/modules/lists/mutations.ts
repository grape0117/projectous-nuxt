import { MutationTree } from 'vuex'
import { IListsState, IList } from './types'
import { CREATE_LISTS, ADD_NEW_LIST } from './mutations-types'

export const mutations: MutationTree<IListsState> = {
  [CREATE_LISTS](state: IListsState, { listName, lists }) {
    // @ts-ignore
    state[listName] = lists
  },
  [ADD_NEW_LIST](state: IListsState, newNameList: string) {
    state.user_tasks_list = [
      ...state.user_tasks_list,
      { title: newNameList, id: '1234', group: 'Custom' }
    ] // Todo: generate id
  }
}
