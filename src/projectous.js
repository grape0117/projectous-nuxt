import Vue from 'vue'
import store from './store'
export default {
  install(vue, opts) {
    Vue.simpleSort = function(a, b) {
      if (a < b) return -1
      if (a > b) return 1
      return 0
    }
    ;(Vue.orderSort = function(a, b) {
      if (a.order < b.order) return -1
      if (a.order > b.order) return 1
      return 0
    }),
      (Vue.numberSort = function(a, b) {
        //TODO: multiply by 1... Any issue with floats?
      })
    Vue.dateSort = function(a, b) {
      //TODO: what happens if we create a date from a date?
    }
    Vue.nameSort = function(a, b) {
      return Vue.simpleSort(a.name.toLowerCase(), b.name.toLowerCase())
    }
    Vue.titleSort = function(a, b) {
      return Vue.simpleSort(a.title.toLowerCase(), b.title.toLowerCase())
    }
    Vue.taskClientSort = function(a, b) {
      let aClientName = a.project_id ? store.getters['projects/project_client_name'](a.project_id) : ''
      let bClientName = b.project_id ? store.getters['projects/project_client_name'](b.project_id) : ''
      if (aClientName.toLowerCase() < bClientName.toLowerCase()) return -1 * direction
      if (aClientName.toLowerCase() > bClientName.toLowerCase()) return 1 * direction
      return 0
    }
    ;(Vue.timerSort = function(a, b) {
      //console.log(store.state.settings);
      //console.log(store.state.settings.current_company.id);
      if (store.state.settings.current_company.id == 44) {
        return Vue.projectRelationSort(a, b)
      } else {
        return new Date(a.report_at) - new Date(b.report_at)
      }
    }),
      (Vue.projectRelationSort = function(a, b) {
        //console.log(a.b)
        if (a.project_id && b.project_id) {
          return Vue.projectSort(store.getters['projects/getProjectById'](a.project_id), store.getters['projects/getProjectById'](b.project_id))
        }
      })
    Vue.projectSort = function(a, b) {
      try {
        if (a.client_id && b.client_id)
          if (a.client_id != b.client_id) {
            let aclient = store.getters['clients/getByClientCompanyId'](a.client_id)
            let bclient = store.getters['clients/getByClientCompanyId'](b.client_id)
            return Vue.simpleSort(aclient.name.toLowerCase(), bclient.name.toLowerCase())
          }
        if (a.owner_company_id == 44 && b.owner_company_id == 44) {
          //console.log(a.name,b.name);
          let yearRegexp = /.*\.([0-9]*)-[0-9]*.*/
          //console.log(yearRegexp);
          let ayear = yearRegexp.exec(a.name)
          let byear = yearRegexp.exec(b.name)
          if (ayear && byear) {
            //console.log(ayear[1],byear[1]);
            if (ayear[1] * 1 < byear[1] * 1) return 1
            if (ayear[1] * 1 > byear[1] * 1) return -1

            let projectRegexp = /.*\.[0-9]*-([0-9]*).*/
            let aprojectnum = projectRegexp.exec(a.name)
            let bprojectnum = projectRegexp.exec(b.name)
            if (aprojectnum && bprojectnum) {
              //console.log(aprojectnum[1],bprojectnum[1])
              if (aprojectnum[1] * 1 < bprojectnum[1] * 1) return -1
              if (aprojectnum[1] * 1 > bprojectnum[1] * 1) return 1
              //console.log('not sorting by num')
            }
          }
        }
        return Vue.nameSort(a, b)
      } catch (err) {
        return 0
      }
    }
  }
}
