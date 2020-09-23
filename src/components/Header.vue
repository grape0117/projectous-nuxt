<template>
  <div class="header">
    <!-- <div class="header-top" :style="`background-image: linear-gradient(to right, rgba(${headerBgColor},0.2), rgba(${headerBgColor},0.9), rgba(${headerBgColor},1));`"> -->
    <div class="header-nav">
      <router-link class="logo-name" to="/">
        {{ projectName | toUpperCase }}
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
        <router-link class="nav-buttons__button" @click="navClick(button)" :to="button.path" v-for="(button, index) in navLinks" :key="index">
          {{ button.name | toUpperCase }}
        </router-link>
      </div>
    </div>
    <div class="header-bottom">
      <div class="nav-icons">
        <i class="nav-icon icon-arrow_forward_ios nav-icons-active"></i>
        <div class="nav-icon" :class="toggles[icon.name] ? 'nav-icons-active' : ''" v-for="(icon, index) in icons" :key="index" @click="toggle(icon.name)">
          <i class="nav-icon__icon" :class="icon.icon" :style="icon.name == 'reload' ? 'color: white;' : ''"></i>
          <span class="nav-icon__name" :style="icon.name == 'reload' ? 'color: white;' : ''">
            {{ icon.name | toUpperCase }}
          </span>
        </div>
        <div class="header-paint" v-if="toggles.paint">
          <div class="d-flex justify-content-between">
            <span style="font-weight: bold;">Theme</span>
            <i class="icon-close" style="cursor: pointer;" @click="toggles.paint = false"></i>
          </div>
          <div class="header-paint-colors">
            <span class="header-paint-color" :class="color" @click="setBackground(color)" v-for="(color, colorIndex) in paletteColors" :key="colorIndex"> </span>
          </div>
        </div>
        <!-- <i class="icon-cached header-icon-refresh" ></i> -->
      </div>
      <div class="profile-icon border"></div>
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
      projectName: 'P',
      navLinks: [
        { name: 'Task Cloud', path: '/tasks' },
        { name: 'Kanban', path: '/kanban' },
        { name: 'clients', path: '/clients' },
        { name: 'users', path: '/users' }
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
      paletteColors: ['paletteRed', 'paletteGreen', 'paletteBlue', 'paletteOrange', 'palettePink', 'paletteViolet', 'paletteYellow']
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
    async setBackground(color) {
      await EventBus.$emit('changeBackground', color)
    },
    async toggle(iconName) {
      if (iconName === 'reload') {
        return await this.storeDataInIndexedDb()
      }
      this.toggles[iconName] = !this.toggles[iconName]
      await EventBus.$emit(`toggle_${iconName}`)
    },
    async getAppDataFromApi() {
      try {
        return await this.$http().get('/test-tasks')
      } catch (e) {
        console.log(e)
      }
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
    }
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
  },
  filters: {
    toUpperCase(val) {
      return val.toUpperCase()
    }
  }
})
</script>

<style lang="scss" scoped>
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
  padding-left: 20px;
}
.logo-name {
  font-weight: bold;
  font-size: 27px;
  color: white;
  text-decoration: none;
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

.header-paint-colors {
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

/* paletteColors: ['red', 'green', 'blue', 'rgba($color: orange, $alpha: 0.6)', 'pink', 'violet', 'rgba(255, 165, 0, 0.6)' ] */
</style>
