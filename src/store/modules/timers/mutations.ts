// @ts-ignore
import { MutationTree } from 'vuex'
import { IModuleState, ITimer } from './types'
import Vue from 'vue'

export const mutations: MutationTree<IModuleState> = {
  updateTimer(state: IModuleState, timer: ITimer) {
    let oldTimers = [...state.timers]
    let updatedTimerIndex = oldTimers.findIndex(({ id }) => id == timer.id)
    if (updatedTimerIndex >= 0) {
      oldTimers[updatedTimerIndex] = timer
      state.timers = oldTimers
    } else {
      let newTimers = [timer, ...oldTimers]
      state.timers = newTimers
    }
  }
}
