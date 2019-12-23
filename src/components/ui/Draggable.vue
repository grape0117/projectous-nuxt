<template>
  <div
    class="list__wrapper"
    :class="{ 'horizontal-alignment': !verticalAlignment }"
  >
    <div
      v-for="(group, index) in listGroups"
      :key="index"
      class="list"
      :draggable="group.isDraggable"
      @dragstart.self="dragStart($event, index)"
      @dragend.self="dragEnd"
      @dragenter="moveList(index, group.isDraggable)"
    >
      <div class="list__group-title">{{ group.name }}</div>
      <div
        v-for="{ id, title, initiallyExpanded } in lists.filter(
          list => list.group === group.name
        )"
        :key="id"
        class="list__group"
      >
        <div class="list__group-subtitle" v-if="verticalAlignment">
          {{ title }}
        </div>
        <pj-dragzone
          :id="id"
          :options="groupedData[id]"
          :isListDragged="isListDragged"
          :draggedItemId="draggedItemId"
          :group="group"
          :tempItemId="tempItemId"
          :initiallyExpanded="initiallyExpanded"
          @create="$emit('create', $event)"
          @update="$emit('update', $event)"
          @taskTimerToggled="$emit('taskTimerToggled', $event)"
          @updateSorting="updateSorting"
          @setDraggedItemId="draggedItemId = $event"
          @addTempItem="addTempItem"
          @deleteTempItem="deleteTempItem"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { groupBy, cloneDeep, uniq } from 'lodash'
import move from 'array-move'
import { generateUniqId } from '@/utils/util-functions'

@Component
export default class Draggable extends Vue {
  @Prop({ required: true }) public data!: any
  @Prop({ required: true }) public lists!: any
  @Prop({ required: false, default: true }) public verticalAlignment!: boolean

  protected tempItemId: number | null = null
  private clonedData: any = cloneDeep(this.data)
  private listGroups: any = []
  private draggedItemId: number | null = null
  private isListDragged: boolean = false
  private draggedListIndex: number = NaN
  private targetListIndex: number = NaN

  get groupedData() {
    return groupBy(this.clonedData, 'listId')
  }

  @Watch('data', { immediate: true })
  public onDataChanged(value: any) {
    this.clonedData = cloneDeep(value)
  }
  @Watch('lists', { immediate: true })
  public onListsChanged(value: any) {
    const notDraggable = ['Past Tasks', 'Current Tasks']
    // TODO: lists should have isDraggable field
    this.listGroups = uniq(value.map(({ group }: any) => group))
      // TODO: to del, only for tests
      .map((list: any) => {
        return {
          name: list,
          isDraggable: notDraggable.indexOf(list) === -1
        }
      })
  }

  public updateSorting(item: any, position: number, idNewPosition: number) {
    const index = this.clonedData.findIndex(({ id }: any) => item.id === id)
    const elementNewPosition = this.clonedData.findIndex(
      ({ id }: any) => id === idNewPosition
    )
    this.clonedData[index] = item
    this.clonedData = move(this.clonedData, index, elementNewPosition)
  }
  public addTempItem({ listId }: any) {
    const tempId = generateUniqId(10000)
    this.clonedData.splice(1, 0, {
      id: tempId,
      title: '',
      listId: listId
    })
    this.tempItemId = tempId
  }

  private deleteTempItem() {
    this.clonedData = this.clonedData.filter(
      ({ id }: any) => id !== this.tempItemId
    )
    this.tempItemId = null
  }

  private dragStart(e: any, index: number) {
    e.dataTransfer.setData('application/node type', this)
    this.isListDragged = true
    this.draggedListIndex = index
  }
  private dragEnd() {
    if (this.targetListIndex === this.draggedListIndex) return

    const listGroupsCopy = [...this.listGroups]
    const targetEl = listGroupsCopy[this.targetListIndex]
    const draggedEl = listGroupsCopy[this.draggedListIndex]
    listGroupsCopy.splice(this.targetListIndex, 1, draggedEl)
    listGroupsCopy.splice(this.draggedListIndex, 1, targetEl)
    this.draggedListIndex = this.targetListIndex
    this.listGroups = listGroupsCopy

    this.isListDragged = false
    this.draggedListIndex = NaN
  }
  private moveList(targetElIndex: number, isDraggable: boolean) {
    if (!isDraggable) return
    this.targetListIndex = targetElIndex

    // TODO: bug if change position here because of different height
  }
}
</script>

<style>
.list {
  width: 100%;
  max-width: 600px;
  cursor: pointer;
  text-transform: capitalize;
}
.list__wrapper.horizontal-alignment {
  display: flex;
}
.list__wrapper.horizontal-alignment .dragzone {
  width: 100%;
}
.list__group {
  width: 100%;
  display: flex;
  border: 1px solid #f6f6f6;
}
.list__group-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #707070;
  text-align: center;
}
.list__group-subtitle {
  width: 120px;
  padding: 0.5rem;
  border-right: 1px solid #f6f6f6;
  background: #f0fbfc;
  flex: none;
  text-transform: uppercase;
  color: #85868a;
  font-weight: bold;
}
</style>
