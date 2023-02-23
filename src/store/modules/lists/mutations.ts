import { MutationTree } from 'vuex'
import { IListsState, IList } from './types'
import { CREATE_LISTS, ADD_NEW_LIST } from './mutations-types'
import { getUserTaskListFormattedDate, setToMidnight } from '@/utils/dateFunctions'

export const mutations: MutationTree<IListsState> = {
  [CREATE_LISTS](state: IListsState, { listName, lists }) {
    // @ts-ignore
    state[listName] = lists
  },
  [ADD_NEW_LIST](state: IListsState, newList: IList) {
    if (!!state.lists.find(({ title }) => title === newList.title)) {
      state.lists = state.lists.filter(({ title }) => title !== newList.title)
    } else {
      state.lists = [...state.lists, newList]
    }
  },
  createListsByDays(state: IListsState) {
    const lists: IList[] = []
    const today = setToMidnight(new Date())
    lists.push({
      id: 'Past',
      title: 'Older',
      group: 'Past Tasks'
    })
    lists.push({
      id: today.toString(),
      title: getUserTaskListFormattedDate(today),
      group: 'Current Tasks'
    })
    for (let day = 1; day < 10; day++) {
      const date = setToMidnight(new Date())
      date.setDate(setToMidnight(new Date()).getDate() + day)
      lists.push({
        id: date.toString(),
        title: getUserTaskListFormattedDate(date),
        group: 'Current Tasks'
      })
    }
    lists.push({
      id: 'Unmarked',
      title: 'Unmarked',
      group: 'Unsorted'
    })
    state.generalLists = lists
  }
}
