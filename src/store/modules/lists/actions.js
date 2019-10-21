import { FETCH_TASKS } from './mutations-types'
export const actions = {
  async fetchTasks({ commit }) {
    // @ts-ignore
    const { user_tasks, tasks } = await this._vm.$http().fetch('/test-tasks')
    commit(FETCH_TASKS, { userTasks: user_tasks, allTasks: tasks })
    return user_tasks
  },
  /*  async addNewTask(
      { commit }: any,
      { listName, taskName, index }: any
    ): Promise<ITask> {
      //create uuid
      commit(ADD_TASK, task)
      const {task} = await this._vm
          .$http()
          .post('tasks', {listName, taskName, index})
      commit(SAVE_TASK_BY_UUID)
      return task
      },*/
  async updateTask({ commit, state }, task) {
    console.log('SEND TO REQUEST CHANGE ORDER')
    console.log(task)
  }
}
//# sourceMappingURL=actions.js.map
