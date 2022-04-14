<template>
  <!-- <div id="app" style="position: relative" class="app-class" :class="bgStyle && bgTheme === 'Colors' ? bgStyle : 'paletteDefault'" :style="{ background: bgTheme === 'Images' ? `url(${this.bgStyle})` : '' }"> -->
  <!-- <div id="app" style="position: relative" class="app-class" :class="{ 'paletteDefault' : !has_background_theme}"  :style="{ 'background' : background_style }"> -->
  <div id="app" style="position: relative" class="app-class" :style="{ background: background_style }">
    <b-overlay :show="$store.state.loading" rounded="sm" style="flex-grow: 1">
      <!-- Loading area -->
      <template #overlay>
        <div class="text-center">
          <b-spinner label="Spinning"></b-spinner>
          <p>Loading ...</p>
        </div>
      </template>

      <div class="row-no-padding">
        <Header v-on:reload="reload" />
        <div class="d-flex justify-content-between">
          <div class="router-view-class">
            <task-detail v-if="has_route_query_task" class="app_task-detail" :task="task" />
            <router-view style="width: 100%; height: 100%" />
          </div>
          <div class="d-flex">
            <task-tray v-show="showTaskSection" />
            <task-side-bar v-show="has_route_query_showChatSection || showChatSection" :show="has_route_query_showChatSection || showChatSection" />
            <timer-tab v-show="showTimerSection" />
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
    <b-modal v-model="$store.state.popAlert" title="Error" ok-only>
      An error occured. Your previous action may not have completed successfully.
    </b-modal>
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

import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

Vue.component('v-select', vSelect)

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
      showTaskSection: false,
      showChatSection: false,
      showTimerSection: false,
      bgDefault: 'rgba(255, 165, 0, 0.6)', // default style
      bgStyle: '',
      bgTheme: '',
      showTaskDetail: false
    }
  },
  computed: {
    // $route.query
    route_query() {
      return this.$route.query
    },
    // check if has $route.query.task
    has_route_query_task() {
      return this.route_query && this.route_query.task ? true : false
    },
    has_route_query_showChatSection() {
      return this.route_query.showChatSection === 'true' ? true : false
    },
    route_query_taskId() {
      if (this.has_route_query_task) {
        return this.route_query.task
      }
      return null
    },
    task() {
      /**
       * Getting "Task" data from Store
       * NOTE: must be replaced when tasks API is available already
       */
      const task = this.$store.state.tasks.tasks.find(t => t.id === this.route_query_taskId)
      return task
    },
    has_background_theme() {
      return !!this.bgTheme && !!this.bgStyle
    },
    background_style() {
      if (typeof this.bgStyle === 'object') {
        return `url(${this.bgStyle.image})`
      }
      return this.bgStyle
    },
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
        // alert('Only admin can access.')
        // this.$router.push({ path: '/' })
      }

      setInterval(this.getNewData, 3000)
    }
  },

  created() {
    if (getCookie('tasks') === 'true') {
      this.showTaskSection = true
    } else {
      this.showTaskSection = false
    }
    if (getCookie('chat') === 'true') {
      this.showChatSection = true
    } else {
      this.showChatSection = false
    }
    if (getCookie('timers') === 'true') {
      this.showTimerSection = true
    } else {
      this.showTimerSection = false
    }

    EventBus.$on('toggle_task', value => {
      this.showTaskDetail = value
      document.cookie = `task=${this.showTaskDetail}`
    })
    EventBus.$on('toggle_tasks', value => {
      this.showTaskSection = value
      document.cookie = `tasks=${this.showTaskSection}`
    })
    EventBus.$on('toggle_timers', value => {
      this.showTimerSection = value
      document.cookie = `timers=${this.showTimerSection}`
    })
    EventBus.$on('toggle_chat', value => {
      this.showChatSection = value
      document.cookie = `chat=${this.showChatSection}`
    })

    // STYLE
    let bgStyle = getCookie('bg-style')
    if (bgStyle) {
      try {
        let style = JSON.parse(bgStyle)
        this.bgStyle = style
      } catch (error) {
        this.bgStyle = bgStyle
      }
    } else {
      const style_color = 'rgba(255, 165, 0, 0.6)'
      this.bgStyle = style_color
      this.setCookie('style', style_color)
    }

    // THEMES
    let style_theme = getCookie('bg-theme')
    if (style_theme) {
      this.bgTheme = style_theme
    } else {
      const theme_name = 'Colors'
      this.bgTheme = theme_name
      this.setCookie('theme', theme_name)
    }

    // background
    EventBus.$on('changeBackground', ({ option, theme }) => {
      this.bgStyle = option
      this.bgTheme = theme

      this.setCookie('style', option)
      this.setCookie('theme', theme)
      // document.cookie = `bg-style=${JSON.stringify(option)}`
      // document.cookie = `bg-theme=${theme}`
    })

    //listener
    let user_id = getCookie('user_id')
    let that = this

    if (user_id) {
      this.$store.state.settings.logged_in = true
      try {
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
      } catch (e) {
        console.error('Websockets not running?')
      }
    }
  },
  beforeDestroy() {
    // to avoid memory leak

    EventBus.$off('toggle_tasks')
    EventBus.$off('toggle_timers')
    EventBus.$off('toggle_chat')
    EventBus.$off('changeBackground')
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
    setCookie(name, value) {
      document.cookie = `bg-${name}=${JSON.stringify(value)}`
    },
    async getAppDataFromApi(updated_at) {
      try {
        return await this.$http().get('/test-tasks/' + updated_at)
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
      if (false && indexDBExists && dataValidation) {
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
      //TODO: user created lists are breaking since commit f7cd86c85cb00b58cf59ad1232595e3eaec8f115 for no apparent reason
      // const userLists = createUserLists(data.lists)
      // this.$store.commit('lists/lists/CREATE_LISTS', {
      //   listName: 'userLists',
      //   lists: userLists
      // })

      setInterval(this.fetchData, 10000)

      this.dateInterval()
      setInterval(this.dateInterval, 1800000)
    },
    async fetchData() {
      console.log(window.sessionStorage.last_poll_timestamp, 'poll')
      if (!window.sessionStorage.last_poll_timestamp) return
      const appData = await this.getAppDataFromApi(window.sessionStorage.last_poll_timestamp)
      this.$store.dispatch('PROCESS_INCOMING_DATA', appData)
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
      const appData = await this.getAppDataFromApi(0)
      console.log('appData', appData)
      if (appData) {
        document.cookie = `company_user_id=${appData.current_company_user_id}`
      }
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
    async clear_idb() {
      let oRequest = indexedDB.open('projectous-data')
      oRequest.onsuccess = function() {
        console.log('clearing', modulesNamesList)
        let db = oRequest.result
        for (module of modulesNamesList) {
          console.log(module)
          let tx = db.transaction(module, 'readwrite')
          let st = tx.objectStore(module)
          st.clear(module)
        }
      }
    },
    async reload() {
      // console.log('reloading')
      // this.$store.state.loading = true
      // this.clear_idb()
      // let data = {}
      // data = await this.storeDataInIndexedDb()
      // this.$store.dispatch('PROCESS_INCOMING_DATA', data)
      // this.$store.state.loading = false
    },
    dateInterval() {
      this.$store.commit('lists/createListsByDays')
    }
  }
}
</script>

<style lang="scss">
:root {
  --main-container-width: 65%;
  /*The variable should be set with a calc and the calc uses a variable? */
  /*document.documentElement.style.setProperty('--pagebackground', 'firebrick');*/
}

.modal-content {
  max-height: calc(100vh - 70px);
}
#app {
  display: flex;
  overflow-y: auto;
  background-repeat: no-repeat !important;
  background-size: cover !important;
  // background-color: rgba(0, 0, 0, 0.3);
  // background-color: rgba($color: orange, $alpha: 0.6);
}

.container-fluid {
  padding: 20px 50px 0 50px;
  max-height: calc(100vh - 50px);
  overflow-y: auto;
  overflow-x: hidden;
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
  min-height: calc(100vh - 50px);
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
// .paletteDefault {
//   background: rgba($color: orange, $alpha: 0.6);
// }
// .paletteRed {
//   background: rgba($color: red, $alpha: 0.6);
// }
// .paletteGreen {
//   background: rgba($color: green, $alpha: 0.6);
// }
// .paletteBlue {
//   background: rgba($color: blue, $alpha: 0.6);
// }
// .paletteOrange {
//   background: rgba($color: orange, $alpha: 0.6);
// }
// .palettePink {
//   background: rgba($color: pink, $alpha: 0.6);
// }
// .paletteViolet {
//   background: rgba($color: violet, $alpha: 0.6);
// }
// .paletteYellow {
//   background: rgba($color: yellow, $alpha: 0.6);
// }
</style>
