import { MutationTree } from 'vuex'
import { IListsState, ITask, IUserTask } from './types'
import { FETCH_TASKS, ADD_NEW_LIST, ADD_NEW_TASK } from './mutations-types'
import { Normalizer } from '@/utils/Normalizer'
import { getUserFriendlyDate, resetTime } from '@/utils/dateFunctions'

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
  [FETCH_TASKS](state: IListsState, { userTasks, allTasks }: any) {
    const normalizedTasks = new Normalizer({
      tasks: allTasks
    }).flatNormalizationById('tasks')
    const filteredTasks = userTasks
      .map(({ task_id }: IUserTask) => normalizedTasks[task_id])
      .sort(({ sort_order: a }: any, { sort_order: b }: any) => a - b)
    console.log(filteredTasks)
    const unmarkedTasks = filteredTasks.filter(
      ({ next_work_day }: ITask) => !next_work_day
    )
    const markedTasks = filteredTasks.filter(
      ({ next_work_day }: ITask) => next_work_day
    )
    const lists = []
    const today = resetTime(new Date())
    // Note: Create list for past tasks
    lists.push({
      name: 'Outdated tasks',
      tasks: markedTasks.filter(
        ({ next_work_day }: any) =>
          resetTime(next_work_day).getDate() < today.getDate()
      )
    })
    // Note: create list for today
    lists.push({
      name: getUserFriendlyDate(today),
      tasks: markedTasks.filter(
        ({ next_work_day }: any) =>
          resetTime(next_work_day).toString() === today.toString()
      )
    })
    // Note: create lists for next 7 days from today
    for (let day = 1; day < 7; day++) {
      const date = resetTime(new Date())
      date.setDate(resetTime(new Date()).getDate() + day)
      lists.push({
        name: getUserFriendlyDate(date),
        tasks: markedTasks.filter(
          ({ next_work_day }: any) =>
            resetTime(next_work_day).toString() === date.toString()
        )
      })
    }
    // Note: create list for tasks with no data
    lists.push({
      name: 'Unmarked',
      tasks: unmarkedTasks
    })
    state.lists = lists
  },
  [ADD_NEW_LIST](state: IListsState, newNameList: string) {
    state.lists = [...state.lists, { name: newNameList, tasks: [] }]
  },
  [ADD_NEW_TASK](state: IListsState, { listName, taskName, index }: any) {
    const getRandomArbitrary = (min: number, max: number): number =>
      Math.ceil(Math.random() * (max - min) + min)
    const taskId = getRandomArbitrary(1000, 999999)
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
