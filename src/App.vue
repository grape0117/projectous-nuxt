<template>
  <div id="app" style="position: relative" class="app-class" :class="bgStyle && bgTheme === 'Colors' ? bgStyle : 'paletteDefault'" :style="{ background: bgTheme === 'Images' ? `url(${this.bgStyle})` : '' }">
    <b-overlay :show="$store.state.loading" rounded="sm" style="flex-grow: 1">
      <!-- Loading area -->
      <template #overlay>
        <div class="text-center">
          <b-spinner label="Spinning"></b-spinner>
          <p>Loading ...</p>
        </div>
      </template>

      <div class="row-no-padding">
        <!-- <pre>
          {{ $store.state.invoice_items }}
        </pre> -->
        <Header v-on:reload="reload" />
        <div class="d-flex justify-content-between">
          <!-- <task-details v-if="show_task"></task-details> -->
          <div class="router-view-class">
            <task-detail v-if="Object.keys(showTask).length > 0" class="app_task-detail" :task="showTask" />
            <router-view style="width: 100%; height: 100%" />
          </div>
          <div class="d-flex">
            <task-tray v-show="showTasks" />
            <task-side-bar v-show="showChat" />
            <timer-tab v-show="showTimer" />
          </div>
        </div>
      </div>
    </b-overlay>

    <task-modal />
    <edit-client-modal id="edit-client-modal" />
    <edit-user-modal id="edit-user-modal" />
    <invite-user-modal id="invite-user-modal" />
    <edit-timer-modal id="edit-timer-modal" />
    <edit-project-modal id="edit-project-modal" />

    <!-- <div id="update-data-button" @click="storeDataInIndexedDb" /> -->

    <!-- <b-nav vertical>
        <b-navbar-brand to="/">Projectous</b-navbar-brand>
        <b-nav-item to="/tasks">Tasks</b-nav-item>
        <b-nav-item to="/projects">Projects</b-nav-item>
        <b-nav-item to="/clients">Clients</b-nav-item>
        <b-nav-item to="/users">Users</b-nav-item>
        <b-nav-item to="/profile">Profile</b-nav-item>
        <b-nav-item to="/logout">Log Out</b-nav-item>
      </b-nav> -->
  </div>
</template>

<script>
import '@/assets/icons/fontello/css/fontello.css'

import Header from '@/components/Header.vue'

import EditClientModal from './views/EditClientModal.vue'
import EditUserModal from './views/EditUserModal'
import InviteUserModal from './views/InviteUserModal'
import EditTaskModal from './views/EditTaskModal'
import EditTimerModal from './views/EditTimerModal'
import EditProjectModal from './views/EditProjectModal'
import { createListsByDays, createUserLists, getCookie } from '@/utils/util-functions'
import Vue from 'vue'
import { idbKeyval, idbGetAll } from '@/plugins/idb.ts'
import { modulesNames, modulesNamesList } from './store/modules-names'
import uuid from 'uuid'
import AllTaskFilipTemplate from './views/AllTaskFilipTemplate'
import { EventBus } from '@/components/event-bus'

export default {
  components: {
    Header,
    AllTaskFilipTemplate,
    TimerTab: () => import('./views/TimerTab.vue'),
    TaskTray: () => import('./views/TaskTray.vue'),
    TaskSideBar: () => import('./views/TaskSideBar.vue'),
    TaskDetail: () => import('./views/TaskDetail.vue'),
    EditClientModal,
    EditUserModal,
    InviteUserModal,
    EditTaskModal,
    EditTimerModal,
    EditProjectModal
  },
  data() {
    return {
      loading: false,
      showTasks: false,
      showChat: false,
      showTimer: false,
      bgStyle: '',
      bgTheme: '',
      showTask: {}
    }
  },
  computed: {
    // backgroundStyle() {
    //   if(this.bgTheme === 'Images') {
    //     return `
    //       background: url(${this.bgStyle}),
    //     `
    //       // 'background-repeat': no-repeat,
    //       // 'background-size': cover,
    //     // background: url(https://images.pexels.com/photos/38537/woodland-road-falling-leaf-natural-38537.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260);
    //     // background-repeat: no-repeat;
    //     // background-size: cover;
    //   }
    // },
    current_edit_task: function() {
      return this.$store.getters['settings/get_current_edit_task']
    },
    current_edit_project: function() {
      console.log('cureent edit projec')
      return this.$store.getters['settings/get_current_edit_project']
    }
    // getBackground() {
    //   if(this.bgStyle) return this.bgStyle

    //   if(!getCookie('bg-color')) {

    //     return false
    //   } else {
    //     return getCookie('bg-color')
    //   }
    // },
  },
  watch: {
    current_edit_task: function(value) {
      alert('watched!')
      if (this.current_edit_task.id) {
        this.$bvModal.show('task-modal')
      } else {
        this.$bvModal.hide('task-modal')
      }
    },
    current_edit_project: function(value) {
      alert('watched!')
      if (this.current_edit_project.id) {
        this.$bvModal.show('project-modal')
      } else {
        this.$bvModal.hide('project-modal')
      }
    },
    current_edit_client: function(value) {
      alert('watched!')
      if (this.current_edit_project.id) {
        this.$bvModal.show('client-modal')
      } else {
        this.$bvModal.hide('client-modal')
      }
    },
    '$route.path': {
      handler(newRoute, oldRoute) {
        if (oldRoute === '/login' && newRoute.indexOf('password') < 0) {
          this.getAppData()
        }
      },
      deep: true
    }
  },
  async mounted() {
    /**
     * We want every modal hide to check to see if another modal should be displayed.
     */
    //Make bvModal available in vuex store -- complaint department is =>
    window.$_app = this
    //Add trigger on modal hidden
    this.$root.$on('bv::modal::hidden', () => {
      this.$store.dispatch('settings/closedModal')
    })

    /**
     * Each tab / instance needs a unique indentifier
     */
    this.$store.state.settings.instance_id = uuid.v4()

    /**
     * Polling for new data TODO: long polling or websocket. If websocket, make sure it resumes easily.
     */
    if (getCookie('auth_token')) {
      await this.getAppData()
      this.$store.state.initialDataLoaded = true

      if (!this.$store.getters['settings/isAdmin'] && this.$route.meta.adminOnly) {
        alert('Only admin can access.')
        this.$router.push({ path: '/' })
      }

      setInterval(this.getNewData, 3000)
    }

    EventBus.$on('showTask', task => {
      this.showTask = task
    })
  },

  created() {
    let getTaskFromQuery = 0
    this.$watch('$route.query', async val => {
      if (getTaskFromQuery > 2) return
      if (!!val.task && this.$store.state.tasks.tasks && this.$store.state.tasks.tasks.length > 0) {
        const task = await this.$store.state.tasks.tasks.find(task => task.id === val.task)
        this.showTask = task
        getTaskFromQuery += 1
      }
    })

    if (getCookie('tasks') === 'true') {
      this.showTasks = true
    } else {
      this.showTasks = false
    }
    if (getCookie('chat') === 'true') {
      this.showChat = true
    } else {
      this.showChat = false
    }
    if (getCookie('timers') === 'true') {
      this.showTimer = true
    } else {
      this.showTimer = false
    }

    EventBus.$on('toggle_task', () => {
      this.showTaskDetail = !this.showTaskDetail
      document.cookie = `task=${this.showTaskDetail}`
    })
    EventBus.$on('toggle_tasks', () => {
      this.showTasks = !this.showTasks
      document.cookie = `tasks=${this.showTasks}`
    })
    EventBus.$on('toggle_timers', () => {
      this.showTimer = !this.showTimer
      document.cookie = `timers=${this.showTimer}`
    })
    EventBus.$on('toggle_chat', () => {
      this.showChat = !this.showChat
      document.cookie = `chat=${this.showChat}`
    })

    if (getCookie('bg-style')) {
      this.bgStyle = getCookie('bg-style')
    }
    if (getCookie('bg-theme')) {
      this.bgTheme = getCookie('bg-theme')
    }
    // background
    EventBus.$on('changeBackground', ({ option, styleTheme }) => {
      this.bgStyle = option
      this.bgTheme = styleTheme

      document.cookie = `bg-style=${option}`
      document.cookie = `bg-theme=${styleTheme}`
    })

    //listener
    var user_id = getCookie('user_id')
    var that = this

    if (user_id)
      window.Echo.channel('addentryevent_channel_' + user_id).listen('.AddEntryEvent', function(e) {
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
        that.$store.dispatch('GET_NEW_DATA')
      })
  },
  beforeDestroy() {
    // to avoid memory leak

    EventBus.$off('toggle_tasks')
    EventBus.$off('toggle_timers')
    EventBus.$off('toggle_chat')
    EventBus.$off('changeBackground')
    EventBus.$off('showTask')
  },
  methods: {
    // getNewData() {
    //   console.log('-getNewData--app.vue---')
    //   this.$http()
    //     .get('/get-new-data/' + window.sessionStorage.last_poll_timestamp)
    //     .then(response => {
    //       this.$store.dispatch('PROCESS_INCOMING_DATA', response)
    //     })
    // },
    async getAppDataFromApi() {
      try {
        return await this.$http().get('/test-tasks')
      } catch (e) {
        console.log(e)
      }
    },
    async getAppData() {
      this.$store.state.loading = true
      let indexDBExists = true
      let request = window.indexedDB.open('projectous-data')

      request.onupgradeneeded = function(e) {
        e.target.transaction.abort()
        indexDBExists = false
      }
      let dataValidation = false
      if (indexDBExists) dataValidation = await this.checkDataInIndexDB()
      let data = {}
      //TODO: find out why adding a table breaks
      if (indexDBExists && dataValidation) {
        console.log('----------------loading from IDB!------------------')
        for (let propertyName of modulesNamesList) {
          const allEntities = await idbGetAll(propertyName)
          if (propertyName === 'properties') {
            Object.keys(allEntities).forEach(key => {
              data[key] = allEntities[key]
            })
          } else {
            data[propertyName] = allEntities
          }
        }
      } else {
        console.log('----------------loading from API (/test-tasks) !------------------')
        data = await this.storeDataInIndexedDb()
      }
      this.$store.dispatch('PROCESS_INCOMING_DATA', data)
      //TODO
      const userLists = createUserLists(data.lists)
      this.$store.commit('lists/lists/CREATE_LISTS', {
        listName: 'userLists',
        lists: userLists
      })
      this.dateInterval()
      setInterval(this.dateInterval, 1800000)
    },
    async checkDataInIndexDB() {
      let valid = true
      for (let key in modulesNames) {
        if (modulesNames.hasOwnProperty(key)) {
          try {
            await idbKeyval.keys(modulesNames[key])
          } catch (e) {
            valid = false
          }
        }
      }
      return valid
    },
    async storeDataInIndexedDb() {
      const appData = await this.getAppDataFromApi()
      console.log('appData', appData)
      for (let key in appData) {
        if (Array.isArray(appData[key])) {
          appData[key].forEach(async entity => {
            try {
              if (key === 'lists') {
                key = 'user_task_lists' //TODO: fix name
              }
              await idbKeyval.set(entity.id, entity, key)
            } catch (e) {
              console.error('---------------------')
              console.error(e)
              console.error(entity)
              console.error('---------------------')
            }
          })
        } else {
          await idbKeyval.set(key, appData[key], 'properties')
        }
      }
      return appData
    },
    async reload() {
      this.$store.state.loading = true
      let data = {}
      data = await this.storeDataInIndexedDb()
      //this.$store.dispatch('PROCESS_INCOMING_DATA', data)
      this.$store.state.loading = false
    },
    dateInterval() {
      this.$store.commit('lists/createListsByDays')
    }
  }
}
</script>

<style lang="scss">
.modal-content {
  max-height: calc(100vh - 70px);
}
#app {
  display: flex;
  // background-color: rgba(0, 0, 0, 0.3);
  // background-color: rgba($color: orange, $alpha: 0.6);
}
#update-data-button {
  position: absolute;
  top: 30px;
  right: 30px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  background: url('assets/icons/refresh-icon.svg');
}
.right-fixed {
  display: flex;
}
.router-view-class {
  position: relative;
  height: calc(100vh - 50px);
  // overflow-y: hidden;
  flex: 1;
}
.app_task-detail {
  z-index: 10;
  width: 100%;
  height: 100%;
  position: absolute;
}

// background-color options
.paletteDefault {
  background: rgba($color: orange, $alpha: 0.6);
  background-repeat: no-repeat !important;
  background-size: cover !important;
}
.paletteRed {
  background: rgba($color: red, $alpha: 0.6);
}
.paletteGreen {
  background: rgba($color: green, $alpha: 0.6);
}
.paletteBlue {
  background: rgba($color: blue, $alpha: 0.6);
}
.paletteOrange {
  background: rgba($color: orange, $alpha: 0.6);
}
.palettePink {
  background: rgba($color: pink, $alpha: 0.6);
}
.paletteViolet {
  background: rgba($color: violet, $alpha: 0.6);
}
.paletteYellow {
  background: rgba($color: yellow, $alpha: 0.6);
}
</style>
