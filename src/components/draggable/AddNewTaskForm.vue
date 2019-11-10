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
    <span v-else class="form-add-task__creating" @click="isCreating = true"
      >+</span
    >
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

const Lists = namespace('lists')

@Component
export default class AddNewTaskForm extends Vue {
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
  width: 100%;
  line-height: normal;
}

.form-add-task__creating {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 17px;
  height: 17px;
  margin-left: auto;
  border: 1px solid black;
}

.form-add-task__creating:hover {
  cursor: pointer;
}
</style>
