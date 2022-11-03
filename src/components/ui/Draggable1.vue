<template>

    <div class="flex justify-center draggable-container h-100">
      <div class="min-h-screen flex overflow-x-scroll py-12  d-flex h-100">
        <draggable
            :animation="200"
            class="d-flex"
            @start="isListDragging=true"
            @end="isListDragging=false"
            v-model="columns"
            >
            <div
              v-for="(column, index) in columns"
              :key="index"
              class="bg-gray-100 rounded-lg px-1 py-0 column-width rounded mr-2 task-step-list"
            >
              <div v-if="column.type!='new_list'" class="h-100">
                <div class="field title">
                  <p class="field-value" v-show="!showField(index)" @click="focusField(index)">{{column.title==''?"untitled":column.title}}</p>
                  <input v-model="columns[index].title" v-show="showField(index)" type="text" :id="'title-input'+index" class="field-value form-control" @focus="focusField(index)" v-on:keyup.enter="editField = 'empty';" @blur="blurField">
                </div>
      
                <draggable
                  :animation="200"
                  ghost-class="ghost-card"
                  group="tasks"
                  class="task-card-container px-2"
                  @start="isDragging=true" 
                  @end="isDragging=false"
                  v-model="columns[index].tasks"
                >

                  <task-card
                    v-for="task in column.tasks"
                    :key="task.id"
                    :task="task"
                    class="mb-2 cursor-move task-card-item"
                    @addTask="addTask(index)"
                    @cancelAdd="cancelAdd"
                  ></task-card>
                </draggable>
                <div class="field" v-show="newTaskIndex!==index">
                  <button class="add-task" @click="addTask(index)"><i class="icon-add"/>Add a Task</button>
                </div>
              </div>
              <div v-else>
                <button @click="addList">Add another list</button>
              </div>
            </div>
        </draggable>
      </div>
    </div>
</template>

<script>

// import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
// import { groupBy, cloneDeep, uniq, invert } from 'lodash'
// import { EventBus } from '@/components/event-bus'

import draggable from "vuedraggable";
import TaskCard from "./components/TaskCard.vue";
export default  {
  name: 'Draggable1',
  components: {
    TaskCard,
    draggable,
  },
  mounted() {
    this.scrollToElement();
  },
  data() {
    return {
      columns: [
        {
          title: "Backlog",
          tasks: [
            {
              id: 1,
              title: "Add discount code to checkout page",
              date: "Sep 14",
              type: "Feature Request",
            },
            {
              id: 2,
              title: "Provide documentation on integrations",
              date: "Sep 12",
            },
            {
              id: 3,
              title: "Design shopping cart dropdown",
              date: "Sep 9",
              type: "Design",
            },
            {
              id: 4,
              title: "Add discount code to checkout page",
              date: "Sep 14",
              type: "Feature Request",
            },
            {
              id: 5,
              title: "Test checkout flow",
              date: "Sep 15",
              type: "QA"
            },
          ],
        },
        {
          title: "In Progress",
          tasks: [
            {
              id: 6,
              title: "Design shopping cart dropdown",
              date: "Sep 9",
              type: "Design",
            },
            {
              id: 7,
              title: "Add discount code to checkout page",
              date: "Sep 14",
              type: "Feature Request",
            },
            {
              id: 8,
              title: "Provide documentation on integrations",
              date: "Sep 12",
              type: "Backend",
            },
          ],
        },
        {
          title: "Review",
          tasks: [
            {
              id: 9,
              title: "Provide documentation on integrations",
              date: "Sep 12",
            },
            {
              id: 10,
              title: "Design shopping cart dropdown",
              date: "Sep 9",
              type: "Design",
            },
            {
              id: 11,
              title: "Add discount code to checkout page",
              date: "Sep 14",
              type: "Feature Request",
            },
            {
              id: 12,
              title: "Design shopping cart dropdown",
              date: "Sep 9",
              type: "Design",
            },
            {
              id: 13,
              title: "Add discount code to checkout page",
              date: "Sep 14",
              type: "Feature Request",
            },
          ],
        },
        {
          title: "Done",
          tasks: [
            {
              id: 14,
              title: "Add discount code to checkout page",
              date: "Sep 14",
              type: "Feature Request",
            },
            {
              id: 15,
              title: "Design shopping cart dropdown",
              date: "Sep 9",
              type: "Design",
            },
            {
              id: 16,
              title: "Add discount code to checkout page",
              date: "Sep 14",
              type: "Feature Request",
            },
          ],
        },
        {
          title: "New list",
          type: "new_list",
          tasks: []
        }

      ],
      isDragging: false,
      isListDragging: false,
      delayedDragging: false,
      delayedListDragging: false,
      editField : 'empty',
      newTaskIndex: null
    };
  },
  watch: {
    isDragging(newValue) {
      if (newValue) {
        this.delayedDragging = true;
        return;
      }
      this.$nextTick(() => {
        this.delayedDragging = false;
        console.log(this.columns);

      });
    },
    isListDragging(newValue) {
      if (newValue) {
        this.delayedListDragging = true;
        return;
      }
      this.$nextTick(() => {
        this.delayedListDragging = false;
        console.log("list dragging")
        console.log(this.columns);

      });
    }
  },
  methods : {
    addList() {
      const number_of_lists = this.columns.length
      this.columns[number_of_lists-1].type = ''
      this.columns.push({
          title: "New list",
          type: "new_list",
          tasks: []
      })
    },
    scrollToElement() {
      const el = this.$refs.scrollToMe;
      if (el) {
        el.scrollIntoView({behavior: 'smooth'});
      }
    },
    focusField(index){
      this.editField = index;
      setTimeout(() => {
        document.getElementById(`title-input${index}`).focus();
      }, 100);
    },
    blurField(){
      this.editField = 'empty'
    },
    showField(index){
      return this.editField == index
    },
    addTask(index){
      if (this.newTaskIndex!==null) {
        this.columns[this.newTaskIndex].tasks = this.columns[this.newTaskIndex].tasks.filter(function(task) {
          return task.type!=='new'
        })
      }
      this.columns[index].tasks.push({              
        title: "",
        type: "new"
      })
      this.newTaskIndex = index
      setTimeout(() => {
        this.scrollToBottom(index)
        document.querySelector("#new-task input").focus()
      }, 10);
    },
    cancelAdd() {
      this.columns[this.newTaskIndex].tasks = this.columns[this.newTaskIndex].tasks.filter(function(task) {
        return task.type!=='new'
      })
      this.newTaskIndex = null
    },
    scrollToBottom(index) {
      const element = document.getElementsByClassName("task-card-container")[index];
      element.scrollTop = element.scrollHeight;
    }
  },

};
</script>

<style scoped>
.column-width {
  min-width: 320px;
  width: 320px;
}
/* Unfortunately @apply cannot be setup in codesandbox, 
but you'd use "@apply border opacity-50 border-blue-500 bg-gray-200" here */
.ghost-card {
  opacity: 0.0;
  background: #070707;
  border: 2px solid #0a0a0a;
}
.task-step-list {
  background-color: rgb(255 165 0);

}
.task-card-container {
  overflow-x: hidden;
  overflow-y: auto;
  max-height: calc(100% - 120px);
  background-color: rgb(235,236,240);
}
.task-card-container:first-child {
  padding-top: 10px;
}
.task-card-item:hover {
  cursor: pointer;
}
.field {
  background-color: rgb(235,236,240);
}
.field.title {
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  height: 48px;
  padding-top: 9px;
}
.field.button {
  border-bottom-left-radius: 3px;
  border-bottom-right-radius: 3px;
}
.field-value {
  padding: 4px 14px;
  margin-bottom: 0px;
}
input.field-value {
  width: 95%;
  padding: 4px;
  margin: 4px 9px;
  /* height: -webkit-fit-content; */
  height: -moz-fit-content;
  height: fit-content;
  margin-top: 0px;
}
.add-task {
  width: 295px;
  padding: 3px;
  margin: 5px 7px;
  border-radius: 5px;
  color: #5e6c84;
  border: none;
}

.add-task:hover {
  background-color: #091e4214;
  color: #23272e;
  /* font-weight: bold; */
}
.add-task:focus {
  outline:0;
}
/* width */
::-webkit-scrollbar {
  width: 7px;
}

/* Track */
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px rgb(218,219,226); 
  border-radius: 5px;
}
 
/* Handle */
::-webkit-scrollbar-thumb {
  background: rgb(191,196,206);
  border-radius: 10px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: rgb(191,196,206);
}
</style>

