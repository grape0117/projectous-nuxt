import { ActionTree } from 'vuex'
import { IListsState } from '../lists/types'
import { IRootState } from '@/store/types'
import { ADD_NEW_LIST } from '@/store/modules/lists/mutations-types'

export const actions: ActionTree<IListsState, IRootState> = {
  async createList({ commit }, newList) {
    // Todo: @stephane - add new endpoint to create list
    commit(
      'ADD_ONE',
      { module: 'user_task_lists', entity: newList },
      { root: true }
    )
  }
}
