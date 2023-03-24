<template>
  <b-modal ref="new-thread-modal" id="new-thread-modal" class="modal fade" role="dialog" @ok="saveThread" ok-variant="light" ok-title="Save" @shown="updateButtonStyle()">
    <template #modal-title>
      <h5 class="white-text">New Thread</h5>
    </template>
    <slot name="content">
      <div class="form-group col-sm-12">
        <label class="control-label white-text" for="thread-title">Thread title: </label>
        <input id="thread-title" ref="thread_title" class="form-control" type="text" name="title" placeholder="Thread Title" v-model="thread_title" v-on:keyup.enter="saveThread" />
      </div>
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
      if (this.thread_title == '') {
        this.makeToast('danger', 'Title is required!')
        return
      }
      let thread = await this.$store.dispatch('threads/createThread', {
        task_id: this.task_id,
        title: this.thread_title,
        user: me
      })
      this.$store.dispatch('tasks/updateChats')
      $('.close').click()
    },
    updateButtonStyle: function() {
      this.thread_title = ''
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
      this.$nextTick(() => {
        this.$refs.thread_title.focus()
      })
    },
    makeToast(variant = null, content = '') {
      this.$bvToast.toast(content, {
        title: `${variant === 'success' ? 'Success' : 'Error'}`,
        variant: variant,
        solid: true
      })
    }
  }
}
</script>

<style>
.modal-header {
  margin: inherit;
}
</style>
