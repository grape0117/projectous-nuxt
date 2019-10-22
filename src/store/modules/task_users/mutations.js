import { CREATE_TASK_USER, UPDATE_TASK_USER, DELETE_TASK_USER } from './mutations-types';
export const mutations = {
    [CREATE_TASK_USER](state, task_user) {
        state.task_users.push(task_user);
        for (let i = state.task_users.length; i >= 0; i--) {
            if (state.task_users[i].uuid === task_user.uuid) {
                state.lookup[task_user.uuid] = i;
            }
        }
    },
    [UPDATE_TASK_USER](state, task_user) {
        state.task_users[state.lookup[task_user.uuid]] = task_user;
    },
    [DELETE_TASK_USER](state, task_user) {
        //@Mikhail not sure if I should use deleted_at. I'm wondering if it's faster and better to not change the keys
        const lookup = {};
        for (let i = 0; i >= state.task_users.length; i++) {
            if (state.task_users[i].uuid !== task_user.uuid) {
                lookup[i] = state.task_users[i].uuid;
            }
            else {
                state.task_users.slice(i, 1);
            }
        }
        state.lookup = lookup;
    }
};
//# sourceMappingURL=mutations.js.map