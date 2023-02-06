<template>
  <div class="header">
    <div class="header-nav">
      <div style="width: 30px">
        <!-- @click="goTo('project')" -->
        <img @mouseenter="setReload(true)" v-if="!showReload" src="/apple-touch-icon.png" width="30" height="30" alt="logo" />
        <div v-else class="reload-icon" @mouseleave="setReload(false)">
          <i class="icon-cached" @click="reload" :class="$store.state.totalActiveRequests ? 'reload-rotate' : null" />
          <span class="reload-text">RELOAD</span>
        </div>
      </div>
      <div class="nav-buttons" style="align-items: center;">
        <router-link class="nav-buttons__button" :to="button.path" v-for="(button, index) in navLinks" :style="{ 'text-decoration': $route.path === button.path ? 'underline' : '' }" :key="index">
          {{ button.name | toUpperCase }}
        </router-link>
        <div>
          <b-dropdown id="dropdown-divider" class="transparent-button" text="Reports">
            <b-dropdown-item-button @click="$router.push('/days')"><router-link id="report-menu-link" to="/days">Days</router-link></b-dropdown-item-button>
            <b-dropdown-item-button @click="$router.push('/invoiceable')"><router-link id="report-menu-link" to="/invoiceable">Invoiceable</router-link></b-dropdown-item-button>
            <b-dropdown-item-button @click="$router.push('/payable')"><router-link id="report-menu-link" to="/payable">Payable</router-link></b-dropdown-item-button>
            <b-dropdown-item-button @click="$router.push('/profit')"><router-link id="report-menu-link" to="/profit">Profit</router-link></b-dropdown-item-button>
            <b-dropdown-item-button @click="$router.push('/user_report')"><router-link id="report-menu-link" to="/user_report">My Report</router-link></b-dropdown-item-button>
          </b-dropdown>
          <b-dropdown id="new-task-menu" class="transparent-button" text="New Task" ref="newtask_dropdown">
            <div class="new-task-container">
              <!-- <select v-model="new_task_project_id" id="task-project-id2" class="form-control select2-select" name="project_id" style="width: 30%;">
                <option value="">No Project</option>
                <option>Personal</option>
                <option v-for="project in openprojects()" :value="project.id"> {{ client_name(project.client_company_id) }} - {{ project.name }} </option>
              </select> -->
              <vue-bootstrap-typeahead ref="projectsTypeahead" :serializer="s => client_name(s.client_company_id) + '-' + s.name" class="mb-5" v-model="projectSearch" id="task-project-id2" :minMatchingChars="1" :data="openprojects()" @hit="selectProject" placeholder="Select a project" />
              <input type="text" id="task" ref="noteInput" class="form-control" placeholder="@assign" @keyup.enter="createTask" @input="creatingTask" style="width: 70%;" />
            </div>
            <div class="search_result" v-if="showResult">
              <h6 class="card-text">
                <b-badge :style="{ 'background-color': getClientAcronymColor(new_task_project_id) }" variant="primary" class="mr-2" v-if="getProjectDetails(new_task_project_id)" v-b-tooltip.hover :title="taskProjectName(new_task_project_id)">
                  {{ getProjectDetails(new_task_project_id) }}
                </b-badge>
                <b-dropdown id="priorities-dropdown" :text="new_priority ? capitalizeFirstLetter(new_priority) : ''" :variant="priorityColor(new_priority)" style="border:none">
                  <b-dropdown-item @click="updatePriority('high')">High</b-dropdown-item>
                  <b-dropdown-item @click="updatePriority('regular')">Regular</b-dropdown-item>
                  <b-dropdown-item @click="updatePriority('low')">Low</b-dropdown-item>
                  <b-dropdown-item @click="updatePriority('hold')">Hold</b-dropdown-item>
                </b-dropdown>
                <b>
                  &nbsp;{{ new_task_title }}

                  <span v-if="new_company_user_id">
                    <span :title="`${getCompanyUserDetails(new_company_user_id).name}   ${assignedUser.step}:${assignedUser.notes}`" @click="updateUser(user)" :class="`avatar mr-1 pointer ${assignedUser.status} ${assignedUser.step} ${assignedUser.notes ? 'notes' : ''}`" :style="{ 'background-color': getCompanyUserDetails(new_company_user_id).color, cursor: 'pointer', display: 'inline-flex' }">
                      {{ abbrName(getCompanyUserDetails(new_company_user_id).name) }}
                    </span>
                  </span>
                  <input id="task-list-due-date" @change="saveDueDate" class="badge badge-danger mr-3" :style="{ width: new_task_due_date ? '' : '26px!important', float: 'right', display: 'flex', cursor: 'pointer', 'background-color': dueDateDetails(new_task_due_date, true) }" type="date" name="due_at" placeholder="Due Date" :value="dueDate(new_task_due_date)" v-b-tooltip.hover :title="dueDateDetails(new_task_due_date)" />
                </b>
              </h6>
              <!-- end result -->
            </div>
            <b-button class="float-right" variant="outline-primary" @click="closeNewTask">Close</b-button>
          </b-dropdown>
        </div>
      </div>
    </div>
    <div class="header-bottom">
      <div class="nav-icons">
        <div class="d-flex" :class="(has_route_query_showChatSection && icon.name === 'chat') || toggles[icon.name] ? 'nav-icons-active' : ''" v-for="(icon, index) in icons" :key="index">
          <div class="nav-icon" @click="toggle(icon.name)">
            <i class="nav-icon__icon" :class="icon.icon" />
            <span class="nav-icon__name">
              {{ icon.name | toUpperCase }}
            </span>
          </div>
          <div class="chat-right-icons" v-if="icon.name === 'chat'">
            <div class="chat-right-icon" style="background-color: green">
              <span class="chat-right-icon-text">0</span>
            </div>
            <div class="chat-right-icon" style="background-color: red">
              <span class="chat-right-icon-text">0</span>
            </div>
          </div>
          <div class="timers-right-icons" v-if="icon.name === 'timers' && (timerRunning || timerEmptyFields > 0)">
            <i class="icon-play_arrow" style="font-size: 20px;" :style="{ color: timerRunning ? '#20d420' : '#20d420' }" />
            <div class="red-circle-icon" v-if="timerEmptyFields > 0">
              <span class="red-circle-icon-text">{{ timerEmptyFields }}</span>
            </div>
          </div>
        </div>
        <div class="header-paint" v-if="this.toggles.paint" v-click-outside.prevent="closeModal">
          <div class="mb-3" v-for="(style, styleIndex) in backgroundStyle" :key="styleIndex">
            <div class="d-flex justify-content-between">
              <span style="font-weight: bold">{{ style.name }}</span>
              <i v-if="styleIndex === 0" class="icon-close" style="cursor: pointer" @click="toggles.paint = false"></i>
            </div>
            <div>
              <div class="header-paint-style" v-if="style.name === 'Colors'">
                <span class="header-paint-color" :style="{ 'background-color': option }" @click="setBackground(option, style.name)" v-for="(option, optionIndex) in style.options" :key="optionIndex"></span>
              </div>

              <div v-else class="header-paint-style">
                <div class="header-paint-image" @click="setBackground(option, style.name)" v-for="(option, optionIndex) in style.options" :key="optionIndex" :style="{ background: `url(${option.image})` }"></div>
              </div>
            </div>
          </div>
        </div>
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
import TaskActionRow from '../views/TaskActionRow.vue'
import { abbrName } from '@/utils/util-functions'
import _ from 'lodash'
import moment from 'moment'

export default Vue.extend({
  extends: TaskActionRow,
  watch: {
    projectSearch: _.debounce(function(project_name) {
      let projects = this.openprojects()
      projects = projects.filter(project => project.name.toLowerCase().indexOf(project_name.toLowerCase()) >= 0)
      return projects
    }, 500)
  },
  data() {
    return {
      projectSearch: '',
      new_task_title: '',
      task_content: '',
      new_company_user_id: false,
      new_user_name: '',
      new_priority: 'active',
      new_task_due_date: '',
      showMenu: false,
      timerEmptyFields: 0,
      timerRunning: false,
      // projectName: 'P',
      navLinks: [
        // { name: 'Task Cloud', path: '/tasks' },
        { name: 'Tasks', path: '/user-tasks' },
        { name: 'Projects', path: '/projects' },
        { name: 'clients', path: '/clients' },
        { name: 'users', path: '/users' },
        { name: 'invoices', path: '/invoices' }
      ],
      colors: {
        backgroundColor: ['0', '0', '0'],
        logo: { name: '#FFFFFF' }
      },
      icons: [
        // { name: 'tasks', icon: 'icon-library_books' }, //revising api for tasks
        { name: 'chat', icon: 'icon-chat' },
        { name: 'timers', icon: 'icon-timer' },
        { name: 'paint', icon: 'icon-format_paint' }
        // { name: 'reload', icon: 'icon-cached' }
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
          options: [
            'rgb(255, 0, 0)', //paletteRed
            'rgb(0, 128, 0)', //paletteGreen
            'rgb(0, 0, 255)', //paletteBlue
            'rgb(255, 165, 0)', //paletteOrange
            'rgb(255, 192, 203)', //palettePink
            'rgb(238, 130, 238)', //paletteViolet
            'rgb(255, 255, 0)' //paletteYellow
          ]
        },
        {
          name: 'Images',
          options: [
            {
              image: 'https://images.pexels.com/photos/38537/woodland-road-falling-leaf-natural-38537.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260',
              rgba_colors: [
                { r: '167', g: '187', b: '120' }, // #A7BB78
                { r: '67', g: '71', b: '22' }, // #434716
                { r: '174', g: '167', b: '174' }, // #AEA7AE
                { r: '157', g: '133', b: '108' }, // #9D856C
                { r: '181', g: '102', b: '99' } // #B56663
              ]
            },
            {
              image: 'https://images.pexels.com/photos/490466/pexels-photo-490466.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
              rgba_colors: [
                { r: '98', g: '189', b: '247' }, // #62bdf7
                { r: '25', g: '159', b: '247' }, // #199ff7
                { r: '221', g: '199', b: '154' }, // #ddc79a
                { r: '243', g: '166', b: '54' }, // #F3A636
                { r: '155', g: '146', b: '134' } // #9b9286
              ]
            },
            {
              image: 'https://images.pexels.com/photos/128234/pexels-photo-128234.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
              rgba_colors: [
                { r: '189', g: '209', b: '63' }, // #bdd13f
                { r: '161', g: '186', b: '105' }, // #a1ba69
                { r: '109', g: '138', b: '62' }, // #6d8a3e
                { r: '53', g: '69', b: '29' }, // #35451d
                { r: '163', g: '163', b: '167' } // #a3a3a7
              ]
            },
            {
              image: 'https://images.pexels.com/photos/33109/fall-autumn-red-season.jpg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
              rgba_colors: [
                { r: '185', g: '72', b: '29' }, // #b9481d
                { r: '119', g: '36', b: '14' }, // #77240e
                { r: '246', g: '175', b: '60' }, // #f6af3c
                { r: '230', g: '125', b: '60' }, // #e67d3c
                { r: '140', g: '92', b: '42' } // #8c5c2a
              ]
            },
            {
              image: 'https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
              rgba_colors: [
                { r: '181', g: '72', b: '56' }, // #b54838
                { r: '98', g: '53', b: '51' }, // #623533
                { r: '199', g: '110', b: '70' }, // #c76e46
                { r: '139', g: '87', b: '82' }, // #8b5752
                { r: '37', g: '40', b: '45' } // #25282d
              ]
            },
            {
              image: 'https://images.pexels.com/photos/531321/pexels-photo-531321.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
              rgba_colors: [
                { r: '148', g: '155', b: '63' }, // #949b3f
                { r: '67', g: '84', b: '49' }, // #435431
                { r: '130', g: '141', b: '105' }, // #828d69
                { r: '52', g: '60', b: '53' }, // #343c35
                { r: '101', g: '100', b: '90' } // #65645a
              ]
            },
            {
              image: 'https://images.pexels.com/photos/719609/pexels-photo-719609.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
              rgba_colors: [
                { r: '185', g: '212', b: '223' }, // #b9d4df
                { r: '101', g: '147', b: '151' }, // #659397
                { r: '190', g: '182', b: '128' }, // #beb680
                { r: '146', g: '132', b: '66' }, // #928442
                { r: '31', g: '58', b: '40' } // #1f3a28
              ]
            }
          ]
        }
      ],
      isShowReload: false,
      bgStyle: '',
      new_task_project_id: null,
      showResult: false,
      assignedUser: {},
      hideNewTask: false
    }
  },
  computed: {
    is_loggedIn() {
      return this.$store.state.settings.logged_in
    },
    has_route_query_showChatSection() {
      return this.$route.query.showChatSection === 'true' ? true : false
    },
    headerBgColor() {
      let rgb = this.colors.backgroundColor
      return `${rgb[0]}, ${rgb[0]}, ${rgb[0]}`
    },
    showReload() {
      if (this.$store.state.totalActiveRequests > 0 || this.isShowReload) {
        return true
      }
      return false
    },
    background_style() {
      if (typeof this.bgStyle === 'object') {
        return `url(${this.bgStyle.image})`
      }
      return this.bgStyle
    }
  },
  mounted() {
    EventBus.$on('timerEmptyFields', count => {
      this.timerEmptyFields = count
    })
    EventBus.$on('timerStatus', status => {
      if (status === 'running') {
        return (this.timerRunning = true)
      }
      this.timerRunning = false
    })

    this.updateBackground()
    this.$root.$on('bv::dropdown::show', bvEvent => {
      if (bvEvent.componentId === 'new-task-menu') {
        setTimeout(() => {
          if (this.$refs.noteInput) {
            this.$refs.noteInput.focus()
          }
        }, 400)
      }
    })
    this.$root.$on('bv::dropdown::hide', bvEvent => {
      if (!this.hideNewTask && bvEvent.componentId === 'new-task-menu' && this.hideNewTask !== undefined) {
        bvEvent.preventDefault()
      } else {
        this.hideNewTask = false
      }
    })
  },
  methods: {
    saveDueDate(e) {
      this.new_task_due_date = e.target.value
    },
    dueDateDetails(due_date, return_color) {
      if (!due_date && !return_color) {
        return ''
      }
      const timezone = moment.tz.guess()
      const timezone_date = moment()
        .tz(timezone)
        .format('YYYY-MM-DD')
      const task_due_date = moment(due_date).format('YYYY-MM-DD')

      const diff = moment.duration(moment(task_due_date).diff(moment(timezone_date)))
      const days = diff.asDays()
      const near_due_date = [1, 2, 3]
      let return_value
      let color
      if (days < 0) {
        return_value = 'Past due'
        color = '#ffc107'
      } else if (days === 0) {
        return_value = 'Due today'
        color = 'red'
      } else if (near_due_date.includes(days)) {
        return_value = `Due in ${days} ${days === 1 ? 'day' : 'days'}`
        color = 'orange'
      } else {
        return_value = `Due on ${moment(due_date).format('MMMM DD')}`
        color = '#17a2b8'
      }
      if (!due_date) {
        color = '#28a745'
      }
      if (return_color) {
        return_value = color
      }
      return return_value
    },
    dueDate(due_date) {
      let formatted_date
      if (due_date) {
        formatted_date = moment(due_date, 'yyyy-MM-DD').format('yyyy-MM-DD')
      } else {
        return ''
      }
      return formatted_date
    },
    reload() {
      alert('Non-functional')
      return
      this.$emit('reload')
    },
    priorityColor(priority) {
      let color = 'primary'
      switch (priority) {
        case 'high':
          color = 'danger'
          break
        case 'active':
          color = 'success'
          break
        case 'regular':
          color = 'success'
          break
        case 'low':
          color = 'warning'
          break
        case 'hold':
          color = 'secondary'
          break

        default:
          color = 'primary'
          break
      }
      return color
    },
    closeNewTask() {
      this.projectSearch = ''
      this.new_task_title = ''
      this.new_company_user_id = false
      this.new_user_name = ''
      this.new_task_project_id = null
      this.showResult = false
      this.hideNewTask = true
      setTimeout(() => {
        this.$refs.newtask_dropdown.hide()
      }, 100)
    },
    selectProject($event) {
      this.showResult = true
      setTimeout(() => {
        this.new_task_project_id = $event.id
      }, 100)
    },
    closeModal() {
      this.toggles.paint = false
    },
    setReload(state) {
      console.log(state)
      this.isShowReload = state
    },
    logout() {
      document.cookie = 'auth_token=' + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      window.location.reload()
    },
    updateBackground(option = null) {
      const report_menu = document.querySelector('.dropdown-menu')
      if (report_menu) {
        report_menu.style.backgroundColor = option ? option : this.bgStyle
      }
    },
    setBackground(option, theme) {
      EventBus.$emit('changeBackground', { option, theme })
      this.updateBackground(option)
    },
    openprojects() {
      const result = this.$store.getters['projects/getOpenProjectsSortedByClient'] || []
      const projectsUniqueById = [...new Map(result.map(item => [item['id'], item])).values()]
      return projectsUniqueById
    },
    client_name(client_company_id) {
      let client = this.$store.getters['clients/getByClientCompanyId'](client_company_id)
      return client ? client.name : ''
    },
    async createTask() {
      if (this.$refs.noteInput.value == '') {
        this.showResult = false
        this.new_task_title = ''
        this.new_task_project_id = null
        this.new_company_user_id = null
      }
      if (!this.new_company_user_id) {
        return
      }
      this.$refs.noteInput.value = ''
      this.$refs.projectsTypeahead.inputValue = ''
      this.showResult = false
      const newTask = await this.$store.dispatch('tasks/createTask', {
        title: this.new_task_title,
        project_id: this.new_task_project_id,
        sort_order: 0,
        status: 'open',
        temp: false,
        users: [this.new_company_user_id],
        owner: this.$store.state.settings.current_company_user_id,
        priority: this.new_priority,
        due_date: this.new_task_due_date
      })
      EventBus.$emit('update', { company_user_id: this.new_company_user_id })
      this.new_task_title = ''
      this.new_task_project_id = null
      this.new_company_user_id = null
    },
    creatingTask: _.debounce(function(e) {
      let notesWithTaskTile = e.target.value
      if (notesWithTaskTile == '') {
        this.showResult = false
      }
      const projectRegex = RegExp('(?:(^([A-Z-]+):@([a-z]+))|([A-Z-]+):|@([a-z]+)|([^:@]+)|([a-z][A-Z]@+))', 'g')

      const acronym_matchs = notesWithTaskTile ? notesWithTaskTile.match(projectRegex) : null
      if (!acronym_matchs) {
        return
      }
      let project_captured = false
      let user_name_captured = false
      let title_captured = false
      let user_name = null
      let task_title = null
      let project_title = null
      console.log('acronym_matchs', acronym_matchs)
      for (let i = 0; i < acronym_matchs.length; i++) {
        const acronym_match = acronym_matchs[i]

        user_name = acronym_match.indexOf('@') >= 0 ? acronym_match.split('@')[1] : user_name
        project_title = acronym_match.indexOf(':') > 0 ? acronym_match.split(':')[0] : project_title
        task_title = acronym_match.indexOf(':') < 0 && acronym_match.indexOf('@') < 0 ? acronym_match : task_title
      }

      if (project_title) {
        console.log('project_title', project_title)
        project_captured = true
        const projects_by_acronym = this.$store.state.projects.projects.filter(project => project.acronym === project_title)
        if (projects_by_acronym.length === 1) {
          this.new_task_project_id = projects_by_acronym[0].id
          this.new_task_title = task_title
          const project_full_title = this.client_name(projects_by_acronym[0].client_company_id) + '-' + projects_by_acronym[0].name
          this.$refs.projectsTypeahead.inputValue = project_full_title
        }
      }

      if (user_name) {
        user_name_captured = true
        console.log('user_name', user_name)
        this.new_user_name = user_name
        let new_company_user = this.$store.getters['company_users/getByAlias'](user_name)
        if (new_company_user) {
          this.new_company_user_id = new_company_user['id']
          this.assignedUser = new_company_user
          this.new_task_title = task_title
        }
      }
      if (task_title) {
        title_captured = true
        console.log('title', task_title)
      }
      if (project_captured || title_captured || user_name_captured) {
        this.showResult = true
      } else {
        this.showResult = false
      }
    }, 200),

    async toggle(iconName) {
      if (iconName === 'reload') {
        this.$emit('reload')
      }
      if (this.has_route_query_showChatSection) {
        let query = Object.assign({}, this.$route.query)
        delete query.showChatSection
        await this.$router.replace({ query })
        return
      }

      if (this.is_loggedIn) {
        this.toggles[iconName] = !this.toggles[iconName]
        EventBus.$emit(`toggle_${iconName}`, this.toggles[iconName])
      }
    },
    abbrName,
    getCompanyUserDetails(company_user_id) {
      const user_details = this.$store.state.company_users.company_users.find(e => e.id === company_user_id)

      return user_details
    },
    getClientAcronymColor(project_id) {
      return this.getProjectDetails(project_id, true)
    },
    getProjectDetails(project_id, is_color) {
      const project = this.getProject(project_id)
      let client_data = null
      if (is_color && project) {
        client_data = this.$store.getters['clients/getByClientCompanyId'](project.client_company_id)
        return client_data.color
      }
      return project ? project.acronym : false
    },
    capitalizeFirstLetter(string) {
      const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)

      return capitalize(string)
    },
    updatePriority(priority) {
      this.new_priority = priority
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

    let bgStyle = getCookie('bg-style')
    if (bgStyle) {
      try {
        let style = JSON.parse(bgStyle)
        this.bgStyle = style
      } catch (error) {
        this.bgStyle = bgStyle
      }
    } else {
      const style_color = 'rgba(255, 165, 0)'
      this.bgStyle = style_color
      this.setCookie('style', style_color)
    }

    // Check if theme is available
    // let theme = getCookie('bg-theme')
    // if (theme) {
    //   this.bgTheme = theme
    // } else {
    //   this.setBackground('rgba(255, 165, 0, 0.6)', 'Colors')
    // }
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
  .reload-icon {
    height: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    cursor: pointer;

    .icon-cached {
      font-size: 24px;
      color: white;
      display: flex;
      // width: 10px;
      width: 24px;
      height: 24px;

      &::before {
        width: 100%;
        height: 100%;
        margin: 0 !important;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
    .reload-text {
      font-size: 10px;
      line-height: 10px;
      color: white;
    }
  }
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  margin-left: 5px;

  .icon-play_arrow:before {
    content: '\EAC9';
    margin: 0 !important;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 10px !important;
    height: 10px !important;
  }
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
  line-height: 10px;
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
  width: 305px;
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
.search_result {
  color: white;
  margin-top: 27px;
}

.btn-outline-primary {
  color: #fff;
  border-color: #fff;
}
.btn-outline-primary:hover {
  color: #fff;
  background-color: #ffa500;
  border-color: #fff;
}
.search_result .card-text {
  width: fit-content;
}
#task-list-due-date {
  margin-left: 20px;
}
/* paletteColors: ['red', 'green', 'blue', 'rgba($color: orange, $alpha: 0.6)', 'pink', 'violet', 'rgba(255, 165, 0, 0.6)' ] */
</style>
