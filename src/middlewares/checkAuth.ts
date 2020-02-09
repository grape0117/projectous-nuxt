import { getCookie } from '@/utils/util-functions'

export default function(guarded: boolean, next: any) {
  if (guarded && !getCookie('auth_token')) next({ name: 'Login' })
  else next()
}
