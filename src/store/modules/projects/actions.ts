import { ActionTree } from 'vuex'
import { IModuleState } from './types'
import { IRootState } from '@/store/types'
import { IProject } from '@/store/modules/projects/types'
import { generateUniqId } from '@/utils/util-functions'

export const actions: ActionTree<IModuleState, IRootState> = {
  loadByProjectId({}, id) {
    // @ts-ignore
    const tasks = this._vm.$http().get('/tasks?project_id=' + id)
    this.commit('tasks/ADD_MANY', tasks)
  },
  async pinProject({ commit, state }, { id, userId }) {
    const { projects, lookup } = state
    const { name } = projects[lookup[id]]
    const userList = {
      group: 'User Lists',
      id: name,
      title: name,
      userId
    }
    commit('projects/PIN_PROJECT', id)
    commit('lists/lists/ADD_NEW_LIST', userList, { root: true })
    // Todo: @Stephane added this http request to send id of pinned project
    // @ts-ignore
    // const response = await this._vm
    //   .$http()
    //   .post('/project-user/', { project_id: id })
  }
  /*saveProject({ commit, state, rootState }: any, { project, project_users }: any) {
    // @ts-ignore
    this._vm.$http().put('/projects/', project.id, { project, project_users })

    commit('UPSERT', { module: 'projects', entity: project }, { root: true })

    project_users.forEach((project_user: any) => {
      //if(!isNaN(task_user.id - parseFloat(task_user.id))) { //jQuery implementation of is_numeric: https://stackoverflow.com/a/21070520/193930
      if (!project_user.user_checked) {
        console.log('forget / delete from edit', project_user)
        commit('DELETE', { module: 'project_users', entity: project_user }, { root: true })
      } else {
        console.log('upsert from edit', project_user)
        commit('UPSERT', { module: 'project_users', entity: project_user }, { root: true })
      }
      //}
    })
  }*/
}
