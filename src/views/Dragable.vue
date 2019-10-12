<template>
  <VueDragable
    class="lists"
    v-model="AllLists"
    group="lists"
    @start="drag=true" @end="drag=false"
  >
    <div 
      v-for="(list, index) in AllLists"
      :key="index"
      class="tasks-list-main"
    >
      <h3>{{ list.name }}</h3>
      <VueDragable
        class="tasks-list"
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
          <p>{{ element.title }}</p>
        </div>
      </VueDragable>
    </div>
  </VueDragable>
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
  @Lists.Mutation('lists/SET_TASKS_TO_LIST') private setTaskToList!: any
  @Lists.Mutation('lists/SET_LISTS') private setLists!: any
  @Lists.State(state => state.lists) private lists!: IList[]
  @Lists.State(state => state.lists.find((list: IList) =>
    list.name === 'tasks').tasks) private tasks!: ITask
  @Lists.State(state => state.lists.find((list: IList) =>
    list.name === 'additionalTasks').tasks) private additionalTasks!: ITask

  get AllLists() {
    return this.lists
  }

  set AllLists(value) {
    this.setLists(value)
  }

  private updateList(value: any) {
    this.setTaskToList({listName: value.name, tasks: value.tasks})
  }

  private async created() {
    await this.fetchTasks()

    setInterval(() => {
      const tasksList = this.AllLists.find((list) => list.name === 'tasks');
      const oldTasks = tasksList ? tasksList.tasks : [];

      this.setTaskToList({
        listName: 'tasks',
        tasks: [{id: 2091, title: 'NEW TASK NEW TASK'}, ...oldTasks]
      })
    }, 5000)
  }
}
</script>

<style>
.lists {
  display: flex;
}

.tasks-list {
  width: 200px;
  padding: 30px;
  margin: 10px;
  border: 1px solid gray;
}

.tasks-list__item {
  border: 1px solid black;
}

.tasks-list__item > p {
  margin: 0px;
  word-break: break-all;
}

.tasks-list-main {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
