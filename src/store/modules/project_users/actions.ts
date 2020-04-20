import { ActionTree } from 'vuex'
import { IModuleState, IProjectUser } from './types'
import { IRootState } from '@/store/types'
import { REMOVE_TEMP_TASKS_USER } from '@/store/modules/task_users/mutations-types'
import { generateUniqId } from '@/utils/util-functions'
import uuid from 'uuid'

function creteDefaultProjectUser(project_id: string): IProjectUser {
  return {
    id: uuid.v4(),
    company_user_id: null,
    role: '',
    project_id,
    user_rate: '0.00'
  }
}

export const actions: ActionTree<IModuleState, IRootState> = {
  createTaskUser({ commit }, { project_id, company_user_id }: IProjectUser) {
    const project_user = {
      ...creteDefaultProjectUser(project_id),
      company_user_id
    }
    // @ts-ignore
    this._vm.$http().post('/project-users', project_user)
    commit('ADD_ONE', { module: 'project_users', entity: project_user }, { root: true })
  }
}
