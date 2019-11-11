// @ts-ignore
import { MutationTree } from 'vuex'
import { IModuleState, ITask } from './types'
import Vue from 'vue'
import { UPDATE_TASK } from '@/store/modules/lists/mutations-types'

export const mutations: MutationTree<IModuleState> = {
  load(state, tasks: ITask[]) {
    //add or update tasks
    tasks.forEach((value, key) => {
      if (!state.lookup[tasks[key].id]) {
        state.tasks.push(value)
      } else {
        state.tasks[state.lookup[tasks[key].id]] = value
      }
    })

    //reset lookup
    state.lookup = []
    state.tasks.forEach((task, key) => {
      state.lookup[task.id] = key
    })
  },
  create: function(state, task) {
    state.tasks.push(task)
    state.tasks.forEach((t, key) => {
      state.lookup[t.id] = key
    })
  },
  upsert(state, task: ITask) {
    let property: string | number
    let key: number

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
  },

  [UPDATE_TASK](state, task) {
    const { id } = task
    const { tasks } = state

    const idx = tasks.findIndex(e => e.id === id)
    state.tasks[idx] = task
  }
}
