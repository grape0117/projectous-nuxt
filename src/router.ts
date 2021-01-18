import Vue from 'vue'
import store from '@/store'
import Router from 'vue-router'
import checkAuth from '@/middlewares/checkAuth'

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
      path: '/reset-password/:api_token',
      name: 'Reset Password',
      component: () => import(/* webpackChunkName: "login" */ '@/views/ResetPassword.vue')
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
      meta: { adminOnly: true },
      component: () => import(/* webpackChunkName: "Custom" */ '@/views/CompanyUsers.vue')
    },
    {
      path: '/clients',
      name: 'Clients',
      meta: { adminOnly: true },
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
      meta: { adminOnly: true },
      component: () => import(/* webpackChunkName: "Custom" */ '@/views/InvoiceableTemplate.vue')
    },
    {
      path: '/invoices',
      name: 'Invoices',
      meta: { adminOnly: true },
      component: () => import(/* webpackChunkName: "Custom" */ '@/views/InvoicesTemplate.vue')
    }
  ]
})

const unGuardedRoutes = ['Login', 'AcceptInvite', 'Register']

router.beforeEach((to, from, next) => {
  const guardedRoute = !unGuardedRoutes.find(route => route === to.name)
  checkAuth(guardedRoute, to, from, next, store)
})

export default router
