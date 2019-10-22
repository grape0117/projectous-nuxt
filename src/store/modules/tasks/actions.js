import { FETCH_TASKS } from '../lists/mutations-types';
export const actions = {
    async fetchTasks({ commit }) {
        const response = await fetch('https://release.projectous.com/test-tasks');
        const { tasks } = await response.json();
        commit(FETCH_TASKS, tasks);
        return tasks;
    }
};
//# sourceMappingURL=actions.js.map