import { getCookie } from '@/utils/util-functions'

export default function(guarded: boolean, to: any, next: any, store: any) {
  let isAdmin = store.getters['settings/isAdmin']

  if (guarded && !getCookie('auth_token')) {
    next({ name: 'Login' })
  } else if (!!store && !isAdmin && to.meta.adminOnly === true) {
    alert('Only admin can access.')
  } else next()
}
