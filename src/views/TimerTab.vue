<template>
  <!-- <div id="timer-tray" :class="trayClass()" style="overflow-y: scroll; z-index: 1; height: 100vh; position: fixed;"> -->
  <div id="timer-tray">
    <div class="timer-tray-top-div">
      <span class="timer-tray-title">TIMERS</span>
      <span>{{ $store.state.settings.current_edit_timer_status }}</span>
      <div class="trayTopBtn">
        <!-- <button class="closebtn" @click="trayToggle()"><b-icon icon="x-circle"></b-icon></button> -->
        <span class="makeBtn" @click="addTimer()">Modal</span>
        <span class="makeBtn" @click="startTimer()">Start New</span>
        <span>{{ total_time_today }}</span>
      </div>
    </div>

    <div class="timer-tray-timer-card">
      <my-sidebar-timer :class="getSidebarClass()" v-bind:only_hidden="false" v-bind:timer_filter="timer_filter"></my-sidebar-timer>
    </div>
    <!-- <div :class="'chat-hide-btn ' + trayClass()">
      <button @click="trayToggle()" type="button" :class="'btn btn-gray ' + trayClass()">
        timers
      </button>
    </div> -->
  </div>
</template>
<script>
import moment from 'moment'

// Components
import MySideBarTimer from './MySidebarTimer.vue'

export default {
  name: 'timer-tab',
  data: function() {
    return {
      tray_expanded: true,
      timer_filter: '',
      keys: []
    }
  },
  computed: {
    total_time_today: function() {
      let self = this
      let total_time_today = 0
      let midnight = new Date(new Date().setHours(0, 0, 0, 0))
      let timers = this.$store.state.timers.timers.filter(function(timer) {
        if (timer.company_user_id === self.$store.state.settings.current_company_user_id) {
          let timertime = new Date(timer.report_at)
          //console.log(timertime)
          //console.log(midnight)
          /*if(timertime > midnight){
            console.log('greater')
          } else {
            console.log('less than')
          }*/

          if (new Date(timer.report_at) > midnight) {
            total_time_today += timer.duration
          }
        }
      })
      return ('00' + Math.floor(total_time_today / 3600)).slice(-2) + ':' + ('00' + Math.floor((total_time_today % 3600) / 60)).slice(-2)
    }
  },
  components: {
    'my-sidebar-timer': MySideBarTimer
  },
  methods: {
    keyUpTest() {
      console.log('working')
    },
    trayClass: function() {
      return this.tray_expanded ? 'expanded' : ''
    },
    trayToggle: function() {
      this.tray_expanded = this.tray_expanded === false
    },
    getSidebarClass: function() {
      return this.expanded ? 'expanded' : 'contracted'
    },
    expandContract: function() {
      this.expanded = this.expanded ? false : true
    },
    async addTimer() {
      this.$store.dispatch('timers/addTimer') //timers/addTimer2 signature
    },
    startTimer: function(e) {
      let start = async () => {
        await this.$store.dispatch('timers/startTimer', {
          current_company_id: this.$store.state.settings.current_company.id,
          client_id: '',
          project_id: '',
          task_id: '',
          is_billable: 1,
          report_at: ''
        })
      }

      if (e) {
        let key = e.key || keyCode
        this.keys.push(key)
        if ((this.keys.includes('n') && this.keys.includes('Alt')) || (this.keys.includes('N') && this.keys.includes('Alt'))) {
          this.keys = []
          start()
        }
        return
      }
      start()
    }
  },
  mounted() {
    window.addEventListener('keyup', this.startTimer)
  },
  beforeDestroy() {
    window.removeEventListener('keyup', this.startTimer)
  }
}
</script>

<style lang="scss">
#timer-tray {
  min-width: 252px;
  height: calc(100vh - 50px);
  overflow: hidden auto;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
}
.timer-tray-top-div {
  top: 0;
  position: sticky;
  padding: 10px;
  z-index: 1;
  background-color: rgba($color: #000000, $alpha: 0.5);
}
.timer-tray-timer-card {
  width: 100%;
  max-width: 250px;
  padding: 0 10px;
  align-self: center;
}
.timer-tray-title {
  margin-top: 10px;
  color: white;
  font-weight: bold;
}
.trayTopBtn {
  margin-top: 10px;
  margin-bottom: 15px;
  color: white;
}
.makeBtn {
  cursor: pointer;
  font-weight: bold;
  padding: 8px 15px;
  margin-right: 5px;
  border-radius: 5px;
  // background-color: rgb(0, 0, 255);
  background-color: rgba(0, 0, 0, 0.5);
}
.makeBtn:hover {
  background-color: rgba(0, 0, 0, 0.7);
}
</style>
