import { FETCH_TASKS, SET_TASKS_TO_LIST } from './mutations-types';
export const mutations = {
    [FETCH_TASKS](state, tasks) {
        state.lists = state.lists.map(list => {
            if (list.name === 'tasks') {
                return { ...list, tasks };
            }
            else {
                return list;
            }
        });
    },
    [SET_TASKS_TO_LIST](state, payload) {
        state.lists = state.lists.map(list => {
            if (list.name === payload.listName) {
                return { ...list, tasks: payload.tasks };
            }
            else {
                return list;
            }
        });
    }
};
//# sourceMappingURL=mutations.js.map