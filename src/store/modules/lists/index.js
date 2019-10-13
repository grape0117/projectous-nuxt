import { actions } from './actions';
import { getters } from './getters';
import { mutations } from './mutations';
const state = {
    lists: [
        {
            name: 'tasks',
            tasks: []
        },
        {
            name: 'additionalTasks',
            tasks: []
        },
        {
            name: 'againTasks',
            tasks: []
        }
    ]
};
export const lists = {
    namespaced: true,
    state,
    actions,
    getters,
    mutations
};
//# sourceMappingURL=index.js.map