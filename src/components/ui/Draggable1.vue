<template>
  <div class="flex justify-center draggable-container h-100">
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
              <task-card v-for="(task, task_index) in column.tasks" :key="task.id" :task="task" class="mb-2 cursor-move task-card-item" @addTask="addTask(index)" @cancelAdd="cancelAdd" @editTask="editTask($event, index, task_index)"></task-card>
            </draggable>
            <div class="field" v-show="newTaskIndex !== index">
              <button class="add-task" @click="addTask(index)"><i class="icon-add" />Add a Task</button>
            </div>
          </div>
          <div v-else>
            <button @click="addList" class="btn btn-lg add-list"><i class="icon-add"></i> Add another list</button>
          </div>
        </div>
      </draggable>
    </div>

    <!-- edit -->
    <div class="quick-card-editor" v-show="edit_task">
      <span class="icon-lg icon-close quick-card-editor-close-icon js-close-editor" @click="edit_task = false"></span>
      <div class="quick-card-editor-card" :style="{ top: cadInfo.top + 'px', left: cadInfo.left + 'px', height: cadInfo.height + 'px', width: cadInfo.width + 'px' }">
        <div class="list-card list-card-quick-edit js-stop">
          <div class="list-card-details js-card-details">
            <textarea class="list-card-edit-title js-edit-card-title" ref="updateTextRef" dir="auto" data-autosize="true" style="overflow: hidden; overflow-wrap: break-word; resize: none; border: none;" :style="{ height: cadInfo.height + 'px', width: cadInfo.width + 'px' }" v-model="card_title" v-on:keyup.enter="updateTask"></textarea>
            <div class="badges"><span class="js-badges"></span><span class="custom-field-front-badges js-custom-field-badges"></span><span class="js-plugin-badges"></span></div>
            <div class="list-card-members js-list-card-members"></div>
          </div>
        </div>
        <b-button variant="primary" @click="updateTask">Save</b-button>
        <div class="quick-card-editor-buttons fade-in" :style="{ top: card_editor_button_top + 'px' }">
          <a class="quick-card-editor-buttons-item" href="/c/3exZ2blP/5-adfasd-adfa-adf-adfad-adfadf-adfadfa-asdfasdfadf"><span class="icon-sm icon-card light"></span><span class="quick-card-editor-buttons-item-text">Open card</span></a
          ><a class="quick-card-editor-buttons-item js-edit-labels" href="#"><span class="icon-sm icon-label light"></span><span class="quick-card-editor-buttons-item-text">Edit labels</span></a
          ><a class="quick-card-editor-buttons-item js-edit-members" href="#"><span class="icon-sm icon-member light"></span><span class="quick-card-editor-buttons-item-text">Change members</span></a
          ><a class="quick-card-editor-buttons-item js-edit-cover" href="#"><span class="icon-sm icon-card-cover light"></span><span class="quick-card-editor-buttons-item-text">Change cover</span></a
          ><a class="quick-card-editor-buttons-item js-move-card" href="#"><span class="icon-sm icon-move light"></span><span class="quick-card-editor-buttons-item-text">Move</span></a
          ><a class="quick-card-editor-buttons-item js-copy-card" href="#"><span class="icon-sm icon-card light"></span><span class="quick-card-editor-buttons-item-text">Copy</span></a
          ><a class="quick-card-editor-buttons-item js-edit-due-date" href="#"><span class="icon-sm icon-clock light"></span><span class="quick-card-editor-buttons-item-text">Edit dates</span></a
          ><a class="quick-card-editor-buttons-item js-archive" href="#"><span class="icon-sm icon-archive light"></span><span class="quick-card-editor-buttons-item-text">Archive</span></a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
// import { groupBy, cloneDeep, uniq, invert } from 'lodash'
// import { EventBus } from '@/components/event-bus'

import draggable from 'vuedraggable'
import TaskCard from './components/TaskCard.vue'
export default {
  name: 'Draggable1',
  components: {
    TaskCard,
    draggable
  },
  data() {
    return {
      columns: [
        {
          title: 'Backlog',
          tasks: [
            {
              id: 1,
              title: 'Add discount code to checkout page',
              date: 'Sep 14',
              type: 'Feature Request'
            },
            {
              id: 2,
              title: 'Provide documentation on integrations',
              date: 'Sep 12'
            },
            {
              id: 3,
              title: 'Design shopping cart dropdown',
              date: 'Sep 9',
              type: 'Design'
            },
            {
              id: 4,
              title: 'Add discount code to checkout page',
              date: 'Sep 14',
              type: 'Feature Request'
            },
            {
              id: 5,
              title: 'Test checkout flow',
              date: 'Sep 15',
              type: 'QA'
            }
          ]
        },
        {
          title: 'In Progress',
          tasks: [
            {
              id: 6,
              title: 'Design shopping cart dropdown',
              date: 'Sep 9',
              type: 'Design'
            },
            {
              id: 7,
              title: 'Add discount code to checkout page',
              date: 'Sep 14',
              type: 'Feature Request'
            },
            {
              id: 8,
              title: 'Provide documentation on integrations',
              date: 'Sep 12',
              type: 'Backend'
            }
          ]
        },
        {
          title: 'Review',
          tasks: [
            {
              id: 9,
              title: 'Provide documentation on integrations',
              date: 'Sep 12'
            },
            {
              id: 10,
              title: 'Design shopping cart dropdown',
              date: 'Sep 9',
              type: 'Design'
            },
            {
              id: 11,
              title: 'Add discount code to checkout page',
              date: 'Sep 14',
              type: 'Feature Request'
            },
            {
              id: 12,
              title: 'Design shopping cart dropdown',
              date: 'Sep 9',
              type: 'Design'
            },
            {
              id: 13,
              title: 'Add discount code to checkout page',
              date: 'Sep 14',
              type: 'Feature Request'
            }
          ]
        },
        {
          title: 'Done',
          tasks: [
            {
              id: 14,
              title: 'Add discount code to checkout page',
              date: 'Sep 14',
              type: 'Feature Request'
            },
            {
              id: 15,
              title: 'Design shopping cart dropdown',
              date: 'Sep 9',
              type: 'Design'
            },
            {
              id: 16,
              title: 'Add discount code to checkout page',
              date: 'Sep 14',
              type: 'Feature Request'
            }
          ]
        },
        {
          title: 'New list',
          type: 'new_list',
          tasks: []
        }
      ],
      isDragging: false,
      isListDragging: false,
      delayedDragging: false,
      delayedListDragging: false,
      editField: 'empty',
      newTaskIndex: null,
      edit_task: false,
      cadInfo: {
        left: 0,
        top: 0
      },
      card_editor_button_top: 0,
      card_title: '',
      edit_task_index: 0,
      edit_list_index: 0
    }
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
      })
    }
  },
  methods: {
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
      if (this.newTaskIndex !== null) {
        this.columns[this.newTaskIndex].tasks = this.columns[this.newTaskIndex].tasks.filter(function(task) {
          return task.type !== 'new'
        })
      }
      this.columns[index].tasks.push({
        title: '',
        type: 'new'
      })
      this.newTaskIndex = index
      this.$nextTick(() => {
        this.scrollToBottom(index)
        document.querySelector('#new-task textarea').focus()
      })
    },
    updateTask() {
      this.columns[this.edit_list_index].tasks[this.edit_task_index].title = this.card_title
      this.edit_task = false
    },
    editTask(cadInfo, list_index, task_index) {
      this.cadInfo = cadInfo
      this.card_editor_button_top = cadInfo.top > 200 ? -114 : 0
      this.card_title = cadInfo.task.title
      this.edit_list_index = list_index
      this.edit_task_index = task_index
      this.edit_task = true
      this.$nextTick(() => {
        this.$refs.updateTextRef.focus()
        this.$refs.updateTextRef.select()
      })
    },
    cancelAdd() {
      this.columns[this.newTaskIndex].tasks = this.columns[this.newTaskIndex].tasks.filter(function(task) {
        return task.type !== 'new'
      })
      this.newTaskIndex = null
    },
    scrollToBottom(index) {
      const element = document.getElementsByClassName('task-card-container')[index]
      element.scrollTop = element.scrollHeight
    }
  }
}
</script>

<style scoped>
.draggable-container {
  overflow-x: auto;
}

.column-width {
  min-width: 320px;
  width: 320px;
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
  width: 295px;
  padding: 3px;
  margin: 5px 7px;
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
</style>
