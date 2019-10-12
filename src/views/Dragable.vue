<template>
  <VueDragable
    class="lists"
    v-model="allLists"
    group="lists"
    @start="drag=true" @end="drag=false"
  >
    <div
      v-for="(list, index) in allLists"
      :key="index"
      class="tasks-list-main"
    >
      <h3>{{ list.name }}</h3>
      <VueDragable
        class="tasks-list"
        :value="list"
        v-model="list.tasks"
      group="tasks"
      @input="updateList(list)"
      @start="drag=true"
      @end="drag=false"
    >
      <div
        v-for="({ id }) in list.tasks"
          :key="id"
          class="tasks-list__item"
        >
          <p>{{ id }}</p>
        </div>
      </VueDragable>
    </div>
    <div class="form-add-new-list">
      <input type="text" v-model="nameNewList" />
      <button @click="addNewListHandler">Add</button>
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
  @Lists.Mutation('lists/ADD_NEW_LIST') private addNewList!: any
  @Lists.State(state => state.lists) private lists!: IList[]
  @Lists.State(state => state.lists.find((list: IList) =>
    list.name === 'tasks').tasks) private tasks!: ITask
  @Lists.State(state => state.lists.find((list: IList) =>
    list.name === 'additionalTasks').tasks) private additionalTasks!: ITask

  private nameNewList: string = ''

  set allLists(value: any) {
    this.setLists(value)
  }

  get allLists() {
    return this.lists
  }

  private addNewListHandler() {
    if (!this.nameNewList) return
    if (this.allLists.some((list: IList) => list.name === this.nameNewList)) return
    this.addNewList(this.nameNewList)
    this.nameNewList = ''
  }

  private updateList(value: any) {
    this.setTaskToList({listName: value.name, tasks: value.tasks})
  }

  private async created() {
    await this.fetchTasks()

    setInterval(() => {
      const tasksList = this.allLists.find((list: IList) => list.name === 'tasks')
      const oldTasks = tasksList ? tasksList.tasks : []
      const getRandomArbitrary = (min: number, max: number): number => Math.ceil(Math.random() * (max - min) + min)

      this.setTaskToList({
        listName: 'tasks',
        tasks: [{id: getRandomArbitrary(1000, 999999), title: 'NEW TASK NEW TASK'}, ...oldTasks]
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

.form-add-new-list {
  padding: 30px;
  margin-top: 40px;
}
</style>
