<template>
  <div class="form-group">
    <!-- <div class="col-sm-12"> -->
    <b-input-group :prepend="user.name" class="mt-12" size="sm">
      <b-input-group-prepend append="$">
        <b-button :variant="buttonVariant('visible')" @click="toggleRole('visible')">Visible</b-button>
        <b-button :variant="buttonVariant('assigned')" @click="toggleRole('assigned')">Assigned</b-button>
        <b-button :variant="buttonVariant('reviewer')" @click="toggleRole('reviewer')">Reviewer</b-button>
        <b-button :variant="buttonVariant('manager')" @click="toggleRole('manager')">Watcher</b-button>
      </b-input-group-prepend>
      <b-input-group prepend="$" v-if="project_user && project_user.role">
        <b-form-input type="number" :class="userRateClass()" :placeholder="userRatePlaceholder()" v-model="default_user_rate"></b-form-input>
      </b-input-group>
    </b-input-group>
    <!-- </div> -->
  </div>
</template>
<script>
/*
      This was pulled out of EditprojectModal so a lot can be simplified but it works so leaving it for now
       */
import { isUndefined, isNull } from 'lodash'
import uuid from 'uuid'

export default {
  props: ['user', 'project', 'project_user'],
  name: 'edit-project-modal-user',
  data: function() {
    return {
      id: this.project_user ? this.project_user.id : uuid.v4(),
      user_checked: !!this.project_user,
      default_user_rate: this.project_user ? this.project_user.default_user_rate : 0,
      role: this.project_user ? this.project_user.role : ''
    }
  },
  computed: {
    client() {
      return this.project.client_company_id ? this.$store.getters['clients/getByClientCompanyId'](this.project.client_company_id) : null
    },
    client_user() {
      return this.client ? this.$store.getters['client_users/getByClientIdAndCompanyUserId']({ client_id: this.client.id, company_user_id: this.user.id }) : null
    }
  },
  watch: {
    default_user_rate(default_user_rate) {
      console.log('user rate changed to ', default_user_rate)
      if (default_user_rate !== '') {
        this.$emit('change', { message: this.user.name + ' given default_user_rate of ' + default_user_rate + ' by current user' })
      } else {
        this.$emit('change', { message: this.user.name + ' removed from project by current user' })
      }
      this.$store.dispatch('UPDATE_ATTRIBUTE', { module: 'project_users', id: this.id, attribute: 'default_user_rate', value: default_user_rate }, { root: true })
    },
    role(role) {
      const project_user = {
        id: this.id,
        project_id: this.project.id,
        company_user_id: this.user.id,
        user_checked: this.user_checked,
        default_user_rate: this.default_user_rate,
        role: role
      }

      if (role) {
        this.$emit('change', { message: this.user.name + ' given role of ' + role + ' by current user' })
        this.$store.dispatch('UPSERT', { module: 'project_users', entity: project_user }, { root: true })
      } else {
        console.log('deleting project user')
        this.$emit('change', { message: this.user.name + ' removed from project by current user' })
        this.$store.dispatch('DELETE', { module: 'project_users', entity: project_user }, { root: true })
      }
      //this.toggleUser()
    }
  },
  methods: {
    userRatePlaceholder() {
      if (this.client_user && this.client_user.default_user_rate > 0) {
        return this.client_user.default_user_rate + ' set on client'
      }

      return this.user.default_user_rate > 0 ? this.user.default_user_rate + ' set at the user level' : null
    },
    /*userRateTooltip() {
      if(this.default_user_rate) return null
      if (this.project_user && this.project_user.default_user_rate > 0) {
        return null
      } else {
        const client = this.$store.getters['clients/getByClientCompanyId'](this.project.client_company_id)
        const client_user = this.$store.getters['client_users/getByClientIdAndCompanyUserId']({client_id: client.id, company_user_id: this.user.id})
        if(client_user.default_user_rate > 0){
          return 'This rate is set on the client. \n Override by entering a value here.'
        }
      }
      if (this.user.default_user_rate) {
        return 'This rate is set on the user. \n Override by entering a value here.'
      } else {
        return null
      }
    },*/
    userRateClass() {
      console.log('default_user_rate', this.project_user.default_user_rate)
      return this.default_user_rate !== '' ? 'set-rate' : 'inherited-rate'
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
