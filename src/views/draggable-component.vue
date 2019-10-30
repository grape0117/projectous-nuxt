<template>
  <draggable
    tag="ul"
    handle=".handle"
    class="list-group"
    :list="list"
    group="people"
    @change="log"
  >
    <li
      v-if="list.length"
      class="list-group-item"
      v-for="(element, index) in list"
      :key="element.id"
    >
      <i class="fa fa-align-justify handle"></i>

      <span class="text"> </span> {{ index }}

      <input type="text" class="form-control" v-model="element.title" />
      <content-editable
        @createTaskFromEnter="createTaskFromEnter"
        v-bind:index="index"
        v-bind:next_work_day="element.next_work_day"
        v-bind:task="getTask(element.task_id)"
      ></content-editable>
      <i class="fa fa-times close" @click="removeAt(index)"></i>
      {{ getProjectFromTaskId(element.task_id) }}
    </li>
  </draggable>
</template>

<script>
import draggable from '@/vuedraggable'
import contentEditable from './content-editable'
export default {
  props: ['list', 'attribute', 'attribute_value'],
  name: 'draggable-component',
  components: {
    draggable,
    contentEditable
  },
  data() {
    return {
      enabled: true,
      dragging: false,
      empty: []
    }
  },
  mounted: function() {
    console.log('list', this.list)
  },
  methods: {
    getProjectFromTaskId: function(task_id) {
      let task = this.$store.getters['tasks/getTaskById'](task_id)
      if (task.project_id) {
        return this.$store.getters['projects/getProjectById'](task.project_id)
          .acronym
      } else {
        return {}
      }
    },
    uuidv4: () => {
      return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        // @ts-ignore
        (
          c ^
          (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
        ).toString(16)
      )
    },
    createTaskFromEnter: function(payload) {
      let task = {
        uuid: this.uuidv4()
      }
      //commit task
      //commit task_user
      //dispatch both
      alert('create')
      this.list = [
        ...this.list.slice(0, payload.index + 1),
        { uuid: this.uuidv4(), task_uuid: task.uuid, title: 'new task' },
        ...this.list.slice(payload.index + 1)
      ]
    },
    getTask: function(task_id) {
      return this.$store.getters['tasks/getTaskById'](task_id)
    },
    checkMove: function(e) {
      window.console.log('Future index: ' + e.draggedContext.futureIndex)
    },
    add: function() {
      this.list.push({ name: 'Juan' })
    },
    replace: function() {
      this.list = [{ name: 'Edgard' }]
    },
    clone: function(el) {
      return {
        name: el.name + ' cloned'
      }
    },
    log: function(evt) {
      window.console.log(evt)
      if (evt.added) {
        console.log(this.attribute_value)
        this.$store.commit('tasks/updateUserTaskAttribute', {
          id: evt.added.element.id,
          attribute: this.attribute,
          value: this.attribute_value
        })
        this.$store.dispatch('tasks/addToUserList', {
          id: evt.added.element.id,
          sort_order: evt.added.newIndex,
          attribute: this.attribute,
          value: this.attribute_value
        })
      } else if (evt.removed) {
      } else if (evt.moved) {
        this.$store.dispatch('tasks/addToUserList', {
          id: evt.moved.element.id,
          sort_order: evt.moved.newIndex,
          attribute: this.attribute,
          value: this.attribute_value
        })
      }
    },
    removeAt(idx) {
      this.list.splice(idx, 1)
    }
  }
}
</script>

<style scoped>
.button {
  margin-top: 35px;
}
.handle {
  float: left;
  padding-top: 8px;
  padding-bottom: 8px;
}

.close {
  float: right;
  padding-top: 8px;
  padding-bottom: 8px;
}

input {
  display: inline-block;
  width: 50%;
}

.text {
  margin: 20px;
}
</style>
