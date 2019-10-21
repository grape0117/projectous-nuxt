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
export const mutations = {
  /*[FETCH_TASKS](state: IListsState, tasks: ITask[]) {
      state.lists = state.lists.map(list =>
        list.name === 'tasks' ? { ...list, tasks } : list
      )
    },*/
  [SET_TASKS_TO_LIST](state, payload) {
    state.lists = state.lists.map(list =>
      list.name === payload.listName ? { ...list, tasks: payload.tasks } : list
    )
  },
  [SET_LISTS](state, lists) {
    state.lists = lists
  },
  [FETCH_TASKS](state, { userTasks, allTasks }) {
    const sortableTasks = userTasks
      .map(({ task_id }) => allTasks.find(task => task_id === task.id))
      .filter(({ due_date }) => due_date)
      .sort(
        (a, b) =>
          // @ts-ignore
          new Date(a.due_date) - new Date(b.due_date)
      )
    const sortableTasksByDays = sortableTasks.reduce((acc, item) => {
      const dateTime = new Date(item.due_date).setHours(0, 0, 0, 0)
      if (
        acc.some(obj => new Date(obj.date).setHours(0, 0, 0, 0) === dateTime)
      ) {
        return acc.map(obj =>
          new Date(obj.date).setHours(0, 0, 0, 0) === dateTime
            ? { ...obj, tasks: [...obj.tasks, item] }
            : obj
        )
      } else {
        return [...acc, { date: dateTime, tasks: [item] }]
      }
    }, [])
    state.lists = sortableTasksByDays.map(item =>
      // @ts-ignore
      ({
        name: dayOfWeek[new Date(item.date).getDay()],
        tasks: item.tasks,
        dateTime: item.date
      })
    )
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
    const getRandomArbitrary = (min, max) =>
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
//# sourceMappingURL=mutations.js.map
