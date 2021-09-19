import { MutationTree } from 'vuex'
import { IRootState } from './types'
import Vue from 'vue'
import { idbKeyval } from '@/plugins/idb'
import { has } from 'lodash'

export const mutations: MutationTree<IRootState> = {
  // async SET_CURRENT_USER(state: IRootState, user_id: number) {
  //   state.current_user = await user_id
  // },
  /**
   * Adds multiple entities all stores checking for duplicates, updating lookup tables as needed.
   * @param {IRootState} state
   * @param {any} module
   * @param {any} entities
   * @constructor
   */
  async ADD_MANY(state: IRootState, { module, entities }: any) {
    // console.log('ADD_MANY ' + module)
    if (!state[module]) {
      console.error('Module ' + module + ' does not exist.')
      return
    }
    //console.log(module, entities)
    //@ts-ignore
    entities.forEach((entity, index) => {
      try {
        if (entity.deleted_at == null) {
          //@ts-ignore
          if (typeof state[module].lookup[entities[index].id] == 'undefined') {
            // console.log(entities[index], 'not found', state[module].lookup)
            //@ts-ignore
            state[module][module].push(entity)
          } else {
            // console.log('ADD_MANY entity found', state[module].lookup[entities[index].id], entity, state[module][module])
            //@ts-ignore
            let key = state[module].lookup[entities[index].id]
            for (let property in entity) {
              if (entity.hasOwnProperty(property)) {
                // @ts-ignore
                Vue.set(state[module][module][key], property, entity[property])
              }
            }
          }

          // @ts-ignore
          this.commit('updateCreateIndexDBEntity', { module, entity })
        } else {
          // @ts-ignore
          this.commit('DELETE', { module, entity })
        }
      } catch (e) {
        console.error(e, module, index, entity)
      }
    })

    // @ts-ignore
    this.commit('LOOKUP', { module })

    state.loading = false

    // @ts-ignore
    if (this._mutations[module + '/ADD_MANY']) {
      // @ts-ignore
      this.commit(module + '/ADD_MANY', entities)
    }
  },

  /**
   * Adds an entity to all stores, updating lookup tables as needed.
   * Does NOT check for existing entities.
   * @param {IRootState} state
   * @param {any} module
   * @param {any} entity
   * @constructor
   */
  ADD_ONE(state: IRootState, { module, entity }) {
    console.log('ADD_ONE')
    if (!state[module]) return
    //@ts-ignore
    state[module][module].push(entity)

    //@Mikhail is there a faster way to find the index? Can I search from the bottom of the array first?
    //@ts-ignore
    console.log(state[module][module])
    //TODO: call LOOKUP
    state[module][module].forEach((item: any, key: any) => {
      state[module].lookup[item.id] = key
    })

    // @ts-ignore
    if (this._mutations[module + '/ADD_ONE']) {
      // @ts-ignore
      this.commit(module + '/ADD_ONE', entity)
    }

    // @ts-ignore
    this.commit('updateCreateIndexDBEntity', { module, entity })
  },

  /**
   * Adds an entity to all stores, updating lookup tables as needed.
   * If a duplicate is found, it updates instead.
   * @param {IRootState} state
   * @param {any} module
   * @param {any} entity
   * @constructor
   */
  UPSERT(state: IRootState, { module, entity }: any) {
    console.log('UPSERT', module, entity)
    if (!state[module]) return
    //console.log('module exists')
    // @ts-ignore
    let key = state[module].lookup[entity.id]
    console.log('key', key)
    console.log(state[module][module][key])
    if (state[module][module][key]) {
      //TODO: call 'UPDATE' here? How to share key?
      for (let property in entity) {
        if (entity.hasOwnProperty(property)) {
          // @ts-ignore
          state[module][module][key][property] = entity[property]
        }
      }
    } else {
      // @ts-ignore
      this.commit('ADD_ONE', { entity: entity, module: module })
    }
    console.log('done')
    console.log(state[module][module])

    // @ts-ignore
    if (this._mutations[module + '/UPSERT']) {
      // @ts-ignore
      this.commit(module + '/UPSERT', entities)
    }

    // @ts-ignore
    this.commit('updateCreateIndexDBEntity', { module, entity })
  },

  /**
   * Updates entity if it exists.
   * @param {IRootState} state
   * @param {any} module
   * @param {any} entity
   * @constructor
   */
  UPDATE(state: IRootState, { module, entity }) {
    console.log('UPDATE', module, entity)
    if (!state[module]) {
      console.log('Module ' + module + ' not found!')
      return
    }
    let modulestate = state[module]
    let key = modulestate.lookup[entity.id]
    if (!modulestate[module][key]) {
      console.log('UPDATE: entity not found in ' + module + ' lookup', entity.id, modulestate.lookup)
      return
    }
    if (modulestate[module][key].id !== entity.id) {
      console.log('mismatched ids!')
      return
    }
    if (key >= 0) {
      for (let property in entity) {
        if (entity.hasOwnProperty(property)) {
          //TODO likely unneeded
          if (!has(modulestate[module][key], property)) {
            console.log('Error: Property not found: ' + property, modulestate[module][key])
            continue
          }
          // @ts-ignore
          Vue.set(modulestate[module][key], property, entity[property])
        }
      }
    }

    // @ts-ignore
    this.commit('updateCreateIndexDBEntity', { module, entity })

    // @ts-ignore
    if (this._mutations[module + '/UPDATE']) {
      // @ts-ignore
      this.commit(module + '/UPDATE', entities)
    }
  },
  UPDATE_ATTRIBUTE(state: IRootState, { module, id, attribute, value }) {
    if (!state[module]) return
    console.log('lookup', id, state[module].lookup[id])
    // @ts-ignore
    state[module][module][state[module].lookup[id]][attribute] = value

    // @ts-ignore
    this.commit('updateCreateIndexDBEntity', { module, entity: state[module][module][state[module].lookup[id]] })
  },

  /**
   * Deletes from all stores (Vuex, IDB) including related items.
   *
   * @param {IRootState} state
   * @param {any} module
   * @param {any} entity
   * @constructor
   */
  DELETE(state: IRootState, { module, entity }) {
    //@Mikhail not sure if I should use deleted_at. I'm wondering if it's faster and better to not change the keys
    // const lookup: any = {}
    // for (let i = 0; i >= state.task_users.length; i++) {
    //   if (state.task_users[i].uuid !== task_user.uuid) {
    //     lookup[i] = state.task_users[i].uuid
    //   } else {
    //     state.task_users.slice(i, 1)
    //   }
    // }
    // state.lookup = lookup
    // @Stephane I implemented it like this for now, later we can change
    /*state.task_users = state.task_users.filter(
            ({ id }: any) => id !== task_user.id
        )*/

    // CASCADE delete first
    // @ts-ignore
    if (this._mutations[module + '/DELETE']) {
      // @ts-ignore
      this.commit(module + '/DELETE', entity)
    }

    if (typeof state[module].lookup[entity.id] == 'undefined') return
    // @ts-ignore
    Vue.delete(state[module][module], state[module].lookup[entity.id])
    // @ts-ignore
    this.commit('LOOKUP', { module })
    // @ts-ignore
    if (this._mutations[module + '/CASCADE_DELETE']) {
      // @ts-ignore
      this.commit(module + '/CASCADE_DELETE', entity)
    }
    //Vue.delete(state[module].lookup, entity.id)
    //TODO: what to do with project_tasks and project_users

    // @ts-ignore
    this.commit('deleteIndexDBEntity', { module, id: entity.id })
  },

  /**
   * Loops through all module entities and creates a lookup table. Also creates related lookups as needed.
   * @param {IRootState} state
   * @param {any} module
   * @constructor
   */
  LOOKUP(state: IRootState, { module }) {
    state[module].lookup = {}
    state[module][module].forEach((item: any, key: any) => {
      // @ts-ignore
      state[module].lookup[item.id] = key
    })

    // @ts-ignore
    if (this._mutations[module + '/LOOKUP']) {
      // @ts-ignore
      this.commit(module + '/LOOKUP', state[module][module])
    }
  },
  /*  uuid_to_id(state: IRootState, { module, uuid, id }) {
    let index = state[module].lookup[uuid]
    state[module][module][index].id = id
    state[module].lookup[id] = state[module].lookup[uuid]
    //TODO: do we need to delete from lookup? Doesn't seem to matter
  },*/
  async updateCreateIndexDBEntity(state: IRootState, { module, entity }) {
    try {
      if (module === 'lists') {
        module = 'user_task_lists' //TODO: fix name
      }
      await idbKeyval.set(entity.id, entity, module)
    } catch (e) {
      console.log('+++++++++++++++++++')
      console.error(e, entity)
      console.log('+++++++++++++++++++')
    }
  },
  async deleteIndexDBEntity(state: IRootState, { module, id }) {
    await idbKeyval.delete(id, module)
  }
}
