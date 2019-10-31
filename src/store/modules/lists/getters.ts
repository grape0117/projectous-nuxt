import { GetterTree } from 'vuex'
import { IRootState } from '@/store/types'
import { IListsState } from './types'

export const getters: GetterTree<IListsState, IRootState> = {
  filterListsByUserId: (state: IListsState) => (userId: number) => {
    return state.lists.map(({ name, id, tasks }) => ({
      name,
      id,
      tasks: tasks.filter(({ company_user_id }) => company_user_id === userId)
    }))
  }
}
