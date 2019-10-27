import router from '../router'
import { EventBus } from '../event-bus.js'
import { MutationTree } from 'vuex'
import { IModuleState } from '@/store/modules/settings/types'
import { mutations } from './mutations'
import { actions } from './actions'
export const settings = {
  namespaced: true,
  state: {
    action_stack: [],
    modules: [],
    check_action_stack: true,
    current_company_user_id: null,
    current_company_user: {},
    current_company_id: null,
    current_running_timer: {},
    current_project: {},
    current_company: { name: '', modules: [] },
    current_module_settings: {},
    current_edit_project: {},
    current_edit_company_user: {},
    current_edit_company_client: { id: null },
    current_edit_task: {},
    current_edit_timer: {},
    current_edit_task_type: {},
    last_seen_at: new Date()
      .toISOString()
      .replace(/([^T]+)T([^\.]+).*/g, '$1 $2'),
    notes: '',
    timer_watch: 1
  },
  mutations,
  actions,
  getters: {
    getCurrentEditProject: state => {
      return state.current_edit_project
    },
    getAllModules: state => {
      return state.modules
    },
    getPermissionsToModules: (state, getters, rootState) => {
      var permissions = []
      state.modules.forEach(function(module) {
        permissions[module.id] = 0
      })
      state.current_company.modules.forEach(function(module) {
        if (
          module.pivot.company_user_role ==
          rootState.settings.current_company_user.user_role
        )
          permissions[module.id] = 1
      })
      return permissions
    },
    getCurrentEditInvoice: state => {
      return state.current_edit_invoice
    },
    getCurrentEditPayment: state => {
      return state.current_edit_payment ? state.current_edit_payment : {}
    },
    getCurrentEditCompanyUser: (state, getters, rootState) => {
      return state.current_edit_company_user
    },
    getRemovableStatusOfCurrentEditUser: (state, getters, rootState) => {
      return state.current_edit_company_user_removable
    },
    getCurrentCompanyModules: (state, getters, rootState) => {
      //labeledConsole('current_company_modules', state.current_company.modules);
      return state.current_company.modules.slice().sort(function(a, b) {
        return a.pivot.sort_order - b.pivot.sort_order
      })
    },
    isCurrentUserOrAdmin: (state, getters, rootState) => user_id => {
      //TODO: user company_user_id
      if (getters['settings/isAdmin']) {
        return true
      }
      return user_id == state.current_company_user.user_id
    },
    hasAccess: (state, getters, rootState) => module => {
      return (
        module.pivot.company_user_role ==
        rootState.settings.current_company_user.user_role
      )
    },
    isNotDiseno: function(state, getters) {
      return !getters['isDiseno']
    },
    isDiseno: function(state) {
      return state.current_company.id == 44
    },
    isWHMCS: function(state) {
      return [27, 219].indexOf(state.current_company.id) !== -1
    },
    isTecharound: function(state) {
      return state.current_company.id == 1
    },
    isAdmin: function(state, local, store) {
      if (!state.current_company_user.user_role) {
        return false
      }
      return state.current_company_user.user_role == 'admin' //TODO: add more roles
    },
    home: function(state, getters, rootState) {
      var path = ''
      state.current_company.modules.find(function(module) {
        if (
          module.pivot.is_home > 0 &&
          module.pivot.company_user_role == state.current_company_user.user_role
        ) {
          path = module.path
          return true
        }
      })
      return path
    }
  }
}
