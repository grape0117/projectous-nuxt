import Vue from 'vue'
export const mutations = {
  load(state, tasks) {
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
    state.tasks.forEach((task, key) => {
      state.lookup[task.id] = key
    })
  },
  upsert(state, task) {
    let property
    let key
    key = state.lookup[task.id]
    if (key) {
      for (property in task) {
        if (task.hasOwnProperty(property)) {
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
  updateAttribute(state, { task_id, attribute, value }) {
    state.tasks[state.lookup[task.id]][attribute] = value
  },
  delete(state, task) {
    Vue.delete(state.tasks, state.lookup[task.id])
    Vue.delete(state.lookup, task.id)
    //TODO: what to do with tasks_users?
  }
}
//# sourceMappingURL=mutations.js.map
