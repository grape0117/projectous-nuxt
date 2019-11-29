<template>
  <div class="dragzone" @dragover.prevent @dragenter="test">
    <div
      v-for="(item, index) in options"
      :key="item.id"
      class="dragzone__item"
      :class="{ 'dragzone__item--dragged': item.id === draggedItemId }"
      draggable="true"
      @dragstart="dragstart(item)"
      @dragend="dragend"
      @dragover="moveItem(index)"
    >
      {{ item.title }}
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class Dragzone extends Vue {
  @Prop({ required: true }) public id!: number
  @Prop({ required: true, default: () => [] }) public options!: any
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
  private moveItem(index: number) {
    try {
      const item = JSON.parse(localStorage.getItem('item') as string)
      item.listId = this.id.toString()
      this.$emit('update', item, index)
      localStorage.setItem('item', JSON.stringify(item))
    } catch (e) {
      console.log(e)
    }
  }
  private test() {
    if (!this.options.length) {
      try {
        const item = JSON.parse(localStorage.getItem('item') as string)
        item.listId = this.id.toString()
        this.$emit('update', item, 0)
      } catch (e) {
        console.log(e)
      }
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
.dragzone__item {
  cursor: pointer;
}
.dragzone__item--dragged {
  color: rgba(0, 0, 0, 0.3);
}
</style>
