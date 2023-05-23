import { mutations } from './mutations'
import { actions } from './actions'
export const settings = {
  namespaced: true,
  state: {
    modal_stack: [],
    modules: [],
    bvModal: null,
    check_modal_stack: true,
    current_company_user_id: null, //TODO remove?
    current_company_user: {}, //TODO remove?
    current_company_id: null,
    current_user_id: null,
    current_running_timer: {},
    current_project: {},
    current_company: { name: '', modules: [] },
    current_module_settings: {},
    current_edit_project: {},
    current_edit_project_status: null, // Add or Edit
    current_edit_company_user: {},
    current_edit_client: { id: null },
    current_edit_task: {},
    current_edit_timer: {},
    current_edit_timer_status: null, // Add or Edit
    current_edit_task_type: {},
    instance_id: '',
    last_poll_timestamp: null,
    last_seen_at: new Date().toISOString().replace(/([^T]+)T([^.]+).*/g, '$1 $2'),
    notes: '',
    timer_watch: 1,
    logged_in: false,
    invoices_status: 'open',
    unread_messages_num: 0,
    total_chats_count: 0
  },
  mutations,
  actions,
  getters: {
    getCurrentEditProject: (state: any) => {
      return state.current_edit_project
    },
    getAllModules: (state: any) => {
      return state.modules
    },
    getPermissionsToModules: (state: any, getters: any, rootState: any) => {
      const permissions: any = []
      state.modules.forEach((module: any) => {
        permissions[module.id] = 0
      })
      state.current_company.modules.forEach((module: any) => {
        if (module.pivot.company_user_role === rootState.settings.current_company_user.user_role) {
          permissions[module.id] = 1
        }
      })
      return permissions
    },
    getCurrentEditInvoice: (state: any) => {
      return state.current_edit_invoice
    },
    getCurrentEditPayment: (state: any) => {
      return state.current_edit_payment ? state.current_edit_payment : {}
    },
    getCurrentEditCompanyUser: (state: any) => {
      return state.current_edit_company_user
    },
    getRemovableStatusOfCurrentEditUser: (state: any) => {
      return state.current_edit_company_user_removable
    },
    getCurrentCompanyModules: (state: any) => {
      return state.current_company.modules.slice().sort((a: any, b: any) => {
        return a.pivot.sort_order - b.pivot.sort_order
      })
    },
    getUnreadMessagesNum: (state: any) => {
      return state.unread_messages_num
    },
    isCurrentUserOrAdmin: (state: any, getters: any) => (user_id: any) => {
      // TODO: user company_user_id
      if (getters['settings/isAdmin']) {
        return true
      }
      return user_id === state.current_company_user.user_id
    },
    hasAccess: (state: any, getters: any, rootState: any) => (module: any) => {
      return module.pivot.company_user_role === rootState.settings.current_company_user.user_role
    },
    isNotDiseno: (state: any, getters: any) => {
      return !getters.isDiseno
    },
    isDiseno(state: any) {
      return state.current_company.id === 44
    },
    isWHMCS(state: any) {
      return [27, 219].indexOf(state.current_company.id) !== -1
    },
    isTecharound(state: any) {
      return state.current_company.id === 1
    },
    isAdmin(state: any, getters: any, rootState: any, rootGetters: any) {
      const current_company_user = rootGetters['company_users/getById'](state.current_company_user_id)
      if (!current_company_user) {
        return false
      }
      return current_company_user.user_role === 'admin' // TODO: add more roles
    },
    home(state: any) {
      let path = ''
      state.current_company.modules.find((module: any) => {
        if (module.pivot.is_home > 0 && module.pivot.company_user_role == state.current_company_user.user_role) {
          path = module.path
          return true
        }
      })
      return path
    }
  }
}
