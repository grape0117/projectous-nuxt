<template>
  <div class="flex justify-center draggable-container h-100" @click="hidePopOver">
    <!-- <div class="flex justify-center draggable-container h-100" oncontextmenu="return false;"> -->
    <div class="min-h-screen overflow-x-scroll py-12  d-flex h-100">
      <draggable :animation="200" class="d-flex" ghost-class="ghost-card" @start="isListDragging = true" @end="isListDragging = false" v-model="columns">
        <div v-for="(column, index) in columns" :key="index" class="bg-gray-100 rounded-lg px-1 py-0 column-width rounded mr-2 task-step-list">
          <div v-if="column.type != 'new_list'" class="h-100">
            <div class="field title">
              <p class="field-value" v-show="!showField(index)" @click="focusField(index)">
                {{ column.title == '' ? 'untitled' : column.title }}
              </p>
              <input v-model="columns[index].title" v-show="showField(index)" type="text" :id="'title-input' + index" class="field-value form-control" @focus="focusField(index)" v-on:keyup.enter="editField = 'empty'" @blur="blurField" />
            </div>

            <draggable :animation="200" ghost-class="ghost-card" group="tasks" class="task-card-container px-2" @start="isDragging = true" @end="isDragging = false" v-model="columns[index].tasks">
              <task-card :columnIndex="index" @showEditModal="showEditMoal(task, index, task_index)" v-for="(task, task_index) in column.tasks" :key="task.id" :task="task" class="mb-2 cursor-move task-card-item" @addTask="addTask(index)" @completeAddTask="completeAddTask" @editTask="editTask($event, task, index, task_index)" @creatingTask="creatingTask($event, index)" :idList="column.idList"></task-card>
            </draggable>
            <!-- <div class="field"> -->
            <div class="field" v-show="newColumnIndex !== index">
              <button class="add-task" @click="addTask(index)" :id="`add-task-btn-${index}`"><i class="icon-add" />Add a Task</button>
            </div>
          </div>
          <div v-else>
            <button @click="addList" class="btn btn-lg add-list"><i class="icon-add"></i> Add another list</button>
          </div>
        </div>
      </draggable>
    </div>

    <!-- edit -->
    <div class="quick-card-editor" v-show="quick_edit_task" @click="hideEditCard">
      <span class="icon-lg icon-close quick-card-editor-close-icon js-close-editor" @click="quick_edit_task = false"></span>
      <div class="quick-card-editor-card" :style="{ top: cadInfo.top + 'px', left: cadInfo.left + 'px', height: cadInfo.height + 'px', width: cadInfo.width + 'px' }">
        <div class="list-card list-card-quick-edit js-stop">
          <div class="list-card-details js-card-details">
            <textarea class="list-card-edit-title js-edit-card-title" ref="updateTextRef" dir="auto" data-autosize="true" style="overflow: hidden; overflow-wrap: break-word; resize: none; border: none;" :style="{ height: cadInfo.height + 'px', width: cadInfo.width + 'px' }" v-model="new_task_title" v-on:keyup.enter="updateTask"></textarea>
            <div class="badges"><span class="js-badges"></span><span class="custom-field-front-badges js-custom-field-badges"></span><span class="js-plugin-badges"></span></div>
            <div class="list-card-members js-list-card-members"></div>
          </div>
        </div>
        <b-button variant="primary" @click="updateTask">Save</b-button>
        <div class="quick-card-editor-buttons fade-in" :style="{ top: card_editor_button_top + 'px' }">
          <a class="quick-card-editor-buttons-item" href="#" @click="showEditMoal(editTaskData, edit_list_index, edit_task_index)"><span class="icon-sm icon-card light"></span><span class="quick-card-editor-buttons-item-text">Open card</span></a>
          <a class="js-edit-labels quick-card-editor-buttons-item " href="#" @click="showAddLabels"><span class="edit-labels icon-sm icon-label light "></span><span class="edit-labels quick-card-editor-buttons-item-text ">Edit labels</span></a>
          <a class="quick-card-editor-buttons-item js-edit-members" href="#" @click="showMembersPopOver"><span class="icon-sm icon-member light"></span><span class="quick-card-editor-buttons-item-text">Change members</span></a>
          <a class="quick-card-editor-buttons-item js-edit-cover" href="#"><span class="icon-sm icon-card-cover light"></span><span class="quick-card-editor-buttons-item-text">Change cover</span></a>
          <a class="quick-card-editor-buttons-item js-move-card" href="#"><span class="icon-sm icon-move light"></span><span class="quick-card-editor-buttons-item-text">Move</span></a>
          <a class="quick-card-editor-buttons-item js-copy-card" href="#"><span class="icon-sm icon-card light"></span><span class="quick-card-editor-buttons-item-text">Copy</span></a>
          <a class="quick-card-editor-buttons-item js-edit-due-date" href="#"><span class="icon-sm icon-clock light"></span><span class="quick-card-editor-buttons-item-text">Edit dates</span></a>
          <a class="quick-card-editor-buttons-item js-archive" href="#"><span class="icon-sm icon-archive light"></span><span class="quick-card-editor-buttons-item-text">Archive</span></a>
        </div>
      </div>
    </div>

    <!-- select user -->
    <div class="pop-over" id="add-member-pop-over" :style="{ left: select_position_left + 'px', top: select_position_top + 'px' }" data-elevation="1" v-show="showMembers">
      <div class="no-back">
        <div class="pop-over-header js-pop-over-header"><span class="pop-over-header-title">Select members</span><a href="#" class="pop-over-header-close-btn icon-sm icon-close" @click="showMembers = false"></a></div>
        <div>
          <div class="pop-over-content js-pop-over-content u-fancy-scrollbar js-tab-parent" style="max-height: 829px;">
            <ul class="pop-over-member-list checkable js-members-list">
              <li class="item js-member-item active selected" v-for="member in members">
                <span class="d-flex justify-content-between" @click="assignUser(member)">
                  <span>
                    <span :title="`${getCompanyUserDetails(member['id']).name}`" :class="`avatar mr-1 pointer`" :style="{ 'background-color': getCompanyUserDetails(member['id']).color, cursor: 'pointer', display: 'inline-flex' }">
                      {{ abbrName(getCompanyUserDetails(member['id']).name) }}
                    </span>
                    <span>{{ getCompanyUserDetails(member['id']).name }}</span>
                  </span>
                  <i v-if="assignedMembers.indexOf(member['id']) >= 0" class="icon-check"></i>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Label -->
    <div class="pop-over" id="add-label-pop-over" :style="{ left: select_position_left + 'px', top: select_position_top + 'px' }" data-elevation="1" v-if="show_add_labels">
      <div class="no-back">
        <div class="pop-over-header js-pop-over-header"><span class="pop-over-header-title">Labels</span><a href="#" class="pop-over-header-close-btn icon-sm icon-close" @click="show_add_labels = false"></a></div>
        <div>
          <div class="pop-over-content js-pop-over-content u-fancy-scrollbar js-tab-parent" style="max-height: 829px;">
            <ul class="pop-over-member-list checkable js-members-list">
              <b-form-checkbox-group id="flavors" v-model="editTaskData.labels" :options="labels" name="flavors" class="ml-4" stacked></b-form-checkbox-group>
              <!-- <li class="item js-member-item active selected" v-for="label in labels">
                <span class="d-flex justify-content-between" @click="addLabel(label)">
                  <b-form-checkbox size="lg">
                    <badge  :color="badgeColor(label)" :label="label" size="lg">{{ label }}</badge>
                  </b-form-checkbox>
                </span>
              </li> -->
            </ul>
          </div>
        </div>
      </div>
    </div>

    <b-modal ref="taskEditModal" id="task-card-edit" v-model="show_edit_modal" class="task-edit-modal" style="min-height: 500px" :size="'lg'" v-if="editTaskData">
      <template #modal-header>
        <div class="header">
          <h2 class="d-flex justify-content-between title">{{ editTaskData.title }}</h2>
          <p>
            in list <strong>{{ editTaskData.list }}</strong>
          </p>
        </div>
      </template>
      <div no-body>
        <div class="form" @click="hidePopOver">
          <b-form-group class="mb-5" id="labels" label="Select Labels:" label-for="select-label">
            <div class="badge-container" id="select-label" ref="add_label">
              <badge v-if="editTaskData.labels" v-for="label in editTaskData.labels" :color="badgeColor(label)" :label="label" size="lg">{{ label }}</badge>
              <a class="add-label" href="#" @click="showAddLabels">
                <i class="icon-add"></i>
              </a>
            </div>
          </b-form-group>
          <b-form-group class="mb-5" label="Members:" label-for="select-user">
            <div class="assigned-members d-flex" ref="add_member">
              <span v-for="member_id in assignedMembers">
                <span :title="`${getCompanyUserDetails(member_id).name}`" :class="`avatar mr-1 pointer`" :style="{ 'background-color': getCompanyUserDetails(member_id).color, cursor: 'pointer', display: 'inline-flex' }">
                  {{ abbrName(getCompanyUserDetails(member_id).name) }}
                </span>
              </span>
              <a class="add-label" href="#" @click="showMembersPopOver">
                <i class="icon-add"></i>
              </a>
            </div>
          </b-form-group>
          <b-form-group class="mb-5" label="Due due:" label-for="task-due-date">
            <b-form-datepicker id="task-due-date" v-model="editTaskData.due_date" class="mb-2"></b-form-datepicker>
          </b-form-group>
          <b-form-group class="mb-5" label="Description:" label-for="task-description">
            <b-form-textarea id="task-description" v-model="editTaskData.note" placeholder="Enter something..." rows="3" max-rows="6"></b-form-textarea>
          </b-form-group>
        </div>
      </div>
      <div slot="modal-footer" class="w-100"></div>
    </b-modal>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import { groupBy, cloneDeep, uniq, invert } from 'lodash'
import Badge from './components/Badge.vue'
import TaskCard from './components/TaskCard.vue'
// import TaskActionRow from ''
import TaskActionRow from '../../views/TaskActionRow.vue'
import { abbrName } from '@/utils/util-functions'
import _ from 'lodash'
import uuid from 'uuid'
export default {
  extends: TaskActionRow,
  name: 'Draggable1',
  components: {
    TaskCard,
    draggable,
    Badge
  },
  props: ['data', 'project_id'],
  data() {
    return {
      columns: [],
      // columns: [
      //   {
      //     title: 'Backlog',
      //     tasks: [
      //       {
      //         id: 1,
      //         title: 'Add discount code to checkout page',
      //         description: 'Here is a description',
      //         due: 'Sep 14',
      //         type: 'Feature Request',
      //         assignedMembers: [],
      //         labels: ['Urgent', 'Top Priority', 'Medimun Priority']
      //       },
      //       {
      //         id: 2,
      //         title: 'Provide documentation on integrations',
      //         description: 'Here is a description',
      //         due: 'Sep 12',
      //         assignedMembers: [],
      //         labels: ['Top Priority']
      //       },
      //       {
      //         id: 3,
      //         title: 'Design shopping cart dropdown',
      //         description: 'Here is a description',
      //         due: 'Sep 9',
      //         type: 'Design',
      //         labels: ['Medimun Priority'],
      //         assignedMembers: []
      //       },
      //       {
      //         id: 4,
      //         title: 'Add discount code to checkout page',
      //         description: 'Here is a description',
      //         due: 'Sep 14',
      //         type: 'Feature Request',
      //         assignedMembers: [],
      //         labels: ['Low Priority']
      //       },
      //       {
      //         id: 5,
      //         title: 'Test checkout flow',
      //         description: 'Here is a description',
      //         due: 'Sep 15',
      //         type: 'QA',
      //         assignedMembers: [],
      //         labels: ['Very Low Priority']
      //       }
      //     ]
      //   },
      //   {
      //     title: 'In Progress',
      //     tasks: [
      //       {
      //         id: 6,
      //         title: 'Design shopping cart dropdown',
      //         description: 'Here is a description',
      //         due: 'Sep 9',
      //         type: 'Design',
      //         assignedMembers: []
      //       },
      //       {
      //         id: 7,
      //         title: 'Add discount code to checkout page',
      //         description: 'Here is a description',
      //         due: 'Sep 14',
      //         type: 'Feature Request',
      //         assignedMembers: []
      //       },
      //       {
      //         id: 8,
      //         title: 'Provide documentation on integrations',
      //         description: 'Here is a description',
      //         due: 'Sep 12',
      //         type: 'Backend',
      //         assignedMembers: []
      //       }
      //     ]
      //   },
      //   {
      //     title: 'Review',
      //     tasks: [
      //       {
      //         id: 9,
      //         title: 'Provide documentation on integrations',
      //         description: 'Here is a description',
      //         due: 'Sep 12',
      //         assignedMembers: []
      //       },
      //       {
      //         id: 10,
      //         title: 'Design shopping cart dropdown',
      //         description: 'Here is a description',
      //         due: 'Sep 9',
      //         type: 'Design',
      //         assignedMembers: []
      //       },
      //       {
      //         id: 11,
      //         title: 'Add discount code to checkout page',
      //         description: 'Here is a description',
      //         due: 'Sep 14',
      //         type: 'Feature Request',
      //         assignedMembers: []
      //       },
      //       {
      //         id: 12,
      //         title: 'Design shopping cart dropdown',
      //         description: 'Here is a description',
      //         due: 'Sep 9',
      //         type: 'Design'
      //       },
      //       {
      //         id: 13,
      //         title: 'Add discount code to checkout page',
      //         description: 'Here is a description',
      //         due: 'Sep 14',
      //         type: 'Feature Request'
      //       }
      //     ]
      //   },
      //   {
      //     title: 'Done',
      //     tasks: [
      //       {
      //         id: 14,
      //         title: 'Add discount code to checkout page',
      //         description: 'Here is a description',
      //         due: 'Sep 14',
      //         type: 'Feature Request'
      //       },
      //       {
      //         id: 15,
      //         title: 'Design shopping cart dropdown',
      //         description: 'Here is a description',
      //         due: 'Sep 9',
      //         type: 'Design'
      //       },
      //       {
      //         id: 16,
      //         title: 'Add discount code to checkout page',
      //         description: 'Here is a description',
      //         due: 'Sep 14',
      //         type: 'Feature Request'
      //       }
      //     ]
      //   },
      //   {
      //     title: 'New list',
      //     type: 'new_list',
      //     tasks: []
      //   }
      // ],
      isDragging: false,
      isListDragging: false,
      delayedDragging: false,
      delayedListDragging: false,
      editField: 'empty',
      newColumnIndex: null,
      quick_edit_task: false,
      cadInfo: {
        left: 0,
        top: 0
      },
      card_editor_button_top: 0,
      new_task_title: '',
      edit_task_index: 0,
      edit_list_index: 0,
      task_content: '',
      new_user_name: '',
      new_task_project_id: null,
      showMembers: false,
      members: [],
      assignedMembers: [],
      select_position_top: 0,
      select_position_left: 0,
      show_edit_modal: false,
      show_add_labels: false,
      editTaskData: null,
      labels: ['Design', 'Feature Request', 'Backend', 'QA', 'default', 'Urgent', 'Top Priority', 'Medimun Priority', 'Low Priority', 'Very Low Priority', 'On Staging', 'Done', 'ToDo', 'Working', 'Hold', 'Testing'],
      isEdit: true,
      task_users: []
    }
  },
  mounted() {
    this.editTaskData = this.columns[0] ? this.columns[0].tasks[0] : null

    this.$root.$on('bv::modal::hidden', e => {
      if (e.componentId === 'task-card-edit') {
        this.hideModalHandle()
      }
    })
  },
  watch: {
    isDragging(newValue) {
      if (newValue) {
        this.delayedDragging = true
        return
      }
      this.$nextTick(() => {
        this.delayedDragging = false
        console.log(this.columns)
        let task_list = []
        this.columns.forEach(column => {
          if (column.type !== 'new_list') {
            const tasks = column.tasks.map(task => task.id)
            task_list.push({
              title: column.title,
              tasks: tasks
            })
          }
        })
        this.$store.dispatch('projects/updateList', { project_id: this.project_id, task_list: task_list })
      })
    },
    isListDragging(newValue) {
      if (newValue) {
        this.delayedListDragging = true
        return
      }
      this.$nextTick(() => {
        this.delayedListDragging = false
        console.log('list dragging')
        console.log(this.columns)
        let task_list = []
        this.columns.forEach(column => {
          if (column.type !== 'new_list') {
            const tasks = column.tasks.map(task => task.id)
            task_list.push({
              title: column.title,
              tasks: tasks
            })
          }
        })
        this.$store.dispatch('projects/updateList', { project_id: this.project_id, task_list: task_list })
      })
    },
    showMembers(newValue) {
      if (!newValue) {
        this.assignedMembers = []
      }
    },
    show_edit_modal(newValue) {
      if (!newValue) {
        this.add_label_pop_over = false
        this.add_member_pop_over = false
      }
    },
    data(newValue) {
      // console.log("data", newValue)
      this.columns = cloneDeep(newValue)
      this.columns.push({
        title: 'New list',
        type: 'new_list',
        tasks: []
      })
    }
  },
  methods: {
    hideModalHandle() {
      let task = this.editTaskData
      this.$store.dispatch('UPDATE', { module: 'tasks', entity: task })
      this.editTaskData = null
      this.showMembers = false
      this.show_add_labels = false
    },
    hidePopOver(event) {
      const add_member_pop_over = document.getElementById('add-member-pop-over')
      const add_label_pop_over = document.getElementById('add-label-pop-over')
      if (
        (add_member_pop_over && add_member_pop_over.contains(event.target)) ||
        event.target.className == 'icon-add' ||
        (add_label_pop_over && add_label_pop_over.contains(event.target)) ||
        $(event.target)
          .parent()
          .hasClass('quick-card-editor-buttons-item')
      ) {
        return
      }
      this.showMembers = false
      this.show_add_labels = false
    },
    showAddLabels() {
      this.show_add_labels = true
      this.showMembers = false
      this.select_position_left = this.$refs.add_label ? this.$refs.add_label.getBoundingClientRect().left : this.cadInfo.left
      this.select_position_top = this.$refs.add_label ? this.$refs.add_label.getBoundingClientRect().top : this.cadInfo.top
    },
    badgeColor(label) {
      const mappings = {
        Design: '#6f42c1',
        'Feature Request': '#20c997',
        Backend: '#007bff',
        QA: '#28a745',
        default: '#20c997',
        Urgent: '#dc3545',
        'Top Priority': '#dc3545',
        'Medimun Priority': '#ffc107',
        'Low Priority': '#28a745',
        'Very Low Priority': '#17a2b8',
        'On Staging': '#D974B0',
        Done: '#B4EFD6',
        ToDo: '#0086C0',
        Working: '#C4C4C4',
        Hold: '#FF158A',
        Testing: '#037F4C'
      }
      return mappings[label] || mappings.default
    },
    showEditMoal(task, list_index, task_index) {
      this.quick_edit_task = false
      this.show_edit_modal = true
      this.edit_list_index = list_index
      this.edit_task_index = task_index
      this.editTaskData = task
      this.task_users = this.$store.getters['task_users/getByTaskId'](task.id)
      this.assignedMembers = this.task_users.map(({ company_user_id }) => company_user_id)
      this.editTaskData['list'] = this.columns[list_index].title
    },
    hideEditCard($event) {
      if ($event.target.classList.contains('quick-card-editor')) {
        this.quick_edit_task = false
        let task = this.editTaskData
        this.$store.dispatch('UPDATE', { module: 'tasks', entity: task })
        this.editTaskData = null
      }
    },
    addLabel(label) {
      const label_index = this.editTaskData.labels.indexOf(label)
      if (label_index < 0) {
        this.editTaskData.labels.push(label)
      } else {
        this.editTaskData.labels.splice(label_index, 1)
      }
    },
    addList() {
      const number_of_lists = this.columns.length
      this.columns[number_of_lists - 1].type = ''
      this.columns.push({
        title: 'New list',
        type: 'new_list',
        tasks: []
      })
      this.$nextTick(() => {
        const element = document.getElementsByClassName('draggable-container')[0]
        element.scrollLeft = element.scrollWidth
      })
    },
    focusField(index) {
      this.editField = index
      this.$nextTick(() => {
        document.getElementById(`title-input${index}`).focus()
      })
    },
    blurField() {
      this.editField = 'empty'
    },
    showField(index) {
      return this.editField == index
    },
    addTask(index) {
      this.showMembers = false
      if (this.newColumnIndex !== null) {
        this.columns[this.newColumnIndex].tasks = this.columns[this.newColumnIndex].tasks.filter(function(task) {
          return task.type !== 'new'
        })
      }
      this.columns[index].tasks.push({
        title: '',
        type: 'new',
        assignedMembers: []
      })
      this.newColumnIndex = index
      this.$nextTick(() => {
        this.scrollToBottom(index)
        document.querySelector('#new-task textarea').focus()
      })
    },
    creatingTask(new_task_info, index) {
      this.newColumnIndex = index
      let notesWithTaskTile = new_task_info.new_task_title
      this.select_position_top = new_task_info.top
      this.select_position_left = new_task_info.left
      const projectRegex = RegExp('(?:(^([A-Z-]+):@([a-z]+))|([A-Z-]+):|@([a-z]+)|([^:@]+))', 'g')

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
        }
      }

      if (user_name) {
        user_name_captured = true
        console.log('user_name', user_name)
        this.new_user_name = user_name
        let new_company_users = this.$store.getters['company_users/getUsersByAlias'](user_name)
        if (new_company_users.length > 0) {
          this.members = new_company_users
          this.is_edit = false
          this.showMembers = true
          this.show_add_labels = false
        } else {
          this.showMembers = false
        }
      }
      if (task_title) {
        title_captured = true
        console.log('title', task_title)
        this.new_task_title = task_title
      }
    },
    async updateTask() {
      this.columns[this.edit_list_index].tasks[this.edit_task_index].title = this.new_task_title
      const task_id = this.columns[this.edit_list_index].tasks[this.edit_task_index].id
      this.quick_edit_task = false
      this.showMembers = false
      let task = this.$store.getters['tasks/getById'](task_id)
      task.title = this.new_task_title
      await this.$store.dispatch('UPDATE', { module: 'tasks', entity: task }, { root: true })
    },
    showMembersPopOver() {
      this.members = this.$store.getters['company_users/getActive']
      this.is_edit = true
      this.showMembers = true
      this.show_add_labels = false
      this.select_position_left = this.$refs.add_member ? this.$refs.add_member.getBoundingClientRect().left : this.cadInfo.left
      this.select_position_top = this.$refs.add_member ? this.$refs.add_member.getBoundingClientRect().top : this.cadInfo.top
    },
    editTask(cadInfo, task, list_index, task_index) {
      this.cadInfo = cadInfo
      this.card_editor_button_top = cadInfo.top > 200 ? (cadInfo.bottom > 100 ? -114 : -200) : 0
      this.new_task_title = cadInfo.task.title
      this.edit_list_index = list_index
      this.edit_task_index = task_index
      this.quick_edit_task = true
      this.editTaskData = task
      this.task_users = this.$store.getters['task_users/getByTaskId'](task.id)
      this.assignedMembers = this.task_users.map(({ company_user_id }) => company_user_id)
      this.$nextTick(() => {
        this.$refs.updateTextRef.focus()
        this.$refs.updateTextRef.select()
      })
    },
    completeAddTask(task) {
      this.showMembers = false

      this.columns[this.newColumnIndex].tasks = this.columns[this.newColumnIndex].tasks.filter(function(task) {
        return task.type !== 'new'
      })
      this.newColumnIndex = null

      let task_list = []
      this.columns.forEach(column => {
        if (column.type !== 'new_list') {
          const tasks = column.tasks.map(task_item => task_item.id)
          task_list.push({
            title: column.title,
            tasks: tasks
          })
        }
      })

      console.log('task_list', task_list)
      if (task) {
        console.log(task)
        this.$emit('createItem', { task, task_list })
      }
    },
    assignUser(member) {
      let task_user = {
        // id: this.id,
        task_id: this.editTaskData.id,
        company_user_id: member.id,
        role: 'assigned'
      }
      if (this.is_edit) {
        this.editTaskData['assignedMembers'] = this.editTaskData['assignedMembers'] || []
        this.assignedMembers = this.editTaskData['assignedMembers']
        const member_index = this.editTaskData['assignedMembers'].indexOf(member['id'])

        if (member_index < 0) {
          task_user['id'] = uuid.v4()
          this.$store.dispatch('UPSERT', { module: 'task_users', entity: task_user }, { root: true })
          this.assignedMembers.push(member['id'])
        } else {
          this.assignedMembers.splice(member_index, 1)
          task_user = this.task_users.filter(({ company_user_id }) => company_user_id == member.id)[0]
          if (task_user) {
            this.$store.dispatch('DELETE', { module: 'task_users', entity: task_user }, { root: true })
          }
        }
      } else {
        const new_task_index = this.columns[this.newColumnIndex].tasks.length
        const member_index = this.columns[this.newColumnIndex].tasks[new_task_index - 1]['assignedMembers'].indexOf(member['id'])
        if (member_index < 0) {
          this.columns[this.newColumnIndex].tasks[new_task_index - 1]['assignedMembers'].push(member['id'])
          this.assignedMembers.push(member['id'])
        } else {
          this.columns[this.newColumnIndex].tasks[new_task_index - 1]['assignedMembers'].splice(member_index, 1)
          this.assignedMembers.splice(member_index, 1)
        }
      }
    },
    scrollToBottom(index) {
      const element = document.getElementsByClassName('task-card-container')[index]
      element.scrollTop = element.scrollHeight
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
    }
  }
}
</script>

<style scoped>
.badge-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 4px;
}
.draggable-container {
  overflow-x: auto;
}

.column-width {
  min-width: 280px;
  width: 280px;
}

.ghost-card {
  opacity: 0.2;
  background: #070707;
  border: 2px solid #0a0a0a;
}

.task-step-list {
  background-color: rgb(255 165 0);
}

.task-card-container {
  overflow-x: hidden;
  overflow-y: auto;
  max-height: calc(100% - 120px);
  background-color: rgb(235, 236, 240);
}

.task-card-container:first-child {
  padding-top: 10px;
}

.task-card-item:hover {
  cursor: pointer;
}

.field {
  background-color: rgb(235, 236, 240);
}

.field.title {
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  height: 48px;
  padding-top: 9px;
}

.field.button {
  border-bottom-left-radius: 3px;
  border-bottom-right-radius: 3px;
}

.field-value {
  padding: 4px 14px;
  margin-bottom: 0px;
  width: fit-content;
}

input.field-value {
  width: 95%;
  padding: 4px;
  margin: 4px 9px;
  /* height: -webkit-fit-content; */
  height: -moz-fit-content;
  height: fit-content;
  margin-top: 0px;
}

.add-task {
  width: 100%;
  padding: 3px;
  margin: 5px 0px;
  border-radius: 5px;
  color: #5e6c84;
  border: none;
}

.add-task:hover {
  background-color: #091e4214;
  color: #23272e;
  /* font-weight: bold; */
}

.add-task:focus {
  outline: 0;
}

.add-list {
  background-color: rgba(20, 20, 20, 0.5);
  color: white;
}

.add-list:hover {
  background-color: #ffffff3d !important;
}

/* width */
::-webkit-scrollbar {
  width: 7px;
}

/* Track */
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px rgb(218, 219, 226);
  border-radius: 5px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: rgb(191, 196, 206);
  border-radius: 10px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: rgb(191, 196, 206);
}

.quick-card-editor {
  background: #0009;
  bottom: 0;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 10;
}

.quick-card-editor-close-icon {
  color: var(--ds-icon-subtle, #fff9);
  padding: 9px;
  position: absolute;
  right: 0;
  top: 0;
  transition-duration: 0.15s;
  transition-property: transform, color;
}

.quick-card-editor-card {
  position: absolute;
  top: 232px;
  left: 560px;
  width: 248px;
}

.quick-card-editor .list-card {
  cursor: default;
}

.list-card-quick-edit {
  z-index: 1;
}

.list-card,
.list-card:hover {
  text-decoration: none;
}

.list-card {
  background-color: var(--ds-surface-raised, #fff);
  border-radius: 3px;
  box-shadow: var(--ds-shadow-raised, 0 1px 0 #091e4240);
  cursor: pointer;
  display: block;
  margin-bottom: 8px;
  max-width: 300px;
  min-height: 20px;
  position: relative;
  z-index: 0;
}

.list-card-cover {
  background-position: 50%;
  background-repeat: no-repeat;
  background-size: cover;
  -webkit-user-select: none;
  user-select: none;
}

.list-card-stickers-area {
  border-radius: 3px;
  bottom: 0;
  left: 0;
  overflow: hidden;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 5;
}

.quick-card-editor-buttons.fade-in {
  opacity: 1;
  transform: translateX(0);
}

.quick-card-editor-buttons {
  left: 100%;
  opacity: 0;
  position: absolute;
  top: 0;
  transform: translateX(-20px);
  transition: opacity 85ms ease-in, transform 85ms ease-in;
  width: 240px;
  z-index: 0;
}

.quick-card-editor-buttons-item {
  background: #0009;
  border-radius: 3px;
  clear: both;
  color: #c7d1db;
  display: block;
  float: left;
  margin: 0 0 4px 8px;
  padding: 6px 12px 6px 8px;
  text-decoration: none;
  transition: transform 85ms ease-in;
}

.quick-card-editor-buttons-item > .icon-sm.light {
  color: #c7d1db;
}

.quick-card-editor-buttons-item-text {
  margin-left: 4px;
}

.quick-card-editor-buttons-item {
  background: #0009;
  border-radius: 3px;
  clear: both;
  color: #c7d1db;
  display: block;
  float: left;
  margin: 0 0 4px 8px;
  padding: 6px 12px 6px 8px;
  text-decoration: none;
  transition: transform 85ms ease-in;
}

.quick-card-editor-buttons-item:hover {
  background: #000c;
  color: #fff;
  text-decoration: none;
  transform: translateX(5px);
}

.list-card-edit-title,
.list-card-edit-title:focus,
.list-card-edit-title:hover {
  background-color: initial;
  box-shadow: none;
}

textarea {
  resize: vertical;
  width: 100%;
}
.pop-over {
  background: var(--ds-surface-overlay, #fff);
  border-radius: 3px;
  box-shadow: var(--ds-shadow-overlay, 0 8px 16px -4px #091e4240, 0 0 0 1px var(--ds-border, #091e4214));
  /* display: none; */
  overflow: hidden;
  position: absolute;
  right: -9999px;
  top: -9999px;
  -webkit-transform: translateZ(0);
  width: 304px;
  z-index: 1070;
}
.pop-over-header {
  height: 40px;
  margin-bottom: 8px;
  position: relative;
  text-align: center;
}
.pop-over-header-title {
  border-bottom: 1px solid var(--ds-border, #091e4221);
  box-sizing: border-box;
  color: var(--ds-text-subtle, #5e6c84);
  display: block;
  line-height: 40px;
  margin: 0 12px;
  overflow: hidden;
  padding: 0 32px;
  position: relative;
  text-overflow: ellipsis;
  white-space: nowrap;
  z-index: 1;
}
.pop-over-header-close-btn {
  color: var(--ds-icon-subtle, #6b778c);
  position: absolute;
  right: 0;
  top: 0;
  z-index: 2;
}
.pop-over-header-close-btn:hover {
  text-decoration-line: none;
}
.pop-over-content {
  overflow-x: hidden;
  overflow-y: auto;
  padding: 0 12px 12px;
}
.pop-over-member-list {
  list-style: none;
  padding: 0px;
  padding-left: 10px;
  margin: 0px;
}
.pop-over-member-list .item {
  padding: 5px 0px;
}
.pop-over-member-list .item:hover {
  cursor: pointer;
  background-color: rgba(88, 85, 85, 0.2);
}
.add-label {
  background-color: rgba(88, 85, 85, 0.2);
  font-size: 1.5rem;
}
.add-label:hover {
  background-color: rgba(150, 147, 147, 0.2);
}
.modal-header .title {
  font-size: 20px;
  margin: -4px -8px;
  min-height: 24px;
  padding: 4px 8px;
  resize: none;
}
</style>
