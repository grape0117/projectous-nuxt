// @ts-ignore
import { MutationTree } from 'vuex'
import { IModuleState, ITask } from './types'
import Vue from 'vue'

export const mutations: MutationTree<IModuleState> = {
  load(state, tasks: ITask[]) {
    //add or update tasks
    tasks.forEach((value, key) => {
      // @ts-ignore
      if (!state.lookup[tasks[key].id]) {
        state.tasks.push(value)
      } else {
        // @ts-ignore
        state.tasks[state.lookup[tasks[key].id]] = value
      }
    })

    //reset lookup
    state.lookup = []
    state.tasks.forEach((task, key) => {
      // @ts-ignore
      state.lookup[task.id] = key
    })
  },
  create: function(state, task) {
    state.tasks.push(task)
    //TODO: we only need to find the key for the new task
    state.tasks.forEach((t, key) => {
      // @ts-ignore
      state.lookup[t.id] = key
    })
  },
  upsert(state, task: ITask) {
    let property: string | number
    let key: number
    // @ts-ignore
    key = state.lookup[task.id]
    if (key) {
      for (property in task) {
        if (task.hasOwnProperty(property)) {
          //@ts-ignore
          state.tasks[key][property] = task[property]
        }
      }
    } else {
      state.tasks.push(task)
      // @ts-ignore
      state.lookup[task.id] = state.tasks.findIndex(row => {
        return row.id == task.id
      })
    }
  },
  updateAttribute(state: IModuleState, { task_id, attribute, value }: any) {
    //@ts-ignore
    state.tasks[state.lookup[task_id]][attribute] = value
  },
  delete(state: IModuleState, task) {
    Vue.delete(state.tasks, state.lookup[task.id])
    Vue.delete(state.lookup, task.id)
    //TODO: what to do with tasks_users?
  }
}
