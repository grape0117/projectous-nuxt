<template>
  <div class="form-group">
    <div class="col-sm-12">
      <label class="control-label col-sm-4">{{ user.name }}: </label>
      {{ this.id }}
      <!--
            <input type="checkbox" v-model="user_checked" />
-->
      <b-input-group class="mt-12">
        <b-input-group-prepend>
          <b-button :variant="buttonVariant('assigned')" @click="toggleRole('assigned')">Assigned</b-button>
          <b-button :variant="buttonVariant('reviewer')" @click="toggleRole('reviewer')">Reviewer</b-button>
          <b-button :variant="buttonVariant('manager')" @click="toggleRole('manager')">Watcher</b-button>
        </b-input-group-prepend>
        <b-input-group size="sm" prepend="$">
          <b-form-input size="4" prepend="$" type="number" :placeholder="userRatePlaceholder" v-model="user_rate"></b-form-input>
        </b-input-group>
      </b-input-group>

      <!--<select v-model="role">
                <option value="assigned">Assigned</option>
                <option value="reviewer">Reviewer</option>
                <option value="manager">Manager</option>
            </select>-->
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
      role: this.project_user ? this.project_user.role : ''
    }
  },
  watch: {
    user_checked() {
      this.toggleUser()
    },
    user_rate() {
      this.toggleUser()
    },
    role(role) {
      const project_user = {
        id: this.id,
        project_id: this.project.id,
        company_user_id: this.user.id,
        user_checked: this.user_checked,
        user_rate: this.user_rate,
        role: role
      }

      if (role) {
        this.$emit('change', { message: this.user.name + ' give role of ' + role + ' by current user' })
        this.$store.dispatch('UPSERT', { module: 'project_users', entity: project_user }, { root: true })
      } else {
        this.$emit('change', { message: this.user.name + ' removed from project by current user' })
        this.$store.dispatch('DELETE', { module: 'project_users', entity: project_user }, { root: true })
      }
      //this.toggleUser()
    }
  },
  methods: {
    userRatePlaceholder() {
      if (this.project_user && this.project_user.user_rate) {
        return this.project_user.user_rate
      }
      //TODO: const client = this.$store.getters['company_clients/getByClientCompanyId'](this.project.client_id)
      else if (this.user.default_user_rate) {
        return this.user.default_user_rate
      } else {
        return 0
      }
    },
    buttonVariant(role) {
      return this.role === role ? 'primary' : 'light'
    },
    toggleRole(role) {
      this.role = this.role === role ? '' : role
    },
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
