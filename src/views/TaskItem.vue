<template>
  <div>
    <p>{{task.title}}</p>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { ITask, IList } from '@/store/modules/lists/types'

const Lists = namespace('lists')

// @ts-ignore
@Component({
  props: {
    task: Object
  }
})
export default class TaskItem extends Vue {}
</script>