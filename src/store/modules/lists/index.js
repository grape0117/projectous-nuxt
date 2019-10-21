import { actions } from './actions'
import { getters } from './getters'
import { mutations } from './mutations'
const state = {
  lists: []
}
export const lists = {
  namespaced: true,
  state,
  actions,
  getters,
  mutations
}
//# sourceMappingURL=index.js.map
