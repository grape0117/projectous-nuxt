<template>
  <div :class="'timer-tab ' + getSidebarClass()" style="text-align: right;">
    {{ getSidebarClass() }}
    <div class="btn btn-info" @click="expandContract()">+ / -</div>
    <button @click="addTimer()">Modal</button>
    <button @click="startTimer()">Start New</button>
    <ul class="nav nav-tabs" role="tablist">
      <li role="presentation" class="active">
        <a
          href="#tab-active"
          aria-controls="tab-active"
          role="tab"
          data-toggle="tab"
          >Active</a
        >
      </li>
      <li role="presentation">
        <a
          href="#tab-hidden"
          aria-controls="tab-hidden"
          role="tab"
          data-toggle="tab"
          >Hidden</a
        >
      </li>
    </ul>

    <div class="tab-content">
      <input v-model="timer_filter" placeholder="Search Projects" />
      <div id="tab-active" role="tabpanel" class="tab-pane active">
        <my-sidebar-timer
          :class="getSidebarClass()"
          style="text-align: left; overflow-y: scroll; border: solid 1px #cccccc;"
          v-bind:only_hidden="false"
          v-bind:timer_filter="timer_filter"
        ></my-sidebar-timer>
      </div>
      <div id="tab-hidden" role="tabpanel" class="tab-pane">
        hidden
        <my-sidebar-timer
          :class="getSidebarClass()"
          style="text-align: left; overflow-y: scroll; border: solid 1px #cccccc;"
          v-bind:only_hidden="true"
          v-bind:timer_filter="timer_filter"
        ></my-sidebar-timer>
      </div>
    </div>
  </div>
</template>
<script>
import MySideBarTimer from './MySidebarTimer.vue'
export default {
  name: 'timer-tab',
  data: function() {
    return {
      expanded: true,
      timer_filter: ''
    }
  },
  components: {
    'my-sidebar-timer': MySideBarTimer
  },
  methods: {
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

<style>
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

.expanded {
  max-height: calc(100vh - 100px);
}

.contracted {
  max-height: 300px;
}
</style>
