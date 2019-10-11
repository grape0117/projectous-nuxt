<template>
  <div class="tasks">
    <VueDragable
      class="tasks-list"
      v-for="(list, index) in AllLists"
      :key="index"
      :value="list"
      @input="updateList(list)"
      v-model="list.tasks"
      group="tasks"
      @start="drag=true" @end="drag=false"
    >
      <div
        v-for="(element, index) in list.tasks"
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
import { ITask, IList } from '@/store/modules/lists/types'
// @ts-ignore
import VueDragable from '@/../node_modules/vuedraggable'

const Lists = namespace('lists')

// @ts-ignore
@Component({ components: { VueDragable }})
export default class Dragable extends Vue {
  @Lists.Action private fetchTasks!: any
  @Lists.Mutation('tasks/SET_TASKS_TO_LIST') public setTaskToList!: any
  @Lists.State(state => state.lists) private lists!: IList[]
  @Lists.State(state => state.lists.find((list: IList) => list.name === 'tasks').tasks) private tasks!: ITask
  @Lists.State(state => state.lists.find((list: IList) => list.name === 'additionalTasks').tasks) private additionalTasks!: ITask

  get AllLists() {
    return this.lists
  }

  updateList(value: any) {
    this.setTaskToList({listName: value.name, tasks: value.tasks})
  }
  
  private async created() {
    await this.fetchTasks()

    setInterval(() => {
      this.setTaskToList({ listName: 'tasks', tasks: [...this.AllLists[0].tasks, {id: 2091, title: "NEW TASK NEW TASK"}] })
    }, 1000)
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
