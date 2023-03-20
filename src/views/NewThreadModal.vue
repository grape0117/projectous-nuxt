<template>
  <b-modal ref="new-thread-modal" id="new-thread-modal" class="modal fade" role="dialog" @ok="saveThread" ok-variant="light" ok-title="Save" @shown="updateButtonStyle()">
    <template #modal-title>
      <h5 class="white-text">New Thread</h5>
    </template>
    <slot name="content">
      <form id="newThreadForm" class="form-horizontal row ml-1 mr-1">
        <input id="taskID" class="form-control" type="hidden" name="id" v-model="task_id" />
        <div class="form-group col-sm-12">
          <label class="control-label white-text" for="thread-title">Thread title: </label>
          <input id="thread-title" class="form-control" type="text" name="title" placeholder="Thread Title" v-model="thread_title" />
        </div>
      </form>
    </slot>
  </b-modal>
</template>

<script>
import EditProjectModalUser from './EditProjectModalUser.vue'
import Vue from 'vue'
import { applyTheme } from '@/utils/util-functions'

export default {
  name: 'new-thread-modal',
  components: {
    'edit-project-modal-user': EditProjectModalUser
  },
  props: {
    task_id: null
  },
  data: function() {
    return {
      thread_title: ''
    }
  },
  created() {
    this.updateButtonStyle()
  },
  computed: {
    users: function() {
      return this.$store.getters['company_users/getActive']
    },
    current_company_user() {
      const me = this.$store.getters['company_users/getMe']
      return me
    }
  },
  watch: {},
  methods: {
    applyTheme,
    async saveThread(callback) {
      let me = this.current_company_user
      let thread = this.$store.dispatch('threads/createThread', {
        task_id: this.task_id,
        title: this.thread_title,
        user: me
      })
    },
    updateButtonStyle: function() {
      const updated_style = this.applyTheme()
      this.buttonStyle = updated_style
      const header = document.querySelector('.modal-header')
      if (header) {
        header.style = updated_style
        const body = document.querySelector('.modal-body')
        body.style = updated_style
        const footer = document.querySelector('.modal-footer')
        footer.style = updated_style
      }
    }
  }
}
</script>

<style>
.modal-header {
  margin: inherit;
}
</style>
