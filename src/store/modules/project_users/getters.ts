import { GetterTree } from 'vuex'
import { IRootState } from '@/store/types'
import { IModuleState } from './types'
import { setToMidnight, localDate } from '@/utils/dateFunctions'
import { getListId } from '@/utils/util-functions'

export const getters: GetterTree<IModuleState, IRootState> = {
  getById: (state: IModuleState) => (id: any) => {
    return state.task_users[state.lookup[id]]
  }
}
