<template id="report-timer-row-template">
  <tr class="timer-form timer-stopped" :data-id="timer.id" :data-duration="timer.duration">
    <td v-if="isAdmin()">
      {{ timer.id }}
      <span v-if="isTecharound()" style="color: purple">{{ timer.default_user_rate }} / {{ timer.default_client_rate }}</span>
      <input type="checkbox" value="1" class="uncheck timer-action" :name="'action[' + timer.id + ']'" />
      <a v-if="timer.invoice_id" href="">{{ timer.invoice_id }}</a>
      <div v-if="timer.is_paid" style="color: green;">Paid</div>
      <div v-if="timer.exported_at" style="color:red;">Exported</div>
    </td>
    <td v-if="isAdmin()" @click="editTimer(timer)">
      <div v-if="timer.client_rate > 0">${{ Math.trunc(((timer.client_rate * timer.invoice_duration) / 3600) * 100) / 100 }} (${{ timer.client_rate }})</div>
      <div v-else style="color: red;">${{ Math.trunc(((timer.client_rate * timer.invoice_duration) / 3600) * 100) / 100 }} (${{ timer.client_rate }})</div>
      <!--<div v-if="isTecharound()">${{ Math.trunc((timer.client_rate * timer.invoice_duration / 3600 - timer.user_rate * timer.duration / 3600) * 100) / 100 }} (${{ timer.client_rate - timer.user_rate }})</div>-->
      <div v-if="isAdmin()">
        <span v-if="timer.user_rate > 0">${{ Math.trunc(((timer.user_rate * timer.duration) / 3600) * 100) / 100 }} (${{ timer.user_rate }})</span><span v-else style="color: red;">${{ Math.trunc(((timer.user_rate * timer.duration) / 3600) * 100) / 100 }} (${{ timer.user_rate }})</span>
      </div>
    </td>
    <td v-else>
      $<span>{{ parseFloat(Math.trunc((timer.user_rate * timer.duration) / 36) / 100).toFixed(2) }}</span>
      <div v-if="timer.is_paid" style="color: green;">Paid</div>
    </td>
    <td @click="editTimer(timer)">
      <div v-if="timer.project_id">
        <div class="timer-row-client">{{ getClientNameFromProjectId(timer.project_id) }}</div>
        <div class="timer-row-project">{{ getProjectName(timer.project_id) }}</div>
        <div class="timer-row-task">{{ getTaskTitle(timer.task_id) }}</div>
      </div>
      <span v-else style="color: red">No Project</span>
      <div v-if="isAdmin()" class="timer-row-user">{{ timerUser(timer.user_id) }}</div>
    </td>
    <td @click="editTimer(timer)">
      {{ timer.report_at }}
    </td>
    <td @click="editTimer(timer)">
      <span v-if="!timer.is_billable" style="color: red;">$</span>
    </td>
    <td @click="editTimer(timer)" style="white-space: nowrap;">
      {{ Math.trunc(timer.duration / 3600) }}:{{ ('00' + Math.trunc((timer.duration % 3600) / 60)).slice(-2) }}
      <div v-if="isAdmin() && timer.duration !== timer.invoice_duration" style="color:red;">{{ Math.trunc(timer.invoice_duration / 3600) }}:{{ ('00' + Math.trunc((timer.invoice_duration % 3600) / 60)).slice(-2) }}</div>
    </td>
    <td @click="editTimer(timer)">
      <div v-if="isAdmin() && timer.invoice_notes" v-html="timer.invoice_notes"></div>
      <div v-else v-html="timer.notes"></div>
      <div v-html="timer.admin_notes"></div>
    </td>
    <td>
      <button class="btn btn-primary" v-if="isAdmin()" @click="applyPayment">Payment</button>
    </td>
  </tr>
</template>

<script>
import { EventBus } from '@/components/event-bus'

export default {
  name: 'report-timer-row',
  props: ['timer'],
  computed: {
    users() {
      return this.$store.state.company_users.company_users
    },
    current_company() {
      return this.$store.state.settings.current_company
    }
  },
  methods: {
    applyPayment() {
      EventBus.$emit('apply-payment')
    },
    getClientNameFromProjectId(project_id) {
      let project = this.$store.getters['projects/getById'](project_id)
      if (project) {
        let client = this.$store.getters['clients/getByClientCompanyId'](project.client_company_id)
        return client ? client.name : ''
      }
    },
    getProjectName(project_id) {
      let project = this.$store.getters['projects/getById'](project_id)
      if (project) return project.name
    },
    getTaskTitle(task_id) {
      if (task_id) {
        let task = this.$store.getters['tasks/getById'](task_id)
        if (task) return task.title
      }
    },
    isTecharound() {
      return this.$store.getters['settings/isTecharound']
    },
    isAdmin() {
      return this.$store.getters['settings/isAdmin']
    },
    timerUser(user_id) {
      if (user_id) {
        const user = this.$store.getters['company_users/getById'](user_id)
        if (user) {
          return user.name
        }
      }
    },
    editTimer() {
      this.$store.dispatch('timers/editTimer', this.timer)
    }
  }
}
</script>
