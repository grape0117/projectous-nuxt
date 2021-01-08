<template>
  <div class="login-page">
    <div class="login-page__block">
      <div class="login-page__block-title">
        <span>Login</span>
      </div>
      <div class="login-page__block-form">
        <form>
          <label class="control-label">Email</label>
          <input type="text" id="email" class="form-control" />
          <label class="control-label">Password</label>
          <input type="password" id="password" class="form-control" />
          <button type="button" @click="login">Login</button>
          <button class="right" type="button" @click="forgotpassword">Reset Password</button>
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
        window.Echo.leave('addentryevent_channel_' + user_id)
        var that = this
        // @ts-ignore
        window.Echo.channel('addentryevent_channel_' + user_id).listen('.AddEntryEvent', e => {
          // @ts-ignore
          console.log('-----Called getNewData!----' + e.data.data.item_type, e.data.data)
          let body = ''
          let title = ''
          let data = e.data
          switch (data.data.item_type) {
            case 'timelog':
              title = ''
              body = '' //JSON.stringify(data.username + ' has been ' + data.data.value.status + ' timelog at ' + data.data.value.status_changed_at)
              break
            case 'tasks':
              title = ''
              body = '' //JSON.stringify(data.username + ' has been ' + data.data.value.status + ' timelog at ' + data.data.value.status_changed_at)
              break
            case 'task_messages':
              title = data.data.value.taskname
              body = JSON.stringify(data.data.value.sender + ' : ' + data.data.value.message)
              break
          }
          if (body)
            // @ts-ignore
            that.$notification.show(
              title,
              {
                body: body
              },

              {
                onerror: function() {
                  console.log('Custom error event was called')
                },
                onclick: function() {
                  console.log('Custom click event was called')
                },
                onclose: function() {
                  console.log('Custom close event was called')
                },
                onshow: function() {
                  console.log('Custom show event was called')
                }
              }
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
  private async forgotpassword(e: any) {
    //send the request to get the reset password link.
    // @ts-ignore
    var email = document.getElementById('email')['value']
    if (!email) {
      alert('please enter the email')
      return
    }
    this.$store.state.loading = true
    // @ts-ignore
    const res = await this.$http().post('/forgotpassword', {
      // @ts-ignore
      email: document.getElementById('email')['value']
    })
    this.$store.state.loading = false
    var sent = res ? res.flag : null

    if (sent) {
      alert('We have just sent the reset link to your email. Please check your email!')
      //this.$router.push('/reset-password/'+res.api_token)
    } else {
      alert('Invalid email')
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
.right {
  float: right;
}
</style>
