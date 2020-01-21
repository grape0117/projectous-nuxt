import { MutationTree } from 'vuex'
import { IRootState } from './types'
import Vue from 'vue'

export const mutations: MutationTree<IRootState> = {
  ADD_MANY(state: IRootState, { module, entities }: any) {
    console.log('ADD_MANY ' + module)
    if (!state[module]) return
    //@ts-ignore
    entities.forEach((value, key) => {
      //@ts-ignore
      if (!state[module].lookup[entities[key].id]) {
        //@ts-ignore
        state[module][module].push(value)
      } else {
        //@ts-ignore
        state[module][module][state[module].lookup[entities[key].id]] = value
      }
    })
    //@ts-ignore
    state[module].lookup = []
    //@ts-ignore
    state[module][module].forEach((item, key) => {
      //@ts-ignore
      state[module].lookup[item.id] = key
    })
  },
  ADD_ONE(state: IRootState, { module, entity }) {
    if (!state[module]) return
    //@ts-ignore
    state[module][module].push(entity)

    //@Mikhail is there a faster way to find the index? Can I search from the bottom of the array first?
    //@ts-ignore
    state[module][module].forEach((item, key) => {
      state[module].lookup[item.id] = key
    })
  },
  UPSERT(state: IRootState, { module, entity }: any) {
    if (!state[module]) return
    let property
    let key
    // @ts-ignore
    key = state[module].lookup[entity.id]
    if (key && state[module][key]) {
      //TODO: call 'UPDATE' here? How to share key?
      for (property in entity) {
        if (entity.hasOwnProperty(property)) {
          // @ts-ignore
          state[module][key][property] = entity[property]
        }
      }
    } else {
      // @ts-ignore
      this.commit('ADD_ONE', { entity: entity, module: module })
    }
  },
  UPDATE(state: IRootState, { module, entity }) {
    if (!state[module]) return
    let key = state[module].lookup[entity.id]
    if (key) {
      for (let property in entity) {
        if (entity.hasOwnProperty(property)) {
          // @ts-ignore
          state[module][key][property] = project[property]
        }
      }
    }
  },
  UPDATE_ATTRIBUTE(
    state: IRootState,
    { module, id: number, attribute: string, value }
  ) {
    if (!state[module]) return
    // @ts-ignore
    state[module][state[module].lookup[id]][attribute] = value
  },
  DELETE(state: IRootState, { module, entity }) {
    console.log(state.task_users, module, state['task_users'], state[module])
    if (!state[module].lookup[entity.id]) return
    // @ts-ignore
    Vue.delete(state[module][module], state[module].lookup[entity.id])
    // @ts-ignore
    Vue.delete(state[module].lookup, entity.id)
    //TODO: what to do with project_tasks and project_users
  },
  uuid_to_id(state: IRootState, { module, uuid, id }) {
    let index = state[module].lookup[uuid]
    state[module][module][index].id = id
    state[module].lookup[id] = state[module].lookup[uuid]
    //TODO: do we need to delete from lookup? Doesn't seem to matter
  }
}
