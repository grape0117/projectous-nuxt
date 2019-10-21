import { GetterTree } from 'vuex'
import { IRootState } from '@/store/types'
import { IListsState } from './types'

export const getters: GetterTree<IListsState, IRootState> = {
  getTaskById(state: IListsState) {
    return (id: string) => {
      return state.allTasks.find(task => task.id === id)
    }
  }
}
