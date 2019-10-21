<template>
  <div class="lists">
    <div v-for="(list, index) in allLists" :key="index" class="tasks-list-main">
      <div class="list-title-block">
        <h3>{{ list.name.substring(0, 3).toUpperCase() }}</h3>
      </div>
      <VueDraggable
        class="tasks-list"
        :value="list"
        v-model="list.tasks"
        group="tasks"
        @change="extractTask"
      >
        <div
          v-for="(task, index) in list.tasks"
          :key="task.id"
          class="tasks-list__item"
        >
          <TaskItem :task="task" />
          <AddNewTaskForm :listTitle="list.name" :indexTask="index + 1" />
        </div>
      </VueDraggable>
    </div>
    <div class="form-add-new-list">
      <input type="text" v-model="nameNewList" />
      <button @click="addNewListHandler">Add</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { ITask, IList } from '@/store/modules/lists/types'
// @ts-ignore
import VueDraggable from '@/../node_modules/vuedraggable'
import TaskItem from '@/components/draggable/TaskItem.vue'
import AddNewTaskForm from '@/components/draggable/AddNewTaskForm.vue'

const Lists = namespace('lists')

@Component({
  components: {
    VueDraggable,
    TaskItem,
    AddNewTaskForm
  }
})
export default class Dragable extends Vue {
  @Lists.Action private fetchTasks!: any
  @Lists.Action private updateTask!: any
  @Lists.Mutation('lists/ADD_NEW_LIST') private addNewList!: any
  @Lists.State(state => state.lists) private lists!: IList[]
  @Lists.State(
    state => state.lists.find((list: IList) => list.name === 'tasks').tasks
  )
  private tasks!: ITask
  @Lists.State(
    state =>
      state.lists.find((list: IList) => list.name === 'additionalTasks').tasks
  )
  private additionalTasks!: ITask

  private nameNewList: string = ''

  get allLists() {
    return this.lists
  }

  private async created() {
    await this.fetchTasks()
    // setInterval(() => {
    //   const tasksList = this.allLists.find(
    //     (list: IList) => list.name === 'tasks'
    //   )
    //   const oldTasks = tasksList ? tasksList.tasks : []
    //   const getRandomArbitrary = (min: number, max: number): number =>
    //     Math.ceil(Math.random() * (max - min) + min)
    //   this.setTaskToList({
    //     listName: 'tasks',
    //     tasks: [
    //       { id: getRandomArbitrary(1000, 999999), title: 'NEW TASK NEW TASK' },
    //       ...oldTasks
    //     ]
    //   })
    // }, 5000)
  }

  private extractTask(events: any): void {
    if (events.removed) return
    const { added, moved } = events
    const event = added || moved
    const task: ITask = event.element
    task.sort_order = event.newIndex
    this.updateTask(task)
  }

  private addNewListHandler() {
    if (!this.nameNewList) return
    if (this.allLists.some((list: IList) => list.name === this.nameNewList)) {
      return
    }
    this.addNewList(this.nameNewList)
    this.nameNewList = ''
  }
}
</script>

<style>
.lists {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  width: 200px;
  padding: 30px;
  margin: 10px;
  border: 1px solid gray;
}

.tasks-list__item {
  border: 1px solid black;
}

.list-title-block {
  background-color: lightgray;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-left: 15px;
  padding-right: 15px;
  width: 50px;
}

.tasks-list__item > p {
  margin: 0px;
  word-break: break-all;
}

.tasks-list-main {
  display: flex;
  justify-content: center;
  align-items: stretch;
}

.form-add-new-list {
  padding: 30px;
  margin-top: 40px;
}
</style>
