import { GetterTree } from 'vuex'
import { IRootState } from '@/store/types'
import { IModuleState, IProject } from './types'
import { IListsState } from '@/store/modules/lists/types'

export const getters: GetterTree<IModuleState, IRootState> = {
  getById: (state: IModuleState, getters: any) => (id: number) => {
    let project
    if ((project = state.projects[state.lookup[id]])) {
      return project
    } else if (id) {
      return state.projects.find(project => project.id === id)
    }
  },
  userprojects: (
    state: IModuleState,
    getters: any,
    rootState: IRootState,
    rootGetters: any
  ) => (user_id: number) => {
    if (!user_id) {
      return getters['all_projects']
    }

    let userProjects: number[]

    return getters['all_projects'].filter((project: IProject) => {
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
    getters: any,
    rootState: IRootState,
    rootGetters: any
  ) => (project_id: number) => {
    let project = getters['getprojectById'](project_id)
    if (project) {
      return project.name
    }
    return ''
  },
  projectClientName: (
    state: IModuleState,
    getters: any,
    rootState: IRootState,
    rootGetters: any
  ) => (project_id: number) => {
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
