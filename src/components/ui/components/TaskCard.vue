<template>
  <div class="bg-white shadow rounded px-3 pt-3 pb-2 border border-white card-content" v-if="task.type !== 'new'" ref="card_element">
    <div class="flex justify-between">
      <p class="text-gray-700 font-semibold font-sans tracking-wide text-sm">{{ task.title }}</p>
    </div>
    <div class="flex mt-4 justify-between items-center">
      <span class="text-sm text-gray-600">{{ task.date }}</span>
      <badge v-if="task.type" :color="badgeColor">{{ task.type }}</badge>
    </div>
    <a href="#none">
      <i class="icon-edit" @click="editTask"></i>
    </a>
  </div>
  <div class="bg-white shadow rounded px-3 pt-3 pb-2 border border-white" id="new-task" v-else>
    <div class="flex justify-between">
      <textarea type="text" name="new_task_title" placeholder="Enter a title for this task" v-model="new_task_title" v-on:keyup.enter="addTaskWithEnter" @input="changeTitle" v-on:blur=""></textarea>
    </div>
    <button @click="addTask" class="btn-primary rounded">Add task</button> <i class="icon-close ml-2" @click="cancelAdd"></i>
  </div>
</template>
<script>
import Badge from './Badge.vue'
export default {
  components: {
    Badge
  },
  data() {
    return {
      new_task_title: ''
    }
  },
  props: {
    task: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    badgeColor() {
      const mappings = {
        Design: 'purple',
        'Feature Request': 'teal',
        Backend: 'blue',
        QA: 'green',
        default: 'teal'
      }
      return mappings[this.task.type] || mappings.default
    }
  },
  methods: {
    addTask() {
      if (!this.new_task_title) {
        return
      }
      console.log('add new task')
      this.task['title'] = this.new_task_title
      this.task['type'] = ''
      this.$emit('cancelAdd', '')
    },
    addTaskWithEnter() {
      console.log('new task title', this.new_task_title)
      if (!this.new_task_title || this.new_task_title == '\n') {
        return
      }
      console.log('add new task')
      this.task['title'] = this.new_task_title
      this.task['type'] = ''
      this.$emit('addTask', '')
    },
    cancelAdd() {
      this.$emit('cancelAdd', '')
    },
    changeTitle: _.debounce(function(e) {
      this.task['title'] = this.new_task_title
    }, 500),
    editTask() {
      const left = this.$refs.card_element.getBoundingClientRect().left
      const top = this.$refs.card_element.getBoundingClientRect().top
      const height = this.$refs.card_element.getBoundingClientRect().height
      const width = this.$refs.card_element.getBoundingClientRect().width
      this.$emit('editTask', { top, left, height, width, task: this.task })
    }
  }
}
</script>
<style>
#new-task textarea {
  width: 100%;
  border: none;
  padding: 0px 0px 10px;
  margin-bottom: 10px;
}
.icon-close {
  font-size: 27px;
  color: gray;
}
.icon-close:hover {
  color: black;
}
.card-content {
  position: relative;
}
.card-content .icon-edit {
  position: absolute;
  top: 17px;
  right: 15px;
  padding: 5px;
  color: #565252;
  background-color: rgba(200, 200, 200, 0.7);
  border-radius: 50%;
  font-size: 20px;
  visibility: hidden;
}
.card-content:hover .icon-edit {
  visibility: visible;
}
</style>
