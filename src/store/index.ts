import Vue from 'vue'
import Vuex, { StoreOptions } from 'vuex'
import { IRootState } from './types'
import modules from './modules/index'

Vue.use(Vuex)
const store: StoreOptions<IRootState> = {
  state: {
    version: '0.1.0'
  },
  modules
}

export default new Vuex.Store(store)
