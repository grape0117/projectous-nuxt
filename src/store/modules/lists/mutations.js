import { FETCH_TASKS, ADD_NEW_LIST, ADD_NEW_TASK } from './mutations-types'
import { Normalizer } from '@/utils/Normalizer'
import { getUserFriendlyDate, resetTime } from '@/utils/dateFunctions'
const dayOfWeek = {
  0: 'Monday',
  1: 'Tuesday',
  2: 'Wednesday',
  3: 'Thursday',
  4: 'Friday',
  5: 'Saturday',
  6: 'Sundays'
}
export const mutations = {
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
  [FETCH_TASKS](state, { userTasks, allTasks }) {
    const normalizedTasks = new Normalizer({
      tasks: allTasks
    }).flatNormalizationById('tasks')
    const filteredTasks = userTasks
      .map(({ task_id }) => normalizedTasks[task_id])
      .sort(({ sort_order: a }, { sort_order: b }) => a - b)
    console.log(filteredTasks)
    const unmarkedTasks = filteredTasks.filter(
      ({ next_work_day }) => !next_work_day
    )
    const markedTasks = filteredTasks.filter(
      ({ next_work_day }) => next_work_day
    )
    const lists = []
    const today = resetTime(new Date())
    // Note: Create list for past tasks
    lists.push({
      name: 'Outdated tasks',
      tasks: markedTasks.filter(
        ({ next_work_day }) =>
          resetTime(next_work_day).getDate() < today.getDate()
      )
    })
    // Note: create list for today
    lists.push({
      name: getUserFriendlyDate(today),
      tasks: markedTasks.filter(
        ({ next_work_day }) =>
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
          ({ next_work_day }) =>
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
  [ADD_NEW_LIST](state, newNameList) {
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
  [ADD_NEW_TASK](state, { listName, taskName, index }) {
    //@Mikhail: can't we put this somewhere outside of mutations?
    const getRandomArbitrary = (min, max) =>
      Math.ceil(Math.random() * (max - min) + min)
    const taskId = getRandomArbitrary(1000, 999999)
    state.lists.map(list => {
      if (list.name === listName) {
        const listTasks = list.tasks
        //@ts-ignore
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
//# sourceMappingURL=mutations.js.map
