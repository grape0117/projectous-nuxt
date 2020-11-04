import Vue from 'vue'
import Vuex, { StoreOptions } from 'vuex'
import { IRootState } from './types'
import modules from './modules/index'
import '@/plugins/http'
import { mutations } from './mutations'
import { actions } from './actions'

Vue.use(Vuex)
const store: StoreOptions<IRootState> = {
  state: {
    version: '0.1.0',
    loading: false,
    current_user: null
  },
  actions,
  mutations,
  modules
}

export default new Vuex.Store(store)
