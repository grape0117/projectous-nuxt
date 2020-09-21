<template>
  <!-- <div id="timer-tray" :class="trayClass()" style="overflow-y: scroll; z-index: 1; height: 100vh; position: fixed;"> -->
  <div id="timer-tray">
    <span class="timer-tray-title">TIMERS</span>
    <div class="trayTopBtn">
      <!-- <button class="closebtn" @click="trayToggle()"><b-icon icon="x-circle"></b-icon></button> -->
      <span class="makeBtn" @click="addTimer()">Modal</span>
      <span class="makeBtn" @click="startTimer()">Start New</span>
      <span>{{ total_time_today }}</span>
    </div>

    <my-sidebar-timer :class="getSidebarClass()" v-bind:only_hidden="false" v-bind:timer_filter="timer_filter"></my-sidebar-timer>
    <!-- <div :class="'chat-hide-btn ' + trayClass()">
      <button @click="trayToggle()" type="button" :class="'btn btn-gray ' + trayClass()">
        timers
      </button>
    </div> -->
  </div>
</template>
<script>
import MySideBarTimer from './MySidebarTimer.vue'
export default {
  name: 'timer-tab',
  data: function() {
    return {
      tray_expanded: true,
      timer_filter: ''
    }
  },
  computed: {
    total_time_today: function() {
      let self = this
      let total_time_today = 0
      let midnight = new Date(new Date().setHours(0, 0, 0, 0))
      let timers = this.$store.state.timers.timers.filter(function(timer) {
        if (timer.company_user_id === self.$store.state.settings.current_user_id) {
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
    addTimer: function() {
      this.$store.dispatch('timers/addTimer') //timers/addTimer2 signature
    },
    startTimer: function() {
      this.$store.dispatch('timers/startTimer', {
        current_company_id: this.$store.state.settings.current_company.id,
        client_id: '',
        project_id: '',
        task_id: '',
        is_billable: 1,
        report_at: ''
      })
    }
  }
}
</script>

<style lang="scss">
#timer-tray {
  height: 100%;
  padding: 0 15px;
  width: 300px;
  height: calc(100vh - 50px);
  overflow-y: scroll;
  // background-color: #616161;
  background-color: rgba(0, 0, 0, 0.5);
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
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
