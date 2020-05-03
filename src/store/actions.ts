import { IRootState } from '@/store/types'
import { ActionTree } from 'vuex'

export const actions: ActionTree<IRootState, IRootState> = {
  ADD_MANY({ commit }, { module, entities }: any) {
    commit('ADD_MANY', { module, entities })
  },
  ADD_ONE({ commit }, { module, entity }) {
    commit('ADD_ONE', { module, entity })
  },
  UPSERT({ commit, state }, { module, entity }: any) {
    console.log('UPSERT ACTION', module, entity)
    if (!state[module]) return
    // @ts-ignore
    let key = state[module].lookup[entity.id]
    console.log('key', key, state[module][module][key])
    if (state[module][module][key]) {
      commit('UPDATE', { module: module, entity: entity })
      // @ts-ignore
      this._vm
        .$http()
        .put('/' + module + '/', entity.id, entity)
        .then(response => {
          console.log('UPDATE API RETURN', response)
        })
    } else {
      commit('ADD_ONE', { module: module, entity: entity })
      // @ts-ignore
      this._vm
        .$http()
        .post('/' + module, entity)
        .then(response => {
          console.log('CREATE API RETURN', response)
        })
      //TODO: merge data from backend?
    }
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
