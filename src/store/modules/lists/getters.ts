import { GetterTree } from 'vuex'
import { IRootState } from '@/store/types'
import { IListsState } from './types'

export const getters: GetterTree<IListsState, IRootState> = {
  getUserLists: (state: IListsState) => (company_user_id: any) => {
    const generalLists = state.generalLists
    const undraggableListsNames = ['Past Tasks', 'Current Tasks']
    const userLists = state.lists
      .filter(list => (list.company_user_id as number) === company_user_id)
      .map(list => {
        list.group = list.title
        return list
      })
    return [...generalLists, ...userLists].map(list => {
      if (undraggableListsNames.includes(list.group)) {
        list.group = 'undraggable'
      }
      return list
    })
  }
}
