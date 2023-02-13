<template>
  <div class="reset-password-page">
    <div class="reset-password-page__block">
      <div class="reset-password-page__block-title">
        <span>Reset Password</span>
      </div>
      <div class="reset-password-page__block-form">
        <b-form @submit="resetpassword">
          <b-form-group id="input-group-1" label="Email address:" label-for="email">
            <b-form-input id="email" v-model="email" type="email" placeholder="Enter email" required></b-form-input>
          </b-form-group>
          <b-form-group id="input-group-2" label="New Password" label-for="password">
            <b-form-input id="password" v-model="password" type="password" required></b-form-input>
          </b-form-group>
          <b-form-group id="input-group-3" label="Confirm Password" label-for="password_confirm">
            <b-form-input id="password" v-model="password_confirm" type="password" required></b-form-input>
          </b-form-group>
          <div class="d-flex justify-content-end">
            <b-button type="submit" variant="primary">Reset Password</b-button>
          </div>
        </b-form>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class ResetPassword extends Vue {
  private email = '' as string
  private password = '' as string
  private password_confirm = '' as string

  private async resetpassword(e: any) {
    e.preventDefault()

    if (this.password == '') {
      alert('Please enter password!')
      return
    }
    if (this.password.length < 8) {
      alert('Passowrd must be greater than 8 characters!')
      return
    }
    if (this.password != this.password_confirm) {
      alert('Password does not match!')
      return
    }
    //get api_token from route params.
    let api_token = this.$route.params.api_token
    // @ts-ignore
    const res = await this.$http().post('/resetpassword', {
      // @ts-ignore
      token: api_token,
      // @ts-ignore
      email: this.email,
      // @ts-ignore
      password: this.password,
      // @ts-ignore
      password_confirmation: this.password_confirm
    })

    let status = res ? res.status : null

    if (status == 'success') {
      alert('Password has been reset successfully! Please try to login.')
      this.$router.push('/login')
    } else {
      alert(res.message)
    }
  }
}
</script>
<style>
.reset-password-page {
  width: 100%;
  height: 100vh;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #cccccc;
}
.reset-password-page__block {
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
.reset-password-page__block-title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.0125em;
  line-height: 2rem;
  word-break: break-all;
}
.reset-password-page__block-title span {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.0125em;
  padding: 16px 24px 10px;
}
</style>
