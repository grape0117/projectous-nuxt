<template>
    <div class="form-add-task" v-on:mouseleave="resetHandler">
        <input v-if="isCreating" type="text" v-model="nameOfNewTask" v-on:keyup.enter="addNewTaskHandler" />
        <span v-else v-on:click="setIsCreating(true)">+</span>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { ITask, IList } from '@/store/modules/lists/types'

const Lists = namespace('lists')

// @ts-ignore
@Component({
  props: {
    listTitle: String,
    indexTask: Number
  }
})
export default class TaskItem extends Vue {
  @Lists.Mutation('lists/ADD_NEW_TASK') private addNewTask!: any

  private isCreating: boolean = false
  private nameOfNewTask: string = ''

  private setIsCreating(value) {
    this.isCreating = value
  }

  private resetHandler() {
    this.isCreating = false
    this.nameOfNewTask = ''
  }

  private addNewTaskHandler() {
    if (!this.nameOfNewTask) return;
    this.addNewTask({ listName: this.listTitle, index: this.indexTask, taskName: this.nameOfNewTask })

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
  display: none
}

.form-add-task:hover > span {
  display: inline;
  cursor: pointer;
}
</style>
