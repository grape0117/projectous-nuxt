// @ts-ignore
import { MutationTree } from 'vuex'
import { IListsState, ITask, IUserTask } from './types'
import {
  FETCH_TASKS,
  SET_TASKS_TO_LIST,
  SET_LISTS,
  ADD_NEW_LIST,
  ADD_NEW_TASK
} from './mutations-types'

const dayOfWeek = {
  0: 'Monday',
  1: 'Tuesday',
  2: 'Wednesday',
  3: 'Thursday',
  4: 'Friday',
  5: 'Saturday',
  6: 'Sundays'
}

export const mutations: MutationTree<IListsState> = {
  [FETCH_TASKS](state: IListsState, payload: any) {
    const sortableTasks = payload.userTasks
      .map((userTask: IUserTask) =>
        payload.allTasks.find((task: ITask) => userTask.task_id === task.id)
      )
      .filter((task: ITask) => task.due_date)
      .sort(
        (a: ITask, b: ITask) =>
          // @ts-ignore
          new Date(a.due_date) - new Date(b.due_date)
      )

    const sortableTasksByDays = sortableTasks.reduce(
      (acc: any, item: ITask) => {
        const dateTime = new Date(item.due_date).setHours(0, 0, 0, 0)

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
  [SET_TASKS_TO_LIST](state: IListsState, payload: any) {
    console.log('SEND TO REQUEST CHANGE ORDER')
    console.log(payload)

    state.lists = state.lists.filter((list: any) => list.tasks.length !== 0)
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
    const taskId = getRandomArbitrary(1000, 999999)

    // @ts-ignore
    state.allTasks = [...state.allTasks, { id: taskId, title: taskName }]

    state.lists.map(list => {
      if (list.name === listName) {
        const listTasks = list.tasks

        // @ts-ignore
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
