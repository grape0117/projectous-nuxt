import { MutationTree } from 'vuex'
import { ITask } from '../tasks/types'
import { IListsState, IList } from './types'
import { ITaskUser } from '../task_users/types'
import {
  FETCH_TASKS,
  SET_TASKS_TO_LIST,
  SET_LISTS,
  ADD_NEW_LIST,
  ADD_NEW_TASK,
  ADD_TASK
} from './mutations-types'

const dayOfWeek: any = {
  0: 'Monday',
  1: 'Tuesday',
  2: 'Wednesday',
  3: 'Thursday',
  4: 'Friday',
  5: 'Saturday',
  6: 'Sundays'
}

export const mutations: MutationTree<IListsState> = {
  /*[FETCH_TASKS](state: IListsState, tasks: ITask[]) {
    state.lists = state.lists.map(list =>
      list.name === 'tasks' ? { ...list, tasks } : list
    )
  },*/
  [SET_TASKS_TO_LIST](state: IListsState, payload: any) {
    state.lists = state.lists.map(list =>
      list.name === payload.listName ? { ...list, tasks: payload.tasks } : list
    )
  },
  [SET_LISTS](state: IListsState, lists: any) {
    state.lists = lists
  },
  [FETCH_TASKS](state: IListsState, { userTasks, allTasks }: any) {
    const sortableTasks = userTasks
      .map(({ task_id }: ITaskUser) =>
        allTasks.find((task: ITask) => task_id === task.id)
      )
      .filter(({ due_date }: ITask) => due_date)
      .sort(
        (a: ITask, b: ITask) =>
          // @ts-ignore
          new Date(a.due_date) - new Date(b.due_date)
      )

    const sortableTasksByDays = sortableTasks.reduce(
      (acc: any, item: ITask) => {
        const dateTime = new Date(item.due_date as string).setHours(0, 0, 0, 0)

        if (
          acc.some(
            (obj: any) => new Date(obj.date).setHours(0, 0, 0, 0) === dateTime
          )
        ) {
          return acc.map((obj: any) =>
            new Date(obj.date).setHours(0, 0, 0, 0) === dateTime
              ? { ...obj, tasks: [...obj.tasks, item] }
              : obj
          )
        } else {
          return [...acc, { date: dateTime, tasks: [item] }]
        }
      },
      []
    )

    state.lists = sortableTasksByDays.map((item: any) =>
      // @ts-ignore
      ({
        name: dayOfWeek[new Date(item.date).getDay()],
        tasks: item.tasks,
        dateTime: item.date
      })
    )
  },
  [ADD_NEW_LIST](state: IListsState, newNameList: string) {
    state.lists = [...state.lists, { name: newNameList, tasks: [] }]
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
  [ADD_NEW_TASK](state: IListsState, { listName, taskName, index }: any) {
    //@Mikhail: can't we put this somewhere outside of mutations?
    const getRandomArbitrary = (min: number, max: number): number =>
      Math.ceil(Math.random() * (max - min) + min)
    const taskId = getRandomArbitrary(1000, 999999)
    state.lists.map(list => {
      if (list.name === listName) {
        const listTasks = list.tasks
        listTasks.splice(index, 0, {
          task_id: taskId,
          id: taskId
        })
        return { ...list, tasks: listTasks }
      } else {
        return list
      }
    })
  }
}
