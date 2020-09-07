<template>
  <div class="header">
    <!-- top -->
    <div class="header-top" :style="`background-image: linear-gradient(to right, rgba(${headerBgColor},0.2), rgba(${headerBgColor},0.9), rgba(${headerBgColor},1));`">
      <div class="logo" :style="`background-color: rgb(${headerBgColor})`">
        <router-link class="logo-name" to="/">
          {{ projectName | toUpperCase }}
        </router-link>
      </div>

      <div class="profile-icon"></div>
    </div>

    <!-- bottom -->
    <div class="header-bottom">
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

      <div class="nav-icons">
        <i class="nav-icon icon-arrow_forward_ios"></i>
        <div class="nav-icon" v-for="(icon, index) in icons" :key="index" @click="toggle(icon.name)">
          <!-- {{ icon.icon }} -->
          <i class="nav-icon__icon" :class="icon.icon"></i>
          <span class="nav-icon__name">
            {{ icon.name | toUpperCase }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { EventBus } from '@/components/event-bus'

export default Vue.extend({
  data() {
    return {
      projectName: 'projectous',
      navLinks: [
        {
          name: 'clients',
          path: '/clients'
        },
        {
          name: 'projects',
          path: '/projects'
        },
        {
          name: 'users',
          path: '/users'
        }
      ],
      colors: {
        // backgroundGradient: ['#03A1EC', '#003C7D', '#020D58'],
        backgroundColor: ['0', '0', '0'],
        logo: {
          background: '#2C63A4',
          name: '#FFFFFF'
        }
      },
      icons: [
        {
          name: 'tasks',
          icon: 'icon-library_books'
        },
        {
          name: 'chat',
          icon: 'icon-chat'
        },
        {
          name: 'timers',
          icon: 'icon-timer'
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
  methods: {
    navClick() {
      alert('no function yet')
    },
    async toggle(iconName) {
      await EventBus.$emit(`toggle_${iconName}`)
    }
  },
  filters: {
    toUpperCase(val) {
      return val.toUpperCase()
    }
  }
})
</script>

<style scoped>
.header {
  display: flex;
  flex-direction: column;
  height: 147px;
  border-bottom: 2px solid #3884a5;
}
.header-top {
  width: 100%;
  height: 90px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 30px;
}
.logo {
  width: 330px;
  height: 100%;
  display: flex;
  align-items: center;
  padding-left: 30px;
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
  width: 48px;
  height: 48px;
  background-color: gray;
  border-radius: 50%;
}
.header-bottom {
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.nav-buttons {
  padding-left: 27px;
}
.nav-buttons__button {
  font-size: 17px;
  margin-right: 20px;
  color: black;
  text-decoration: none;
}
.nav-buttons__button:hover {
  cursor: pointer;
}
.nav-icons {
  display: flex;
  align-items: center;
  padding-right: 30px;
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
</style>
