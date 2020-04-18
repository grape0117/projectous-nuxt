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
      This was pulled out of EditprojectModal so a lot can be simplified but it works so leaving it for now
       */
  import uuid from 'uuid'

  export default {
    props: ['user', 'project', 'project_user'],
    name: 'edit-project-modal-user',
    data: function() {
      return {
        id: this.project_user ? this.project_user.id : uuid.v4(),
        user_checked: !!this.project_user,
        user_rate: this.project_user ? this.project_user.user_rate : 0,
        role: this.project_user ? this.project_user.role : 'assigned'
      }
    },
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
        console.log('toggling', this.project_user)
        this.$emit('toggle', {
          id: this.id,
          project_id: this.project.id,
          company_user_id: this.user.id,
          user_checked: this.user_checked,
          user_rate: this.user_rate,
          role: this.role
        })
      }
    }
  }
</script>
