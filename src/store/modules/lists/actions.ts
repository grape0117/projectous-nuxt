import { ActionTree } from 'vuex'
import { IListsState } from '../lists/types'
import { ITask } from '../tasks/types'
import { IRootState } from '@/store/types'
import { ADD_TASK, FETCH_TASKS } from './mutations-types'

export const actions: ActionTree<IListsState, IRootState> = {
  async fetchTasks({ commit }): Promise<ITask[]> {
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
  async updateTask({ commit, state }, task): Promise<any> {
    console.log('SEND TO REQUEST CHANGE ORDER')
    console.log(task)
  }
}
