import { GetterTree } from 'vuex'
import { IRootState } from '@/store/types'
import { IModuleState, IProject } from './types'

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
  getOpenCompanyProjects: (state: IModuleState) => (client_company_id: any) => {
    return state.projects.filter(project => {
      if (project.status != 'open') {
        return false
      }
      return project.client_id == client_company_id
    })
  },
  getUserProjects: (state: IModuleState) => (userId: number) => {
    if (!userId) {
      return state.projects
    }

    let userProjects: number[] = []

    return state.projects.filter((project: IProject) => {
      let userMatch = false
      if (project.id) {
        if (userProjects.includes(project.id)) {
          return true
        }
        project.users.forEach(({ id }) => {
          if (id == userId) {
            userProjects.push(project.id)
            userMatch = true
            return false
          }
        })
      }
      project.users.forEach(({ id }) => {
        if (id == userId) {
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
    getters: any
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
