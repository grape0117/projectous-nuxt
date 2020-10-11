<template>
  <div class="list__wrapper" :class="{ 'horizontal-alignment': !verticalAlignment }">
    <div v-for="(group, index) in listGroups" :key="index" class="list" draggable="true" @dragstart.self="dragStart($event, index)" @dragend.self="dragEnd" @dragenter="moveList(index)">
      <div v-if="!verticalAlignment" class="list__group-title">
        {{ group.name }}
      </div>
      <div class="list__group" :class="title.replace(/[^a-zA-Z0-9]/, '-')" :style="{ height: !verticalAlignment ? 'calc(100vh - 140px)' : '' }" v-for="{ id, title, initiallyExpanded } in lists.filter(list => list.group === group.name)" :key="id">
        <div
          :class="'list__group-subtitle-title' + title.replace(/[^a-zA-Z0-9]/, '-')"
          :style="{
            // background: isListDragged && targetListIndex === index ? '#333333' : 'initial'
          }"
          v-if="verticalAlignment"
        >
          <div v-if="group.isDraggable" class="dragzone__item-dragbox dragzone__item-dragbox--active list-group-dragbox"><span /> <span /> <span /></div>
          <div class="list__group-subtitle-title">{{ title }}</div>
        </div>
        <div></div>
        <pj-dragzone :id="id" :tasks="groupedDataWithProjects(id)" :isListDragged="isListDragged" :draggedItemId="draggedItemId" :group="group" :selectedCompanyUserId="selectedCompanyUserId" :initiallyExpanded="initiallyExpanded" @delete="$emit('delete', $event)" @taskTimerToggled="$emit('taskTimerToggled', $event)" @updateDataIndexes="updateDataIndexes" @setDraggedItemId="draggedItemId = $event" @updateSortOrders="$emit('updateSortOrders', $event)" @setCurrentListsBlockName="$emit('setCurrentListsBlockName', $event)" />
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
  @Prop({ required: false, default: null }) public selectedCompanyUserId!: number | null

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

  /**
   * Splices in item in place of dropped item
   *
   * @param item item that is being dragged
   * @param {number} dropped_id item_id that is being replaced
   */
  public updateDataIndexes(item: any, dropped_id: number) {
    //Update item TODO: not sure this is necessary since all data reloads
    const itemIndex = Number(this.clonedDataIndexes[item.id])
    this.clonedData[itemIndex] = item

    const droppedIndex = Number(this.clonedDataIndexes[dropped_id])
    this.clonedData.splice(droppedIndex, 0, this.clonedData.splice(itemIndex, 1)[0])
  }

  private dragStart(e: any, index: number) {
    // drag and drop will be available only if item contains node with this class
    const selector = e.target.querySelector('.list-group-dragbox')
    if (selector) {
      e.dataTransfer.setData('application/node type', this) //@Mikhail, what is this for?
      this.isListDragged = true
      this.draggedListIndex = index
    } else {
      e.preventDefault()
    }
  }
  private dragEnd() {
    if (this.targetListIndex === this.draggedListIndex) {
      this.draggedListIndex = NaN
      this.isListDragged = false
      return
    }

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

    //@Mikhail: not sure what this TODO means
    // TODO: bug if change position here because of different height
  }

  private groupedDataWithProjects(id: string) {
    let tasks = this.groupedData[id]
    let projects = this.$store.state.projects.projects

    console.log(tasks)

    if (tasks) {
      tasks.map(task => {
        console.log(task.id)
      })
    }

    if (tasks) {
      tasks.forEach(task => {
        let project = projects.find(({ id: projectId }: any) => projectId === task.project_id)
        task['project'] = project ? project : []

        return task
      })
    }

    return tasks
  }
}
</script>

<style>
.list {
  width: 100%;
  max-width: 300px;
  cursor: pointer;
  text-transform: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.list__wrapper.horizontal-alignment {
  display: flex;
  /* justify-content: center; */
  /* border: 5px solid red; */
}
.list__wrapper.horizontal-alignment .dragzone {
  width: 100%;
}
.list__group {
  max-width: 280px;
  overflow-y: scroll;
  width: 100%;
  padding: 0 10px;
  display: flex;
  margin-bottom: 10px;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  -webkit-box-shadow: 0px 0px 16px -7px rgba(0, 0, 0, 0.75);
  -moz-box-shadow: 0px 0px 16px -7px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 0px 16px -7px rgba(0, 0, 0, 0.75);
}
.list__group:first-child {
  margin-top: 15px;
}
.dragzone__content {
  padding-bottom: 10px;
}
.list__group-title {
  font-size: 0.8rem;
  text-transform: uppercase;
  font-weight: bold;
  color: white;
  text-align: center;
}
.list__group-subtitle-title {
  width: 40px;
  padding: 0.5rem;
  padding-left: 5px;
  /*border-right: 1px solid #f6f6f6;*/
  /*background: #f0fbfc;*/
  flex: none;
  text-transform: uppercase;
  color: #85868a;
  font-weight: bold;
  font-size: 14px;
}
.list__group-subtitle-title,
.list__group-subtitle.Today {
  /* background-color: rgb(101 45 101); */
  color: white;
  /* border-left: solid 8px #993399; */
}
.dragzone,
.Today .dragzone {
  /* background-color: #99339938; */
  /* background-color: rgba(255, 255, 255, 0.2); */
}
.list__group-subtitle.Today .dragzone__item-dragbox--active span {
  color: #a9a6a6;
}

.list__group-subtitle-title {
  white-space: nowrap;
  float: left;
  writing-mode: vertical-rl;
}
</style>
