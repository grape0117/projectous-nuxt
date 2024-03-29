<template>
  <div class="lists">
    <div v-for="(list, index) in lists" :key="index" class="tasks-list-main">
      <div class="list-title-block">
        <h3>{{ list.name }}</h3>
      </div>
      <div
        v-if="tasks[index] && tasks[index].length > shorthandedListItems"
        class="lists__toggle"
        @click.prevent="setExpandedList(list.name)"
      >
        &#9652;
      </div>
      <VueDraggable
        v-model="tasks[index]"
        class="tasks-list"
        group="tasks"
        @change="extractTask($event, index)"
      >
        <div
          v-for="(task, i) in expandedList === list.name
            ? tasks[index]
            : tasks[index]
            ? tasks[index].slice(0, shorthandedListItems)
            : []"
          :key="task.name"
          class="tasks-list__item"
        >
          <TaskItem
            :task="task"
            :list-index="index"
            :task-index="i"
            @openNewTaskInput="isCreating = `${index}_${i}`"
          />
          <AddNewTaskForm
            :list-index="index"
            :task-index="i + 1"
            :user-id="selectedCompanyUserId ? selectedCompanyUserId : null"
            :is-creating="isCreating === `${index}_${i}`"
            @setIsCreating="isCreating = $event"
            class="tasks-list__add"
          />
        </div>
      </VueDraggable>
      <AddNewTaskForm
        v-if="tasks[index] && !tasks[index].length"
        :list-index="index"
        :task-index="0"
        :user-id="selectedCompanyUserId ? selectedCompanyUserId : null"
        :is-creating="isCreating === `${index}_${0}`"
        @setIsCreating="isCreating = $event"
      />
    </div>
    <div class="form-add-new-list">
      <input type="text" v-model="nameNewList" />
      <button @click="addNewListHandler">Add</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Prop, Component, Vue, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { IList } from '@/store/modules/lists/types'
// @ts-ignore
import VueDraggable from '@/../node_modules/vuedraggable'
import TaskItem from '@/components/draggable/TaskItem.vue'
import AddNewTaskForm from '@/components/draggable/AddNewTaskForm.vue'
import { ITaskUser } from '@/store/modules/task_users/types'

const Lists = namespace('lists')
const TaskUsers = namespace('task_users')

@Component({
  components: {
    VueDraggable,
    TaskItem,
    AddNewTaskForm
  }
})
export default class Draggable extends Vue {
  @Prop({ required: false }) public selectedCompanyUserId: any
  @Lists.Action private fetchTasks!: any
  @Lists.Mutation('lists/ADD_NEW_LIST') private addNewList!: any
  @Lists.State(state => state.lists) private lists!: IList[]
  @TaskUsers.State(state => state['tasks_by_user'])
  private tasks!: ITaskUser[][]
  @TaskUsers.Action private createTaskUsersList!: any
  @TaskUsers.Mutation('task_users/UPDATE_TASK_USER_BY_LIST')
  private updateTasksUserList!: any

  private nameNewList: string = ''
  private expandedList: string = ''
  private shorthandedListItems: number = 3
  private isCreating: string | null = null

  private async created() {
    await this.fetchTasks()
  }

  @Watch('selectedCompanyUserId')
  private onSelectedUserChanged(value: any) {
    if (value) {
      this.createTaskUsersList(value)
    }
  }

  private extractTask(event: any, listIndex: number): void {
    // Todo: add updateTask method
    // this.updateTasksUserList({ event, listIndex })
  }

  private setExpandedList(listName: string) {
    this.expandedList = this.expandedList ? '' : listName
  }

  private addNewListHandler() {
    if (!this.nameNewList) return
    if (this.lists.some((list: IList) => list.title === this.nameNewList)) {
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
  width: 20px;
  height: 20px;
  border: solid 1px black;
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
}

.tasks-list {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 200px;
  padding: 30px;
  margin: 10px;
  border: 1px solid gray;
}

.tasks-list__list {
  margin: 0;
  padding-left: 18px;
}

.tasks-list__item {
  width: 100%;
  position: relative;
  font-size: 0.9rem;
}

.tasks-list__item::before {
  content: '●';
  position: absolute;
  left: -0.9rem;
  top: 0.3rem;
  font-size: 0.5rem;
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

.tasks-list__add {
  opacity: 0;
}

.tasks-list__item:hover .tasks-list__add {
  opacity: 1;
}

.tasks-list-main {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: stretch;
}

.form-add-new-list {
  padding: 30px;
  margin-top: 40px;
}
</style>
