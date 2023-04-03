<template>
  <b-modal ref="select-responsibility-modal" id="select-responsibility-modal" class="modal fade" role="dialog" @ok="close" ok-variant="light" ok-title="Save" @shown="updateButtonStyle()">
    <template #modal-title>
      <h5 class="white-text">
        Select responsibility of <strong>{{ thread.title }}</strong>
      </h5>
    </template>
    <slot name="content">
      <div class="form-group col-sm-12">
        <div v-for="user in task_users" v-if="thread" class="user-item mb-2">
          <div class="d-flex" @click="changeResponsibility(user)">
            <span v-if="getCompanyUserDetails(user.company_user_id)" :title="`${getCompanyUserDetails(user.company_user_id).fullname}`" :class="`${thread.responsibility_company_user_id == user.company_user_id ? 'responsibility' : ''} avatar mr-1 pointer ${user.status} ${user.step} ${user.notes ? 'notes' : ''}`" :style="{ 'background-color': getCompanyUserDetails(user.company_user_id).color, cursor: 'pointer', display: 'inline-flex' }">
              {{ abbrName(getCompanyUserDetails(user.company_user_id).name) }}
            </span>
            <p class="text-white m-0 mr-5">{{ getCompanyUserDetails(user.company_user_id).name }}</p>
          </div>
        </div>
      </div>
    </slot>
  </b-modal>
</template>

<script>
import EditProjectModalUser from './EditProjectModalUser.vue'
import Vue from 'vue'
import { applyTheme } from '@/utils/util-functions'
import { getCookie, abbrName } from '@/utils/util-functions'

export default {
  name: 'select-responsibility-modal',
  components: {
    'edit-project-modal-user': EditProjectModalUser
  },
  props: {
    task_id: null,
    thread: null
  },
  data: function() {
    return {
      thread_title: ''
    }
  },
  computed: {
    current_company_user() {
      const me = this.$store.getters['company_users/getMe']
      return me
    },
    task_users: {
      get: function() {
        return this.$store.getters['task_users/getByTaskId'](this.task_id)
        // return this.$store.getters['task_users/getByTaskId'](this.task.id).filter(task_user => task_user.role != 'owner')
      },
      set: function(newValue) {}
    }
  },
  watch: {},
  methods: {
    abbrName,
    getCompanyUserDetails(company_user_id) {
      const user_details = this.$store.state.company_users.company_users.find(e => e.id === company_user_id)

      return user_details
    },
    applyTheme,
    async changeResponsibility(user) {
      let me = this.current_company_user
      const { task_thread } = await this.$store.dispatch('threads/changeResponsibility', {
        company_user_id: user.company_user_id,
        thread_id: this.thread.id,
        user: me
      })

      $('.close').click()
    },
    async close(callback) {
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
.responsibility {
  border: solid red 2px;
}
.user-item:hover {
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.2);
}
</style>
