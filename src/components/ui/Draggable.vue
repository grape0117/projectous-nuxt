<template>
  <div>
    <div v-for="group in listGroups" :key="group" class="list">
      <div class="list__group-title">{{ group }}</div>
      <div
        v-for="{ id, title } in lists.filter(list => list.group === group)"
        :key="id"
        class="list__group"
      >
        <div class="list__group-subtitle">{{ title }}</div>
        <pj-dragzone
          :id="id"
          :options="groupedData[id]"
          :draggedItemId="draggedItemId"
          @create="create($event, id)"
          @update="update"
          @save="$emit('update', $event)"
          @setDraggedItemId="draggedItemId = $event"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { groupBy, cloneDeep, uniq } from 'lodash'
import move from 'array-move'

@Component
export default class Draggable extends Vue {
  @Prop({ required: true }) public data!: any
  @Prop({ required: true }) public lists!: any
  private clonedData: any = []
  private draggedItemId: number | null = null
  get groupedData() {
    return groupBy(this.clonedData, 'listId')
  }
  get listGroups() {
    return uniq(this.lists.map(({ group }: any) => group))
  }
  @Watch('data', { immediate: true })
  public onDataChanged(value: any) {
    this.clonedData = cloneDeep(value)
  }
  public create(id: number, listId: number | string) {
    this.$emit('create', id, listId)
  }
  public update(item: any, position: number, idNewPosition: number) {
    const index = this.clonedData.findIndex(({ id }: any) => item.id === id)
    const elementNewPosition = this.clonedData.findIndex(
      ({ id }: any) => id === idNewPosition
    )
    this.clonedData[index] = item
    this.clonedData = move(this.clonedData, index, elementNewPosition)
  }
}
</script>
<style>
.list__group {
  padding-left: 1.5rem;
}
.list__group-title {
  font-weight: bold;
}
.list__group-subtitle {
  font-size: 0.8rem;
}
</style>
