<template>
  <div>
    {{ title }}&nbsp;&nbsp;
    <b-button v-b-tooltip.hover title="Copy timer link" size="sm" variant="info" @click="copyTimerLink()" :style="buttonStyle">
      <b-icon icon="clipboard" aria-hidden="true"></b-icon>
    </b-button>
    <b-input-group>
      <b-form-input style="height:0px; width:0px; opacity:0;" v-on:focus="$event.target.select()" ref="timerLink" readonly v-model="link"></b-form-input>
    </b-input-group>
    <b-alert :show="dismissCountDown" variant="success" @dismissed="dismissCountDown = 0" @dismiss-count-down="countDownChanged" style="font-size:13px;"><b-icon icon="check-circle-fill" variant="success"></b-icon>&nbsp;Timer link copied to clipboard!</b-alert>
  </div>
</template>

<script>
import { getCookie } from '@/utils/util-functions'
export default {
  name: 'copy-link-button',
  props: ['link', 'title'],
  data() {
    return {
      test: false,
      buttonStyle: '',
      dismissSecs: 3,
      dismissCountDown: 0
    }
  },
  mounted: function() {
    this.applyTheme()
  },
  methods: {
    copyTimerLink() {
      this.$refs.timerLink.focus()
      document.execCommand('copy')
      this.showCopySuccess()
    },
    countDownChanged(dismissCountDown) {
      this.dismissCountDown = dismissCountDown
    },
    showCopySuccess() {
      this.dismissCountDown = this.dismissSecs
    },
    applyTheme() {
      let bgStyle = getCookie('bg-style')
      if (bgStyle) {
        try {
          let style = JSON.parse(bgStyle)
          this.buttonStyle = `background-color:${style}`
        } catch (error) {
          this.buttonStyle = `background-color:${buttonStyle}`
        }
      } else {
        const style_color = 'rgba(255, 165, 0, 0.6)'
        this.buttonStyle = `background-color:${style_color}`
      }
    }
  }
}
</script>
