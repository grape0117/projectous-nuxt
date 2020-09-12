<template>
  <!-- <div id="timer-tray" :class="trayClass()" style="overflow-y: scroll; z-index: 1; height: 100vh; position: fixed;"> -->
  <div id="timer-tray">
    <span>TIMERS</span>
    <div class="trayTopBtn">
      <!-- <button class="closebtn" @click="trayToggle()"><b-icon icon="x-circle"></b-icon></button> -->
      <button class="makeBtn" @click="addTimer()" style="margin-left: 30px;">Modal</button>
      <button class="makeBtn" @click="startTimer()" style="margin-left: 10px;">Start New</button>
      {{ total_time_today }}
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
  width: 300px;
  height: calc(100vh - 50px);
  overflow-y: scroll;
  background-color: #616161;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
}

// #timer-tray {
//   width: 300px;
//   -webkit-transition: all 600ms cubic-bezier(0.22, 1, 0.19, 1);
//   transition: all 600ms cubic-bezier(0.22, 1, 0.19, 1);
//   background-color: #993399;
//   transition: 0.5s;
//   right: -300px;
//   &.expanded {
//     right: 0;
//   }
//   .project-item {
//     list-style-type: none;
//     padding: 10px 15px;
//     background: #e9d2e9;
//     width: 260px;
//     min-height: 130px;
//     margin: 0 auto;
//     border-radius: 5px;
//     margin: 10px;
//     -webkit-box-shadow: 0px 0px 16px -7px rgba(0, 0, 0, 0.75);
//     -moz-box-shadow: 0px 0px 16px -7px rgba(0, 0, 0, 0.75);
//     box-shadow: 0px 0px 16px -7px rgba(0, 0, 0, 0.75);
//   }
//   .timer-task {
//     background-color: #e9d2e9;
//   }
//   button.btn.btn-purple {
//     color: #ffffff !important;
//     background-color: #993399;
//     border-color: #993399;
//     position: fixed;
//     bottom: 37px;
//     right: -38px;
//     transform: rotate(-90deg);
//     font-size: 20px;
//     text-transform: uppercase;
//     padding: 8px 25px;
//     border-radius: 0 5px 0 0;
//     z-index: 999;
//     -webkit-transition: all 600ms cubic-bezier(0.22, 1, 0.19, 1);
//     transition: all 600ms cubic-bezier(0.22, 1, 0.19, 1);
//   }
//   button.btn.btn-gray {
//     color: #ffffff !important;
//     background-color: #993399;
//     color: white;
//     position: fixed;
//     bottom: 31px;
//     right: -31px;
//     transform: rotate(-90deg);
//     font-size: 16px;
//     text-transform: uppercase;
//     padding: 8px 25px;
//     border-radius: 0 5px 0 0;
//     z-index: 999;
//     -webkit-transition: 0.5s;
//     transition: 0.5s;
//   }
//   button.btn.btn-gray:active {
//     box-shadow: none;
//   }
//   .closebtn {
//     font-size: 30px;
//     background: transparent;
//     color: #ffffff;
//     cursor: pointer;
//     border: none;
//     position: absolute;
//     left: 0;
//     top: -3px;
//     outline: none;
//   }
//   .trayTopBtn {
//     position: sticky;
//     top: 0px;
//     padding: 10px;
//     border-bottom-left-radius: 5px;
//     border-bottom-right-radius: 5px;
//     background: #993399;
//     z-index: 100;
//     color: #fff;

//     .makeBtn {
//       border: 1px solid #652d65;
//       border-radius: 5px;
//       color: #fff;
//       font-size: 14px;
//       outline: none;
//       background: #652d65;
//     }
//   }
//   @media (max-width 800px) {
//     position: absolute;
//     top: 0;
//     right: 0;
//   }
// }

// .chat-hide-btn {
//   margin-right: 0;
// }
// .chat-hide-btn .expanded {
//   margin-right: 300px;
// }

// .timer-tab {
//   position: fixed;
//   bottom: 0;
//   right: 0;
//   min-height: 150px;
//   min-width: 100px;
//   max-width: 200px;
//   opacity: 0.99;
//   z-index: 1;
// }
</style>
