<template>
  <div>
    <span v-if="!editable" @click="editable = true">{{ task.title }}</span>
    <input
      v-else
      v-model="task.title"
      @blur="editable = false"
      @keyup.enter="update"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { ITask } from '@/store/modules/tasks/types'
import { namespace } from 'vuex-class'

const Task = namespace('tasks')

@Component
export default class TaskItem extends Vue {
  @Prop({ required: true }) private task!: ITask
  private editable: boolean = false
  private original: string = this.task.title
  @Task.Action private updateTask!: any

  private editTask() {
    this.editable = false
  }

  private update() {
    this.editable = false
    this.updateTask(this.task)
  }
}
</script>
