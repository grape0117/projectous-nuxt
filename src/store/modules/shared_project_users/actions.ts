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
    default_user_rate: null
  }
}

export const actions: ActionTree<IModuleState, IRootState> = {
  createTaskUser({ dispatch }, { project_id, company_user_id }: IProjectUser) {
    const project_user = {
      ...creteDefaultProjectUser(project_id),
      company_user_id
    }
    // @ts-ignore
    dispatch('ADD_ONE', { module: 'shared_project_users', entity: project_user })
  }
}
