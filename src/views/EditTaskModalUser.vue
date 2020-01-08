<template>
  <div class="form-group">
    <div class="col-sm-12">
      <label class="control-label col-sm-4">{{ user.name }}: </label>
      <input type="checkbox" v-model="user_checked" />
      <input type="text" v-model="user_rate" />
      <select v-model="role">
        <option value="assigned">Assigned</option>
        <option value="reviewer">Reviewer</option>
        <option value="manager">Manager</option>
      </select>
    </div>
  </div>
</template>
<script>
/*
    This was pulled out of EditTaskModal so a lot can be simplified but it works so leaving it for now
     */
export default {
  props: ['user', 'task', 'task_users'],
  name: 'edit-task-modal-user',
  data: function() {
    return {
      user_checked: this.userChecked(this.user.id),
      user_rate: this.userRate(this.user.id) * 1,
      role: this.userRole(this.user.id)
    }
  },
  computed: {},
  watch: {
    user_checked() {
      this.toggleUser()
    },
    user_rate() {
      this.toggleUser()
    },
    role() {
      this.toggleUser()
    }
  },
  methods: {
    toggleUser: function() {
      console.log('toggling')
      this.$emit('toggle', {
        task_id: this.task.id,
        company_user_id: this.user.id,
        user_checked: this.user_checked,
        user_rate: this.user_rate,
        role: this.role
      })
    },
    userChecked: function(company_user_id) {
      let userChecked = false

      this.task_users.forEach(user => {
        if (user.company_user_id === company_user_id) {
          userChecked = true
          return false
        }
      })
      return userChecked
    },
    userRate(company_user_id) {
      let userRate = ''
      this.task_users.forEach(user => {
        if (user.company_user_id === company_user_id) {
          //console.log('user rate found');
          //console.log(user);
          userRate = user.user_rate
          return false
        }
      })
      return userRate
    },
    userRole(company_user_id) {
      let role = 'assigned'
      this.task_users.forEach(user => {
        if (user.company_user_id === company_user_id) {
          role = user.role
          return false
        }
      })
      return role
    }
  }
}
</script>
