<template>
  <div class="forgot-password-page">
    <div class="forgot-password-page__block">
      <div class="forgot-password-page__block-title">
        <span>Forgot Password</span>
      </div>
      <div class="forgot-password-page__block-form">
        <b-form autocomplete="off" @submit="requestResetPassword">
          <b-form-group id="input-group-1" label="Email address:" label-for="email">
            <b-form-input id="email" v-model="email" type="email" placeholder="Enter email" required></b-form-input>
          </b-form-group>
          <div class="d-flex justify-content-end">
            <b-button type="submit" variant="primary">Send Password Reset Link</b-button>
          </div>
        </b-form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class ForgotPassword extends Vue {
  private email = '' as string

  private async requestResetPassword(e: any) {
    e.preventDefault()
    if (this.email == '') {
      alert('Please enter email!')
      return
    }
    // @ts-ignore
    const res = await this.$http().post('/forgotpassword', {
      email: this.email
    })
    if (res.status == 'success') {
      alert(res.message)
    } else {
      alert(res.message)
    }
  }
}
</script>

<style>
.forgot-password-page {
  width: 100%;
  height: 100vh;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #cccccc;
}
.forgot-password-page__block {
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
.forgot-password-page__block-title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.0125em;
  line-height: 2rem;
  word-break: break-all;
}
.forgot-password-page__block-title span {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.0125em;
  padding: 16px 24px 10px;
}
.right {
  float: right;
}
</style>
