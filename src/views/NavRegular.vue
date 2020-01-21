<template>
  <nav class="navbar navbar-inverse navbar-fixed-top">
    <!--<active-timer></active-timer>-->
    <div class="container-fluid">
      <div class="navbar-header">
        <button
          type="button"
          class="navbar-toggle collapsed"
          data-toggle="collapse"
          data-target="#navbar"
          aria-expanded="false"
          aria-controls="navbar"
        >
          <span class="sr-only">Toggle navigation</span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <div class="navbar-brand" @click="home()">
          Projectous {{ total_task_users }}
        </div>
        <!--        <button-->
        <!--          data-toggle="collapse"-->
        <!--          data-target="#notification"-->
        <!--          style="position: absolute; left: 100px; top: 1px; color: blue;"-->
        <!--        >-->
        <!--          <i class="glyphicon glyphicon-ok"></i-->
        <!--          ><span class="badge badge-light">4</span>-->
        <!--        </button>-->
      </div>
      <div id="navbar" class="navbar-collapse collapse">
        <ul class="nav navbar-nav navbar-right">
          <!--<li><a>Quick Start: <select class="form-control" style="display: inline-block; width: auto;" name="project_id" onchange="save_timer();">
                                    <option value="-">*** No Project ***</option>
                                    @foreach($projects as $project)
                    <option value="{{ $project->id }}"

                                                >{{ $project->name }}</option>
                                    @endforeach
                        </select></a></li>-->
          <li>
            <a>{{ total_time_today }}</a>
          </li>
          <!--<nav-company v-bind:module="module" v-for="module in modules"></nav-company>-->
          <li><a href="#">Settings</a></li>
          <!--<li class="ws-status"><a>Real-Time Updates: <span style="color:red;">offline</span></a></li>-->
          <li>
            <a @click="home()">{{ name }}</a>
          </li>
          <!--<company-dropdown></company-dropdown>-->
        </ul>

        <form class="navbar-form navbar-right">
          <!--<input type="text" class="form-control" placeholder="Search...">-->
        </form>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  computed: {
    total_task_users: function() {
      return this.$store.state.task_users.task_users.length
    },
    total_time_today: function() {
      return 'total_time'
      let self = this
      let total_time_today = 0
      let midnight = new Date(new Date().setHours(0, 0, 0, 0))
      let timers = this.$store.state.timers.timers.filter(function(timer) {
        if (
          timer.company_user_id == self.$store.state.settings.current_user_id
        ) {
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

      return (
        ('00' + Math.floor(total_time_today / 3600)).slice(-2) +
        ':' +
        ('00' + Math.floor((total_time_today % 3600) / 60)).slice(-2)
      )
    },
    name: function() {
      return 'Name' //this.$store.state.settings.current_company_user.name;
    },
    modules: function() {
      //console.log('app.computed.modules');
      return [{}]
      return this.$store.getters['settings/getCurrentCompanyModules']
    }
  },
  methods: {
    home: function() {
      let self = this
      // alert('go home')
      // return
      //console.log(this.current_company.modules);
      // this.$nextTick(function() {
      //   self.$store.state.settings.current_company.modules.forEach(function(
      //     module,
      //     key
      //   ) {
      //     if (
      //       module.pivot.is_home > 0 &&
      //       module.pivot.company_user_role ==
      //         self.$store.state.settings.current_company_user.user_role
      //     ) {
      //       self.$router.push(module.path)
      //       return
      //     }
      //   })
      // })
    },
    getData: function() {
      store.dispatch('settings/getData')
    }
  }
}
</script>

<style>
body {
  padding-top: 50px;
}
</style>
