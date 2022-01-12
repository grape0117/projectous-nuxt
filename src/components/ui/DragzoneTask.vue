<template>
  <div class="dragzone__item" :class="{ 'dragzone__item--dragged': item.id === draggedItemId }" :id="item.id" draggable="true" @dragstart="dragstart($event, item)" @dragend="dragend($event)" @drop="drop($event)">
    <div class="dragzone__item-block">
      <div class="dragzone_dragover" @dragover="moveItem(index, item.id)"></div>
      <div class="dragzone__item-block-content">
        <div class="dragzone__item-wrapper" style="padding-left: 5px; padding-right: 5px">
          <div class="burger-icon-wrapper" v-if="!item.project.acronym">
            <div style="padding-left: 5px; padding-right: 5px; margin-top: 5px" class="burger-icon" @click="showTaskDetail(item)" @contextmenu.prevent="toggleTaskOptions($event)" @mouseenter="show_plusIcon(item.id, true)" @mouseleave="show_plusIcon(null, false)">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <span v-show="showPlusIcon.task_id === item.id && showPlusIcon.visible" @mouseenter="show_plusIcon(item.id, true)" @mouseleave="show_plusIcon(null, false)" @click="createTempItem(index, item.id)"> + </span>
          </div>

          <div class="dragzone__item-info">
            <div class="add-task-plus" v-show="showPlusIcon.task_id === item.id && showPlusIcon.visible" @mouseenter="show_plusIcon(item.id, true)" @mouseleave="show_plusIcon(null, false)" @click="createTempItem(index, item.id)">+</div>
            <span class="dragzone-project-acronym-wrapper" v-if="item.project" @click="showTaskDetail(item)" @contextmenu.prevent="toggleTaskOptions($event)" @mouseenter="show_plusIcon(item.id, true)" @mouseleave="show_plusIcon(null, false)">
              <project-icon v-bind:project="item.project"></project-icon>
            </span>
            <span class="dragzone__item-text" v-html="item.title" contenteditable="true" :data-id="item.id" @blur="updateTaskTitle($event, item)" @keydown.enter.prevent="createTempItem(index, item.id)" @click="editedItemId = item.id" />
          </div>
          <div v-if="item.project_id" class="dragzone__item-tracker-icon" @click="onTaskTimerClicked(item.task_id, item.id)">
            <span v-if="timerId === item.id || task_timer_running" class="icon-stop" style="font-size: 25px; color: red" />
            <span v-else class="icon-play_arrow" style="font-size: 25px; color: green" />
          </div>
        </div>
        <!--<div v-if="show_debug" style="padding: 0 10px">-->
        <!--<small>-->
        <!--<span style="color: red">{{ getTaskType(item.task_id || item.id) }}</span-->
        <!--&gt;status: {{ item.status }} list: {{ item.user_task_list_id }} work: {{ item.next_work_day }} sort: {{ item.sort_order }} index: {{ index }} <small v-if="item.task_id">TaskUser</small><small v-else>Task.id</small>: {{ item.id }}-->
        <!--</small>-->
        <!--</div>-->
        <!-- <div class="dragzone__task-users">
          <div v-for="task_user in get_task_users" :key="task_user.id">
            <b-badge v-if="showBadge(task_user)" class="dragzone_badge" :style="{ backgroundColor: getCompanyUser(task_user.company_user_id).color }" :task_user="task_user">
              {{ getCompanyUser(task_user.company_user_id).name | abbrName }}
            </b-badge>
          </div>
        </div> -->
        <div class="dragzone__task-users">
          <div v-for="task_user in getTaskUsers(item.task_id || item.id)" :key="task_user.id">
            <b-badge v-if="(task_user.company_user_id !== selectedCompanyUserId || !verticalAlignment) && !Array.isArray(getCompanyUser(task_user.company_user_id))" v-b-tooltip.hover :title="getCompanyUser(task_user.company_user_id).fullname || getCompanyUser(task_user.company_user_id).name" class="dragzone_badge" :style="{ backgroundColor: getCompanyUser(task_user.company_user_id).color }" :task_user="task_user">
              {{ getCompanyUser(task_user.company_user_id).name | abbrName }}
            </b-badge>
          </div>
        </div>
      </div>
      <div v-if="index == tasks.length - 1" class="dragzone_dragover" @dragover="moveItem(index, item.id)"></div>
    </div>

    <div class="task-option" v-if="show_task_option" v-click-outside="toggleTaskOptions">
      <div class="title">Status</div>
      <div class="options">
        <span @click="updateStatus('open')">Open</span>
        <span @click="updateStatus('in-progress')">In-progress</span>
        <span @click="updateStatus('turned-in')">Turned-in</span>
        <span @click="updateStatus('completed')">Completed</span>
        <span @click="updateStatus('closed')">Closed</span>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { IProject } from '../../store/modules/projects/types'
import ProjectIcon from './ProjectIcon.vue'

export default Vue.extend({
  props: ['item', 'index', 'draggedItemId', 'tasks', 'timerId', 'selectedCompanyUserId', 'verticalAlignment'],

  data() {
    return {
      showPlusIcon: { task_id: null, visible: false },
      show_task_option: false
    }
  },
  components: {
    'project-icon': ProjectIcon
  },
  filters: {
    abbrName(name) {
      if (!name) return ''
      let matches = name.match(/\b(\w)/g) // ['J','S','O','N']
      if (matches) {
        let acronym = matches.join('') // JSON
        return acronym.toUpperCase()
      }
    }
  },
  methods: {
    toggleTaskOptions() {
      this.show_task_option = !this.show_task_option
    },
    async updateStatus(status) {
      this.toggleTaskOptions()
      const { id } = this.item
      this.$store.dispatch('UPDATE_ATTRIBUTE', { module: 'tasks', id, attribute: 'status', value: status }, { root: true })
    },
    dragstart(e, item) {
      this.$emit('dragstart', e, item)
    },
    dragend(e) {
      this.$emit('dragend', e)
    },
    drop(e) {
      this.$emit('drop', e)
    },
    moveItem(index, id) {
      this.$emit('moveItem', index, id)
    },
    async showTaskDetail(item) {
      let task = await this.$store.state.tasks.tasks.find(tsk => {
        if (item.task_id) {
          return tsk.id === item.task_id
        } else {
          return tsk.id === item.id
        }
      })

      await this.$router.push({ query: { task: task.id, showChatSection: 'true' } })
    },
    show_plusIcon(task_id, visibility) {
      this.showPlusIcon = { task_id: task_id, visible: visibility }
    },
    createTempItem(index, after_id) {
      this.$emit('createTempItem', index, after_id)
    },
    clientColor(item) {
      const client = this.$store.state.clients.clients.find(c => c.client_company_id === item.project.client_company_id)
      if (client) {
        return client.color
      }
    },
    projectName(project_id) {
      return this.$store.getters['projects/projectName'](project_id)
    },
    updateTaskTitle(event, item) {
      this.$emit('updateTaskTitle', event, item)
    },
    onTaskTimerClicked(taskId, itemId) {
      this.$emit('onTaskTimerClicked', taskId, itemId)
    },
    getTaskType(task_id) {
      let task = this.$store.getters['tasks/getById'](task_id)
      return task.settings ? task.settings.task_type : null
    },
    getCompanyUser(company_user_id) {
      let company_user = this.$store.getters['company_users/getById'](company_user_id)
      //console.log(company_user)
      return company_user ? company_user : []
    },
    showBadge(task_user) {
      return task_user.company_user_id !== this.selectedCompanyUserId || !this.verticalAlignment
    },
    getTaskUsers(task_id) {
      let task_users = this.$store.getters['task_users/getByTaskId'](task_id)

      const users = task_users.reduce((acc, user) => {
        if (!acc.find(u => u.company_user_id === user.company_user_id)) {
          acc.push(user)
        }
        return acc
      }, [])
      return users
    }
  },
  computed: {
    has_running_timer() {
      const timer = this.$store.state.timers.timers.find(t => t.status === 'running')

      if (timer && Object.keys(timer)) {
        return timer
      }

      return false
    },
    task_timer_running() {
      // @ts-ignore
      return this.has_running_timer ? this.has_running_timer.task_id === this.item.task_id : false
    },
    show_debug() {
      return process.env.VUE_APP_SHOW_DEBUG === 'on'
    },
    get_task_users() {
      return this.$store.getters['task_users/getByTaskId'](this.item.task_id || this.item.id)
    }
  }
})
</script>

<style lang="scss" scoped>
.dragzone__item {
  position: relative;
}
.task-option {
  cursor: default;
  position: absolute;
  z-index: 2;
  width: 150px;
  top: 15px;
  left: 30px;
  border-radius: 4px;
  background-color: rgba($color: #ffffff, $alpha: 1);
  padding: 5px;
  font-size: 14px;

  .title {
    font-size: 16px;
    font-weight: 500;
    border-bottom: 0.1px solid rgba($color: #000000, $alpha: 0.1);
    width: 100%;
  }

  .options {
    display: flex;
    flex-direction: column;
    padding: 5px 0;

    span {
      cursor: pointer;
      &:hover {
        color: rgba($color: #2983e2, $alpha: 1);
      }
    }
  }

  .add-task-plus {
    position: absolute;
    left: 15px;
    top: 5px;
  }
}
</style>
