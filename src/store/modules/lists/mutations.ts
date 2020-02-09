import { MutationTree } from 'vuex'
import { IListsState, IList } from './types'
import { CREATE_LISTS, ADD_NEW_LIST } from './mutations-types'

export const mutations: MutationTree<IListsState> = {
  [CREATE_LISTS](state: IListsState, { listName, lists }) {
    // @ts-ignore
    state[listName] = lists
  },
  [ADD_NEW_LIST](state: IListsState, newList: IList) {
    if (!!state.userLists.find(({ title }) => title === newList.title)) {
      state.userLists = state.userLists.filter(
        ({ title }) => title !== newList.title
      )
    } else {
      state.userLists = [...state.userLists, newList]
    }
  }
}
