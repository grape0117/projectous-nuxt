import { actions } from './actions'
import { getters } from './getters'
import { mutations } from './mutations'
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
