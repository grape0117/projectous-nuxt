<template>
  <div :style="style()" v-on:blur="saveNote" contenteditable="true" v-html="task.note"></div>
</template>

<script>
export default {
  name: 'task-note',
  props: ['task'],
  methods: {
    style() {
      //if(this.task.note != ''){
      return 'min-height: 15px; background: #efefef; font-size: 11px; color: #666666;'
      //}
    },
    saveNote(event) {
      this.task.note = event.target.innerHTML
      this.$store.dispatch('tasks/saveNote', this.task)
    }
  }
}
</script>
