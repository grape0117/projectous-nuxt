<template>
  <div>
    Dragable
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { ITask } from '@/store/modules/tasks/types'

const Tasks = namespace('tasks')

@Component
export default class Dragable extends Vue {
  @Tasks.Action private fetchTasks!: any
  @Tasks.State(state => state.tasks) private tasks!: ITask

  private async created() {
    await this.fetchTasks()
  }
}
</script>
