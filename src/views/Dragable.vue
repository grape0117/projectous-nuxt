<template>
  <div class="tasks">
    <VueDragable
      tag="ul"
      handle=".handle"
      class="tasks-list"
      v-for="(list, index) in AllLists"
      :key="index"
      :value="list"
      v-model="list.tasks"
      group="tasks"
      @input="updateList(list)"
      @start="drag=true"
      @end="drag=false"
    >
      <li
          class="list-group-item tasks-list__item"
          v-for="(element, index) in list.tasks"
          :key="index"
      >
        <i class="fa fa-align-justify handle"></i>

        <span class="text"> </span> {{ index }}

        <input type="text" class="form-control" v-model="element.title" />
        <content-editable @createTaskFromEnter="createTaskFromEnter" v-bind:index="index" v-bind:next_work_day="element.next_work_day" v-bind:task="getTask(element.task_id)"></content-editable>
        <i class="fa fa-times close" @click="removeAt(index)"></i> {{ getProjectFromTaskId(element.task_id) }}
      </li>
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
  @Lists.Mutation('tasks/SET_TASKS_TO_LIST') private setTaskToList!: any
  @Lists.State(state => state.lists) private lists!: IList[]
  @Lists.State(state => state.lists.find((list: IList) =>
    list.name === 'tasks').tasks) private tasks!: ITask
  @Lists.State(state => state.lists.find((list: IList) =>
    list.name === 'additionalTasks').tasks) private additionalTasks!: ITask

  get AllLists() {
    return this.lists
  }

    public getTask(task_id: any): object {
        return this.$store.getters['tasks/getTaskById'](task_id)
    }

  private updateList(value: any) {
    this.setTaskToList({listName: value.name, tasks: value.tasks})
  }



  private async created() {
    await this.fetchTasks()

    setInterval(() => {
      this.setTaskToList({
        listName: 'tasks',
        tasks: [{id: 2091, title: 'NEW TASK NEW TASK'},
        ...this.AllLists[0].tasks]
      })
    }, 5000)
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
