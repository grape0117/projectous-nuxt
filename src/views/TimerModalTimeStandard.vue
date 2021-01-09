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
      <span class="timer-modal_button" @click="set_invoice_duration = true" v-if="(timer.status !== 'running' && isAdmin() && !set_invoice_duration) || timer.duration === timer.invoice_duration">Set Invoice Duration</span>
      <div class="form-group" v-else-if="timer.status !== 'running' && isAdmin()">
        <label class="control-label" for="timerUserNotes">Invoice Duration: </label>
        <div id="timerDuration" class="form-control-static">
          <div class="timer-modal_timer">
            <input name="invoice_duration_hours" id="invoice_hours" class="form-control" placeholder="00" style="display: inline" v-model="invoice_hours" />: <input name="invoice_duration_minutes" id="invoice_minutes" class="form-control" style="display: inline" placeholder="00" v-model="invoice_minutes" />:
            <input name="invoice_duration_seconds" id="invoice_seconds" class="form-control" style="display: inline" placeholder="00" v-model="invoice_seconds" />
          </div>
          <div class="timer-modal_timer-label">(Hours : Minutes : Seconds)</div>
        </div>
      </div>
    </div>
    <!--<div>

      <div class="col-sm-2">
              <button v-if="timer.status == 'running'" class="btn btn-default" style="float: right;"><i class="glyphicon glyphicon-stop"></i></button>
              <button v-else class="btn btn-default" style="float: right;"><i class="glyphicon glyphicon-play"></i></button>
          </div>
    </div>-->
    <!--<span class="timer-modal_button" @click="set_invoice_duration = true" v-if="(timer.status !== 'running' && isAdmin() && !set_invoice_duration) || timer.duration === timer.invoice_duration">Set Invoice Duration</span>-->
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
  /* data() {
    return {
      hours: '',
      minutes: '',
      seconds: ''
    }
  },*/
  data() {
    return {
      set_invoice_duration: false
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
        return Math.floor(this.timer.invoice_duration / 3600)
      },
      set(value) {
        this.updateInvoiceDuration(value, null, null)
      }
    },
    invoice_minutes: {
      get() {
        return ('00' + Math.floor((this.timer.invoice_duration % 3600) / 60)).slice(-2)
      },
      set(value) {
        this.updateInvoiceDuration(null, value, null)
      }
    },
    invoice_seconds: {
      get() {
        return ('00' + Math.floor(this.timer.invoice_duration % 60)).slice(-2)
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
    updateDuration(hours, minutes, seconds) {
      console.log('hms', hours, minutes, seconds, hours !== null ? hours : this.hours * 3600, minutes !== null ? minutes * 60 : this.minutes * 60, seconds !== null ? seconds * 1 : this.seconds * 1)
      let duration = hours !== null ? hours * 3600 : this.hours * 3600
      console.log(duration)
      duration += minutes !== null ? minutes * 60 : this.minutes * 60
      console.log(duration)
      duration += seconds !== null ? seconds * 1 : this.seconds * 1
      console.log(duration)

      console.log(duration, this.timer.duration)
      if (this.timer.duration !== duration) {
        this.$store.dispatch('UPDATE_ATTRIBUTE', {
          module: 'timers',
          id: this.timer.id,
          attribute: 'duration',
          value: duration
        })
      }
      if (this.timer.duration === this.timer.invoice_duration) {
        this.$store.dispatch('UPDATE_ATTRIBUTE', {
          module: 'timers',
          id: this.timer.id,
          attribute: 'invoice_duration',
          value: duration
        })
      }
    },
    updateInvoiceDuration(hours, minutes, seconds) {
      let duration = hours !== null ? hours * 3600 : this.hours * 3600
      duration += minutes !== null ? minutes * 60 : this.minutes * 60
      duration += seconds !== null ? seconds * 1 : this.seconds * 1

      if (this.timer.invoice_duration !== duration) {
        this.$store.dispatch('UPDATE_ATTRIBUTE', {
          module: 'timers',
          id: this.timer.id,
          attribute: 'invoice_duration',
          value: duration
        })
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
