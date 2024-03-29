<template>
  <div class="form-group edit-task-modal-user">
    <b-input-group class="mt-12" size="sm" v-if="filter || !!(task_user && Object.keys(task_user).length)">
      <div class="d-flex justify-content-between w-100">
        <span @click="toggleShow" class="user-name pointer">{{ user.name }}</span>
        <i class="icon-close pointer" v-if="show" @click="toggleShow" />
      </div>
      <b-input-group-prepend append="$" v-if="show">
        <b-button :variant="buttonVariant('visible')" @click="toggleRole('visible')">Visible</b-button>
        <b-button :variant="buttonVariant('assigned')" @click="toggleRole('assigned')">Assigned</b-button>
        <b-button :variant="buttonVariant('reviewer')" @click="toggleRole('reviewer')">Reviewer</b-button>
        <b-button :variant="buttonVariant('manager')" @click="toggleRole('manager')">Watcher</b-button>
      </b-input-group-prepend>
      <b-input-group prepend="$" v-if="show && task_user && task_user.role">
        <b-form-input type="number" :class="userRateClass()" :placeholder="userRatePlaceholder()" v-model="user_rate"></b-form-input>
      </b-input-group>
    </b-input-group>
    <div class="form-group" v-if="show">
      <label class="control-label col-sm-4" :for="'taskWorkDate' + user.id">Next Work Day: {{ next_work_day }} </label>
      <div class="col-sm-8">
        <input :id="'taskWorkDate' + user.id" class="form-control" type="date" name="next_work_day" placeholder="Next Work Day" v-model="next_work_day" />
      </div>
    </div>
  </div>
</template>
<script>
/*
    This was pulled out of EditTaskModal so a lot can be simplified but it works so leaving it for now
     */
import uuid from 'uuid'

export default {
  props: ['user', 'task', 'task_user', 'filter'],
  name: 'edit-task-modal-user',
  data: function() {
    return {
      id: this.task_user ? this.task_user.id : uuid.v4(),
      user_checked: !!this.task_user,
      user_rate: this.task_user ? this.task_user.user_rate : null,
      role: this.task_user ? this.task_user.role : '',
      next_work_day: this.task_user ? this.task_user.next_work_day : null,
      show: false
    }
  },
  computed: {
    project() {
      return this.task.project_id ? this.$store.getters['projects/getById'](this.task.project_id) : null
    },
    project_user() {
      return this.project ? this.$store.getters['project_users/getByProjectIdAndCompanyUserId']({ project_id: this.project.id, company_user_id: this.user.id }) : null
    },
    client() {
      if (!this.task.project_id) return ''
      const client = this.project.client_id ? this.$store.getters['clients/getByClientCompanyId'](this.project.client_id) : null
      return client
    },
    client_user() {
      const client_user = this.client ? this.$store.getters['client_users/getByClientIdAndCompanyUserId']({ client_id: this.client.id, company_user_id: this.user.id }) : null
      return client_user
    }
  },
  watch: {
    user_rate(user_rate) {
      if (user_rate !== '') {
        this.$emit('change', { message: this.user.name + ' given user_rate of ' + user_rate + ' by current user' })
      } else {
        this.$emit('change', { message: this.user.name + ' removed from task by current user' })
      }
      this.$store.dispatch('UPDATE_ATTRIBUTE', { module: 'task_users', id: this.id, attribute: 'user_rate', value: user_rate }, { root: true })
    },
    role(role) {
      const task_user = {
        id: this.id,
        task_id: this.task.id,
        company_user_id: this.user.id,
        next_work_day: this.next_work_day,
        user_checked: this.user_checked,
        user_rate: this.user_rate,
        role: role
      }

      if (role) {
        this.$emit('change', { message: this.user.name + ' given role of ' + role + ' by current user' })
        this.$store.dispatch('UPSERT', { module: 'task_users', entity: task_user }, { root: true })
      } else {
        this.$emit('change', { message: this.user.name + ' removed from task by current user' })
        this.$store.dispatch('DELETE', { module: 'task_users', entity: task_user }, { root: true })
      }
      //this.toggleUser()
    },
    next_work_day(next_work_day) {
      this.$store.dispatch('UPDATE_ATTRIBUTE', { module: 'task_users', id: this.id, attribute: 'next_work_day', value: next_work_day }, { root: true })
    }
  },
  methods: {
    toggleShow() {
      this.show = !this.show
    },
    userRatePlaceholder() {
      if (this.project_user) console.log('project_user.user_rate ' + this.project_user.default_user_rate, this.project_user)
      if (this.client_user) console.log('client_user.user_rate ' + this.client_user.default_user_rate, this.client_user)
      if (this.task_user && this.task_user.user_rate * 1 > 0) {
        return this.task_user.user_rate
      } else if (this.project_user && this.project_user.default_user_rate > 0) {
        return project_user.default_user_rate
      } else if (this.client_user && this.client_user.default_user_rate > 0) {
        return this.client_user.default_user_rate
      } else if (this.user.user_rate) {
        return this.user.user_rate
      } else {
        return null
      }
    },
    /*    userRateTooltip() {
      if (this.task_user && this.task_user.user_rate) {
        return null
      } else if (this.task.project_id) {
        const project_user = this.$store.getters['project_users/getByProjectIdAndCompanyUserId']({
          project_id: this.task.project_id,
          company_user_id: this.user.id
        })
        if (project_user.default_user_rate) {
          return 'This rate is set on the project. \n Override by entering a value here.'
        } else {
          const project = this.$store.getters['projects/getById'](this.task.project_id)
          const client = this.$store.getters['clients/getByClientCompanyId'](project.client_company_id)
          const client_user = this.$store.getters['client_users/getByClientIdAndCompanyUserId']({client_id: client.id, company_user_id: this.user.id})
          if(client_user && client_user.default_user_rate){
            return 'This rate is set on the client. \n Override by entering a value here.'
          }
        }
      }
      if (this.user.user_rate) {
        return 'This rate is set on the user. \n Override by entering a value here.'
      } else {
        return 'Please set a default rate for this user'
      }
    },*/
    userRateClass() {
      return this.task_user.user_rate > 0 ? 'set-rate' : 'inherited-rate'
    },
    buttonVariant(role) {
      return this.role === role ? 'primary' : 'light'
    },
    toggleRole(role) {
      this.role = this.role === role ? '' : role
    }
  }
}
</script>

<style lang="scss" scoped>
.pointer {
  cursor: pointer;
}
.edit-task-modal-user .input-group-text {
  cursor: pointer;
}
.user-name {
  color: #495057;
  text-align: center;
  white-space: nowrap;
  background-color: #e9ecef;
  border: 1px solid #ced4da;
  font-weight: 400;
  font-size: 14px;
  padding: 4px 8px;
}
</style>
