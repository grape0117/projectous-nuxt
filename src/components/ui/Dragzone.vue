<template>
  <div class="dragzone" @dragover.prevent @dragover="listUpdate">
    <div
      v-for="(item, index) in options"
      :key="item.id"
      :class="{ 'dragzone__item--dragged': item.id === draggedItemId }"
      draggable="true"
      @dragstart="dragstart(item)"
      @dragend="dragend"
      @dragover="moveOrder(index)"
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
    return localStorage.getItem('task') || null
  }
  set draggedItemId(item: any) {
    localStorage.setItem('task', JSON.stringify(item))
  }
  public dragstart(item: any) {
    this.draggedItemId = item
  }
  public dragend() {
    localStorage.removeItem('task')
  }
  public moveOrder(index: number) {
    try {
      const item = JSON.parse(localStorage.getItem('task') as string)
      // item.sortOrder = index + 1
      this.$emit('changeSortOrder', item, index)
    } catch (e) {
      console.log(e)
    }
  }
  public listUpdate() {
    try {
      const item = JSON.parse(localStorage.getItem('task') as string)
      item.listId = this.id
      this.$emit('updateTask', item)
    } catch (e) {
      console.log(e)
    }
  }
}
</script>

<style>
.dragzone {
  width: 300px;
  height: 400px;
  border: 1px solid black;
}
.dragzone__item--dragged {
  color: rgba(0, 0, 0, 0.3);
}
</style>
