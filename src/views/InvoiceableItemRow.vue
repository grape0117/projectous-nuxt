<template id="report-timer-row-template">
  <tr class="timer-form timer-stopped" :data-id="item.id">
    <td v-if="isAdmin()">
      {{ item.id }}
      <input type="checkbox" value="1" class="uncheck timer-action" :name="'item[' + item.id + ']'" />
      <a v-if="item.invoice_id" href="">{{ timer.invoice_id }}</a>
    </td>
    <td v-if="isAdmin()" @click="editItem(item)"></td>
    <td v-else="">
      $<span>{{ item.invoice_amount }}</span>
    </td>
    <td @click="editItem(item)">
      <div v-if="item.project_id">
        <div class="timer-row-client">{{ getClientNameFromProjectId(item.project_id) }}</div>
        <div class="timer-row-project">{{ getProjectName(item.project_id) }}</div>
      </div>
      <span v-else="" style="color: red">No Project</span>
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
  props: ['item'],
  computed: {
    users: function() {
      return this.$store.state.company_users.company_users
    },
    current_company: function() {
      return this.$store.state.settings.current_company
    }
  },
  methods: {
    getClientNameFromProjectId: function(project_id) {
      let project = this.$store.getters['projects/getProjectById'](project_id)
      if (project) {
        let client = this.$store.getters['clients/getCompanyClientByClientId'](project.client_company_id)
      }
      return client ? client.name : ''
    },
    getProjectName: function(project_id) {
      let project = this.$store.getters['projects/getProjectById'](project_id)
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
