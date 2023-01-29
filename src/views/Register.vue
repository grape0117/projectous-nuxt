<template>
  <div class="register-page">
    <div class="register-page__block">
      <div class="register-page__block-title">
        <span>Register</span>
      </div>
      <div class="register-page__block-form">
        <b-form @submit="register">
          <b-form-group id="input-group-1" label="Name:" label-for="name">
            <b-form-input id="name" v-model="name" type="text" placeholder="Enter Name" required></b-form-input>
          </b-form-group>

          <b-form-group id="input-group-2" label="E-Mail Address:" label-for="email">
            <b-form-input id="email" v-model="email" type="email" placeholder="Enter email" required></b-form-input>
          </b-form-group>

          <b-form-group id="input-group-3" label="Password:" label-for="password">
            <b-form-input id="password" v-model="password" type="password" placeholder="Enter password" required></b-form-input>
          </b-form-group>

          <b-form-group id="input-group-4" label="Confirm Password:" label-for="confirm_password">
            <b-form-input id="confirm_password" v-model="confirm_password" type="password" placeholder="Enter password again" required></b-form-input>
          </b-form-group>

          <div class="d-flex justify-content-end">
            <b-button type="submit" variant="primary" class="mr-2">Register</b-button>
          </div>
        </b-form>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class Register extends Vue {
  private name = '' as string
  private email = '' as string
  private password = '' as string
  private confirm_password = '' as string

  private async register(e: any) {
    e.preventDefault()
    // @ts-ignore
    const res = await this.$http().post('/register', {
      name: this.name,
      email: this.email,
      password: this.password,
      confirm_password: this.confirm_password
    })

    const auth_token = res ? res.auth_token : null
    const user_id = res ? res.user_id : null

    if (auth_token) {
      const next = sessionStorage.getItem('afterRegisterRoute')
      if (next) {
        this.$router.push(next)
      } else {
        this.$router.push('/login')
      }
    } else {
      alert('Invalid email or password')
    }
  }
}
</script>
<style>
.register-page {
  width: 100%;
  height: 100vh;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #cccccc;
}
.register-page__block {
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
.register-page__block-title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.0125em;
  line-height: 2rem;
  word-break: break-all;
}
.register-page__block-title span {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.0125em;
  padding: 16px 24px 10px;
}
.right {
  float: right;
}
</style>
