<template>
  <div>
    <h6>Add new list</h6>
    <input v-model="title" type="text" @keyup.prevent.enter="createNewList" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { generateUniqId } from '@/utils/util-functions'

const Lists = namespace('lists')

@Component
export default class NewListForm extends Vue {
  @Prop({ required: true }) public userId!: number
  private title: string = ''
  private createNewList() {
    const list = {
      group: 'User Lists',
      id: generateUniqId(10),
      title: this.title,
      userId: this.userId
    }
    this.$store.dispatch('ADD_ONE', { module: 'lists', entity: list })
    this.title = ''
  }
}
</script>
