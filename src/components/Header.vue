<template>
  <div class="header">
    <!-- <div class="header-top" :style="`background-image: linear-gradient(to right, rgba(${headerBgColor},0.2), rgba(${headerBgColor},0.9), rgba(${headerBgColor},1));`"> -->
    <div class="header-nav">
      <router-link class="logo-name" to="/">
        <!-- {{ projectName | toUpperCase }} -->
        <img src="/apple-touch-icon.png" width="30" height="30" alt="logo" />
      </router-link>
      <div class="nav-buttons">
        <!-- <b-nav horizntal>
          <b-navbar-brand to="/">Projectous</b-navbar-brand>
          <b-nav-item to="/tasks">Tasks</b-nav-item>
          <b-nav-item to="/projects">Projects</b-nav-item>
          <b-nav-item to="/clients">Clients</b-nav-item>
          <b-nav-item to="/users">Users</b-nav-item>
          <b-nav-item to="/profile">Profile</b-nav-item>
          <b-nav-item to="/logout">Log Out</b-nav-item>
        </b-nav> -->
        <router-link class="nav-buttons__button" :to="button.path" v-for="(button, index) in navLinks" :style="{ 'text-decoration': $route.path === button.path ? 'underline' : '' }" :key="index">
          {{ button.name | toUpperCase }}
        </router-link>
      </div>
    </div>
    <div class="header-bottom">
      <div class="nav-icons">
        <i class="nav-icon icon-arrow_forward_ios nav-icons-active"></i>
        <div class="d-flex" :class="toggles[icon.name] ? 'nav-icons-active' : ''" v-for="(icon, index) in icons" :key="index">
          <div class="nav-icon" @click="toggle(icon.name)">
            <i class="nav-icon__icon" :class="[icon.icon, icon.name == 'reload' && $store.state.totalActiveRequests ? 'reload-rotate' : null]" :style="icon.name == 'reload' ? 'color: white;' : ''" />
            <span class="nav-icon__name" :style="icon.name == 'reload' ? 'color: white;' : ''">
              {{ icon.name | toUpperCase }}
            </span>
          </div>
          <div class="chat-right-icons" v-if="icon.name === 'chat'">
            <div class="chat-right-icon" style="background-color: green;">
              <span class="chat-right-icon-text">0</span>
            </div>
            <div class="chat-right-icon" style="background-color: red;">
              <span class="chat-right-icon-text">0</span>
            </div>
          </div>
          <div class="timers-right-icons" v-if="icon.name === 'timers' && (timerRunning || timerEmptyFields > 0)">
            <i class="icon-play_arrow" style="font-size: 20px;" :style="{ color: timerRunning ? '#20d420' : 'rgba(0,0,0,0)' }" />
            <div class="red-circle-icon" v-if="timerEmptyFields > 0">
              <span class="red-circle-icon-text">{{ timerEmptyFields }}</span>
            </div>
          </div>
        </div>

        <div class="header-paint" v-if="toggles.paint">
          <div class="mb-3" v-for="(style, styleIndex) in backgroundStyle" :key="styleIndex">
            <div class="d-flex justify-content-between">
              <span style="font-weight: bold;">{{ style.name }}</span>
              <i v-if="styleIndex === 0" class="icon-close" style="cursor: pointer;" @click="toggles.paint = false"></i>
            </div>
            <div>
              <div class="header-paint-style" v-if="style.name === 'Colors'">
                <span class="header-paint-color" :class="option" @click="setBackground(option, style.name)" v-for="(option, optionIndex) in style.options" :key="optionIndex"> </span>
              </div>

              <div v-else class="header-paint-style">
                <div class="header-paint-image" @click="setBackground(option, style.name)" v-for="(option, optionIndex) in style.options" :key="optionIndex" :style="{ background: `url(${option})` }"></div>
              </div>
            </div>
          </div>
        </div>
        <!-- <i class="icon-cached header-icon-refresh" ></i> -->
      </div>
      <div class="header_menu-wrapper">
        <div class="profile-icon border" @click="showMenu = !showMenu"></div>
        <div class="header_menu" v-if="showMenu">
          <div class="header_menu-item-list">
            <span class="header_menu-item" @click="goTo('profile')">Profile</span>
            <span class="header_menu-item">Change company</span>
            <span class="header_menu-item" @click="logout">Log Out</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { EventBus } from '@/components/event-bus'
import { idbKeyval } from '@/plugins/idb.ts'
import { getCookie } from '@/utils/util-functions'

export default Vue.extend({
  data() {
    return {
      showMenu: false,
      timerEmptyFields: 0,
      timerRunning: false,
      // projectName: 'P',
      navLinks: [
        { name: 'Task Cloud', path: '/tasks' },
        { name: 'Kanban', path: '/kanban' },
        { name: 'clients', path: '/clients' },
        { name: 'users', path: '/users' },
        { name: 'invoices', path: '/invoices' },
        { name: 'reports', path: '/reports' },
        { name: 'graph', path: '/graph' },
        { name: 'profit', path: '/profit' }
      ],
      colors: {
        backgroundColor: ['0', '0', '0'],
        logo: { name: '#FFFFFF' }
      },
      icons: [
        { name: 'tasks', icon: 'icon-library_books' },
        { name: 'chat', icon: 'icon-chat' },
        { name: 'timers', icon: 'icon-timer' },
        { name: 'paint', icon: 'icon-format_paint' },
        { name: 'reload', icon: 'icon-cached' }
      ],
      toggles: {
        tasks: false,
        chat: false,
        timers: false,
        paint: false
      },
      backgroundStyle: [
        // the 'name' inside these objects is connected in the App.vue's "changeBackground" EventBus. If wanted to rename, please rename it there also
        {
          name: 'Colors',
          options: ['paletteRed', 'paletteGreen', 'paletteBlue', 'paletteOrange', 'palettePink', 'paletteViolet', 'paletteYellow']
        },
        {
          name: 'Images',
          options: [
            'https://images.pexels.com/photos/38537/woodland-road-falling-leaf-natural-38537.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260',
            'https://images.pexels.com/photos/490466/pexels-photo-490466.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
            'https://images.pexels.com/photos/128234/pexels-photo-128234.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
            'https://images.pexels.com/photos/33109/fall-autumn-red-season.jpg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
            'https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
            'https://images.pexels.com/photos/531321/pexels-photo-531321.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
            'https://images.pexels.com/photos/719609/pexels-photo-719609.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'
          ]
        }
      ]
    }
  },
  computed: {
    headerBgColor() {
      let rgb = this.colors.backgroundColor
      return `${rgb[0]}, ${rgb[0]}, ${rgb[0]}`
    }
  },
  mounted() {
    // window.$_app = this
  },
  methods: {
    goTo(path) {
      this.showMenu = false
      if (this.$route.path === `/${path}`) return

      this.$router.push({ path: `/${path}` })
    },
    async logout() {
      document.cookie = 'auth_token=' + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      window.location.reload()
    },
    async setBackground(option, styleTheme) {
      console.log(styleTheme)
      await EventBus.$emit('changeBackground', { option, styleTheme })
    },
    async toggle(iconName) {
      if (iconName === 'reload') {
        this.$emit('reload')
        // let data = await this.storeDataInIndexedDb()
        // return this.$store.dispatch('PROCESS_INCOMING_DATA', data)
      }
      this.toggles[iconName] = !this.toggles[iconName]
      await EventBus.$emit(`toggle_${iconName}`)
    }
    // async getAppDataFromApi() {
    //   try {
    //     return await this.$http().get('/test-tasks')
    //   } catch (e) {
    //     console.log(e)
    //   }
    // },
    // async storeDataInIndexedDb() {
    //   const appData = await this.getAppDataFromApi()
    //   console.log('appData', appData)
    //   for (let key in appData) {
    //     if (Array.isArray(appData[key])) {
    //       appData[key].forEach(async entity => {
    //         try {
    //           if (key === 'lists') {
    //             key = 'user_task_lists' //TODO: fix name
    //           }
    //           await idbKeyval.set(entity.id, entity, key)
    //         } catch (e) {
    //           console.error('---------------------')
    //           console.error(e)
    //           console.error(entity)
    //           console.error('---------------------')
    //         }
    //       })
    //     } else {
    //       await idbKeyval.set(key, appData[key], 'properties')
    //     }
    //   }
    //   return appData
    // }
  },
  created() {
    if (getCookie('tasks') === 'true') {
      this.toggles.tasks = true
    } else {
      this.toggles.tasks = false
    }
    if (getCookie('chat') === 'true') {
      this.toggles.chat = true
    } else {
      this.toggles.chat = false
    }
    if (getCookie('timers') === 'true') {
      this.toggles.timers = true
    } else {
      this.toggles.timers = false
    }
    EventBus.$on('timerEmptyFields', count => {
      this.timerEmptyFields = count
    })
    EventBus.$on('timerStatus', status => {
      if (status === 'running') {
        return (this.timerRunning = true)
      }
      this.timerRunning = false
    })
    //
  },
  filters: {
    toUpperCase(val) {
      return val.toUpperCase()
    }
  },
  beforeDestroy() {
    EventBus.$off('timerEmptyFields')
    EventBus.$off('timerStatus')
  }
})
</script>

<style lang="scss">
@-moz-keyframes spin {
  100% {
    -moz-transform: rotate(-360deg);
  }
}
@-webkit-keyframes spin {
  100% {
    -webkit-transform: rotate(-360deg);
  }
}
@keyframes spin {
  100% {
    -webkit-transform: rotate(-360deg);
    transform: rotate(-360deg);
  }
}

.reload-rotate {
  -webkit-animation: spin 1s linear infinite;
  -moz-animation: spin 1s linear infinite;
  animation: spin 1s linear infinite;
}
.header {
  // border: 10px solid red !important;
  // flex-wrap: wrap;
  // border: 1px solid
}
.header_menu-wrapper {
  // border: 1px solid red;
  position: relative;
}
.header_menu {
  border-radius: 3px;
  position: absolute;
  // color: white;
  z-index: 10;
  background-color: #f7f8ff;
  right: 0;
  top: 40px;
  // width: 180px;
  display: flex;
  justify-content: center;
  border: 1px solid rgba($color: #000000, $alpha: 0.4);
  box-shadow: 0px 0px 15px rgba($color: #000000, $alpha: 0.8);
}
.header_menu-item-list {
  margin: 15px 0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  font-weight: 500;
}
.header_menu-item {
  padding: 2px 20px;
  white-space: nowrap;
}
.header_menu-item:hover {
  background-color: rgba($color: #000000, $alpha: 0.2);
  // color: white;
}
.nav-buttons {
  display: flex;
}
.nav-buttons__button {
  margin-right: 5px;
}
.timers-right-icons {
  // border: 1px solid red;
  display: flex;
  flex-direction: column;
  // justify-content: center;
  align-items: center;
}
.chat-right-icons {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 3px 1px;
}
.chat-right-icon {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  // background-color: red;
  display: flex;
  justify-content: center;
  align-items: center;
}
.chat-right-icon-text {
  font-size: 10px;
  color: white;
}
.red-circle-icon .red-circle-icon-text {
  font-size: 10px;
  font-weight: bold;
  color: white;
}
</style>

<style lang="scss" scoped>
.red-circle-icon {
  width: 15px;
  height: 15px;
  background-color: red;
  border-radius: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}
/* .header { */
/* display: flex; */
/* flex-direction: column; */
/* height: 147px; */

/* } */
.header {
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 30px;
  border-bottom: 2px solid white;
  /* background-color: #616161; */
  background-color: rgba(0, 0, 0, 0.4);
}
.header-nav {
  display: flex;
  align-items: center;
  padding-left: 30px;
}
.logo-name {
  display: flex;
  justify-content: center;
  align-items: center;
  // font-weight: bold;
  // font-size: 27px;
  // color: white;
  // text-decoration: none;
}
.logo-name:hover {
  cursor: pointer;
}
.profile-icon {
  width: 35px;
  height: 35px;
  background-color: gray;
  border-radius: 50%;
  cursor: pointer;
}
.header-bottom {
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.nav-buttons {
  margin-left: 27px;
}
.nav-buttons__button {
  /* font-size: 17px; */
  margin-right: 20px;
  color: white;
  font-weight: 500;
  text-decoration: none;
}
.nav-buttons__button:hover {
  cursor: pointer;
}
.nav-icons {
  display: flex;
  align-items: center;
  padding-right: 30px;
  color: rgba(255, 255, 255, 0.5);
  position: relative;

  .request-spinner {
    width: 35px;
    height: 35px;
    margin-left: 15px;
  }
}
.nav-icons-active {
  color: white;
}
.nav-icon {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-left: 15px;
}

.nav-icon:hover {
  cursor: pointer;
}
.nav-icon__icon {
  font-size: 24px;
  display: flex;
}
.nav-icon__name {
  font-size: 10px;
  margin-top: -5px;
}
.header-paint {
  position: absolute;
  display: flex;
  flex-direction: column;
  border-radius: 7px;
  padding: 20px 25px;
  width: 100%;
  top: 50px;
  z-index: 10;
  color: #1d2228;
  background-color: #f7f8ff;
}

.header-paint-style {
  margin-top: 10px;
  display: grid;
  grid-template-columns: auto auto auto auto auto;
  grid-row-gap: 10px;
  grid-column-gap: 21px;
}
.header-paint-color {
  display: inline-block;
  width: 35px;
  height: 35px;
  border-radius: 100px;
  cursor: pointer;
  /* background-color: black; */
}

.header-paint-images {
  display: flex;
}
.header-paint-image {
  width: 35px;
  height: 35px;
  border-radius: 7px;
  background-repeat: no-repeat !important;
  background-size: cover !important;
  cursor: pointer;
}

/* paletteColors: ['red', 'green', 'blue', 'rgba($color: orange, $alpha: 0.6)', 'pink', 'violet', 'rgba(255, 165, 0, 0.6)' ] */
</style>
