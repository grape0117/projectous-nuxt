<template>
  <div class="task-item">
    <p class="task-item__text" v-if="!editable" @click="editable = true">
      {{ task.title }}
    </p>
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

<style scoped>
.task-item__text {
  margin: 0;
  line-height: normal;
}
</style>
