import { MutationTree } from 'vuex'
import Vue from 'vue'
import { IModuleState } from './types'

export const mutations: MutationTree<IModuleState> = {
  addNewHelp(state: IModuleState, help) {
    //@ts-ignore
    state.helps = [...state.helps, help]
  },
  DELETE(state: IModuleState, entity) {
    //@ts-ignore
    let new_helps = state.helps.filter(help => help.id != entity.id)
    state.helps = [...new_helps]
  }
}
