<template id="report-timer-row-template">
  <tr class="report-timer-row timer-stopped" :data-id="timer.id" :data-duration="timer.duration">
    <td v-if="isAdmin()">
      {{ timer.id }}
      <span v-if="isTecharound()" style="color: purple">{{ timer.default_user_rate }} / {{ timer.default_client_rate }}</span>
      <input type="checkbox" :value="checkbox_value" @input="toggleCheckbox" :checked="checkbox_all_checked" class="timer-action" :name="'action[' + timer.id + ']'" />
      <a v-if="timer.invoice_id" href="">{{ timer.invoice_id }}</a>
      <div v-if="timer.is_paid" style="color: green;">Paid</div>
      <div v-if="timer.exported_at" style="color:red;">Exported</div>
    </td>
    <td v-else></td>
    <td v-if="isAdmin()" @click="editTimer(timer)">
      <div v-if="timer.client_rate > 0" style="color: lightgreen;">${{ Math.trunc(((timer.client_rate * timer.invoice_duration) / 3600) * 100) / 100 }} (${{ timer.client_rate }})</div>
      <div v-else style="color: red;">$0</div>
      <div>
        <span v-if="timer.user_rate * timer.duration > 0">${{ Math.trunc(((timer.user_rate * timer.duration) / 3600) * 100) / 100 }} (${{ timer.user_rate }})</span><span v-else style="color: red;">${{ Math.trunc(((timer.user_rate * timer.duration) / 3600) * 100) / 100 }} (${{ timer.user_rate }})</span>
        <div v-else style="color: red;">$0</div>
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
        <div class="timer-row-task">{{ timer.task_title }}</div>
      </div>
      <span v-else style="color: red">No Project</span>
      <div v-if="isAdmin()" class="timer-row-user">{{ timerUser(timer.user_id) }}</div>
    </td>
    <td @click="editTimer(timer)">
      {{ timer.report_at }}
    </td>
    <td v-if="!is_user_report">
      <div class="report-timer-avatar" :style="{ 'background-color': timer.user ? timer.user.color : 'gray' }" v-b-tooltip.hover :title="timer.user ? timer.user.name : ''">
        {{ abbrName(timer.user ? timer.user.name : 'U') }}
      </div>
    </td>
    <td v-if="!is_user_report" @click="editTimer(timer)">
      <span v-if="!timer.is_billable" style="color: red;">$</span>
    </td>
    <td @click="editTimer(timer)" style="white-space: nowrap;">
      {{ this.formatTime(timer.duration) }}
      <div v-if="isAdmin() && timer.duration !== timer.invoice_duration" style="color:red;">{{ Math.trunc(timer.invoice_duration / 3600) }}:{{ ('00' + Math.trunc((timer.invoice_duration % 3600) / 60)).slice(-2) }}</div>
    </td>
    <td @click="editTimer(timer)">
      <div v-if="isAdmin() && timer.invoice_notes && timer.invoice_notes !== 'undefined' && timer.invoice_notes.trim() !== ''" v-html="timer.invoice_notes"></div>
      <div v-else v-html="timer.notes"></div>
      <div v-if="timer.admin_notes && timer.admin_notes !== 'undefined' && timer.admin_notes.trim() !== ''" v-html="timer.admin_notes"></div>
    </td>
  </tr>
</template>

<script>
import { abbrName } from '@/utils/util-functions'
import { EventBus } from '@/components/event-bus'
import { formatTime } from '@/utils/util-functions'

export default {
  name: 'report-timer-row',
  props: ['timer', 'checkbox_all_checked', 'is_user_report'],
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
      if (!this.checkbox_toggled) return this.checkbox_all_checked === true ? 1 : 0

      // if toggled toggled
      return !this.checkbox_all_checked === true ? 1 : 0
    },
    users() {
      return this.$store.state.company_users.company_users
    },
    current_company() {
      return this.$store.state.settings.current_company
    }
  },
  created: function() {},
  methods: {
    abbrName,
    formatTime,
    toggleCheckbox() {
      this.checkbox_toggled = !this.checkbox_toggled
    },
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

<style lang="scss" scoped>
.report-timer-avatar {
  width: 25px;
  height: 25px;
  color: black;
  box-shadow: rgb(255 255 255 / 50%) 0px 0px 5px;
  margin-left: 0px;
  border-radius: 50px;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  justify-content: center;
  align-items: center;
}
.report-timer-row {
  background-color: rgba($color: #000000, $alpha: 0.5);
  cursor: pointer;
  color: white;

  &:hover {
    background-color: rgba($color: #000000, $alpha: 0.6);
  }
}
</style>
