// @ts-ignore
import { MutationTree } from 'vuex'
import { IListsState, ITask } from './types'
import {
  FETCH_TASKS,
  SET_TASKS_TO_LIST,
  SET_LISTS,
  ADD_NEW_LIST,
  ADD_NEW_TASK
} from './mutations-types'

export const mutations: MutationTree<IListsState> = {
  [FETCH_TASKS](state: IListsState, { userTasks, allTasks }: any) {
    const sortableTasks = userTasks
      .map(({ task_id }: any) => allTasks.find(({ id }: any) => task_id === id))
      .filter(({ due_date }: any) => due_date)
      .sort(
        ({ due_date: a }: any, { due_date: b }: any) =>
          (new Date(a) as any) - (new Date(b) as any)
      )

    state.lists = state.lists.map(list =>
      list.name === 'tasks' ? { ...list, tasks: sortableTasks } : list
    )
  },
  [SET_TASKS_TO_LIST](state: IListsState, { tasks, listName }: any) {
    const sortableTasks = tasks.sort(
      ({ due_date: a }: any, { due_date: b }: any) =>
        (new Date(a) as any) - (new Date(b) as any)
    )

    state.lists = state.lists.map(list =>
      list.name === listName ? { ...list, tasks: sortableTasks } : list
    )
  },
  [SET_LISTS](state: IListsState, lists: any) {
    state.lists = lists
  },
  [ADD_NEW_LIST](state: IListsState, newNameList: string) {
    state.lists = [...state.lists, { name: newNameList, tasks: [] }]
  },
  [ADD_NEW_TASK](state: IListsState, { listName, taskName, index }: any) {
    const getRandomArbitrary = (min: number, max: number): number =>
      Math.ceil(Math.random() * (max - min) + min)
    const taskId: number = getRandomArbitrary(1000, 999999)

    // @ts-ignore
    state.allTasks = [...state.allTasks, { id: taskId, title: taskName }]

    state.lists.map(list => {
      if (list.name === listName) {
        const listTasks = list.tasks

        listTasks.splice(index, 0, {
          task_id: taskId,
          id: getRandomArbitrary(1000, 999999)
        })
        return { ...list, tasks: listTasks }
      } else {
        return list
      }
    })
  }
}
