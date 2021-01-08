<template>
  <div class="login-page">
    <div class="login-page__block">
      <div class="login-page__block-title">
        <span>Reset Password</span>
      </div>
      <div class="login-page__block-form">
        <form @submit="resetpassword">
          <label class="control-label">New Password</label>
          <input type="password" id="password" class="form-control" />
          <label class="control-label">Confirm Password</label>
          <input type="password" id="password_confirm" class="form-control" />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class ResetPassword extends Vue {
  private async resetpassword(e: any) {
    e.preventDefault()
    //validation.
    // @ts-ignore
    var password = document.getElementById('password')['value']
    // @ts-ignore
    var password_confirm = document.getElementById('password_confirm')['value']

    if (password == '') {
      alert('Please enter password!')
      return
    }
    if (password.length < 6) {
      alert('Passowrd must be greater than 6 characters!')
      return
    }
    if (password != password_confirm) {
      alert('Password does not match!')
      return
    }
    //get api_token from route params.
    var api_token = this.$route.params.api_token
    // @ts-ignore
    const res = await this.$http().post('/resetpassword', {
      // @ts-ignore
      api_token: api_token,
      // @ts-ignore
      password: password,
      // @ts-ignore
      password_confirm: password_confirm
    })

    var flag = res ? res.flag : null

    if (flag) {
      alert('Password has been reset successfully! Please try to login.')
      this.$router.push('/login')
    } else {
      alert('Error')
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
