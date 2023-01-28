<template>
  <div class="accept-invite-page">
    <div class="accept-invite-page__block">
      <b-form @submit="acceptInvite">
        <b-form-group id="input-group-1" label="Email address:" label-for="email">
          <b-form-input id="email" v-model="email" type="email" placeholder="Enter email" required></b-form-input>
        </b-form-group>

        <b-form-group id="input-group-2" label="Name:" label-for="name">
          <b-form-input id="name" v-model="name" type="text" placeholder="Name" required></b-form-input>
        </b-form-group>

        <b-form-group id="input-group-3" label="Password:" label-for="password">
          <b-form-input id="password" v-model="password" type="password" placeholder="Enter password" required></b-form-input>
        </b-form-group>

        <input type="text" id="company_user" v-model="company_user" class="data" /> has invited you to company
        <input type="text" id="company" v-model="company" class="data" />

        <div class="d-flex justify-content-end">
          <b-button type="submit" variant="primary" class="mr-2">Accept Invite</b-button>
        </div>
      </b-form>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class AcceptInvite extends Vue {
  private token = this.$route.query.token as string
  private email = this.$route.query.email as string
  private company = '' as string
  private company_user = '' as string
  private name = '' as string
  private password = '' as string

  created() {
    //fetch data for token
    // @ts-ignore
    this.$http()
      .get('/invite-data?token=' + this.token + '&email=' + this.email)
      // @ts-ignore
      .then(response => {
        if (response.success) {
          this.company = response.data.company
          this.company_user = response.data.company_user
        } else {
          alert(response.message)
        }
      })
  }
  private async acceptInvite(e: any) {
    e.preventDefault()
    // @ts-ignore
    const res = await this.$http().post('/accept-invite', {
      token: this.token,
      email: this.email,
      name: this.name,
      password: this.password
    })
    if (res.success) {
      this.$router.push('/login')
    } else {
      alert('Error while handling the acceptation of an invitation. Please contact admin.')
    }
  }
}
</script>
<style lang="scss">
.data {
  border: none;
  background: none;
  width: 150px;
}
.accept-invite-page {
  width: 100%;
  height: 100vh;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #cccccc;
}
.accept-invite-page__block {
  display: block;
  width: 100%;
  max-width: 600px;
  height: auto;
  padding: 1.5rem;
  position: relative;
  background: #ffffff;
  border-radius: 4px;
  box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
}
</style>
