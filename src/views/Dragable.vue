<template>
  <div class="tasks">
    <VueDragable
      class="tasks-list"
      v-model="tasksList"
      group="tasks"
      @start="drag=true" @end="drag=false"
    >
      <div
        v-for="(element, index) in tasksList"
        :key="index"
        class="tasks-list__item"
      >
        {{element.title}}
      </div>
    </VueDragable>
    <VueDragable
      class="tasks-list"
      v-model="additionalTasksList"
      group="tasks"
      @start="drag=true" @end="drag=false"
    >
      <div
        v-for="(element, index) in additionalTasksList"
        :key="index"
        class="tasks-list__item"
      >
        {{element.title}}
      </div>
    </VueDragable>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { ITask } from '@/store/modules/tasks/types'
// @ts-ignore
import VueDragable from '@/../node_modules/vuedraggable'

const Tasks = namespace('tasks')

// @ts-ignore
@Component({ components: { VueDragable }})
export default class Dragable extends Vue {

  get tasksList() {
    return this.tasks
  }

  set tasksList(value) {
    this.setTasks(value)
  }

  get additionalTasksList() {
    return this.additionalTasks
  }

  set additionalTasksList(value) {
    this.setAdditionalTasks(value)
  }
  @Tasks.Mutation('tasks/SET_TASKS') public setTasks!: any
  @Tasks.Mutation('tasks/SET_ADDITIONAL_TASKS') public setAdditionalTasks!: any
  @Tasks.Action private fetchTasks!: any
  @Tasks.State(state => state.tasks) private tasks!: ITask
  @Tasks.State(state => state.additionalTasks) private additionalTasks!: ITask

  private async created() {
    await this.fetchTasks()
  }
}
</script>

<style>
.tasks {
  display: flex;
}
.tasks-list {
  width: 50%;
}
.tasks-list__item {
  border: 1px solid black;
}
</style>
