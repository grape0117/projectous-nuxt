import { MutationTree } from 'vuex'
import { IModuleState, IProject } from '@/store/modules/projects/types'
import Vue from 'vue'
import {
  ADD_PROJECTS,
  UPSERT_PROJECT,
  DELETE_PROJECT,
  UPDATE_PROJECT,
  UPDATE_PROJECT_ATTRIBUTE,
  ADD_PROJECT
} from '@/store/modules/projects/mutations-types'

export const mutations: MutationTree<IModuleState> = {
  ['ADD_MANY'](state: IModuleState, { module, entities }: any) {
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
  ['ADD_ONE'](state: IModuleState, entity: IProject) {
    //@ts-ignore
    state[rows].push(entity)

    //@Mikhail is there a faster way to find the index? Can I search from the bottom of the array first?
    //@ts-ignore
    state[rows].forEach((item, key) => {
      state.lookup[item.id] = key
    })
  },
  ['UPSERT'](state: IModuleState, { module, entity }: any) {
    let property
    let key
    // @ts-ignore
    key = state[module].lookup[entity.id]
    if (key) {
      for (property in entity) {
        if (entity.hasOwnProperty(property)) {
          // @ts-ignore
          state[module][key][property] = project[property]
        }
      }
    } else {
      // @ts-ignore
      this.commit('ADD_ONE', { entity: entity, module: module })
    }
  },
  ['UPDATE_ATTRIBUTE'](
    state: IModuleState,
    { module, id: number, attribute: string, value }
  ) {
    // @ts-ignore
    state[module][state[module].lookup[id]][attribute] = value
  },
  ['DELETE'](state: IModuleState, { module, entity }) {
    // @ts-ignore
    Vue.delete(state[module], state[module].lookup[entity.id])
    // @ts-ignore
    Vue.delete(state[module].lookup, entity.id)
    //TODO: what to do with project_tasks and project_users
  }
}
