import Vue from 'vue'
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
  getOpenProjectsSortedByClient: function(
    state: IModuleState,
    getters,
    rootState,
    rootGetters
  ) {
    let self = this
    //console.log('openprojects')
    let active_clients = rootGetters['company_clients/getActiveCompanyClients']
    // @ts-ignore
    let projects = []
    if (!active_clients) {
      return
    }
    // @ts-ignore
    let client_projects = []

    //console.log(state.lookup_by_client_company_id)
    // @ts-ignore
    active_clients.forEach(function(company_client) {
      //console.log(company_client)
      client_projects = []
      // @ts-ignore
      let client_project_keys =
        state.lookup_by_client_company_id[company_client.client_id]
      // @ts-ignore
      client_project_keys.forEach(function(key) {
        //console.log(project_id)
        /*console.log(self.$store.state.projects.lookup[project_id])
                console.log(self.$store.state.projects.projects[self.$store.state.projects.lookup[project_id]])*/
        if (!state.projects[key]) {
          return
        }
        let project = state.projects[key]
        //console.log(project.status)
        if (project.status === 'open') {
          client_projects.push(project)
        }
      })
      // @ts-ignore
      projects = projects.concat(
        client_projects.sort(function(a, b) {
          if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
          if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
          return 0
        })
      )
    })
    // @ts-ignore
    return projects
  },
  getOpenCompanyProjects: (state: IModuleState, getters) => (
    client_company_id: any
  ) => {
    // @ts-ignore
    return state.lookup_by_client_company_id[client_company_id]
      .reduce(function(result: any, project_id: any) {
        let project = getters['getById'](project_id)
        if (!project) {
          console.log(project_id)
          return result
        }
        if (project.status != 'open') {
          return result
        }
        if (!result) {
          result = []
        }
        // @ts-ignore
        console.log(result)

        result.push(project)
        return result
      })
      .sort(function(a: IProject, b: IProject) {
        console.log(a, b)
        if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
        if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
        return 0
      })
    /*return state.projects.filter(project => {
      if (project.status != 'open') {
        return false
      }
      return project.client_id == client_company_id
    })*/
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
  },
  openprojects: (state, getters, rootState, rootGetters) => (
    search: any,
    sort: any
  ) => {
    let isAdmin = rootGetters['settings/isAdmin']
    console.log('isAdmin', isAdmin)
    let projects = state.projects.filter(function(project) {
      //console.log('openprojects')
      if (project.status != 'open') {
        return false
      }
      let company_client = rootGetters['company_clients/getByClientCompanyId'](
        project.client_id
      )
      if (company_client && company_client.status != 'active') {
        return false
      }

      //console.log('project', rootGetters['settings/isAdmin'], project.owner_company_id, rootState.settings.current_company.id, project.users);
      //If !admin && !project_user return false
      if (
        !rootGetters['settings/isAdmin'] &&
        !project.users.find(function(company_user) {
          if (company_user.id == rootState.settings.current_company_user_id) {
            //console.log(project.name);
          }
          //console.log(company_user.id, rootState.settings.current_company_user.id)
          return company_user.id == rootState.settings.current_company_user_id
        })
      ) {
        return false
        //admin users get to see all company projects and shared projects
      } else if (
        rootGetters['settings/isAdmin'] &&
        project.owner_company_id != rootState.settings.current_company_id
      ) {
        return false
      }

      if (search && search.length >= 3) {
        let regex = new RegExp(
          '(' +
            search
              .toLowerCase()
              .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
              .replace(' ', '.*') +
            ')'
        )
        let companyClientKey =
          rootState.company_clients.lookup_by_client_id[project.client_id]
        if (typeof companyClientKey !== 'undefined') {
          if (
            !(
              rootState.company_clients.company_clients[companyClientKey].name +
              ' ' +
              project.name
            )
              .toLowerCase()
              .match(regex)
          ) {
            //return false;
          }
        } else {
          //TODO uncomment to find projects without a client
          //console.log(project.name, project.client_id, rootState.company_clients.lookup_by_client_id[project.client_id])
          //return false;
        }
      }
      return true
    }) //.sort(Vue.projectSort)

    //console.log('projects', projects)
    return projects
  },
  openprojects2: (state, getters, rootState, rootGetters) => (
    search: any,
    sort: any
  ) => {
    let isAdmin = rootGetters['settings/isAdmin']
    console.log('isAdmin', isAdmin)
    let projects = state.projects.filter(function(project) {
      //console.log('openprojects')
      if (project.status != 'open') {
        return false
      }
      let company_client = rootGetters['company_clients/getByClientCompanyId'](
        project.client_id
      )
      if (company_client && company_client.status != 'active') {
        return false
      }

      //console.log('project', rootGetters['settings/isAdmin'], project.owner_company_id, rootState.settings.current_company.id, project.users);
      //If !admin && !project_user return false
      if (
        !rootGetters['settings/isAdmin'] &&
        !project.users.find(function(company_user) {
          if (company_user.id == rootState.settings.current_company_user_id) {
            //console.log(project.name);
          }
          //console.log(company_user.id, rootState.settings.current_company_user.id)
          return company_user.id == rootState.settings.current_company_user_id
        })
      ) {
        return false
        //admin users get to see all company projects and shared projects
      } else if (
        rootGetters['settings/isAdmin'] &&
        project.owner_company_id != rootState.settings.current_company_id
      ) {
        return false
      }

      if (search && search.length >= 3) {
        let regex = new RegExp(
          '(' +
            search
              .toLowerCase()
              .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
              .replace(' ', '.*') +
            ')'
        )
        let companyClientKey =
          rootState.company_clients.lookup_by_client_id[project.client_id]
        if (typeof companyClientKey !== 'undefined') {
          if (
            !(
              rootState.company_clients.company_clients[companyClientKey].name +
              ' ' +
              project.name
            )
              .toLowerCase()
              .match(regex)
          ) {
            //return false;
          }
        } else {
          //TODO uncomment to find projects without a client
          //console.log(project.name, project.client_id, rootState.company_clients.lookup_by_client_id[project.client_id])
          //return false;
        }
      }
      return true
    }) //.sort(Vue.projectSort)

    //console.log('projects', projects)
    return projects
  }
}
