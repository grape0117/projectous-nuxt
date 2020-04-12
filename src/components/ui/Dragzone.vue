<template>
  <div class="dragzone" @dragover.prevent @dragenter="moveToNewList" @drop="drop($event)">
    <div v-if="isListExpandable" @click="expandedList = !expandedList" class="dragzone__item-icon">
      {{ expandedList ? '&#9652;' : '&#9662;' }}
    </div>
    <div class="dragzone__content">
      <div v-for="(item, index) in expandedList ? tasks : tasks.slice(0, numberOfExpandedItems)" :key="item.uuid" class="dragzone__item" :class="{ 'dragzone__item--dragged': item.id === draggedItemId }" draggable="true" @dragstart="dragstart($event, item)" @dragend="dragend($event)" @drop="drop($event)">
        <div class="dragzone__item-block">
          <div style="width: 100%; height: 20px" @dragover="moveItem(index, item.id)" />
          <div class="dragzone__item-block-content">
            <div class="dragzone__item-block-content-text">
              <div v-if="true || editedItemId === item.id" class="dragzone__item-tracker-icon" @click="onTaskTimerClicked(item.task_id, item.id)">
                <span v-if="timerId === item.id" class="dragzone__item-tracker-icon-square" />
                <span v-else class="dragzone__item-tracker-icon-triangle" />
              </div>
              <div class="dragzone__item-subtext">
                <img v-if="project_url(item)" :src="project_url(item)" />
                {{ projectName(item.project_id) }}
              </div>
              <div class="dragzone__item-dragbox dragzone__item-dragbox--active" @click="editTask(item.task_id || item.id)">
                <span />
                <span />
                <span />
              </div>
              <div class="dragzone__add-task dragzone__add-task--item" @click="createTempItem(index, item.id)">
                +
              </div>
              <div class="dragzone__item-text" v-html="item.title" contenteditable="true" :data-id="item.id" @blur="updateTask($event, item)" @keydown.enter.prevent="createTempItem(index, item.id)" @click="editedItemId = item.id" />
            </div>
            <div class="dragzone__task-users">
              <b-badge v-if="task_user.company_user_id !== current_company_user_id" v-for="task_user in getTaskUsers(item.task_id || item.id)" :key="task_user.id" :variant="task_user.role === 'assigned' ? 'info' : 'secondary'" v-bind:task_user="task_user">{{ getCompanyUserName(task_user.company_user_id) }} </b-badge>
            </div>
          </div>
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

      <div v-if="tasks.length === 0" class="dragzone__add-task" @click="createTempItem(-1)">
        +
      </div>
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
import uuid from 'uuid'

const Tasks = namespace('tasks')

@Component
export default class Dragzone extends Vue {
  private get isListExpandable() {
    return this.tasks.length > this.numberOfExpandedItems
  }
  @Prop({ required: true }) public id!: number
  @Prop({ required: true }) public draggedItemId!: number | null
  @Prop({ required: true, default: () => [] }) public tasks!: any
  @Prop({ required: true }) public isListDragged!: boolean
  @Prop({ required: true }) public group!: any
  @Prop({ required: false, default: false }) public initiallyExpanded!: boolean
  @Prop({ required: false, default: false })
  public selectedCompanyUserId!: number
  @Tasks.Getter public getById!: any

  private current_company_user_id: any = this.$store.state.settings.current_company_user_id
  private expandedList: boolean = this.initiallyExpanded
  private numberOfExpandedItems: number = 8
  private newItem: any = null
  private timerId: number | string | null = null
  private editedItemId: number | string | null = null
  private currentListsBlockName: string | null = null

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
  private getCompanyUserName(company_user_id: any) {
    let company_user = this.$store.getters['company_users/getById'](company_user_id)
    //console.log(company_user)
    return company_user ? company_user.name : ''
  }
  private getTaskDueDate(task_id: any) {
    let task = this.$store.getters['tasks/getById'](task_id)
    return task.due_date ? task.due_date : null
  }

  private editTask(task_id: any) {
    let task = this.$store.getters['tasks/getById'](task_id)
    console.log('editing task: ', task)
    this.$store.state.commit('settings/setCurrentEditTask', cloneDeep(task))
    //this.$store.dispatch('settings/openModal', {modal: 'task', id: task_id})
  }
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
  private drop() {
    //console.log('************* DROP *************')
    const item = JSON.parse(localStorage.getItem('item') as string)
    if (item) {
      //DROP event triggers twice for some reason.
      this.$emit('update', item)
      localStorage.removeItem('item')
      const displaced_item_id = localStorage.getItem('displaced_item_id')
      this.$emit('updateDataIndexes', item, displaced_item_id)
      if (this.tasks.length) {
        this.$emit('updateSortOrders', JSON.stringify(this.tasks))
      }
    }
  }

  /**
   * Triggers only on source list
   */
  private dragend(e: any) {
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
    localStorage.setItem('displaced_item_id', id) //TODO: should this be after the next line?
    if (this.isListDragged) return

    try {
      const item = JSON.parse(localStorage.getItem('item') as string)
      item.listId = this.id
      item.user_task_list_id = this.group === 'User Lists' ? this.id : null
      item.sort_order = index
      this.$emit('updateDataIndexes', item, id)
      localStorage.setItem('item', JSON.stringify(item))
    } catch (e) {
      alert('moveItem error check console')
      console.log(e)
    }
  }

  /**
   * List Dragenter: Triggers on every drag event and during every drag event multiple times.
   *
   * - Quick return if a list is being dragged.
   * -TODO: why is it checking tasks.length? Aside from setting sort order, I don't see a reason yet
   */
  private moveToNewList() {
    this.$emit('setCurrentListsBlockName') //TODO: move after next line?
    if (this.isListDragged) return

    if (!this.tasks.length) {
      //Set sort order to 0 because there is no item index we are dragging over
      this.updateDraggedLocalStorageItem(0, '')
    }
  }

  private updateDraggedLocalStorageItem(sort_order: number, dropped_id: string) {
    try {
      const item = JSON.parse(localStorage.getItem('item') as string)
      //TODO: listId should be a uuid and user_task_list_id should also be that so we don't need diff ids?
      item.listId = this.id
      item.user_task_list_id = this.group === 'User Lists' ? this.id : null
      item.user_task_list_id = this.group === 'User Lists' ? this.id : null
      item.sort_order = sort_order
      this.$emit('updateDataIndexes', item, dropped_id)
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

<style>
.dragzone {
  width: 100%;
  /*width: calc(100% - 121px);*/
  min-height: 40px;
  height: auto;
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
  /*display: flex;*/
  align-items: center;
  clear: both;
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
  margin-left: 30px;
  flex-grow: 1;
  min-height: 1.459em;
  font-size: 0.9rem;
  color: #595b60;
}
.dragzone__item-subtext {
  margin-left: 30px;
  width: calc(100% - 30px);
  margin-bottom: -0.1rem;
  line-height: 0.8rem;
  font-size: 0.7rem;
  font-weight: lighter;
  color: #949598;
}
.dragzone__item-tracker-icon {
  float: right;
  width: 20px;
  height: 20px;
  margin-left: auto;
  border-radius: 100%;
  background: #c5c5c8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}
.dragzone__item-tracker-icon--active {
  background: #5cd8e2;
}
.dragzone__item-tracker-icon-triangle {
  width: 8px;
  height: 0;
  margin-left: 3px;
  border-left: solid 8px #ffffff;
  border-bottom: solid 6px transparent;
  border-top: solid 6px transparent;
}
.dragzone__item-tracker-icon-square {
  width: 8px;
  height: 8px;
  background: #ffffff;
  border-radius: 3px;
}
.dragzone__item-tracker-icon:hover span {
  transform: scale(0.8);
  transform-origin: 50% 50%;
  transition: transform 200ms ease-out;
}
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
  clear: left;
  margin-left: 10px;
  cursor: pointer;
  line-height: 8px;
  visibility: hidden;
}

.dragzone__task-users {
  margin-left: 25px;
}

*:focus {
  outline: none;
}
</style>
