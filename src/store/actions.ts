import { IRootState } from '@/store/types'
import { ActionTree } from 'vuex'

export const actions: ActionTree<IRootState, IRootState> = {
  ADD_MANY({ commit }, { module, entities }: any) {
    commit('ADD_MANY', { module, entities })
  },
  ADD_ONE({ commit }, { module, entity }) {
    commit('ADD_ONE', { module, entity })
  },
  UPSERT({ commit }, { module, entity }: any) {
    commit('UPSERT', { module, entity })
  },
  UPDATE({ commit }, { module, entity }) {
    commit('UPDATE', { module, entity })
  },
  UPDATE_ATTRIBUTE({ commit }, { module, id, attribute, value }) {
    commit('UPDATE_ATTRIBUTE', { module, id, attribute, value })
    // @ts-ignore
    this._vm.$http().patch('/' + module + '/', id, { attribute, value })
  },
  DELETE({ commit }, { module, entity }) {
    commit('DELETE', { module, entity })
    //TODO: what to do with project_tasks and project_users
  }
}
