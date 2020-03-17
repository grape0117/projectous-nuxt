<template>
  <div
    id="timer-tray"
    :class="trayClass()"
    style="overflow-y: scroll; z-index: 1; height: 100vh;"
  >
    <div style="position: sticky; height: 30px; top: 0">
      <button @click="addTimer()">Modal</button>
      <button @click="startTimer()">Start New</button>
    </div>

    <my-sidebar-timer
      :class="getSidebarClass()"
      style="text-align: left; overflow-y: scroll; border: solid 1px #cccccc;"
      v-bind:only_hidden="false"
      v-bind:timer_filter="timer_filter"
    ></my-sidebar-timer>
    <div :class="'chat-hide-btn ' + trayClass()">
      <button
        @click="trayToggle()"
        type="button"
        :class="'btn btn-purple ' + trayClass()"
      >
        timers
      </button>
    </div>
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
        company_client_id: '',
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
  width: 0;
  -webkit-transition: all 600ms cubic-bezier(0.22, 1, 0.19, 1);
  transition: all 600ms cubic-bezier(0.22, 1, 0.19, 1);
  &.expanded {
    width: 300px;
  }
  button.btn.btn-purple {
    color: #ffffff !important;
    background-color: #993399;
    border-color: #993399;
    position: fixed;
    bottom: 37px;
    right: -38px;
    transform: rotate(-90deg);
    font-size: 20px;
    text-transform: uppercase;
    padding: 8px 25px;
    border-radius: 0 5px 0 0;
    z-index: 999;
    -webkit-transition: all 600ms cubic-bezier(0.22, 1, 0.19, 1);
    transition: all 600ms cubic-bezier(0.22, 1, 0.19, 1);
  }
  @media (max-width 800px) {
    position: absolute;
    top: 0;
    right: 0;
  }
}

.chat-hide-btn {
  margin-right: 0;
}
.chat-hide-btn .expanded {
  margin-right: 300px;
}

.timer-tab {
  position: fixed;
  bottom: 0;
  right: 0;
  min-height: 150px;
  min-width: 100px;
  max-width: 200px;
  opacity: 0.99;
  z-index: 1;
}
</style>
