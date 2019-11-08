<template>
  <div class="lists">
    <div
      v-for="(list, index) in filteredLists"
      :key="index"
      class="tasks-list-main"
    >
      <div class="list-title-block">
        <h3>{{ list.name }}</h3>
      </div>
      <VueDraggable
        class="tasks-list"
        :value="list.tasks"
        group="tasks"
        @change="extractTask($event, list.name)"
      >
        <div
          v-for="(task, index) in expandedList === list.name
            ? list.tasks
            : list.tasks.slice(0, shorthandedListItems)"
          :key="task.name"
          class="tasks-list__item"
        >
          <TaskItem :task="task" />
          <AddNewTaskForm :listTitle="list.name" :indexTask="index + 1" />
        </div>
        <div class="lists__toggle" @click="setExpandedList(list.name)">
          ...
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
import { Prop, Component, Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { IList } from '@/store/modules/lists/types'

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
export default class Draggable extends Vue {
  @Prop({ required: false }) public selectedCompanyUser: any
  @Lists.Action private fetchTasks!: any
  @Lists.Action private updateList!: any
  @Lists.Action private moveTask!: any
  @Lists.Mutation('lists/ADD_NEW_LIST') private addNewList!: any
  @Lists.State(state => state.lists) private lists!: IList[]

  private nameNewList: string = ''
  private expandedList: string = ''
  private shorthandedListItems: number = 3

  private get filteredLists() {
    if (!this.selectedCompanyUser || !this.selectedCompanyUser.id)
      return this.lists
    return this.lists.map(({ id, name, tasks }) => ({
      id,
      name,
      tasks: tasks.filter(
        ({ company_user_id }) => company_user_id === this.selectedCompanyUser.id
      )
    }))
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

  private extractTask(event: any, listName: string): void {
    this.updateList({ event, listName })
    // const { added, moved, removed } = event
    // if (!removed) {
    // const { element, newIndex } = added || moved
    // Todo: add updateTask method
    // this.updateTask(element)
    // }
  }

  private setExpandedList(listName: string) {
    this.expandedList = this.expandedList ? '' : listName
  }

  private addNewListHandler() {
    if (!this.nameNewList) return
    if (this.lists.some((list: IList) => list.name === this.nameNewList)) {
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

.lists__toggle {
  border: solid 1px black;
  text-align: center;
  cursor: pointer;
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
  margin: 0;
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
