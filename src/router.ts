import Vue from 'vue'
import Router from 'vue-router'
import checkAuth from '@/middlewares/checkAuth'

import InvoiceableTemplate from './views/InvoiceableTemplate.vue'
import InvoicesTemplate from './views/InvoicesTemplate.vue'
import ClientsTemplate from './views/ClientsTemplate.vue'
import Tasks from './views/AllTaskFilipTemplate.vue'
import UsersTemplate from './views/UsersTemplate.vue'
import AcceptInvite from './views/AcceptInvite.vue'
import MessageSideBar from './views/TaskSideBar.vue'
import store from 'vuex'
import TaskDetails from '@/components/draggable/TaskDetails.vue'

Vue.use(Router)
//TODO: lazy load https://blog.logrocket.com/lazy-loading-in-vue-js/

const router = new Router({
  mode: 'history',
  routes: [
    { path: '/', name: 'home', redirect: '/custom' },
    {
      path: '/login',
      name: 'Login',
      component: () => import(/* webpackChunkName: "login" */ '@/views/Login.vue')
    },
    {
      path: '/accept-invite',
      name: 'AcceptInvite',
      component: () => import(/* webpackChunkName: "AcceptInvite" */ '@/views/AcceptInvite.vue')
    },
    {
      path: '/tasks',
      name: 'Tasks',
      component: () => import(/* webpackChunkName: "Tasks" */ '@/views/AllTaskFilipTemplate.vue')
    },
    {
      path: '/task/:task_id',
      name: 'Task_Detail',
      props: true,
      component: TaskDetails
    },
    {
      // for test
      path: '/message',
      name: 'MessageSideBar',
      component: MessageSideBar
    },
    {
      path: '/projects',
      name: 'Projects',
      component: () => import(/* webpackChunkName: "Tasks" */ '@/views/Projects.vue')
    },
    {
      path: '/custom',
      name: 'Custom',
      component: () => import(/* webpackChunkName: "Custom" */ '@/views/Custom.vue')
    },
    {
      path: '/users',
      name: 'Company Users',
      component: () => import(/* webpackChunkName: "Custom" */ '@/views/ClientsTemplate.vue')
    },
    {
      path: '/clients',
      name: 'Clients',
      component: () => import(/* webpackChunkName: "Custom" */ '@/views/CompanyUsers.vue')
    },
    {
      path: '/users',
      name: 'Users',
      component: () => import(/* webpackChunkName: "Custom" */ '@/views/UsersTemplate.vue')
    },
    {
      path: '/reports',
      name: 'Reports',
      component: () => import(/* webpackChunkName: "Custom" */ '@/views/InvoiceableTemplate.vue')
    },
    {
      path: '/invoices',
      name: 'Invoices',
      component: () => import(/* webpackChunkName: "Custom" */ '@/views/InvoicesTemplate.vue')
    }
  ]
})

const unGuardedRoutes = ['Login', 'AcceptInvite', 'Register']

router.beforeEach((to, from, next) => {
  const guardedRoute = !unGuardedRoutes.find(route => route === to.name)
  checkAuth(guardedRoute, next)
})

export default router
