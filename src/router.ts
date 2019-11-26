import Vue from 'vue'
import Router from 'vue-router'
import Projects from './views/Projects.vue'
import Custom from './views/Custom.vue'
import CompanyUsers from './views/CompanyUsers.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/custom'
    },
    {
      path: '/projects',
      name: 'Projects',
      component: Projects
    },
    {
      path: '/custom',
      name: 'Custom',
      component: Custom
    },
    {
      path: '/users',
      name: 'Company Users',
      component: CompanyUsers
    }
  ]
})
