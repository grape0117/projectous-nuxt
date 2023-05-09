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
    let result = this._vm
      .$http()
      .post('/' + module, data)
      .then((response: any) => {
        dispatch('PROCESS_INCOMING_DATA', response)
        return response
      })

    return result
  },
  UPSERT({ dispatch, commit, state }, { module, entity }: any) {
    if (!state[module]) {
      console.error('Module ' + module + ' not found.')
      return
    }

    // @ts-ignore
    let key = state[module].lookup[entity.id]
    // @ts-ignore
    const isUpdate = state[module][module].findIndex(item => item.id == entity.id) >= 0
    if (isUpdate) {
      dispatch('UPDATE', { module, entity })
    } else {
      return dispatch('ADD_ONE', { module, entity }).then((result: any) => result)
    }
  },
  UPDATE({ commit, dispatch }, { module, entity }) {
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
    let result = this._vm
      .$http()
      .patch('/' + module + '/', id, { attribute, value })
      .then((response: any) => {
        //TODO: Not sure we need double commits. What happens if the value is updated on the backend?
        commit('UPDATE_ATTRIBUTE', { module: module, id: id, attribute: attribute, value: response[module][attribute] })
        return response
      })
    return result
  },
  UPDATE_SETTING({ commit, dispatch }, { module, id, setting, value }) {
    commit('UPDATE_SETTING', { module: module, id: id, setting: setting, value: value })
    // @ts-ignore
    let result = this._vm
      .$http()
      .patch('/' + module + '/', id, { setting, value })
      .then((response: any) => {
        //TODO: Not sure we need double commits. What happens if the value is updated on the backend?
        commit('UPDATE_SETTING', { module: module, id: id, setting: setting, value: response[module][setting] })
        return response
      })
    return result
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
          case 'unread_messages_num':
            rootState.settings.unread_messages_num = data[module]
            break
          case 'current_company_id':
            rootState.settings.current_company_id = data[module]
            break
          case 'user_id':
            rootState.settings.current_user_id = data[module]
            break
          case 'current_company_user_id':
            rootState.settings.current_company_user_id = data[module]
            break
          case 'my_tasks':
            rootState.tasks.my_tasks = data[module]
            break
          case 'new_task':
            rootState.tasks.my_tasks = [data[module], ...rootState.tasks.my_tasks]
            break
          case 'updated_task':
            const task_index = rootState.tasks.my_tasks.findIndex((task: any) => task.id === data[module].id)
            const new_my_task_list = [...rootState.tasks.my_tasks]
            new_my_task_list[task_index] = data[module]
            rootState.tasks.my_tasks = new_my_task_list
            break
          case 'today_tasks':
            rootState.tasks.today_tasks = data[module]
            break
          case 'past_due_tasks':
            rootState.tasks.past_due_tasks = data[module]
            break
          case 'others_tasks':
            rootState.tasks.others_tasks = data[module]
            break
          case 'all_tasks':
            rootState.tasks.all_tasks = data[module]
            break
          case 'other_timers':
            rootState.timers.other_timers = data[module]
            break
          case 'last_poll_timestamp':
            window.sessionStorage.last_poll_timestamp = data[module]
            break
          default:
          //console.error('Incoming data not being loaded: ', module, data[module])
        }
      }
    }
  },
  GET_NEW_DATA({ dispatch }) {
    // @ts-ignore
    this._vm
      .$http()
      .get('/get-new-data/' + window.sessionStorage.last_poll_timestamp)
      // @ts-ignore
      .then(response => {
        // @ts-ignore

        dispatch('PROCESS_INCOMING_DATA', response)
      })
  }
}
