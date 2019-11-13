<template>
  <div class="form-add-task" @mouseleave="resetHandler">
    <input
      v-if="isCreating"
      v-model="nameOfNewTask"
      ref="newTask"
      type="text"
      @keyup.enter="addNewTaskHandler"
      @keyup.esc="resetHandler"
    />
    <span
      v-else
      @click="
        $emit('setIsCreating', `${listIndex}_${taskIndex ? taskIndex - 1 : 0}`)
      "
      >+</span
    >
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { ITask } from '@/store/modules/tasks/types'

const Tasks = namespace('tasks')
const TaskUsers = namespace('task_users')

@Component
export default class AddNewTaskForm extends Vue {
  @Prop({ required: true }) protected listIndex!: string
  @Prop({ required: true }) protected taskIndex!: number
  @Prop({ required: true }) protected userId!: number | null
  @Prop({ required: true }) protected isCreating!: boolean
  @Tasks.Action private addNewTask!: any
  @TaskUsers.Mutation('task_users/ADD_TASK_USER_TO_LIST')
  private addUserTask!: any

  private nameOfNewTask: string = ''

  @Watch('isCreating')
  private isCreatingChanged(value: any) {
    if (value) {
      // @ts-ignore
      this.$nextTick(() => this.$refs.newTask.focus())
    }
  }

  private resetHandler() {
    if (this.isCreating) {
      this.$emit('setIsCreating', null)
      this.nameOfNewTask = ''
    }
  }

  private addNewTaskHandler() {
    if (!this.nameOfNewTask) return
    const getRandomArbitrary = (min: number, max: number): number =>
      Math.ceil(Math.random() * (max - min) + min)
    const id = getRandomArbitrary(1000, 999999).toString()
    const task: ITask = {
      id,
      title: this.nameOfNewTask,
      company_user_id: this.userId
    }
    this.addUserTask({
      listIndex: this.listIndex,
      taskIndex: this.taskIndex,
      task
    })
    this.resetHandler()
  }
}
</script>

<style>
.form-add-task {
  width: 15px;
  height: 15px;
  border: 1px solid black;
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
</style>
