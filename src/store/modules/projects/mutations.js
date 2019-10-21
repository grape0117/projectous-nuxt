import Vue from 'vue'
export const mutations = {
  load(state, projects) {
    projects.forEach((value, key) => {
      if (!state.lookup[projects[key].id]) {
        state.projects.push(value)
      } else {
        state.projects[state.lookup[projects[key].id]] = value
      }
    })
    state.lookup = []
    state.projects.forEach((project, key) => {
      state.lookup[project.id] = key
    })
  },
  create(state, project) {
    state.projects.push(project)
    //@Mikhail is there a faster way to find the index? Can I search from the bottom of the array first?
    state.projects.forEach((project, key) => {
      state.lookup[project.id] = key
    })
  },
  upsert(state, project) {
    let property
    let key
    key = state.lookup[project.id]
    if (key) {
      for (property in project) {
        if (project.hasOwnProperty(property)) {
          // @ts-ignore
          state.projects[key][property] = project[property]
        }
      }
    } else {
      // @ts-ignore
      this.commit('projects/create', project)
    }
  },
  updateAttribute(state, { project_id: number, attribute: string, value }) {
    // @ts-ignore
    state.projects[state.lookup[project.id]][attribute] = value
  },
  delete(state, project) {
    Vue.delete(state.projects, state.lookup[project.id])
    Vue.delete(state.lookup, project.id)
    //TODO: what to do with project_tasks and project_users
  }
}
//# sourceMappingURL=mutations.js.map
