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
          ? items.slice(0, numberOfExpandedItems)
          : items"
        :key="item.id"
        class="dragzone__item"
        :class="{ 'dragzone__item--dragged': item.id === draggedItemId }"
        draggable="true"
        @dragstart="dragstart(item)"
        @dragend="dragend"
        @dragover="moveItem(index, item.id)"
      >
        <div class="dragzone__item-dragbox" />
        <div
          class="dragzone__item-text"
          ref="content"
          v-html="item.title"
          contenteditable="true"
          @blur="updateTitle($event, item, index)"
          @keydown.enter.prevent="addNewTask($event, item, index)"
        />
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
  @Tasks.Getter public getById!: any

  private expandedList: boolean = true
  private numberOfExpandedItems: number = 3
  private items: any = this.options
  private newItem: any = null

  @Watch('options')
  private onOptionsChange(value: any) {
    this.items = value
  }

  private dragstart(item: any) {
    localStorage.setItem('item', JSON.stringify(item))
    this.$emit('setDraggedItemId', item.id)
  }
  private dragend() {
    try {
      const item = JSON.parse(localStorage.getItem('item') as string)
      this.$emit('save', item)
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
      this.$emit('update', item, index, id)
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
        this.$emit('update', item, 0)
      } catch (e) {
        console.log(e)
      }
    }
  }
  private updateTitle(
    { target: { innerHTML: name } }: any,
    item: any,
    index: number
  ) {
    if (item.id === -1 && item.title === '') {
      this.items.splice(index, 1)
    }

    if (name === item.title) return

    const updatedItem = cloneDeep(item)
    updatedItem.title = name

    if (updatedItem.id !== -1) {
      this.$emit('save', updatedItem)
    } else {
      this.$emit('create', updatedItem)
    }
  }
  private async addNewTask(e: any, item: any, index: number) {
    this.updateTitle(e, item, index)

    this.newItem = cloneDeep(item)
    this.newItem.id = -1
    this.newItem.task_id = -1
    this.newItem.title = ''

    this.items.splice(1, 0, this.newItem)

    await this.$nextTick()
    if (this.$el.querySelectorAll('.dragzone__item-text')[index + 1]) {
      // @ts-ignore
      this.$el.querySelectorAll('.dragzone__item-text')[index + 1].focus()
    }
  }
}
</script>

<style>
.dragzone {
  width: 300px;
  min-height: 40px;
  padding: 0.5rem;
  height: auto;
  border: 1px solid black;
}
.dragzone__content {
  max-height: 350px;
  overflow-y: auto;
  padding: 0.5rem;
}
.dragzone__item {
  display: flex;
  align-items: center;
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
.dragzone__item-dragbox {
  width: 10px;
  height: 10px;
  margin-right: 0.5rem;
  border-radius: 100%;
  flex: none;
  background-color: black;
}
.dragzone__item-text {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  flex-grow: 1;
  min-height: 1.5em;
}
*:focus {
  outline: none;
}
</style>
