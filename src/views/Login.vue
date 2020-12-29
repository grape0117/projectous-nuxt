<template>
  <div class="login-page">
    <div class="login-page__block">
      <div class="login-page__block-title">
        <span>Login</span>
      </div>
      <div class="login-page__block-form">
        <form @submit="login">
          <label class="control-label">Email</label>
          <input type="text" id="email" class="form-control" />
          <label class="control-label">Password</label>
          <input type="password" id="password" class="form-control" />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class Login extends Vue {
  private async login(e: any) {
    e.preventDefault()
    // @ts-ignore
    const res = await this.$http().post('/login', {
      // @ts-ignore
      email: document.getElementById('email')['value'],
      // @ts-ignore
      password: document.getElementById('password')['value']
    })

    const auth_token = res ? res.auth_token : null
    const user_id = res ? res.user_id : null

    if (auth_token) {
      document.cookie = 'auth_token=' + auth_token

      if (user_id) {
        document.cookie = 'user_id=' + user_id
        // @ts-ignore
        //window.Echo.leave('addentryevent_channel_' + user_id)
        var that = this
        // @ts-ignore
        window.Echo.channel('addentryevent_channel_' + user_id).listen('.AddEntryEvent', e => {
          console.log('-----Called getNewData!----item', e)
          // @ts-ignore
          that.$notification.show(
            e.data.data.item_type + ' has been updated!',
            {
              body: JSON.stringify(e)
            },
            {}
          )

          //'item_id = ' + e.item_id + ' & from_user_id = ' + e.from_user_id + ' & to_user_id = ' + e.to_user_id + ' & item_type = ' + e.item_type
          that.$store.dispatch('GET_NEW_DATA')
        })
      }

      this.$router.push('/')
    } else {
      alert('Invalid email or password')
    }
  }
}
</script>
<style>
.login-page {
  width: 100%;
  height: 100vh;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #cccccc;
}
.login-page__block {
  display: block;
  width: 100%;
  max-width: 400px;
  height: auto;
  padding: 1.5rem;
  position: relative;
  background: #ffffff;
  border-radius: 4px;
  box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
}
.login-page__block-title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.0125em;
  line-height: 2rem;
  word-break: break-all;
}
.login-page__block-title span {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.0125em;
  padding: 16px 24px 10px;
}
</style>
