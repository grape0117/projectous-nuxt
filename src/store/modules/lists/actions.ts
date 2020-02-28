import { ActionTree } from 'vuex'
import { IListsState } from '../lists/types'
import { IRootState } from '@/store/types'
import { ADD_NEW_LIST } from '@/store/modules/lists/mutations-types'

export const actions: ActionTree<IListsState, IRootState> = {
  async createList({ commit }, newList) {
    await commit(
      'updateCreateIndexDBEntity',
      { module: 'user_task_lists', value: newList },
      { root: true }
    )
    // Todo: @stephane - add new endpoint to create list
    commit(ADD_NEW_LIST, newList)
  }
}
