<template>
  <div class="login-page">
    <div class="login-page__block">
      <div class="login-page__block-title">
        <span>Login</span>
      </div>
      <div class="login-page__block-form">
        <b-form @submit="login">
          <b-form-group id="input-group-1" label="Email address:" label-for="email">
            <b-form-input id="email" v-model="email" type="email" placeholder="Enter email" required></b-form-input>
          </b-form-group>

          <b-form-group id="input-group-2" label="Password:" label-for="password">
            <b-form-input id="password" v-model="password" type="password" placeholder="Enter password" required></b-form-input>
          </b-form-group>

          <div class="d-flex justify-content-end">
            <b-button type="submit" variant="primary" class="mr-2">Submit</b-button>
            <b-button @click="forgotpassword" variant="danger" class="mr-2">Forgot Password</b-button>
            <b-button @click="register" variant="primary">Register</b-button>
          </div>
        </b-form>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class Login extends Vue {
  private email = '' as string
  private password = '' as string

  private async login(e: any) {
    e.preventDefault()
    // @ts-ignore
    const res = await this.$http().post('/login', {
      email: this.email,
      password: this.password
    })

    const auth_token = res ? res.auth_token : null
    const user_id = res ? res.user_id : null
    const company_id = res ? res.company_id : null

    if (auth_token) {
      document.cookie = 'auth_token=' + auth_token
      try {
        if (user_id) {
          this.$store.state.settings.logged_in = true
          document.cookie = 'user_id=' + user_id
        }
      } catch (e) {
        console.error(e, 'Unable to create socket')
      }

      if (company_id) {
        this.$store.dispatch('settings/setCurrentCompanyId', company_id)
        const next = sessionStorage.getItem('afterLoginRoute')
        if (next) {
          this.$router.push(next)
        } else {
          this.$router.push('/user-tasks')
        }
      } else {
        this.$router.push('/change-company')
      }
    } else {
      alert('Invalid email or password')
    }
  }
  private async forgotpassword(e: any) {
    window.location.href = '/forgot-password'
  }
  private async register(e: any) {
    window.location.href = '/register'
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
.right {
  float: right;
}
</style>
