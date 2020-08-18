<template>
  <div>
    <input type="email" />
    <input type="first_name" />
    <input type="last_name" />
    <input type="password" />
    <input type="timezone" />
    Blank has invited you to company X
    <b-button>Accept Invite</b-button>
  </div>
</template>
<script>
export default {
  data() {
    return {
      token: this.$route.query.token,
      email: this.$route.query.email
    }
  },
  mounted() {
    //fetch data for token
    this.$http()
      .get('/invite?token=' + this.token + '&email=' + this.email)
      .then(response => {})
  },
  methods: {
    acceptInvite() {
      this.$http()
        .post('/accept-invite', {})
        .then(response => {
          //Redirect to application?
          this.$router.push('/login')
        })
    }
  }
}
</script>
