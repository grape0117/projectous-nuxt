import Vue from 'vue'
import Router from 'vue-router'
import Projects from './views/Projects.vue'
import Custom from './views/Custom.vue'
import CompanyUsers from './views/CompanyUsers.vue'
import Login from '@/views/Login.vue'
import checkAuth from '@/middlewares/checkAuth'
import InvoiceableTemplate from './views/InvoiceableTemplate.vue'
import InvoicesTemplate from './views/InvoicesTemplate.vue'
import ClientsTemplate from './views/ClientsTemplate.vue'
import Tasks from './views/AllTaskFilipTemplate.vue'
import UsersTemplate from './views/UsersTemplate.vue'
import AcceptInvite from './views/AcceptInvite.vue'
import store from 'vuex'

Vue.use(Router)
//TODO: lazy load https://blog.logrocket.com/lazy-loading-in-vue-js/

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
      path: '/accept-invite',
      name: 'AcceptInvite',
      component: AcceptInvite
    },
    {
      path: '/tasks',
      name: 'Tasks',
      component: Tasks
    },
    {
      path: '/task/:task_id',
      name: 'Task_Detail',
      component: Tasks,
      props: true
    },
    {
      path: '/projects',
      name: 'Projects',
      component: Custom
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
    },
    {
      path: '/clients',
      name: 'Clients',
      component: ClientsTemplate
    },
    {
      path: '/users',
      name: 'Users',
      component: UsersTemplate
    },
    {
      path: '/reports',
      name: 'Reports',
      component: InvoiceableTemplate
    },
    {
      path: '/invoices',
      name: 'Invoices',
      component: InvoicesTemplate
    }
  ]
})

const unGuardedRoutes = ['Login', 'AcceptInvite', 'Register']

router.beforeEach((to, from, next) => {
  const guardedRoute = !unGuardedRoutes.find(route => route === to.name)
  checkAuth(guardedRoute, next)
})

export default router
