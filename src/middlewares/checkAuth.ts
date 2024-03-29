import { getCookie } from '@/utils/util-functions'

export default function(guarded: boolean, to: any, from: any, next: any, store: any) {
  let isAdmin = store.getters['settings/isAdmin']

  if (guarded && !getCookie('auth_token')) {
    sessionStorage.setItem('afterLoginRoute', to.fullPath)

    next({ name: 'Login' })
  } else if (!!store && !!store.state.initialDataLoaded && !isAdmin && to.meta.adminOnly === true) {
    alert('Only admin can access.')
  } else next()
}
