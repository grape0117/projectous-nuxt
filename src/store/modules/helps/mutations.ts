import { MutationTree } from 'vuex'
import Vue from 'vue'
import { IModuleState } from './types'

export const mutations: MutationTree<IModuleState> = {
  addNewHelp(state: IModuleState, help) {
    //@ts-ignore
    state.helps = [...state.helps, help]
  }
}
