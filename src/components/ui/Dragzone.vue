<template>
  <div class="dragzone" @dragover.prevent @dragenter="moveToNewList">
    <div
      v-if="isListExpandable"
      @click="expandedList = !expandedList"
      class="dragzone__item-icon"
    >
      {{ expandedList ? '&#9652;' : '&#9662;' }}
    </div>
    <div class="dragzone__content">
      <div
        v-for="(item, index) in expandedList
          ? tasks
          : tasks.slice(0, numberOfExpandedItems)"
        :key="item.uuid"
        class="dragzone__item"
        :class="{ 'dragzone__item--dragged': item.id === draggedItemId }"
        draggable="true"
        @dragstart="dragstart($event, item)"
        @dragend="dragend($event)"
      >
        <div class="dragzone__item-block">
          <div
            style="width: 100%; height: 5px"
            @dragover="moveItem(index, item.id)"
          />
          <div class="dragzone__item-block-content">
            <div class="dragzone__item-block-content-text">
              <div
                v-if="true || editedItemId === item.id"
                class="dragzone__item-tracker-icon"
                @click="onTaskTimerClicked(item.task_id, item.id)"
              >
                <span
                  v-if="timerId === item.id"
                  class="dragzone__item-tracker-icon-square"
                />
                <span v-else class="dragzone__item-tracker-icon-triangle" />
              </div>
              <div class="dragzone__item-subtext">
                {{ projectName(item.project_id) }}
              </div>
              <div
                class="dragzone__item-dragbox dragzone__item-dragbox--active"
                @click="editTask(item.task_id || item.id)"
              >
                <span />
                <span />
                <span />
              </div>
              <div
                class="dragzone__add-task dragzone__add-task--item"
                @click="createTempTask(index)"
              >
                +
              </div>
              <div
                class="dragzone__item-text"
                v-html="item.title"
                contenteditable="true"
                :data-id="item.id"
                @blur="updateTask($event, item)"
                @keydown.enter.prevent="createTempTask(index)"
                @click="editedItemId = item.id"
              />
            </div>
            <div class="dragzone__task-users">
              <b-badge
                v-for="task_user in getTaskUsers(item.task_id || item.id)"
                :variant="task_user.role == 'assigned' ? 'info' : 'secondary'"
                v-bind:task_user="task_user"
                >{{ getCompanyUserName(task_user.company_user_id) }}
              </b-badge>
            </div>
          </div>
          <div
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
            ></div>
            <span
              class="dragzone__item-tracker-circle"
              :class="{
                'dragzone__item-tracker-circle--active': timerId === item.id
              }"
            />
            <div class="dragzone__item-tracker-time">00:00:00</div>
          </div>
        </div>
      </div>

      <div
        v-if="tasks.length === 0"
        class="dragzone__add-task"
        @click="createTempTask(0)"
      >
        +
      </div>
    </div>
    <div v-if="!expandedList && isListExpandable" class="pl-2">
      ...
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { cloneDeep } from 'lodash'
import { namespace } from 'vuex-class'

const Tasks = namespace('tasks')

@Component
export default class Dragzone extends Vue {
  @Prop({ required: true }) public id!: number
  @Prop({ required: true }) public draggedItemId!: number | null
  @Prop({ required: true, default: () => [] }) public tasks!: any
  @Prop({ required: true }) public isListDragged!: boolean
  @Prop({ required: true }) public group!: string
  @Prop({ required: false, default: false }) public initiallyExpanded!: boolean
  @Prop({ required: false, default: false })
  public selectedCompanyUserId!: number
  @Tasks.Getter public getById!: any

  private expandedList: boolean = this.initiallyExpanded
  private numberOfExpandedItems: number = 3
  private newItem: any = null
  private timerId: number | string | null = null
  private editedItemId: number | string | null = null
  private currentListsBlockName: string | null = null

  private get isListExpandable() {
    return this.tasks.length > this.numberOfExpandedItems
  }

  private getTaskUsers(task_id: any) {
    return this.$store.getters['task_users/getByTaskId'](task_id)
  }
  private getCompanyUserName(company_user_id: any) {
    let company_user = this.$store.getters['company_users/getById'](
      company_user_id
    )
    //console.log(company_user)
    return company_user ? company_user.name : ''
  }
  private getTaskDueDate(task_id: any) {
    let task = this.$store.getters['tasks/getById'](task_id)
    return task.due_date ? task.due_date : null
  }

  @Watch('tasks')
  onTaskChanged(newTasks: any, oldTasks: any) {
    if (newTasks.length > oldTasks.length) {
      const tempTask = newTasks.find(({ temp }: any) => temp)
      if (tempTask) {
        // Note: expanding list prevents that a new task appears in the hided area
        // since it could be many tasks with the same sort_order number
        this.expandedList = true
        // Note: added timeout to wait once new task node appears in DOM
        setTimeout(() => {
          const el =
            this.$el.querySelector(
              `.dragzone__item-text[data-id="${tempTask.id}"]`
            ) ||
            this.$el.querySelectorAll('.dragzone__item-text')[this.tasks.length]
          if (el) {
            // @ts-ignore
            el.focus()
          }
        }, 50)
      }
    }
  }

  private editTask(task_id: any) {
    let task = this.$store.getters['tasks/getById'](task_id)
    console.log('editing task: ', task)
    this.$store.state.settings.current_edit_task = task
    this.$bvModal.show('task-modal')
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
  private dragend(e: any) {
    try {
      const item = JSON.parse(localStorage.getItem('item') as string)
      this.$emit('update', item)
      localStorage.removeItem('item')
      this.$emit('setDraggedItemId', null)
      if (this.tasks.length)
        this.$emit('updateOptions', JSON.stringify(this.tasks))
    } catch (e) {
      console.log(e)
    }
  }
  private moveItem(index: number, id: number) {
    if (this.isListDragged) return

    try {
      const item = JSON.parse(localStorage.getItem('item') as string)
      item.listId = this.id
      item.user_task_list_id = this.group === 'User Lists' ? this.id : null
      item.sort_order = index
      this.$emit('updateSorting', item, index, id)
      localStorage.setItem('item', JSON.stringify(item))
    } catch (e) {
      console.log(e)
    }
  }
  private moveToNewList() {
    this.$emit('setCurrentListsBlockName')
    if (this.isListDragged) return

    if (!this.tasks.length) {
      try {
        const item = JSON.parse(localStorage.getItem('item') as string)
        item.listId = this.id
        item.user_task_list_id = this.group === 'User Lists' ? this.id : null
        item.sort_order = 0
        this.$emit('updateSorting', item, 0)
        localStorage.setItem('item', JSON.stringify(item))
      } catch (e) {
        console.log(e)
      }
    }
  }

  private async createTempTask(index: number) {
    const newItem = {
      title: '',
      listId: this.id,
      sort_order: index ? index - 1 : 0,
      temp: true
    }
    this.$emit('create', newItem)
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
  /*width: calc(100% - 121px);*/
  min-height: 40px;
  /*padding: 0.5rem;*/
  height: auto;
}
.dragzone__content {
  /*max-height: 350px;*/
  /*overflow-y: auto;*/
  /*padding: 0.5rem;*/
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
  width: 100%;
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
