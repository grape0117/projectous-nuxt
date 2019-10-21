import Vue from 'vue'
import { IRootState } from '@/store/types'
import { IModuleState } from './types'
import { ITask } from '../tasks/types'
import { IProject } from '../projects/types'
import { Module, GetterTree, ActionTree } from 'vuex'
import { mutations } from './mutations'
import { actions } from './actions'
import { Getter } from 'vuex-class'

const state = {
  projects: [],
  lookup: {}
}

export const projects: Module<IModuleState, IRootState> = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
