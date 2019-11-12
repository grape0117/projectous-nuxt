import { MutationTree } from 'vuex'
import { IListsState } from './types'
import {
  FETCH_TASKS,
  ADD_NEW_LIST,
  ADD_NEW_TASK,
  UPDATE_TASK
} from './mutations-types'
import { getUserFriendlyDate, resetTime } from '@/utils/dateFunctions'
import { ITask } from '@/store/modules/tasks/types'

export const mutations: MutationTree<IListsState> = {
  /*[FETCH_TASKS](state: IListsState, tasks: ITask[]) {
    state.lists = state.lists.map(list =>
      list.name === 'tasks' ? { ...list, tasks } : list
    )
  },*/
  /*  [SET_TASKS_TO_LIST](state: IListsState, payload: any) {
    state.lists = state.lists.map(list =>
      list.name === payload.listName ? { ...list, tasks: payload.tasks } : list
    )
  },
  [SET_LISTS](state: IListsState, lists: any) {
    state.lists = lists
  },*/
  [FETCH_TASKS](state: IListsState, { task_users, allTasks }: any) {
    const lists = []
    const today = resetTime(new Date())
    // Note: Create list for past tasks

    /**
     * Sort by sort_order
     *
     *
     * Sort by date
     * Sort by sort_order
     *
     */

    lists.push({
      id: 'Past',
      name: 'Outdated tasks'
    })
    // Note: create list for today
    lists.push({
      id: today.toString(), // uuid //2019-10-10
      name: getUserFriendlyDate(today) // 2019-10-10 //Oct 10
    })
    // Note: create lists for next 7 days from today
    for (let day = 1; day < 7; day++) {
      const date = resetTime(new Date())
      date.setDate(resetTime(new Date()).getDate() + day)
      lists.push({
        id: date.toString(),
        name: getUserFriendlyDate(date)
      })
    }
    // Note: create list for tasks with no data
    lists.push({
      id: 'Unmarked',
      name: 'Unmarked'
    })
    state.lists = lists
  },
  [ADD_NEW_LIST](state: IListsState, newNameList: string) {
    state.lists = [...state.lists, { name: newNameList, id: '1234' }] // Todo: generate id
  },
  /*[ADD_TASK](
    state: IListsState,
    { task, listName }: { task: ITask; listName: string }
  ) {
    //@Mikhail what naming conventions are you following? For object properties I would like to match the DB
    state.allTasks = [...state.allTasks, task]
    state.lists.map(list => {
      if (list.name === listName) {
        const listTasks = list.tasks

        listTasks.splice(task.sort_order, 0, task)
        return { ...list, tasks: listTasks }
      } else {
        return list
      }
    })
  },*/
  [ADD_NEW_TASK](state: IListsState, { listName, index }: any) {
    // @Mikhail: can't we put this somewhere outside of mutations?
    const getRandomArbitrary = (min: number, max: number): number =>
      Math.ceil(Math.random() * (max - min) + min)
    const taskId = getRandomArbitrary(1000, 999999)
    // state.lists.map(list => {
    //   if (list.name === listName) {
    //     const listTasks = list.tasks
    //     // @ts-ignore
    //     listTasks.splice(index, 0, {
    //       task_id: taskId,
    //       id: taskId
    //     })
    //     return { ...list, tasks: listTasks }
    //   } else {
    //     return list
    //   }
    // })
  }
}
