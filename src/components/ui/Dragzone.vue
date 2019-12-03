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
          @blur="updateTitle($event, item)"
          @keydown.enter.prevent
          @keydown.enter="createNewTask(item.id)"
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
import { Component, Vue, Prop } from 'vue-property-decorator'
import { cloneDeep } from 'lodash'
import { namespace } from 'vuex-class'

const Tasks = namespace('tasks')

@Component
export default class Dragzone extends Vue {
  @Prop({ required: true }) public id!: number
  @Prop({ required: true, default: () => [] }) public options!: any
  @Tasks.Getter public getById!: any
  private expandedList: boolean = true
  private numberOfExpandedItems: number = 3
  get draggedItemId() {
    return localStorage.getItem('item') || null
  }
  set draggedItemId(item: any) {
    localStorage.setItem('item', JSON.stringify(item))
  }
  private dragstart(item: any) {
    this.draggedItemId = item
  }
  private dragend() {
    try {
      const item = JSON.parse(localStorage.getItem('item') as string)
      this.$emit('save', item)
      localStorage.removeItem('item')
    } catch (e) {
      console.log(e)
    }
  }
  private moveItem(index: number, id: number) {
    try {
      const item = JSON.parse(localStorage.getItem('item') as string)
      item.listId = this.id.toString()
      item.sort_order = index
      this.$emit('update', item, index, id)
      localStorage.setItem('item', JSON.stringify(item))
    } catch (e) {
      console.log(e)
    }
  }
  private moveToNewList() {
    if (!this.options.length) {
      try {
        const item = JSON.parse(localStorage.getItem('item') as string)
        item.listId = this.id.toString()
        item.sort_order = 0
        this.$emit('update', item, 0)
      } catch (e) {
        console.log(e)
      }
    }
  }
  private updateTitle({ target: { innerHTML: name } }: any, item: any) {
    const updatedItem = cloneDeep(item)
    updatedItem.title = name
    this.$emit('save', updatedItem)
  }
  private createNewTask(id: number) {
    this.$emit('create', id)
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
}
*:focus {
  outline: none;
}
</style>
