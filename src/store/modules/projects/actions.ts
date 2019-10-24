import { ActionTree } from 'vuex'
import { IModuleState } from './types'
import { IRootState } from '@/store/types'
import { IProject } from '@/store/modules/projects/types'

export const actions: ActionTree<IModuleState, IRootState> = {
  async add({ commit }: { commit: any }, project: IProject) {
    //@Mikhail I want to queue requests that fail
    // @ts-ignore
    //const response = await this._vm.$http().fetch('/projects/add', project)
    //@Mikhail should I commit twice? Once before request and once after in case backend changes some of the data? Or should all updates come via websocket connection?
    //commit('upsert', response.project)
  },
  async save(
    { commit, dispatch }: { commit: any; dispatch: any },
    project: IProject
  ) {
    // @ts-ignore
    //const response = await this._vm.$http().post('/projects/save', project) //@Mikhail I always get confused with singular plural
    //dispatch('update', response.project)
    //context.dispatch('settings/closeModal', { modal: 'project', object: project, pop: true, push: false }, { root: true });
    //context.commit('settings/setCheckActionStack', true, { root: true });
  },
  async updateAttribue(
    { commit }: { commit: any },
    {
      attribute,
      value,
      project_id
    }: { attribute: string; value: any; project_id: number }
  ) {
    // @ts-ignore
    /*const response = await this._vm
      .$http()
      .put('/projects/' + project_id + 'updateAttribute', { attribute, value })
    commit('updateAttribute', { project_id, attribute, value }) //@Mikhail should I get values from response?*/
  },
  async delete() {}
}
