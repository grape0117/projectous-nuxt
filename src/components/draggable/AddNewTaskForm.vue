<template>
  <div class="form-add-task" @mouseleave="resetHandler">
    <input
      v-if="isCreating"
      v-model="nameOfNewTask"
      ref="newTask"
      type="text"
      @keydown.enter="addNewTaskHandler"
      @keydown.esc="resetHandler"
    />
    <span v-else @click="isCreating = true">+</span>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

const Lists = namespace('lists')

@Component
export default class TaskItem extends Vue {
  @Prop({ required: true }) protected listTitle!: string
  @Prop({ required: true }) protected indexTask!: number
  @Lists.Mutation('lists/ADD_NEW_TASK') private addNewTask!: any

  private isCreating: boolean = false
  private nameOfNewTask: string = ''

  @Watch('isCreating')
  private isCreatingChanged(value: any) {
    if (value) {
      // @ts-ignore
      this.$nextTick(() => this.$refs.newTask.focus())
    }
  }

  private resetHandler() {
    this.isCreating = false
    this.nameOfNewTask = ''
  }

  private addNewTaskHandler() {
    if (!this.nameOfNewTask) return
    this.addNewTask({
      listName: this.listTitle,
      index: this.indexTask,
      taskName: this.nameOfNewTask
    })
    this.resetHandler()
  }
}
</script>

<style>
.form-add-task {
  height: 5px;
  border: 1px solid black;
}

.form-add-task:hover {
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.form-add-task > span {
  display: none;
}

.form-add-task:hover > span {
  display: inline;
  cursor: pointer;
}
</style>
