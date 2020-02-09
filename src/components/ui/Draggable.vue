<template>
  <div
    class="list__wrapper"
    :class="{ 'horizontal-alignment': !verticalAlignment }"
  >
    <div
      v-for="(group, index) in listGroups"
      :key="index"
      class="list"
      draggable="true"
      @dragstart.self="dragStart($event, index)"
      @dragend.self="dragEnd"
      @dragenter="moveList(index)"
    >
      <div v-if="!verticalAlignment" class="list__group-title">
        {{ group.name }}
      </div>
      <div
        v-for="{ id, title, initiallyExpanded } in lists.filter(
          list => list.group === group.name
        )"
        :key="id"
        class="list__group"
      >
        <div class="list__group-subtitle" v-if="verticalAlignment">
          <div
            v-if="group.isDraggable"
            class="dragzone__item-dragbox dragzone__item-dragbox--active list-group-dragbox"
          >
            <span />
            <span />
            <span />
          </div>
          <div>{{ title }}</div>
        </div>
        <pj-dragzone
          :id="id"
          :tasks="groupedData[id]"
          :isListDragged="isListDragged"
          :draggedItemId="draggedItemId"
          :group="group"
          :selectedCompanyUserId="selectedCompanyUserId"
          :initiallyExpanded="initiallyExpanded"
          @create="$emit('create', $event)"
          @update="$emit('update', $event)"
          @delete="$emit('delete', $event)"
          @taskTimerToggled="$emit('taskTimerToggled', $event)"
          @updateSorting="updateSorting"
          @setDraggedItemId="draggedItemId = $event"
          @updateOptions="$emit('updateOptions', $event)"
          @setCurrentListsBlockName="$emit('setCurrentListsBlockName', $event)"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { groupBy, cloneDeep, uniq, invert } from 'lodash'

@Component
export default class Draggable extends Vue {
  @Prop({ required: true }) public listsBlockName!: string
  @Prop({ required: true }) public data!: any
  @Prop({ required: true }) public lists!: any
  @Prop({ required: false, default: true }) public verticalAlignment!: boolean
  @Prop({ required: false, default: null }) public selectedCompanyUserId!:
    | number
    | null

  private clonedData: any = cloneDeep(this.data)
  private listGroups: any = []
  private draggedItemId: number | null = null
  private isListDragged: boolean = false
  private draggedListIndex: number = NaN
  private targetListIndex: number = NaN

  get groupedData() {
    return groupBy(this.clonedData, 'listId')
  }

  get clonedDataIndexes() {
    return invert(this.clonedData.map(({ id }: any) => id))
  }

  @Watch('data', { immediate: true })
  public onDataChanged(value: any) {
    this.clonedData = cloneDeep(value)
  }
  @Watch('lists', { immediate: true })
  public onListsChanged(value: any) {
    // TODO: lists should have isDraggable field
    this.listGroups = uniq(value.map(({ group }: any) => group))
      // TODO: to del, only for tests
      .map((list: any) => {
        return {
          name: list,
          isDraggable: list !== 'undraggable'
        }
      })
  }

  public updateSorting(item: any, position: number, idNewPosition: number) {
    const index = Number(this.clonedDataIndexes[item.id])
    const elementNewPosition = Number(this.clonedDataIndexes[idNewPosition])
    this.clonedData[index] = item
    this.clonedData.splice(
      elementNewPosition,
      0,
      this.clonedData.splice(index, 1)[0]
    )
  }

  private dragStart(e: any, index: number) {
    // drag and drop will be available only if item contains node with this class
    const selector = e.target.querySelector('.list-group-dragbox')
    if (selector) {
      e.dataTransfer.setData('application/node type', this)
      this.isListDragged = true
      this.draggedListIndex = index
    } else {
      e.preventDefault()
    }
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
  private moveList(targetElIndex: number) {
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
  font-size: 0.8rem;
  text-transform: uppercase;
  font-weight: bold;
  color: #707070;
  text-align: center;
}
.list__group-subtitle {
  width: 40px;
  padding: 0.5rem;
  border-right: 1px solid #f6f6f6;
  background: #f0fbfc;
  flex: none;
  text-transform: uppercase;
  color: #85868a;
  font-weight: bold;
}

.list__group-subtitle > div {
  float: left;
}

.list__group-subtitle div {
  writing-mode: vertical-rl;
  text-align: center;
}
</style>
