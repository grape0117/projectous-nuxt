import Vue from 'vue'
import Router from 'vue-router'
import Projects from './views/Projects.vue'
import CompanyUsers from './views/CompanyUsers.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/projects'
    },
    {
      path: '/projects',
      name: 'Projects',
      component: Projects
    },
    {
      path: '/users',
      name: 'Company Users',
      component: CompanyUsers
    }
  ]
})
