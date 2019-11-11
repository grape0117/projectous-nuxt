<template>
  <div>
    <span v-if="!editable" @click="editable = true">{{ task.title }}</span>
    <input v-else :value="task.title" @keyup.enter="editTask" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { ITask } from '@/store/modules/tasks/types'

@Component
export default class TaskItem extends Vue {
  @Prop({ required: true }) private task!: ITask
  private editable: boolean = false

  private editTask() {
    this.$emit('editTask', this.task)
    this.editable = false
  }
}
</script>
