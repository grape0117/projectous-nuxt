<template id="report-timer-row-template">
  <tr class="timer-form timer-stopped" :data-id="item.id">
    <td v-if="isAdmin()">
      {{ item.id }}
      <input type="checkbox" :value="checkbox_all_checked" @input="toggleCheckbox" :checked="checkbox_all_checked" class="timer-action" :name="'item[' + item.id + ']'" />
      <a v-if="item.invoice_id" href="">{{ timer.invoice_id }}</a>
    </td>
    <td v-if="isAdmin()" @click="editItem(item)"></td>
    <td v-else>
      $<span>{{ item.invoice_amount }}</span>
    </td>
    <td @click="editItem(item)">
      <div v-if="item.project_id">
        <div class="timer-row-client">{{ getClientNameFromProjectId(item.project_id) }}</div>
        <div class="timer-row-project">{{ getProjectName(item.project_id) }}</div>
      </div>
      <span v-else style="color: red">No Project</span>
    </td>
    <td @click="editItem(item)">
      {{ item.date }}
    </td>
    <td @click="editItem(item)"></td>
    <td @click="editItem(item)" style="white-space: nowrap;">
      1
    </td>
    <td @click="editItem(item)">
      <div v-html="item.description"></div>
    </td>
  </tr>
</template>

<script>
export default {
  name: 'invoiceable-item-row',
  props: ['item', 'checkbox_all_checked'],
  data() {
    return {
      checkbox_toggled: false
    }
  },
  watch: {
    checkbox_all_checked() {
      this.checkbox_toggled = false
    }
  },
  computed: {
    checkbox_value() {
      // if not toggled
      if (!this.checkbox_toggled) return this.checkbox_all_checked

      // if toggled toggled
      return !this.checkbox_all_checked
    },
    users: function() {
      return this.$store.state.company_users.company_users
    },
    current_company: function() {
      return this.$store.state.settings.current_company
    }
  },
  methods: {
    toggleCheckbox() {
      this.checkbox_toggled = !this.checkbox_toggled
    },
    getClientNameFromProjectId: function(project_id) {
      let project = this.$store.getters['projects/geById'](project_id)
      if (project) {
        let client = this.$store.getters['clients/getByClientCompanyId'](project.client_company_id)
      }
      return client ? client.name : ''
    },
    getProjectName: function(project_id) {
      let project = this.$store.getters['projects/getById'](project_id)
      if (project) return project.name
    },
    isTecharound: function() {
      return this.$store.getters['settings/isTecharound']
    },
    isAdmin: function() {
      return this.$store.getters['settings/isAdmin']
    },
    editItem: function() {
      this.$store.dispatch('invoices/editItem', this.item)
    }
  }
}
</script>
