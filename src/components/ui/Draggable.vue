<template>
  <div>
    <pj-dragzone
      v-for="{ id } in lists"
      :key="id"
      :id="id"
      :options="groupedData[id]"
      @update="update"
      @save="$emit('update', $event)"
    />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { groupBy, cloneDeep } from 'lodash'
import move from 'array-move'

@Component
export default class Draggable extends Vue {
  @Prop({ required: true }) public data!: any
  @Prop({ required: true }) public lists!: any
  private clonedData: any = []
  get groupedData() {
    return groupBy(this.clonedData, 'listId')
  }
  @Watch('data', { immediate: true })
  public onDataChanged(value: any) {
    this.clonedData = cloneDeep(value)
  }
  public update(item: any, position: number) {
    const index = this.clonedData.findIndex(({ id }: any) => item.id === id)
    const firstElementInList = this.clonedData.findIndex(
      ({ listId }: any) => listId === item.listId
    )
    if (index === firstElementInList + position) return
    console.log(index, firstElementInList)
    const elementNewPosition = firstElementInList + position
    this.clonedData[index] = item
    this.clonedData = move(this.clonedData, index, elementNewPosition)
  }
}
</script>
