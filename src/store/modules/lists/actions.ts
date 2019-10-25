import { ActionTree } from 'vuex'
import { IListsState } from '../lists/types'
import { ITask } from '../tasks/types'
import { IRootState } from '@/store/types'
import { ADD_TASK, FETCH_TASKS } from './mutations-types'

export const actions: ActionTree<IListsState, IRootState> = {
  async fetchTasks({ commit }) {
    const {
      task_users,
      tasks,
      company_users,
      projects,
      project_users
      // @ts-ignore
    } = await this._vm.$http().fetch('/test-tasks')
    console.log(task_users)
    commit(FETCH_TASKS, { task_users: task_users, allTasks: tasks })
    commit(
      'ADD_MANY',
      { module: 'user_tasks', entities: task_users },
      { root: true }
    )
    commit(
      'ADD_MANY',
      { module: 'projects', entities: projects },
      { root: true }
    )
    commit(
      'ADD_MANY',
      { module: 'project_users', entities: project_users },
      { root: true }
    )
    commit(
      'ADD_MANY',
      { module: 'company_users', entities: company_users },
      { root: true }
    )
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
  async updateTask({ commit }, task): Promise<any> {
    console.log(task)
    console.log('SEND TO REQUEST CHANGE ORDER')
  }
}
