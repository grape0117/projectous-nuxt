import { actions } from './actions';
import { getters } from './getters';
import { mutations } from './mutations';
const state = {
    task_users: [],
    lookup: []
};
export const task_users = {
    namespaced: true,
    state,
    actions,
    getters,
    mutations
};
//# sourceMappingURL=index.js.map