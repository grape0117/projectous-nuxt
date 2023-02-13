// @ts-ignore
import { ActionTree } from 'vuex'
import { IModuleState, ITask } from './types'
import { IRootState } from '@/store/types'
// @ts-ignore
import { generateUUID } from '@/utils/util-functions'
import uuid from 'uuid'
import { IProject } from '@/store/modules/projects/types'
import { ITaskUser } from '@/store/modules/task_users/types'
import { idbKeyval, idbGetAll } from '@/plugins/idb.ts'

function createDefaultTask(): ITask {
  return {
    id: uuid.v4(),
    child_task_id: null,
    company_id: null,
    completed_at: null,
    created_by_company_user_id: null,
    detail: null,
    due_date: null,
    estimate: null,
    files: [],
    for_today: 0,
    messages: [],
    next_task_id: null,
    note: null,
    order: null,
    original_due_date: null,
    parent_task_id: null,
    previous_task_id: null,
    priority: 'active',
    priority_set_at: null,
    project_id: null,
    next_work_day: null,
    sort_order: 0,
    status: 'open',
    title: '',
    users: [],
    workflowy_id: null,
    settings: {},
    last_task_message_id: null,
    last_task_message_created_at: null
  }
}

export const actions: ActionTree<IModuleState, IRootState> = {
  async getBoardTasksFromIDB({ state }, project_id) {
    let tasks = await idbGetAll('tasks')

    state.tasks_by_project = tasks.filter((task: ITask) => (task.project_id = project_id))
  },
  async createTask({ commit, getters }: any, { title, project_id, sort_order, status, temp, users = [], owner, priority = 'active', due_date }: any) {
    const task = {
      ...createDefaultTask(),
      title,
      project_id,
      sort_order,
      status,
      users,
      owner,
      priority,
      due_date
    }
    let newTask
    if (temp) {
      newTask = {
        ...task,
        //id: generateUUID(),
        temp: true
      }
    } else {
      //TODO: should we do this? task.id = uuid.v4();
      // @ts-ignore
      newTask = (await this._vm.$http().post('/tasks', { task }))[0]
      // commit('removeTempTasks')
    }
    commit('ADD_ONE', { module: 'tasks', entity: newTask }, { root: true })
    return newTask
  },
  async createProjectTask({ commit, getters }: any, { title, project_id, sort_order, status, temp }: any) {
    const task = {
      ...createDefaultTask(),
      title,
      project_id,
      sort_order,
      status
    }
    let newTask
    if (temp) {
      newTask = {
        ...task,
        id: generateUUID(),
        temp: true
      }
      commit('ADD_ONE', { module: 'tasks', entity: newTask }, { root: true })
    } else {
      //TODO: should we do this? task.id = uuid.v4();
      // @ts-ignore
      newTask = (await this._vm.$http().post('/tasks', { task })).task
      commit('ADD_ONE', { module: 'tasks', entity: task }, { root: true })
      // commit('removeTempTasks')
    }

    return newTask
  },
  async createUserTask({ commit, getters }: any, { title, project_id, sort_order, status, temp }: any) {
    const task = {
      ...createDefaultTask(),
      title,
      project_id,
      sort_order,
      status
    }
    const userTask = {
      task_id: task.id
    }
    let newTask
    if (temp) {
      newTask = {
        ...task,
        id: generateUUID(),
        temp: true
      }
    } else {
      //TODO: should we do this? task.id = uuid.v4();
      // @ts-ignore
      newTask = (await this._vm.$http().post('/tasks', { task })).task
      commit('removeTempTasks')
    }
    commit('ADD_ONE', { module: 'tasks', entity: newTask }, { root: true })
    return newTask
  },
  async saveTask({ commit, state, rootState }: any, { task, task_users }: any) {
    console.log('last task edited', task, task_users)
    commit('UPSERT', { module: 'tasks', entity: task }, { root: true })

    task_users.forEach((task_user: any) => {
      //if(!isNaN(task_user.id - parseFloat(task_user.id))) { //jQuery implementation of is_numeric: https://stackoverflow.com/a/21070520/193930
      if (!task_user.user_checked) {
        console.log('forget / delete from edit', task_user)
        commit('DELETE', { module: 'task_users', entity: task_user }, { root: true })
      } else {
        console.log('upsert from edit', task_user)
        commit('UPSERT', { module: 'task_users', entity: task_user }, { root: true })
      }
      //}
    })

    // @ts-ignore
    const response = await this._vm.$http().post('/tasks/' + task.id, { task, task_users })
    /*console.log(response)
    for (let uuid in response.new_task_user_ids) {
      if (response.new_task_user_ids.hasOwnProperty(uuid)) {
        let id = response.new_task_user_ids[uuid]
        commit('uuid_to_id', { module: 'task_users', id, uuid }, { root: true })
      }
    }*/
  },
  async updateTask({ commit }: any, task: any) {
    // @ts-ignore
    await this._vm.$http().post('/tasks/' + task.id, { task })
    // TODO @stephane send task to server
    commit('UPSERT', { module: 'tasks', entity: task }, { root: true })
  },
  async updateChats({ commit }: any) {
    // @ts-ignore
    let { chats } = await this._vm.$http().get('/chats')
    commit('updateChats', chats)
  },
  async CASCADE_DELETE({ rootState, commit }, task) {
    rootState.task_users.task_users.forEach((task_user: ITaskUser) => {
      if (task_user.task_id === task.id) {
        // @ts-ignore
        this.commit('DELETE', { module: 'task_users', entity: task_user }, { root: true })
      }
    })
  },
  /**
   * @param commit - vuex mutation
   * @param { number[] } ids - list of tasks ids, where index is equal sort_order
   * @description: update tasks sort order
   */
  updateSortOrders({ commit }, ids) {
    // Todo: @stephane - create endpoint to update project_sort_order for tasks
    // ToDo: hook up indexDB
    commit('updateTasksSortOrders', ids)
    // @ts-ignore
    this._vm.$http().post('/tasks/sort_order', { ids: ids })
  },
  updateTaskTitle({ rootState, commit, dispatch, _getters }: any, { task_id, title }: any) {
    const userRegex = /^@{1,3}[a-zA-Z]+\s|\s@{1,3}[a-zA-Z]+\s|\s@{1,3}[a-zA-Z]+$|^@{1,3}[a-zA-Z]+/gm

    const titleMatch = title ? title.match(userRegex) : null
    console.log(titleMatch)

    if (titleMatch && titleMatch.length > 0) {
      const task_users = _getters['task_users/getByTaskId'](task_id)

      //get user by match
      const matchedCompanyUsers = _getters['company_users/getByAlias'](titleMatch[0])
      console.log('matched users', matchedCompanyUsers)
      //assigned vs reviewer vs manager
      const numAts = titleMatch[0].split('@').length - 1
      const role = numAts == 1 ? 'assigned' : numAts == 2 ? 'reviewer' : numAts == 3 ? 'manager' : 'something is wrong'
      //add task_user
      if (!task_users.find((task_user: ITaskUser) => task_user == matchedCompanyUsers)) {
        dispatch('ADD_ONE', {
          module: 'task_uses',
          entity: { role, id: uuid.v4(), task_id, company_user_id: matchedCompanyUsers }
        })
      }
      //remove @match from title
    }

    const projectRegex = /^([A-Z-]+):\s*/

    const acronym_match = title ? title.match(projectRegex) : null

    if (acronym_match && acronym_match[1]) {
      const projects_by_acronym = rootState.projects.projects.filter((project: any) => project.acronym === acronym_match[1])

      if (projects_by_acronym.length === 1) {
        title = title.replace(acronym_match[0], '')
        dispatch('UPDATE_ATTRIBUTE', { module: 'tasks', task_id, attribute: 'project_id', value: projects_by_acronym[0].id }, { root: true })
        dispatch('UPDATE_ATTRIBUTE', { module: 'tasks', task_id, attribute: 'title', value: title }, { root: true })
      }
    } else {
      this.dispatch('UPDATE_ATTRIBUTE', { module: 'tasks', task_id, attribute: 'title', value: title }, { root: true })
    }
  }
}
