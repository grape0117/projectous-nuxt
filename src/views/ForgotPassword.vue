<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-6">
        <div class="card card-default">
          <div class="card-header">Forgot Password</div>
          <div class="card-body">
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
