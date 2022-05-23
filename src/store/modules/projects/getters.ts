import Vue from 'vue'
import { GetterTree } from 'vuex'
import { IRootState } from '@/store/types'
import { IModuleState, IProject } from './types'

export const getters: GetterTree<IModuleState, IRootState> = {
  getById: (state: IModuleState) => (id: string) => {
    let project
    // tslint:disable-next-line:no-conditional-assignment
    if ((project = state.projects[state.lookup[id]])) {
      return project
    } else if (id) {
      return state.projects.find(({ id: projectId }) => projectId === id)
    }
  },
  getOpenProjectsSortedByClient: function(state: IModuleState, _getters, rootState, rootGetters) {
    let self = this
    //console.log('openprojects')
    let active_clients = rootGetters['clients/getActiveCompanyClients']
    // @ts-ignore
    let new_projects = state.projects.filter(e => e.projects)
    // @ts-ignore
    let projects = []
    if (!active_clients.length) {
      return
    }
    // @ts-ignore
    let client_projects = []
    //console.log('active_clients', active_clients)
    //console.log('lookup_by_client_company_id', state.lookup_by_client_company_id)
    //console.log(state.lookup_by_client_company_id)
    // @ts-ignore
    active_clients.forEach(function(client) {
      //console.log(client)
      client_projects = []
      // @ts-ignore
      // @ts-ignore
      let client_project_keys = state.lookup_by_client_company_id[client.client_company_id]
      if (!client_project_keys) {
        // console.log('project not found', client)
        return
      }
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
        // @ts-ignore
        client_projects.sort(function(a, b) {
          if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
          if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
          return 0
        })
      )
    })

    // console.log("PROJECTS", projects)
    if (new_projects.length > 0) {
      new_projects.forEach(function(proj) {
        // @ts-ignore
        const { projects: new_proj } = proj
        // @ts-ignore
        new_proj.is_new = true
        // @ts-ignore
        let check_if_exists = projects.filter(e => e.id == new_proj.id).length
        if (check_if_exists === 0) {
          projects.unshift(new_proj)
        }
      })
    }
    // @ts-ignore
    return projects
  },
  getOpenCompanyProjects: (state: IModuleState, _getters) => (client_company_id: any) => {
    let openCompanyProjects: any = []
    // @ts-ignore
    const projects = state.lookup_by_client_company_id[client_company_id]
    if (projects)
      projects.forEach(function(projectKey: any) {
        let project = state.projects[projectKey]
        if (!project) {
          return
        }
        if (project.status != 'open') {
          return
        }

        openCompanyProjects.push(project)
      })

    return openCompanyProjects.sort(function(a: IProject, b: IProject) {
      if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
      if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
      return 0
    })
    /*return state.projects.filter(project => {
      if (project.status != 'open') {
        return false
      }
      return project.client_company_id == client_company_id
    })*/
  },
  getUserProjects: (state: IModuleState) => (userId: string) => {
    if (!userId) {
      return state.projects
    }

    let userProjects: string[] = []

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
    _getters: any
  ) => (project_id: string) => {
    let project = _getters.getById(project_id)
    if (project) {
      return project.name
    }
    return ''
  },
  projectClientName: (
    state: IModuleState,
    // tslint:disable-next-line:no-shadowed-variable
    _getters: any,
    rootState: IRootState,
    rootGetters: any
  ) => (project_id: string) => {
    let project = _getters.getById(project_id)
    if (!project) {
      return ''
    } else if (project.client_company_id) {
      let client = rootGetters['clients/getByClientCompanyId'](project.client_company_id)
      if (client) {
        return client.name
      }
    }
    return ''
  },
  projectName: (
    state: IModuleState,
    // tslint:disable-next-line:no-shadowed-variable
    _getters: any,
    rootState: IRootState,
    rootGetters: any
  ) => (project_id: string) => {
    const project = _getters.getById(project_id)
    if (!project) {
      return ''
    }

    if (project.client_company_id) {
      const client = rootGetters['clients/getByClientCompanyId'](project.client_company_id)
      if (client) {
        const prefix = '<span style="background-color: ' + client.color + ';">'
        const suffix = '</span>'

        let icon = ''
        if (client.url && (client.url == project.project_url || !project.project_url)) {
          icon = '<img src="' + process.env.VUE_APP_API_URL + '/clients/' + client.id + '/favicon.png" />'
        } else if (project.project_url) {
          icon = '<img src="' + process.env.VUE_APP_API_URL + '/projects/' + project.id + '/favicon.png" />'
        }

        let project_name = ''
        if (client.url == project.project_url && project.project_url) {
          return prefix + icon + suffix
        } else if (project.acronym) {
          return prefix + icon + project.acronym + suffix
        } else {
          return prefix + icon + project.name + suffix
        }
      }
    }

    return project.name
  },
  openprojects: (state, _getters, rootState, rootGetters) => (search: any, sort: any) => {
    let isAdmin = rootGetters['settings/isAdmin']
    console.log('isAdmin', isAdmin)
    let projects = state.projects.filter(function(project) {
      //console.log('openprojects')
      if (project.status != 'open') {
        return false
      }
      //console.log('project', project)
      let client = rootGetters['clients/getByClientCompanyId'](project.client_company_id)
      if (client && client.status != 'active') {
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
      } else if (rootGetters['settings/isAdmin'] && project.owner_company_id != rootState.settings.current_company_id) {
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
        let companyClientKey = rootState.clients.lookup_by_client_id[project.client_company_id]
        if (typeof companyClientKey !== 'undefined') {
          if (!(rootState.clients.clients[companyClientKey].name + ' ' + project.name).toLowerCase().match(regex)) {
            //return false;
          }
        } else {
          //TODO uncomment to find projects without a client
          //console.log(project.name, project.client_company_id, rootState.clients.lookup_by_client_id[project.client_company_id])
          //return false;
        }
      }
      return true
    }) //.sort(Vue.projectSort)

    //console.log('projects', projects)
    return projects
  },
  openprojects2: (state, _getters, rootState, rootGetters) => (search: any, sort: any) => {
    let isAdmin = rootGetters['settings/isAdmin']
    console.log('isAdmin', isAdmin)
    let projects = state.projects.filter(function(project) {
      //console.log('openprojects')
      if (project.status != 'open') {
        return false
      }
      let client = rootGetters['clients/getByClientCompanyId'](project.client_company_id)
      if (client && client.status != 'active') {
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
      } else if (rootGetters['settings/isAdmin'] && project.owner_company_id != rootState.settings.current_company_id) {
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
        let companyClientKey = rootState.clients.lookup_by_client_id[project.client_company_id]
        if (typeof companyClientKey !== 'undefined') {
          if (!(rootState.clients.clients[companyClientKey].name + ' ' + project.name).toLowerCase().match(regex)) {
            //return false;
          }
        } else {
          //TODO uncomment to find projects without a client
          //console.log(project.name, project.client_company_id, rootState.clients.lookup_by_client_id[project.client_company_id])
          //return false;
        }
      }
      return true
    }) //.sort(Vue.projectSort)

    //console.log('projects', projects)
    return projects
  }
}
