// @ts-ignore
import { MutationTree } from 'vuex'
import { IListsState, ITask, IList, IUserTask } from './types'
import {
  FETCH_TASKS,
  SET_TASKS_TO_LIST,
  SET_LISTS, ADD_NEW_LIST,
  SET_ALL_TASKS,
  ADD_NEW_TASK
} from './mutations-types'

export const mutations: MutationTree<IListsState> = {
  [FETCH_TASKS](state: IListsState, payload: any) {
    const sortableTasks = payload.userTasks
      .map((userTask: IUserTask) => (
        payload.allTasks.find((task: ITask) => (
          userTask.task_id === task.id)
        )
      ))
      .filter((task: ITask) => task.due_date)
      .sort((a: ITask, b: ITask) => (
        // @ts-ignore
        new Date(a.due_date) - new Date(b.due_date)
      ))

    state.lists = state.lists.map(list => list.name === 'tasks' ? { ...list, tasks: sortableTasks } : list)
  },
  [SET_TASKS_TO_LIST](state: IListsState, payload: any) {
    const sortableTasks = payload.tasks
      .sort((a: ITask, b: ITask) => (
        // @ts-ignore
        new Date(b.due_date) - new Date(a.due_date)
      ))

    state.lists = state.lists.map(list => list.name === payload.listName ? { ...list, tasks: sortableTasks } : list)
  },
  [SET_LISTS](state: IListsState, lists: any) {
    state.lists = lists
  },
  [ADD_NEW_LIST](state: IListsState, newNameList: string) {
    state.lists = [...state.lists, { name: newNameList, tasks: [] }]
  },
  [ADD_NEW_TASK](state: IListsState, { listName, taskName, index }: any) {
    const getRandomArbitrary = (min: number, max: number): number => Math.ceil(Math.random() * (max - min) + min)
    const taskId = getRandomArbitrary(1000, 999999)

    // @ts-ignore
    state.allTasks = [...state.allTasks, { id: taskId, title: taskName }]

    state.lists.map(list => {
      if (list.name === listName) {
        const listTasks = list.tasks

        // @ts-ignore
        listTasks.splice(index, 0, { task_id: taskId, id: getRandomArbitrary(1000, 999999) })
        return { ...list, tasks: listTasks }
      } else {
        return list
      }
    })
  }
}
