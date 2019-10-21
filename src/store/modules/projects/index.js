import { mutations } from './mutations'
import { actions } from './actions'
const state = {
  projects: [],
  lookup: {}
}
export const projects = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
//# sourceMappingURL=index.js.map
