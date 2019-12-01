import { MutationTree } from 'vuex'
import { IListsState } from './types'
import { CREATE_LISTS, ADD_NEW_LIST } from './mutations-types'
import { createListsByDays } from '@/utils/util-functions'

export const mutations: MutationTree<IListsState> = {
  [CREATE_LISTS](state: IListsState, listName: string) {
    // @ts-ignore
    state[listName] = createListsByDays()
  },
  [ADD_NEW_LIST](state: IListsState, newNameList: string) {
    state.user_tasks_list = [
      ...state.user_tasks_list,
      { title: newNameList, id: '1234', group: 'Custom' }
    ] // Todo: generate id
  }
}
