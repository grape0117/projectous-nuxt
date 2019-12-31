import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import '@/plugins/http'
import '@/plugins/ui'
import BootstrapVue from 'bootstrap-vue'
Vue.use(BootstrapVue)
import EditTaskModal from './views/EditTaskModal.vue'
import NavBar from './views/NavBar.vue'
Vue.component('nav-bar', NavBar)
Vue.component('task-modal', EditTaskModal)

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
