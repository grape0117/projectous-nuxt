const company_user_id = 1;
export const getters = {
    getById: (state, getters) => (id) => {
        return state.task_users[state.lookup[id]];
    },
    getMyTasks: (state, getters) => (company_user_id) => {
        state.task_users.filter(function (task_user) {
            return task_user === company_user_id;
        });
    }
};
//# sourceMappingURL=getters.js.map