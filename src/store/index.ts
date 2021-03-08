import Vue from 'vue'
import Vuex, { StoreOptions } from 'vuex'
import { IRootState } from './types'
import modules from './modules/index'
import '@/plugins/http'
import { mutations } from './mutations'
import { actions } from './actions'

// import NativeNotificationOfVue from 'native-notification-of-vue'
import VueNativeNotification from 'vue-native-notification'

Vue.use(VueNativeNotification, {
  // Automatic permission request before
  // showing notification (default: true)
  requestOnNotify: true
})
// @ts-ignore
// Vue.notification.requestPermission().then(console.log) // Prints "granted", "denied" or "default"

Vue.use(Vuex)
const store: StoreOptions<IRootState> = {
  state: {
    version: '0.1.0',
    loading: false,
    initialDataLoaded: false,
    totalActiveRequests: 0,
    popAlert: false
    // current_user: null
  },
  actions,
  mutations,
  modules
}

export default new Vuex.Store(store)
