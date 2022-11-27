import { Module } from 'vuex'
import { IRootState } from '@/store/types'
import { IModuleState } from './types'
import { actions } from './actions'
import { getters } from './getters'
import { mutations } from './mutations'

const state = {
  displayed_tasks_plus0: [],
  displayed_tasks_plus1: [],
  displayed_tasks_plus2: [],
  displayed_tasks_plus3: [],
  displayed_tasks_plus4: [],
  displayed_tasks_plus5: [],
  displayed_tasks_plus6: [],
  completed_tasks: [],
  hold_tasks: [],
  active_tasks: [],
  when_possible_tasks: [],
  this_week_tasks: [],
  today_tasks: [],
  tasks: [],
  my_tasks: [],
  past_due_tasks: [],
  others_tasks: [],
  all_tasks: [],
  tasks_by_project: [],
  lookup: {}
}

export const tasks: Module<IModuleState, IRootState> = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
