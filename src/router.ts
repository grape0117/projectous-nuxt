import Vue from 'vue'
import store from '@/store'
import Router from 'vue-router'
import checkAuth from '@/middlewares/checkAuth'

Vue.use(Router)
//TODO: lazy load https://blog.logrocket.com/lazy-loading-in-vue-js/

const router = new Router({
  mode: 'history',
  routes: [
    { path: '/', name: 'home', redirect: '/user-tasks' },
    {
      path: '/profit',
      name: 'Profit',
      component: () => import(/* webpackChunkName: "Profit" */ '@/views/Profit.vue')
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import(/* webpackChunkName: "login" */ '@/views/Login.vue')
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import(/* webpackChunkName: "login" */ '@/views/Register.vue')
    },
    {
      path: '/graph',
      name: 'Graph',
      component: () => import(/* webpackChunkName: "graph" */ '@/views/Graph.vue')
    },
    {
      path: '/forgot-password',
      name: 'Forgot Password',
      component: () => import(/* webpackChunkName: "forgot-password" */ '@/views/ForgotPassword.vue'),
      meta: {
        hideNavbar: true
      }
    },
    {
      path: '/reset-password/:api_token',
      name: 'Reset Password',
      component: () => import(/* webpackChunkName: "reset-password" */ '@/views/ResetPassword.vue'),
      meta: {
        hideNavbar: true
      }
    },
    {
      path: '/accept-invite',
      name: 'AcceptInvite',
      component: () => import(/* webpackChunkName: "accept-invite" */ '@/views/AcceptInvite.vue'),
      meta: {
        hideNavbar: true
      }
    },
    {
      path: '/tasks',
      name: 'Task Cloud',
      component: () => import(/* webpackChunkName: "Tasks" */ '@/views/AllTaskFilipTemplate.vue')
    },
    {
      path: '/user-tasks',
      name: 'User Tasks',
      component: () => import(/* webpackChunkName: "UserTasks" */ '@/views/UserTasksTemplate.vue')
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
      path: '/projects',
      name: 'Projects',
      component: () => import(/* webpackChunkName: "Project" */ '@/views/Kanban.vue')
    },
    {
      path: '/users',
      name: 'Company Users',
      meta: { adminOnly: true },
      component: () => import(/* webpackChunkName: "Users" */ '@/views/CompanyUsers.vue')
    },
    {
      path: '/clients',
      name: 'Clients',
      meta: { adminOnly: true },
      component: () => import(/* webpackChunkName: "Clients" */ '@/views/ClientsTemplate.vue')
    },
    // {
    //   path: '/users',
    //   name: 'Users',
    //   component: () => import(/* webpackChunkName: "Custom" */ '@/views/UsersTemplate.vue')
    // },
    {
      path: '/invoiceable',
      name: 'Invoiceable',
      meta: { adminOnly: true },
      component: () => import(/* webpackChunkName: "Custom" */ '@/views/InvoiceableTemplate.vue')
    },
    {
      path: '/payable',
      name: 'Payable',
      meta: { adminOnly: true },
      component: () => import(/* webpackChunkName: "Custom" */ '@/views/PayableTemplate.vue')
    },
    {
      path: '/invoices',
      name: 'Invoices',
      meta: { adminOnly: true },
      component: () => import(/* webpackChunkName: "Custom" */ '@/views/InvoicesTemplate.vue')
    },
    {
      path: '/invoice/:invoice_id',
      name: 'Invoice',
      meta: { adminOnly: true },
      component: () => import(/* webpackChunkName: "Custom" */ '@/views/InvoiceTemplate.vue')
    },
    {
      path: '/task_invoice/:invoice_id',
      name: 'TaskInvoice',
      meta: { adminOnly: true },
      component: () => import(/* webpackChunkName: "Custom" */ '@/views/TaskInvoiceTemplate.vue')
    },
    {
      path: '/days',
      name: 'Days',
      component: () => import(/* webpackChunkName: "Custom" */ '@/views/DaysTemplate.vue')
    },
    {
      path: '/reports',
      name: 'Reports',
      component: () => import(/* webpackChunkName: "Custom" */ '@/views/ReportsTemplate.vue')
    },
    {
      path: '/user_report',
      name: 'My Report',
      component: () => import(/* webpackChunkName: "Custom" */ '@/views/UserInvoiceableTemplate.vue')
    }
  ]
})

const unGuardedRoutes = ['Login', 'AcceptInvite', 'Register', 'Forgot Password', 'Reset Password']

router.beforeEach((to, from, next) => {
  const guardedRoute = !unGuardedRoutes.find(route => route === to.name)
  checkAuth(guardedRoute, to, from, next, store)
})

export default router
