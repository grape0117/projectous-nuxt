<template>
  <div class="form-group">
    <div class="col-sm-12">
      <!--<label class="control-label col-sm-4">{{ user.name }}: </label>-->
      <!--
                  <input type="checkbox" v-model="user_checked" />
      -->
      <!-- {{ client_user }} -->
      <b-input-group :prepend="user.name" class="mt-12" size="sm">
        <b-input-group-prepend append="$">
          <b-button :variant="buttonVariant('visible')" @click="toggleRole('visible')">Visible</b-button>
          <b-button :variant="buttonVariant('assigned')" @click="toggleRole('assigned')">Assigned</b-button>
          <b-button :variant="buttonVariant('reviewer')" @click="toggleRole('reviewer')">Reviewer</b-button>
          <b-button :variant="buttonVariant('manager')" @click="toggleRole('manager')">Watcher</b-button>
        </b-input-group-prepend>
        <b-input-group prepend="$" v-if="client_user && client_user.role">
          <b-form-input v-b-tooltip.hover @blur="updateUserRate()" :title="userRateTooltip()" type="number" :class="userRateClass()" :placeholder="userRatePlaceholder()" v-model="default_user_rate"></b-form-input>
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
import { isUndefined, isNull } from 'lodash'

export default {
  props: ['user', 'client', 'client_user'],
  name: 'edit-client-modal-user',
  data: function() {
    return {
      id: this.client_user ? this.client_user.id : uuid.v4(),
      user_checked: !!this.client_user,
      default_user_rate: this.client_user ? this.client_user.default_user_rate : null,
      role: this.client_user ? this.client_user.role : ''
    }
  },
  watch: {
    role(role) {
      const client_user = {
        id: this.id,
        client_id: this.client.id,
        company_user_id: this.user.id,
        user_checked: this.user_checked,
        default_user_rate: this.default_user_rate,
        role: role
      }

      if (role) {
        this.$emit('change', { message: this.user.name + ' given role of ' + role + ' by current user' })
        this.$store.dispatch('UPSERT', { module: 'client_users', entity: client_user }, { root: true })
      } else {
        this.$emit('change', { message: this.user.name + ' removed from project by current user' })
        this.$store.dispatch('DELETE', { module: 'client_users', entity: client_user }, { root: true })
      }
      //this.toggleUser()
    }
  },
  methods: {
    updateUserRate() {
      console.log('user rate changed to ', this.default_user_rate)
      if (this.default_user_rate !== '') {
        this.$emit('change', { message: this.user.name + ' given default_user_rate of ' + this.default_user_rate + ' by current user' })
      } else {
        this.$emit('change', { message: this.user.name + ' removed default_user_rate from project by current user' })
      }
      this.$store.dispatch('UPDATE_ATTRIBUTE', { module: 'client_users', id: this.id, attribute: 'default_user_rate', value: this.default_user_rate }, { root: true })
    },
    userRatePlaceholder() {
      if (this.client_user && this.client_user.default_user_rate) {
        return this.client_user.default_user_rate
      } else if (this.user.default_user_rate) {
        return this.user.default_user_rate
      } else {
        return null
      }
    },
    userRateTooltip() {
      if (this.client_user && this.client_user.default_user_rate) {
        return null
      } else if (this.user.default_user_rate) {
        return 'This rate is set on the user. \n Override by entering a value here.'
      } else {
        return null
      }
    },
    userRateClass() {
      console.log('default_user_rate', this.client_user.default_user_rate)
      return this.client_user && !isNull(this.client_user.default_user_rate) && !isUndefined(this.client_user.default_user_rate) && this.client_user.default_user_rate !== '' ? 'set-rate' : 'inherited-rate'
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

<style>
input.inherited-rate {
  background-color: #cccccc;
}
input.set-rate {
  background-color: white;
}
</style>
