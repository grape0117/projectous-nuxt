<template>
  <div v-if="taskId" class="task-details__wrapper">
    <b-container fluid>
      <b-row>
        <b-col>Details</b-col>
        <b-col>Chat</b-col>
        <b-col>Files</b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

const Tasks = namespace('tasks')

@Component
export default class TaskDetails extends Vue {
  @Prop({ required: true }) private taskId!: number | string | null
  @Tasks.Getter('getById') private getTaskById!: any

  get taskData() {
    return this.taskId ? this.getTaskById(this.taskId) : {}
  }
}
</script>

<style>
.task-details__wrapper {
  position: fixed;
  bottom: 0;
  left: 15px;
  width: calc(100vw - 30px);
  height: 100px;
  background-color: #fff;
  border: 1px solid #333;
}
</style>
