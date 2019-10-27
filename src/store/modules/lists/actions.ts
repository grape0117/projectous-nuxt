import { ActionTree } from 'vuex'
import { IListsState } from '../lists/types'
import { IRootState } from '@/store/types'
import { FETCH_TASKS } from './mutations-types'

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
    // commit(
    //   'ADD_MANY',
    //   { module: 'task_users', entities: task_users },
    //   { root: true }
    // )
    // commit('ADD_MANY', { module: 'tasks', entities: tasks }, { root: true })
    // commit(
    //   'ADD_MANY',
    //   { module: 'projects', entities: projects },
    //   { root: true }
    // )
    commit(FETCH_TASKS, { task_users, allTasks: tasks })
    /*commit(
        'ADD_MANY',
        { module: 'project_users', entities: project_users },
        { root: true }
      )*/
    commit(
      'ADD_MANY',
      { module: 'companyUsers', entities: company_users },
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
  async moveTask({ commit }, { element, newIndex, list }): Promise<any> {
    element.sort_order = newIndex
    element.next_work_day = list
    console.log(element, newIndex, list)

    commit('UPDATE', { module: 'task_users', entity: element }, { root: true })
    //@ts-ignore
    await this._vm.$http().put('/task_users/move-to-list', element.id, {
      task: element,
      sort_order: newIndex,
      list: list
    })
    console.log(element)
    console.log('SEND TO REQUEST CHANGE ORDER')
  }
}
