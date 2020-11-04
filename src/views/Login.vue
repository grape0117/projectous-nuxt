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
    const { auth_token, user_id } = await this.$http().post('/login', {
      // @ts-ignore
      email: document.getElementById('email')['value'],
      // @ts-ignore
      password: document.getElementById('password')['value']
    })

    if (auth_token) {
      document.cookie = 'auth_token=' + auth_token
      await this.$store.dispatch('SET_CURRENT_USER', user_id)
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
