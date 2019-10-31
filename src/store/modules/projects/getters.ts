import { GetterTree } from 'vuex'
import { IRootState } from '@/store/types'
import { IModuleState, IProject } from './types'
import { IListsState } from '@/store/modules/lists/types'

export const getters: GetterTree<IModuleState, IRootState> = {
  getById: (state: IModuleState) => (id: number) => {
    let project
    // tslint:disable-next-line:no-conditional-assignment
    if ((project = state.projects[state.lookup[id]])) {
      return project
    } else if (id) {
      return state.projects.find(({ id: projectId }) => projectId === id)
    }
  },
  userprojects: (
    state: IModuleState,
    // tslint:disable-next-line:no-shadowed-variable
    getters: any,
    rootState: IRootState,
    rootGetters: any
  ) => (user_id: number) => {
    if (!user_id) {
      return getters.all_projects
    }

    let userProjects: number[]

    return getters.all_projects.filter((project: IProject) => {
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
    state: IModuleState,
    // tslint:disable-next-line:no-shadowed-variable
    getters: any,
    rootState: IRootState,
    rootGetters: any
  ) => (project_id: number) => {
    let project = getters.getprojectById(project_id)
    if (project) {
      return project.name
    }
    return ''
  },
  projectClientName: (
    state: IModuleState,
    // tslint:disable-next-line:no-shadowed-variable
    getters: any,
    rootState: IRootState,
    rootGetters: any
  ) => (project_id: number) => {
    let project = getters.getprojectById(project_id)
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
