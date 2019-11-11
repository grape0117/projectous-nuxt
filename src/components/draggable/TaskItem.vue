<template>
  <div>
    <span v-if="!editable" @click="openInput">{{ task.title }}</span>
    <input
      v-else
      ref="input"
      :value="task.title"
      @change="newTitle = $event.target.value"
      @blur="update"
      @keyup.enter="openNewTaskForm"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { ITask } from '@/store/modules/tasks/types'
import { namespace } from 'vuex-class'
import { cloneDeep } from 'lodash'
import { ITaskUser } from '@/store/modules/task_users/types'

const Task = namespace('tasks')
const TaskUsers = namespace('task_users')

@Component
export default class TaskItem extends Vue {
  @Prop({ required: true }) private task!: ITask
  @Prop({ required: true }) private listIndex!: number
  @Prop({ required: true }) private taskIndex!: number
  @Task.Action private updateTask!: any
  @TaskUsers.Mutation('task_users/UPDATE_TASK_USER_BY_LIST')
  updateUserTask!: any
  @TaskUsers.State(state => state['tasks_by_user'])
  private tasks!: ITaskUser[][]
  private editable: boolean = false
  private newTitle: string = ''

  private update() {
    this.editable = false
    // make update only if the title has changed
    if (this.newTitle && this.task.title !== this.newTitle) {
      const task: any = cloneDeep(this.task)
      task.title = this.newTitle
      this.updateTask(task)
      this.updateUserTask({
        task,
        listIndex: this.listIndex,
        taskIndex: this.taskIndex
      })
    }
  }
  private openInput() {
    this.editable = true
    this.$nextTick(() => {
      // @ts-ignore
      this.$refs.input.focus()
    })
  }
  private openNewTaskForm() {
    this.editable = false
    this.$emit('openNewTaskInput')
  }
}
</script>
