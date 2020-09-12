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
          <i class="nav-icon__icon" :class="icon.icon"></i>
          <span class="nav-icon__name">
            {{ icon.name | toUpperCase }}
          </span>
        </div>
      </div>
      <div class="profile-icon border"></div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { EventBus } from '@/components/event-bus'

export default Vue.extend({
  data() {
    return {
      projectName: 'P',
      navLinks: [{ name: 'Task Cloud', path: '/tasks' }, { name: 'Kanban', path: '/kanban' }, { name: 'clients', path: '/clients' }, { name: 'users', path: '/users' }],
      navLinks: [
        {
          name: 'Task Cloud',
          path: '/tasks'
        },
        {
          name: 'Kanban',
          path: '/kanban'
        },
        {
          name: 'clients',
          path: '/clients'
        },
        {
          name: 'users',
          path: '/users'
        }
      ],
      colors: {
        backgroundColor: ['0', '0', '0'],
        logo: { name: '#FFFFFF' }
      },
      icons: [{ name: 'tasks', icon: 'icon-library_books' }, { name: 'chat', icon: 'icon-chat' }, { name: 'timers', icon: 'icon-timer' }],
      toggles: {
        tasks: true,
        chat: false,
        timers: true
      }
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
      this.toggles[iconName] = !this.toggles[iconName]
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
  background-color: #616161;
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
</style>
