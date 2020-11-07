import Vue from 'vue'
import Router from 'vue-router'
import checkAuth from '@/middlewares/checkAuth'

import store from 'vuex'

Vue.use(Router)
//TODO: lazy load https://blog.logrocket.com/lazy-loading-in-vue-js/

const router = new Router({
  mode: 'history',
  routes: [
    { path: '/', name: 'home', redirect: '/kanban' },
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
      name: 'Task Cloud',
      component: () => import(/* webpackChunkName: "Tasks" */ '@/views/AllTaskFilipTemplate.vue')
    },
    {
      path: '/tasks/:task_id',
      name: 'Task_Detail',
      // props: true,
      // component: () => import(/* webpackChunkName: "Tasks-detail" */ '@/components/draggable/TaskDetails.vue')
      component: () => import(/* webpackChunkName: "Tasks-detail" */ '@/views/AllTaskFilipTemplate.vue')
    },
    {
      // for test
      path: '/message',
      name: 'MessageSideBar',
      component: () => import(/* webpackChunkName: "Message-sidebar" */ '@/views/TaskSideBar.vue')
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import(/* webpackChunkName: "Profile" */ '@/views/Profile.vue')
    },
    {
      path: '/kanban',
      name: 'Kanban',
      component: () => import(/* webpackChunkName: "Custom" */ '@/views/Kanban.vue')
    },
    {
      path: '/users',
      name: 'Company Users',
      component: () => import(/* webpackChunkName: "Custom" */ '@/views/CompanyUsers.vue')
    },
    {
      path: '/clients',
      name: 'Clients',
      component: () => import(/* webpackChunkName: "Custom" */ '@/views/ClientsTemplate.vue')
    },
    // {
    //   path: '/users',
    //   name: 'Users',
    //   component: () => import(/* webpackChunkName: "Custom" */ '@/views/UsersTemplate.vue')
    // },
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
