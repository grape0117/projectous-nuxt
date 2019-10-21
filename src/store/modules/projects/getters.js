export const getters = {
  getById: (state, getters) => id => {
    let project
    if ((project = state.projects[state.lookup[id]])) {
      return project
    } else if (id) {
      return state.projects.find(project => project.id === id)
    }
  },
  userprojects: (state, getters, rootState, rootGetters) => user_id => {
    if (!user_id) {
      return getters['all_projects']
    }
    let userProjects
    return getters['all_projects'].filter(project => {
      let userMatch = false
      if (project.id) {
        if (userProjects.indexOf(project.id) !== -1) {
          return true
        }
        project.users.forEach(user => {
          if (user.id == user_id) {
            userProjects.push(project.id)
            userMatch = true
            return false
          }
        })
      }
      project.users.forEach((user, index) => {
        if (user.id == user_id) {
          userMatch = true
          return false
        }
      })
      return userMatch
    })
  },
  projectProjectName: (
    state,
    getters,
    rootState,
    rootGetters
  ) => project_id => {
    let project = getters['getprojectById'](project_id)
    if (project) {
      return project.name
    }
    return ''
  },
  projectClientName: (state, getters, rootState, rootGetters) => project_id => {
    let project = getters['getprojectById'](project_id)
    if (!project) {
      return ''
    } else if (project.client_id) {
      let client = rootGetters['clients/getClientById'](project.client_id)
      if (client) {
        return client.name
      }
    }
    return ''
  }
}
//# sourceMappingURL=getters.js.map
