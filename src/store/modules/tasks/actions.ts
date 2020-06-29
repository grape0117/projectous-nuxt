// @ts-ignore
import { ActionTree } from 'vuex'
import { IModuleState, ITask } from './types'
import { IRootState } from '@/store/types'
// @ts-ignore
import { generateUUID } from '@/utils/util-functions'
import uuid from 'uuid'
import { IProject } from '@/store/modules/projects/types'
import { ITaskUser } from '@/store/modules/task_users/types'

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
    settings: {}
  }
}

export const actions: ActionTree<IModuleState, IRootState> = {
  async createTask({ commit, getters }: any, { title, project_id, sort_order, status, temp }: any) {
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
        //id: generateUUID(),
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
    } else {
      //TODO: should we do this? task.id = uuid.v4();
      // @ts-ignore
      newTask = (await this._vm.$http().post('/tasks', { task })).task
      commit('removeTempTasks')
    }
    commit('ADD_ONE', { module: 'tasks', entity: newTask }, { root: true })
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
  async UPDATE_TITLE({ rootGetters, dispatch, rootState }, { id, title }) {
    const task = rootGetters['tasks/getById'](id)
    console.log('update title', id, task, title)

    //TODO: Check for @mention

    //Check for ABC:
    const projectRegex = /^([A-Z]+):\s*/ //TODO: fix the :[:space] not being captured
    const acronym_match = title.match(projectRegex)
    console.log(acronym_match)

    // We have an acronym. Look for a matching project
    if (acronym_match && acronym_match[1]) {
      const projects_by_acronym = rootState.projects.projects.filter((project: IProject) => project.acronym === acronym_match[1])
      if (projects_by_acronym.length === 1) {
        //TODO: update history
        dispatch('UPDATE_ATTRIBUTE', { module: 'tasks', id, attribute: 'project_id', value: projects_by_acronym[0].id }, { root: true })
        console.log('match found: ', projects_by_acronym[0].name)
        title = title.replace(acronym_match[0], '')
      }
    }
    //TODO: only get assigned projects

    /*      const initialRegex = /.*!/
      let regexString = ".*"
      acronym_match[1].split("").forEach( (char: string) => {
        regexString += '('+char + ").*"
      })
      console.log(regexString)
      const regex = new RegExp(regexString, "g");
      let match_by_initial
      const projects_by_initial = rootState.projects.projects.filter((project: IProject) => {
          match_by_initial = project.name.match(regex)
          console.log('match_by_initial', match_by_initial)
          return match_by_initial ? match_by_initial.length == acronym_match[1].length : false
      })

      if(projects_by_initial.length === 1){
          console.log('deep match found: ', projects_by_initial[0].name)
      }*/
    //TODO: remove ABC: string
    dispatch('UPDATE_ATTRIBUTE', { module: 'tasks', id, attribute: 'title', value: title }, { root: true })
  },
  async updateTask({ commit }: any, task: any) {
    // @ts-ignore
    await this._vm.$http().post('/tasks/' + task.id, { task })
    // TODO @stephane send task to server
    commit('UPSERT', { module: 'tasks', entity: task }, { root: true })
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
  }
}
