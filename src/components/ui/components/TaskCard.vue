<template>
    <div class="bg-white shadow rounded px-3 pt-3 pb-2 border border-white" v-if="task.type!=='new'">
      <div class="flex justify-between">
        <p class="text-gray-700 font-semibold font-sans tracking-wide text-sm">{{task.title}}</p>
      </div>
      <div class="flex mt-4 justify-between items-center">
        <span class="text-sm text-gray-600">{{task.date}}</span>
        <badge v-if="task.type" :color="badgeColor">{{task.type}}</badge>
      </div>
    </div>
    <div class="bg-white shadow rounded px-3 pt-3 pb-2 border border-white" id="new-task" v-else>
      <div class="flex justify-between">
        <input type="text" name="new_task_title" placeholder="Enter a title for this task" v-model="new_task_title" v-on:keyup.enter="addTaskWithEnter" @input="changeTitle" v-on:blur="">
      </div>
      <button @click="addTask" class="btn-primary rounded">Add task</button> <i class="icon-close ml-2" @click="cancelAdd"></i>
    </div>
  </template>
  <script>
  import Badge from "./Badge.vue";
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
          Design: "purple",
          "Feature Request": "teal",
          Backend: "blue",
          QA: "green",
          default: "teal"
        };
        return mappings[this.task.type] || mappings.default;
      }
    },
    methods: {
      addTask() {
        if (!this.new_task_title) {
          return
        }
        console.log("add new task")
        this.task['title'] = this.new_task_title
        this.task['type'] = ""
        this.$emit('cancelAdd', '')
      },
      addTaskWithEnter() {
        if (!this.new_task_title) {
          return
        }
        console.log("add new task")
        this.task['title'] = this.new_task_title
        this.task['type'] = ""
        this.$emit('addTask', '')
      },
      cancelAdd() {
        this.$emit('cancelAdd', '')
      },
      changeTitle:_.debounce(function(e) {
        this.task['title'] = this.new_task_title
      },500),
    }
  };
  </script>
<style>
  #new-task input {
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
</style>
  