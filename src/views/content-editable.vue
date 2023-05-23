<template>
  <div v-if="task" contenteditable="" v-html="task.title + index" @keydown.enter="createTaskFromEnter" @blur="processTitle"></div>
</template>
<script>
export default {
  props: ['task', 'index'],
  name: 'content-editable',
  computed: {
    projects: function() {
      return this.$store.getters['projects/openprojects']()
    }
  },
  methods: {
    processTitle: function(event) {
      alert('here')
      let new_title = event.target.innerHTML
      const regex = /^\s*[A-Z0-9-]+:\s+/
      let matches = regex.exec(new_title)
      alert('regex')
      if (matches) {
        let project = this.projects.find(proj => {
          return proj.acronym + ':' === matches[0]
        })
        new_title = new_title.replace(regex, '<span style="color: red;">$&</span>')
        //this.task.title = new_title;
        //return;

        this.$store.commit('tasks/updateTaskAttribute', {
          id: this.task.id,
          attribute: 'title',
          attribute_value: new_title
        })
        this.$store.commit('tasks/updateTaskAttribute', {
          id: this.task.id,
          attribute: 'project_id',
          attribute_value: new_title
        })
      }
    },
    createTaskFromEnter: function(event) {
      alert('enter')
      event.preventDefault()
      this.$emit('createTaskFromEnter', { index: this.index })
      //this.$store.dispatch('tasks/createTaskFromEnter', {from_id: task.id});
      //return false;
    }
  }
}
</script>
