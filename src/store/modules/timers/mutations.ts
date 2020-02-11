// @ts-ignore
import { MutationTree } from 'vuex'
import { IModuleState, ITimer } from './types'
import Vue from 'vue'

export const mutations: MutationTree<IModuleState> = {
  load(state, timers) {
    //console.log(state);
    Vue.set(state, 'timers', [])
    // @ts-ignore
    timers.forEach((value, key) => {
      if (!state.lookup[timers[key].id]) {
        state.timers.push(value)
      } else {
        state.timers[state.lookup[timers[key].id]] = value
      }
    })

    // @ts-ignore
    this.commit('LOOKUP', { module: 'timers' })
  },
  upsert(state, object) {
    let table = 'timers'

    let key = state.lookup[object.id]
    if (key) {
      console.log('key found')
      //Loop through properties
      for (let property in object) {
        if (object.hasOwnProperty(property)) {
          // @ts-ignore
          state[table][key][property] = object[property]
        }
      }
    } else {
      // @ts-ignore
      state[table].push(object)
      //TODO: I'm tempted to use state[table].length - 1, but maybe if elements are removed, they key won't match the length.
      // @ts-ignore
      state.lookup[object.id] = state[table].findIndex((item: any) => {
        return item.id == object.id
      })
    }
  },
  upsertTimer(state, timer) {
    let index = state.timers.findIndex((search: any) => {
      if (search)
        //Things break hard without this after deleting a timer
        return search.id == timer.id
    })

    if (index !== -1) {
      console.log(index)
      console.log(timer)
      Vue.set(state.timers, index, JSON.parse(JSON.stringify(timer)))
    } else {
      console.log(timer)
      state.timers.unshift(timer)
      //TODO: rekey lookup
    }
  },
  updateTimer: function(state, timer) {
    let index = state.timers.findIndex((search: any) => {
      if (search)
        //Things break hard without this after deleting a timer
        return search.id == timer.id
    })

    if (index !== -1) {
      Vue.set(state.timers, index, JSON.parse(JSON.stringify(timer)))
    }
  },
  deleteTimer: function(state, timer_id) {
    console.log(state.timers)
    let index = state.timers.findIndex((search: any) => {
      if (search)
        //Things break hard without this after deleting a timer
        return search.id == timer_id
    })

    console.log(index)
    if (index !== -1) {
      console.log(state.timers[index])
      Vue.delete(state.timers, index)
    }
  }
}
