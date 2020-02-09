import Vue from 'vue'
import Router from 'vue-router'
import Projects from './views/Projects.vue'
import Custom from './views/Custom.vue'
import CompanyUsers from './views/CompanyUsers.vue'
import Login from '@/views/Login.vue'
import checkAuth from '@/middlewares/checkAuth'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/custom'
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
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

const guardedRoutes = ['Projects', 'Custom', 'Company Users']

router.beforeEach((to, from, next) => {
  const guardedRoute = !!guardedRoutes.find(route => route === to.name)
  checkAuth(guardedRoute, next)
})

export default router
