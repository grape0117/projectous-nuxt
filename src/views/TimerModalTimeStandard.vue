<template id="timer-modal-time-standard-template">
  <div>
    <div class="timer-modal_duration col-sm-12">
      <div class="form-group">
        <label class="control-label" for="timerUserNotes">Duration: </label>
        <div id="timerDuration" class="form-control-static">
          <div class="timer-modal_timer">
            <input name="duration_hours" class="form-control" id="duration_hours" placeholder="00" style="display: inline" v-model="hours" />: <input name="duration_minutes" id="duration_minutes" class="form-control" style="display: inline" placeholder="00" v-model="minutes" />:
            <input name="duration_seconds" class="form-control" id="duration_seconds" style="display: inline" placeholder="00" v-model="seconds" />
          </div>
          <div class="timer-modal_timer-label">(Hours : Minutes : Seconds)</div>
        </div>
      </div>
    </div>
    <div class="timer-modal_duration col-sm-12">
      <!-- <span class="timer-modal_button" @click="setInvoiceDuration" v-if="(timer.status !== 'running' && isAdmin() && !is_set_invoice_duration)">Set Invoice Duration</span> -->
      <div class="form-group" v-if="(timer.status !== 'running' && isAdmin() && timer.invoice_duration) || is_set_invoice_duration">
        <label class="control-label" for="timerUserNotes">Invoice Duration: </label>
        <div id="timerDuration" class="form-control-static">
          <div class="timer-modal_timer">
            <input name="invoice_duration_hours" id="invoice_hours" class="form-control" placeholder="00" style="display: inline" v-model="invoice_hours" />: <input name="invoice_duration_minutes" id="invoice_minutes" class="form-control" style="display: inline" placeholder="00" v-model="invoice_minutes" />:
            <input name="invoice_duration_seconds" id="invoice_seconds" class="form-control" style="display: inline" placeholder="00" v-model="invoice_seconds" />
          </div>
          <div class="timer-modal_timer-label">(Hours : Minutes : Seconds)</div>
        </div>
      </div>
      <span class="timer-modal_button" @click="setInvoiceDuration" v-else="timer.status !== 'running' && isAdmin() && !is_set_invoice_duration">Set Invoice Duration</span>
    </div>
    <!--<div>

      <div class="col-sm-2">
              <button v-if="timer.status == 'running'" class="btn btn-default" style="float: right;"><i class="glyphicon glyphicon-stop"></i></button>
              <button v-else class="btn btn-default" style="float: right;"><i class="glyphicon glyphicon-play"></i></button>
          </div>
    </div>-->
    <!--<span class="timer-modal_button" @click="is_set_invoice_duration = true" v-if="(timer.status !== 'running' && isAdmin() && !is_set_invoice_duration) || timer.duration === timer.invoice_duration">Set Invoice Duration</span>-->
    <!--<div class="form-group" v-else-if="timer.status !== 'running' && isAdmin()">-->
    <!--<span class="timer-modal_label">Invoice Duration:</span>-->

    <!--<div>-->
    <!--<div id="timerDuration" class="form-control-static">-->
    <!--<div class="timer-modal_timer">-->
    <!--<input name="duration_hours" id="invoice_hours" placeholder="00" style="display: inline" v-model="invoice_hours" />: <input name="duration_minutes" id="invoice_minutes" style="display: inline" placeholder="00" v-model="invoice_minutes" />:-->
    <!--<input name="duration_seconds" id="invoice_seconds" style="display: inline" placeholder="00" v-model="invoice_seconds" />-->
    <!--</div>-->
    <!--<div class="timer-modal_timer-label">(Hours : Minutes : Seconds)</div>-->
    <!--</div>-->
    <!--</div>-->
    <!--</div>-->
  </div>
</template>

<script>
export default {
  name: 'timer-modal-time-standard',
  props: ['timer'],
  data() {
    return {
      is_set_invoice_duration: false
      // hours: Math.floor(this.timer.duration / 3600),
      // minutes: ('00' + Math.floor((this.timer.duration % 3600) / 60)).slice(-2),
      // seconds: ('00' + Math.floor(this.timer.duration % 60)).slice(-2)
    }
  },
  computed: {
    hours: {
      get() {
        return Math.floor(this.timer.duration / 3600)
      },
      set(value) {
        this.updateDuration(value, null, null)
      }
    },
    minutes: {
      get() {
        return ('00' + Math.floor((this.timer.duration % 3600) / 60)).slice(-2)
      },
      set(value) {
        this.updateDuration(null, value, null)
      }
    },
    seconds: {
      get() {
        return ('00' + Math.floor(this.timer.duration % 60)).slice(-2)
      },
      set(value) {
        this.updateDuration(null, null, value)
      }
    },
    invoice_hours: {
      get() {
        let timerInfo = this.$store.state.timers.timers.filter(({ id }) => id == this.timer.id)[0]
        return Math.floor(timerInfo.invoice_duration / 3600)
      },
      set(value) {
        this.updateInvoiceDuration(value, null, null)
      }
    },
    invoice_minutes: {
      get() {
        let timerInfo = this.$store.state.timers.timers.filter(({ id }) => id == this.timer.id)[0]
        return ('00' + Math.floor((timerInfo.invoice_duration % 3600) / 60)).slice(-2)
      },
      set(value) {
        this.updateInvoiceDuration(null, value, null)
      }
    },
    invoice_seconds: {
      get() {
        let timerInfo = this.$store.state.timers.timers.filter(({ id }) => id == this.timer.id)[0]
        return ('00' + Math.floor(timerInfo.invoice_duration % 60)).slice(-2)
      },
      set(value) {
        this.updateInvoiceDuration(null, null, value)
      }
    }
  },
  methods: {
    isAdmin() {
      return this.$store.getters['settings/isAdmin']
    },
    async setInvoiceDuration() {
      this.is_set_invoice_duration = true
      this.updateInvoiceDuration(this.hours, this.minutes, this.seconds)
    },
    /* updateHours(hours) {
      console.log('hours', hours, this.hours)
      if (hours * 1 !== this.hours * 1) {
        let duration = this.timer.duration - this.hours * 3600 + hours * 4600
        this.$emit('input', duration)
      }
    },
    updateMinutes(minutes) {
      console.log('minutes', minutes, this.minutes)
      if (minutes * 1 !== this.minutes * 1) {
        let duration = this.timer.duration - this.minutes * 60 + minutes * 60
        this.$emit('input', duration)
      }
    },
    updateSeconds(seconds) {
      console.log('seconds', seconds)
      const existingSeconds = this.timer.duration % 60
      if (seconds !== existingSeconds) {
        let duration = this.timer.duration - this.timer.duration % 60 + seconds
        this.$emit('input', duration)
      }
    },*/
    async updateDuration(hours, minutes, seconds) {
      let duration = hours !== null ? hours * 3600 : this.hours * 3600

      duration += minutes !== null ? minutes * 60 : this.minutes * 60

      duration += seconds !== null ? seconds * 1 : this.seconds * 1

      if (this.timer.duration !== duration) {
        this.$emit('update-duration', duration)
      }

      if (this.timer.duration === this.timer.invoice_duration) {
        this.$emit('update-invoice-duration', duration)
      }
    },
    async updateInvoiceDuration(hours, minutes, seconds) {
      let duration = hours !== null ? hours * 3600 : this.invoice_hours * 3600
      duration += minutes !== null ? minutes * 60 : this.invoice_minutes * 60
      duration += seconds !== null ? seconds * 1 : this.invoice_seconds * 1

      if (this.timer.invoice_duration !== duration) {
        this.$emit('update-invoice-duration', duration)
      }
    }
  }
}
</script>

<style lang="scss">
.timer-modal_duration {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 8px;
}
.timer-modal_timer {
  display: flex;
  // width: 200px;
}
.timer-modal_timer input {
  width: 45px;
  text-align: right;
}
.timer-modal_label {
  font-size: 13px;
  font-weight: bold;
  margin-bottom: 8px;
}
.timer-modal_timer-label {
  font-size: 10px;
  font-weight: bold;
  margin-top: 3px;
}
.timer-modal_button {
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  background-color: #6c8eff;
  padding: 5px 8px;
  border-radius: 50px;
  color: white;
}
</style>
