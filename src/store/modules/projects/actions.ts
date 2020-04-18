import { ActionTree } from 'vuex'
import { IModuleState } from './types'
import { IRootState } from '@/store/types'
import { IProject } from '@/store/modules/projects/types'
import { generateUniqId } from '@/utils/util-functions'

export const actions: ActionTree<IModuleState, IRootState> = {
  async add({ commit }: { commit: any }, project: IProject) {
    //@Mikhail I want to queue requests that fail
    // @ts-ignore
    //const response = await this._vm.$http().fetch('/projects/add', project)
    //@Mikhail should I commit twice? Once before request and once after in case backend changes some of the data? Or should all updates come via websocket connection?
    //commit('upsert', response.project)
  },
  async save({ commit, dispatch }: { commit: any; dispatch: any }, project: IProject) {
    // @ts-ignore
    //const response = await this._vm.$http().post('/projects/save', project) //@Mikhail I always get confused with singular plural
    //dispatch('update', response.project)
    //context.dispatch('settings/closeModal', { modal: 'project', object: project, pop: true, push: false }, { root: true });
    //context.commit('settings/setCheckActionStack', true, { root: true });
  },
  async updateAttribue({ commit }: { commit: any }, { attribute, value, project_id }: { attribute: string; value: any; project_id: number }) {
    // @ts-ignore
    const response = await this._vm.$http().put('/projects/' + project_id + 'updateAttribute', { attribute, value })
    commit('updateAttribute', { project_id, attribute, value }) //@Mikhail should I get values from response?
  },
  async delete() {},
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
  },
  saveProject({ commit, state, rootState }: any, { project, project_users }: any) {
    // @ts-ignore
    this._vm.$http().put('/projects/' + project.id, { project, project_users })

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
  }
}
