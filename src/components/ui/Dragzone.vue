<template>
  <div class="dragzone" @dragover.prevent @dragenter="moveToNewList($event)" @drop="drop($event)">
    <div v-if="isListExpandable" @click="expandedList = !expandedList" class="dragzone__item-icon">
      {{ expandedList ? '&#9652;' : '&#9662;' }}
    </div>
    <!-- <pre style="color: white;">{{ tasks }}</pre> -->
    <div class="dragzone__content" ref="dragzone_wrapper">
      <div v-for="(item, index) in expandedList ? tasks : tasks.slice(0, numberOfExpandedItems)" :key="item.uuid" class="dragzone__item" :class="{ 'dragzone__item--dragged': item.id === draggedItemId }" :id="item.id" draggable="true" @dragstart="dragstart($event, item)" @dragend="dragend($event)" @drop="drop($event)">
        <!-- <pre>{{ item }}</pre> -->
        <div class="dragzone__item-block">
          <div class="dragzone_dragover" @dragover="moveItem(index, item.id)"></div>
          <div class="dragzone__item-block-content">
            <div class="dragzone__item-wrapper" style="padding-left: 5px; padding-right: 5px">
              <div class="burger-icon-wrapper" v-if="!item.project.acronym">
                <div style="padding-left: 5px; padding-right: 5px; margin-top: 5px" class="burger-icon" @click="showTaskDetail(item)" @mouseenter="show_plusIcon(item.id, true)" @mouseleave="show_plusIcon(null, false)">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span v-show="showPlusIcon.task_id === item.id && showPlusIcon.visible" @mouseenter="show_plusIcon(item.id, true)" @mouseleave="show_plusIcon(null, false)" @click="createTempItem(index, item.id)"> + </span>
              </div>

              <div class="dragzone__item-info">
                <!-- <p style="margin-bottom: 0 !important;">
                  <span class="dragzone-project-acronym" v-if="item.project.acronym">{{ item.project.acronym }}</span>
                  <span v-else class="dragzone-project-project-name">{{ projectName(item.project_id) }}</span>
                  <span class="dragzone__item-text" contenteditable="true" :data-id="item.id" @blur="updateTaskTitle($event, item)" @keydown.enter.prevent="createTempItem(index, item.id)" @click="editedItemId = item.id">{{ item.title }}</span>
                </p> -->
                <div class="dragzone-project-acronym-wrapper" v-if="item.project.acronym">
                  <div class="dragzone-project-acronym" :style="{ 'background-color': clientColor(item) }" @click="showTaskDetail(item)" @mouseenter="show_plusIcon(item.id, true)" @mouseleave="show_plusIcon(null, false)">
                    {{ item.project.acronym }}
                  </div>
                  <span v-show="showPlusIcon.task_id === item.id && showPlusIcon.visible" @mouseenter="show_plusIcon(item.id, true)" @mouseleave="show_plusIcon(null, false)" @click="createTempItem(index, item.id)"> + </span>
                </div>
                <span v-else class="dragzone-project-project-name">{{ projectName(item.project_id) }}</span>
                <div class="dragzone__item-text d-flex align-items-center" v-html="item.title" contenteditable="true" :data-id="item.id" @blur="updateTaskTitle($event, item)" @keydown.enter.prevent="createTempItem(index, item.id)" @click="editedItemId = item.id" />
              </div>
              <div v-if="item.project_id" class="dragzone__item-tracker-icon" @click="onTaskTimerClicked(item.task_id, item.id)">
                <span v-if="timerId === item.id" class="icon-stop" style="font-size: 25px; color: red" />
                <span v-else class="icon-play_arrow" style="font-size: 25px; color: green" />
              </div>
            </div>
            <!-- <div class="dragzone__item-block-content-text">
              <div class="dragzone__item-subtext mt-2">
                <img v-if="project_url(item)" :src="project_url(item)" />
                <div class="d-flex align-items-center">
                  <span class="dragzone-project-acronym" v-if="item.project.acronym">
                    {{ item.project.acronym }}
                  </span>
                  <span v-else>{{ projectName(item.project_id) }}</span>
                  <div v-if="item.project_id" class="dragzone__item-tracker-icon" @click="onTaskTimerClicked(item.task_id, item.id)">
                    <span v-if="timerId === item.id" class="dragzone__item-tracker-icon-square" />
                    <span v-else class="dragzone__item-tracker-icon-triangle" />
                  </div>
                </div>
              </div>
              <div class="dragzone__item-dragbox dragzone__item-dragbox--active" @click="editTask(item.task_id || item.id)">
                <span />
                <span />
                <span />
              </div>
              <div class="dragzone__add-task dragzone__add-task--item" @click="createTempItem(index, item.id)">
                +
              </div>
              <div class="">
                <div class="dragzone__item-text d-flex align-items-center" v-html="item.title" contenteditable="true" :data-id="item.id" @blur="updateTaskTitle($event, item)" @keydown.enter.prevent="createTempItem(index, item.id)" @click="editedItemId = item.id" />
              </div>
            </div> -->
            <div v-if="show_debug()" style="padding: 0 10px">
              <small>
                <span style="color: red">{{ getTaskType(item.task_id || item.id) }}</span> list: {{ item.user_task_list_id }} work: {{ item.next_work_day }} sort: {{ item.sort_order }} index: {{ index }} <small v-if="item.task_id">TaskUser</small><small v-else>Task.id</small>: {{ item.id }}
              </small>
            </div>
            <div class="dragzone__task-users">
              <b-badge v-if="task_user.company_user_id !== selectedCompanyUserId || !verticalAlignment" class="dragzone_badge" :style="{ backgroundColor: getCompanyUser(task_user.company_user_id).color }" v-for="task_user in getTaskUsers(item.task_id || item.id)" :key="task_user.id" v-bind:task_user="task_user">
                {{ getCompanyUser(task_user.company_user_id).name | abbrName }}
              </b-badge>
            </div>
          </div>
          <div v-if="index == tasks.length - 1" class="dragzone_dragover" @dragover="moveItem(index, item.id)"></div>

          <!-- <div
            v-if="true || editedItemId === item.id"
            class="dragzone__item-tracker"
          >
            <div
              v-if="getTaskDueDate(item.task_id || item.id)"
              class="dragzone__item-tracker-number"
            >
              08/01 {{ getTaskDueDate(item.task_id || item.id) }}
            </div>
            <div
              class="dragzone__item-tracker-name"
              :class="{
                'dragzone__item-tracker-name--active': timerId === item.id
              }"
            />
            <span
              class="dragzone__item-tracker-circle"
              :class="{
                'dragzone__item-tracker-circle--active': timerId === item.id
              }"
            />
            <div class="dragzone__item-tracker-time">00:00:00</div>
          </div>-->
        </div>
      </div>

      <div v-if="tasks.length === 0" class="dragzone__add-task" @click="createTempItem(-1)">+</div>
    </div>
    <!--<div v-if="!expandedList && isListExpandable" class="pl-2">
      ...
    </div>-->
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { cloneDeep } from 'lodash'
import { namespace } from 'vuex-class'
import { EventBus } from '@/components/event-bus'
import uuid from 'uuid'

const Tasks = namespace('tasks')

@Component({
  filters: {
    abbrName(name: string) {
      if (!name) return ''
      let matches = name.match(/\b(\w)/g) // ['J','S','O','N']
      if (matches) {
        let acronym = matches.join('') // JSON
        return acronym.toUpperCase()
      }
    }
  }
})
export default class Dragzone extends Vue {
  private get isListExpandable() {
    return this.tasks.length > this.numberOfExpandedItems
  }
  @Prop({ required: true }) public id!: number
  @Prop({ required: true }) public draggedItemId!: number | null
  @Prop({ required: true, default: () => [] }) public tasks!: any
  @Prop({ required: true }) public isListDragged!: boolean
  @Prop({ required: true }) public group!: any
  @Prop({ required: true }) public verticalAlignment!: boolean
  @Prop({ required: false, default: false }) public initiallyExpanded!: boolean
  @Prop({ required: false, default: false })
  @Tasks.Getter
  public getById!: any

  @Prop({ required: true }) private selectedCompanyUserId!: number
  private current_company_user_id: any = this.$store.state.settings.current_company_user_id
  private expandedList: boolean = this.initiallyExpanded
  private numberOfExpandedItems: number = 20
  private newItem: any = null
  private timerId: number | string | null = null
  private editedItemId: number | string | null = null
  private currentListsBlockName: string | null = null
  private showPlusIcon: object = { task_id: null, visible: false }

  @Watch('tasks')
  public onTaskChanged(newTasks: any, oldTasks: any) {
    if (newTasks.length > oldTasks.length) {
      const tempTask = newTasks.find(({ temp }: any) => temp)
      if (tempTask) {
        // Note: expanding list prevents that a new task appears in the hided area
        // since it could be many tasks with the same sort_order number
        this.expandedList = true
        // Note: added timeout to wait once new task node appears in DOM
        setTimeout(() => {
          const el = this.$el.querySelector(`.dragzone__item-text[data-id="${tempTask.id}"]`) || this.$el.querySelectorAll('.dragzone__item-text')[this.tasks.length]
          if (el) {
            // @ts-ignore
            el.focus()
          }
        }, 50)
      }
    }
  }

  private async showTaskDetail(item: any) {
    // editTask(item.task_id || item.id)

    let task = await this.$store.state.tasks.tasks.find((tsk: any) => {
      if (item.task_id) {
        return tsk.id === item.task_id
      } else {
        return tsk.id === item.id
      }
    })

    await this.$router.push({ query: { task: task.id, showChatSection: 'true' } })
  }

  private clientColor(item: any) {
    return this.$store.state.clients.clients.find((client: any) => client.client_company_id === item.project.client_company_id).color
  }

  private show_plusIcon(task_id: any, visibility: boolean) {
    this.showPlusIcon = { task_id: task_id, visible: visibility }
  }

  private show_debug() {
    return process.env.VUE_APP_SHOW_DEBUG === 'on'
  }
  private project_url(item: any) {
    if (!item.project_id) {
      return false
    }

    const project = this.$store.getters['projects/getById'](item.project_id)
    if (!project) {
      return false
    }

    return project.project_url ? 'https://api.projectous.com/api/projects/' + project.id + '/favicon.png' : false
  }

  private getTaskUsers(task_id: any) {
    return this.$store.getters['task_users/getByTaskId'](task_id)
  }
  private getCompanyUser(company_user_id: any) {
    let company_user = this.$store.getters['company_users/getById'](company_user_id)
    //console.log(company_user)
    return company_user ? company_user : []
  }
  private getTaskDueDate(task_id: any) {
    let task = this.$store.getters['tasks/getById'](task_id)
    return task.due_date ? task.due_date : null
  }

  private getTaskType(task_id: any) {
    let task = this.$store.getters['tasks/getById'](task_id)
    return task.settings ? task.settings.task_type : null
  }

  // private editTask(task_id: any) {
  //   let task = this.$store.getters['tasks/getById'](task_id)
  //   console.log('edit task', task)
  //   this.$store.state.settings.current_edit_task = cloneDeep(task)
  //   this.$store.dispatch('settings/openModal', 'task')
  // }
  private projectName(project_id: any) {
    const project = this.$store.getters['projects/getById'](project_id)
    return project ? project.name : project_id
  }
  private dragstart(e: any, item: any) {
    e.dataTransfer.setData('application/node type', this)
    e.dataTransfer.setDragImage(e.target, 0, 0)
    localStorage.setItem('item', JSON.stringify(item))
    setTimeout(() => {
      this.$emit('setDraggedItemId', item.id)
    }, 0)
  }

  /**
   * Triggers only on destination list
   */
  private async drop() {
    console.log('************* DROP *************')
    const item = JSON.parse(localStorage.getItem('item') as string)
    if (item) {
      //DROP event triggers twice for some reason.
      this.$parent.$emit('update', item)
      localStorage.removeItem('item')
      const displaced_item_id = localStorage.getItem('displaced_item_id')
      this.$emit('updateDataIndexes', item, displaced_item_id)
      if (this.tasks.length) {
        this.$emit('updateSortOrders', JSON.stringify(this.tasks))
      }
    }

    await EventBus.$emit('updateDraggableHeight')
  }

  /**
   * Triggers only on source list
   */
  private dragend(e: any) {
    console.log('************* DRAGEND *************')
    this.$emit('setDraggedItemId', null)

    //Update Source List item.sort_order
    if (this.tasks.length) {
      //TODO: check to see if source and destination are the same to save an api call
      this.$emit('updateSortOrders', JSON.stringify(this.tasks))
    }
  }

  /**
   * Dragover event
   */
  private moveItem(index: number, id: string) {
    console.log('************* DRAGOVER ' + this.id, this.group, ' *************')
    localStorage.setItem('displaced_item_id', id) //TODO: should this be after the next line?
    if (this.isListDragged) return

    this.updateDraggedLocalStorageItem(index, id)
  }

  /**
   * List Dragenter: Triggers on every drag event and during every drag event multiple times.
   *
   * - Quick return if a list is being dragged.
   * -TODO: why is it checking tasks.length? Aside from setting sort order, I don't see a reason yet
   */
  private moveToNewList() {
    console.log('************* DRAGENTER ' + this.id + ' ' + this.group + ' *************')
    this.$emit('setCurrentListsBlockName') //TODO: move after next line?
    if (this.isListDragged) return

    if (!this.tasks.length) {
      //Set sort order to 0 because there is no item index we are dragging over
      this.updateDraggedLocalStorageItem(0, '')
    }
  }

  private updateDraggedLocalStorageItem(sort_order: number, dropped_id: string) {
    try {
      console.log('group', this.group)
      const item = JSON.parse(localStorage.getItem('item') as string)
      //TODO: listId should be a uuid and user_task_list_id should also be that so we don't need diff ids?
      item.listId = this.id
      item.user_task_list_id = this.id ? this.id : null
      item.sort_order = sort_order
      this.$emit('updateDataIndexes', item, dropped_id) //TODO this somehow governs the drop area grey div
      localStorage.setItem('item', JSON.stringify(item))
    } catch (e) {
      console.log(e)
    }
  }

  private async createTempItem(index: number, after_id: number) {
    index = index + 1
    console.log('******** CREATE TEMP ITEM @index ' + index + ' @after ' + after_id + ' @group ' + this.group.name + ' ********')
    const id = uuid.v4()
    const tempItem = {
      id,
      title: '',
      listId: this.id,
      status: this.group.name,
      sort_order: index,
      temp: false
    }

    // @ts-ignore
    const ids_of_items_to_shift_up = this.tasks.slice(index).map(item => item.id)
    this.$parent.$emit('createItem', {
      item: tempItem,
      ids_of_items_to_shift_up
    })
    //console.log('emit createItem')
    Vue.nextTick(() => {
      console.log('*** TICK ***')
      // @ts-ignore
      const elements = document.querySelectorAll('[data-id="' + id + '"]')
      if (elements.length) {
        // @ts-ignore
        elements[0].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
        // @ts-ignore
        elements[0].focus()
      } else {
        console.log('[data-id="' + id + '"] Not Found')
      }
    })
  }

  private async updateTaskTitle(event: any, item: any) {
    let titleWithAcronym = event.target.innerHTML

    const id = item.task_id ? item.task_id : item.id
    console.log('update title', item, id)

    const projectRegex = /^([A-Z-]+):\s*/ //TODO: fix the :[:space] not being captured
    const acronym_match = titleWithAcronym ? titleWithAcronym.match(projectRegex) : null

    if (acronym_match && acronym_match[1]) {
      const projects_by_acronym = this.$store.state.projects.projects.filter((project: any) => project.acronym === acronym_match[1])
      if (projects_by_acronym.length === 1) {
        //TODO: update history
        await this.$store.dispatch('UPDATE_ATTRIBUTE', { module: 'tasks', id, attribute: 'project_id', value: projects_by_acronym[0].id }, { root: true })
        // console.log('match found: ', projects_by_acronym[0].name)
      }
    }
    // else {
    //   await this.$store.dispatch('UPDATE_ATTRIBUTE', { module: 'tasks', id, attribute: 'project_id', value: '' }, { root: true })
    // }

    let title = titleWithAcronym.split(': ')[1] || titleWithAcronym

    event.target.innerHTML = title

    await this.$store.dispatch('tasks/UPDATE_TITLE', { id, title })
  }

  private async updateTask({ target: { innerHTML: name } }: any, item: any) {
    if (item.temp) {
      if (!name) {
        // Note: delete temp item if user didn't enter title
        this.$emit('delete', item)
      } else {
        const newItem = {
          title: name,
          listId: this.id,
          sort_order: item.sort_order
        }
        // Note: create a new item
        this.$emit('create', newItem)
      }
    } else if (item.title !== name) {
      const updatedItem = cloneDeep(item)
      updatedItem.title = name
      this.$emit('update', updatedItem)
    }
    this.editedItemId = null
  }

  /*
  This is for toggling the Play/Stop icon
   */
  private onTaskTimerClicked(taskId: number | string, itemId: number | string) {
    //TODO: timerId could be from a getter checking for a timer associated with taskId today with logged in user
    const timerId = this.timerId === null ? itemId : null
    this.timerId = timerId
    this.$emit('taskTimerToggled', { taskId, timerId })
  }
}
</script>

<style lang="scss">
.dragzone_badge {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  border-radius: 50% !important;
  width: 25px;
  height: 25px;
  color: black !important;
  font-size: 10px !important;
  margin-right: 3px;
  box-shadow: rgba(255, 255, 255, 0.5) 0px 0px 5px;
  margin-left: 0px;
}
.dragzone-project-project-name {
  font-size: 10px;
  font-weight: bold;
  max-width: 80px;
  color: green;
  // background-color: orange;
  // text-decoration: underline;
}
.dragzone__item-wrapper {
  display: flex;
  // height: 100%;
  // align-items: center;
  // justify-content: center;
  // border: 1px solid red;
}
.dragzone__item-info {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  word-break: break-word;
}
.burger-icon-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  // align-items: flex-start;
  // border: 1px solid red;
}
.burger-icon span {
  display: block;
  width: 15px;
  height: 2px;
  background: #cccccf;
  margin: 2px 0;
}
.dragzone-project-acronym {
  padding: 3px 5px;
  white-space: nowrap;
  color: white;
  font-size: 10px;
  max-height: 20px;
}
.dragzon-icon-dehaze {
  cursor: all-scroll;
  font-size: 20px;
}
.dragzone {
  width: 100%;
  min-height: 40px;
  height: auto;
}
.dragzone_dragover {
  width: 100%;
  height: 5px;
}
.dragzone__content {
  /*  max-height: 350px;
  overflow-y: auto;
  padding: 0.5rem;*/
}
.dragzone__item {
  /*display: flex;*/
  align-items: flex-start;
  padding: 2px 0;
  cursor: pointer;
  position: relative;
}
.dragzone__item:hover .dragzone__add-task--item {
  visibility: visible;
}
.dragzone__item-icon {
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  border: 1px solid #222222;
  cursor: pointer;
}
.dragzone__item--dragged {
  color: rgba(0, 0, 0, 0.3);
}

/* http://prntscr.com/u6e55s */
.dragzone__item--dragged:after {
  position: absolute;
  top: 0;
  left: 0;
  content: '';
  background-color: #c5c5c8;
  width: 100%;
  height: 100%;
}
.dragzone__item-block {
  width: 100%;
}
.dragzone__item-block-content {
  /* display: flex; */
  padding: 2px 0;
  align-items: center;
  clear: both;
  color: white;
  background-color: rgba($color: #000000, $alpha: 0.4);
  box-shadow: 0px 0px 16px -7px rgba($color: #ffffff, $alpha: 1);
  border-radius: 5px;
}
.dragzone__item-block-content-text {
  flex-grow: 1;
  margin-right: 5px;
}
.dragzone__item-dragbox {
  float: left;
  cursor: move;
  width: 12px;
  height: 18px;
  margin: 0.5rem;
  margin-top: 0.2rem;
  flex: none;
  display: flex;
  flex-wrap: wrap;
}
.dragzone__item-dragbox span {
  display: block;
  width: 100%;
  height: 2px;
  background: #cccccf;
  margin: 2px 0;
}
.dragzone__item-dragbox--active span {
  background: lightgrey; /*#cef3f7;*/
}
.dragzone__item-text {
  margin-left: 5px;
  flex-grow: 1;
  min-height: 1.459em;
  font-size: 0.9rem;
  color: white;
  margin-bottom: 0 !important;
}
.dragzone__item-subtext {
  margin-left: 30px;
  width: calc(100% - 30px);
  /* margin-top: 10rem; */
  margin-bottom: 0.5rem;
  line-height: 0.8rem;
  font-size: 0.7rem;
  font-weight: lighter;
  color: white;
}
.dragzone__item-tracker-icon {
  float: right;
  width: 20px;
  height: 20px;
  margin-left: auto;
  border-radius: 100%;
  // background: #c5c5c8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}
.dragzone__item-tracker-icon--active {
  background: #5cd8e2;
}
// .dragzone__item-tracker-icon-triangle {
//   width: 8px;
//   height: 0;
//   margin-left: 3px;
//   border-left: solid 8px #ffffff;
//   border-bottom: solid 6px transparent;
//   border-top: solid 6px transparent;
// }
.dragzone__item-tracker-icon-square {
  width: 8px;
  height: 8px;
  background: #ffffff;
  border-radius: 3px;
}
// .dragzone__item-tracker-icon .icon-play_arrow:hover {
//   color: white;
//   // transform: scale(0.8);
//   // transform-origin: 50% 50%;
//   // transition: transform 200ms ease-out;
// }
.dragzone__item-tracker {
  width: 100%;
  padding: 0.25rem 0.5rem;
  margin-top: 0.5rem;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  color: #767676;
}
.dragzone__item-tracker-number {
  padding: 0 4px;
  margin-right: 0.5rem;
  background: #ffffff;
}
.dragzone__item-tracker-name {
  font-style: italic;
}
.dragzone__item-tracker-name--active {
  color: #5cd8e2;
}
.dragzone__item-tracker-circle {
  width: 14px;
  height: 14px;
  margin-left: 1rem;
  border-radius: 100%;
  background: #767676;
}
.dragzone__item-tracker-circle--active {
  background: #50b379;
}
.dragzone__item-tracker-time {
  margin-left: auto;
  font-weight: bold;
}
.dragzone__add-task {
}
.dragzone__add-task--item {
  float: left;
  margin-left: -35px;
  margin-top: 7px;
  cursor: pointer;
  line-height: 8px;
  visibility: hidden;
}

.dragzone__task-users {
  // margin-left: 25px;
  margin: 2px 0 2px 25px;
  display: flex;
}
.dragzone-project-acronym-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

*:focus {
  outline: none;
}
</style>
