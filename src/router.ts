import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Draggable.vue'
import Projects from './views/Projects.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/projects',
      name: 'Projects',
      component: Projects
    }
  ]
})
