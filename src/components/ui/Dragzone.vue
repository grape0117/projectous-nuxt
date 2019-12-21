<template>
  <div class="dragzone" @dragover.prevent @dragenter="moveToNewList">
    <div
      v-if="options.length > numberOfExpandedItems"
      @click="expandedList = !expandedList"
      class="dragzone__item-icon"
    >
      {{ expandedList ? '&#9652;' : '&#9662;' }}
    </div>
    <div class="dragzone__content">
      <div
        v-for="(item, index) in expandedList
          ? options.slice(0, numberOfExpandedItems)
          : options"
        :key="item.id"
        class="dragzone__item"
        :class="{ 'dragzone__item--dragged': item.id === draggedItemId }"
        draggable="true"
        @dragstart="dragstart($event, item)"
        @dragend="dragend"
        @dragover="moveItem(index, item.id)"
      >
        <div class="dragzone__item-dragbox dragzone__item-dragbox--active">
          <span />
          <span />
          <span />
        </div>
        <div class="dragzone__item-block">
          <div class="dragzone__item-block-content">
            <div class="dragzone__item-block-content-text">
              <div
                class="dragzone__item-text"
                v-html="item.title"
                contenteditable="true"
                :data-id="item.id"
                @blur="updateTitle($event, item)"
                @keydown.enter.prevent="onEnter($event, item)"
                @click="editedItemId = item.id"
                @input="newNameTouched = true"
              />
              <div class="dragzone__item-subtext">Greenbite</div>
            </div>
            <div
              v-if="editedItemId === item.id"
              class="dragzone__item-tracker-icon"
              @click="onTaskTimerClicked(item.task_id, item.id)"
            >
              <span
                v-if="timerId === item.id"
                class="dragzone__item-tracker-icon-square"
              />
              <span v-else class="dragzone__item-tracker-icon-triangle" />
            </div>
          </div>
          <div v-if="editedItemId === item.id" class="dragzone__item-tracker">
            <div class="dragzone__item-tracker-number">08/01</div>
            <div
              class="dragzone__item-tracker-name"
              :class="{
                'dragzone__item-tracker-name--active': timerId === item.id
              }"
            >
              Richard
            </div>
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
    </div>
    <div
      v-if="expandedList && options.length > numberOfExpandedItems"
      class="pl-2"
    >
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
  @Prop({ required: true, default: () => [] }) public options!: any
  @Prop({ required: true }) public isListDragged!: boolean
  @Prop({ required: true }) public group!: string
  @Prop({ required: true }) public tempItemId!: number | null
  @Tasks.Getter public getById!: any

  private expandedList: boolean = true
  private numberOfExpandedItems: number = 3
  private newItem: any = null
  private timerId: number | string | null = null
  private editedItemId: number | string | null = null
  private preventUpdate: boolean = false
  private newNameTouched: boolean = false

  @Watch('tempItemId')
  private async onTempItemIdChanged(id: number | null) {
    if (id !== null) {
      await this.$nextTick()
      const newEl =
        this.$el.querySelector(`.dragzone__item-text[data-id="${id}"]`) ||
        this.$el.querySelectorAll('.dragzone__item-text')[this.options.length]
      if (newEl) {
        // @ts-ignore
        newEl.focus()
      }
    }
  }

  private dragstart(e: any, item: any) {
    e.dataTransfer.setData('application/node type', this)
    localStorage.setItem('item', JSON.stringify(item))
    this.$emit('setDraggedItemId', item.id)
  }
  private dragend() {
    try {
      const item = JSON.parse(localStorage.getItem('item') as string)
      this.$emit('update', item)
      localStorage.removeItem('item')
      this.$emit('setDraggedItemId', null)
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
    if (this.isListDragged) return

    if (!this.options.length) {
      try {
        const item = JSON.parse(localStorage.getItem('item') as string)
        item.listId = this.id
        item.user_task_list_id = this.group === 'User Lists' ? this.id : null
        item.sort_order = 0
        this.$emit('updateSorting', item, 0)
      } catch (e) {
        console.log(e)
      }
    }
  }
  /*
  If you hit enter, that fires first, set item.addItem == true. I'm not sure why we don't just addNewTask inside onEnter?
   */
  private updateTitle(
    { target: { innerHTML: name } }: any,
    item: any
  ) {
    if (this.tempItemId || this.preventUpdate) {
      if (this.newNameTouched) {
        item.title = name
        this.$emit('create', item)
        this.$emit('deleteTempItem')
        this.preventUpdate = false
      }
    } else {
      const updatedItem = cloneDeep(item)
      updatedItem.title = name
      this.$emit('update', updatedItem)
    }
  }

  /*
Why not create item inside this?
 */
  private async onEnter(event: any, item: any) {
    if (!this.tempItemId) {
      this.newNameTouched = false
      const { target } = event
      this.preventUpdate = true
      this.$emit('addTempItem', item)
      target.blur()
    }
  }
  /*
  This is for toggling the Play/Stop icon
   */
  private onTaskTimerClicked(taskId: number | string, itemId: number | string) {
    const timerId = this.timerId === null ? itemId : null
    this.timerId = timerId
    this.$emit('taskTimerToggled', { taskId, timerId })
  }
}
</script>

<style>
.dragzone {
  width: calc(100% - 121px);
  min-height: 40px;
  padding: 0.5rem;
  height: auto;
}
.dragzone__content {
  max-height: 350px;
  overflow-y: auto;
  padding: 0.5rem;
}
.dragzone__item {
  display: flex;
  align-items: flex-start;
  padding: 2px 0;
  cursor: pointer;
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
.dragzone__item-block {
  width: 100%;
}
.dragzone__item-block-content {
  display: flex;
  align-items: center;
}
.dragzone__item-block-content-text {
  flex-grow: 1;
  margin-right: 20px;
}
.dragzone__item-dragbox {
  cursor: move;
  width: 12px;
  height: 12px;
  margin: 0.5rem;
  flex: none;
}
.dragzone__item-dragbox span {
  display: block;
  width: 100%;
  height: 2px;
  background: #cccccf;
  margin: 2px 0;
}
.dragzone__item-dragbox--active span {
  background: #cef3f7;
}
.dragzone__item-text {
  flex-grow: 1;
  min-height: 1.459em;
  font-size: 1.2rem;
  color: #595b60;
}
.dragzone__item-subtext {
  width: 100%;
  font-size: 1rem;
  font-weight: lighter;
  color: #949598;
}
.dragzone__item-tracker-icon {
  width: 60px;
  height: 60px;
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
  width: 20px;
  height: 0;
  margin-left: 5px;
  border-left: solid 20px #ffffff;
  border-bottom: solid 12px transparent;
  border-top: solid 12px transparent;
}
.dragzone__item-tracker-icon-square {
  width: 20px;
  height: 20px;
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
*:focus {
  outline: none;
}
</style>
