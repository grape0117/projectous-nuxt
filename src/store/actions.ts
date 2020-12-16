import { IRootState } from '@/store/types'
import { ActionTree } from 'vuex'

export const actions: ActionTree<IRootState, IRootState> = {
  // SET_CURRENT_USER({ commit }, user_id) {
  //   commit('SET_CURRENT_USER', user_id)
  // },
  ADD_MANY({ commit, dispatch }, { module, entities }) {
    //TODO: rename to load?
    commit('ADD_MANY', { module, entities })
  },
  ADD_ONE({ commit, dispatch }, { module, entity }: { module: string; entity: any }) {
    //TODO: rename to create?
    commit('ADD_ONE', { module, entity })

    let data = {}
    // @ts-ignore
    data[module] = entity
    // @ts-ignore
    this._vm
      .$http()
      .post('/' + module, data)
      .then((response: any) => {
        dispatch('PROCESS_INCOMING_DATA', response)
      })
  },
  UPSERT({ dispatch, commit, state }, { module, entity }: any) {
    console.log('UPSERT ACTION', module, entity)

    if (!state[module]) {
      console.error('Module ' + module + ' not found.')
      return
    }

    console.log('MY CONSOLE.LOG')
    console.log(state[module])

    // console.log(state.client_users.lookup)
    // @ts-ignore
    let key = state[module].lookup[entity.id]
    console.log('key', key, state[module][module][key])

    if (state[module][module][key]) {
      dispatch('UPDATE', { module, entity })
    } else {
      dispatch('ADD_ONE', { module, entity })
    }
  },
  UPDATE({ commit, dispatch }, { module, entity }) {
    console.log('update entity', entity)
    commit('UPDATE', { module, entity })
    // @ts-ignore
    this._vm
      .$http()
      .put('/' + module + '/', entity.id, entity)
      .then((response: any) => {
        dispatch('PROCESS_INCOMING_DATA', response.data)
      })
  },
  UPDATE_ATTRIBUTE({ commit, dispatch }, { module, id, attribute, value }) {
    commit('UPDATE_ATTRIBUTE', { module: module, id: id, attribute: attribute, value: value })
    // @ts-ignore
    this._vm
      .$http()
      .patch('/' + module + '/', id, { attribute, value })
      .then((response: any) => {
        dispatch('PROCESS_INCOMING_DATA', response)
      })
  },

  /**
   * Dispatch cascade deletes, commit delete then send delete to backend
   */
  DELETE({ dispatch, commit }, { module, entity }) {
    // @ts-ignore
    if (this._actions[module + '/CASCADE_DELETE']) {
      // @ts-ignore
      dispatch(module + '/CASCADE_DELETE', entity)
    }

    commit('DELETE', { module, entity })

    // @ts-ignore
    this._vm.$http().delete('/' + module + '/', entity.id)
  },
  PROCESS_INCOMING_DATA({ commit, rootState }, data) {
    // console.log('PROCESS_INCOMING_DATA', data)
    // @ts-ignore
    for (const module in data) {
      if (rootState[module]) {
        if (Array.isArray(data[module])) {
          if (data[module].length) {
            commit('ADD_MANY', { module, entities: data[module] })
          }
        } else if (data[module].deleted_at === null) {
          commit('UPSERT', { module, entity: data[module] })
        } else {
          commit('DELETE', { module, entity: data[module] })
        }
      } else {
        switch (module) {
          //TODO: store in IndexedDB
          case 'current_company_id':
            rootState.settings.current_company_id = data[module]
            break
          case 'user_id':
            rootState.settings.current_user_id = data[module]
            break
          case 'current_company_user_id':
            rootState.settings.current_company_user_id = data[module]
            break
          case 'last_poll_timestamp':
            window.sessionStorage.last_poll_timestamp = data[module]
            break
          default:
          //console.error('Incoming data not being loaded: ', module, data[module])
        }
      }
    }
  }
}
