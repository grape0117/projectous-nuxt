<template>
  <div>
    <span v-if="!editable" @click="editable = true">{{ task.title }}</span>
    <input
      v-else
      :value="task.title"
      @input="onChange"
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
  private newTitle: string = ''
  @Task.Action private updateTask!: any

  private onChange(e) {
    this.newTitle = e.target.value
  }

  private update() {
    this.editable = false

    // make update only if the title has changed
    if (this.newTitle !== this.task.title) {
      this.task.title = this.newTitle
      this.updateTask(this.task)
    }
  }
}
</script>
