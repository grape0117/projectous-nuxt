import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import '@/plugins/http'
import '@/plugins/ui'
import '@/plugins/bootstrap'
import EditTaskModal from './views/EditTaskModal.vue'
import NavBar from './views/NavBar.vue'

// Custom directives
import outsideClick from '@/directives/outside-click'

// @ts-ignore
import ProjectousPlugin from './projectous.js'
Vue.use(ProjectousPlugin)
import VueMoment from 'vue-moment'
Vue.use(VueMoment)
import 'moment-timezone'

// Components
Vue.component('nav-bar', NavBar)
Vue.component('task-modal', EditTaskModal)

// Directives
Vue.directive('click-outside', outsideClick)

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.config.productionTip = false

export let app = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
