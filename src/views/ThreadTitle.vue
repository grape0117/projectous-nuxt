<template>
  <b-list-group-item class="message-panel_inner-message" style="float: right;" v-if="thread">
    <b-avatar class="mr-1 mb-2 avatar" :text="user_name" v-b-tooltip.hover :title="full_name" size="25px" />
    <div>
      <pre class="msg-content" style="color: white;">{{ title }}</pre>
    </div>
    <span @click="selectReponsibility()" v-if="responsibility_company_user_id && getCompanyUserDetails(responsibility_company_user_id)" :class="`responsibility avatar mr-1 pointer ml-4 responsibility`" :style="{ 'background-color': getCompanyUserDetails(responsibility_company_user_id).color, cursor: 'pointer', display: 'inline-flex' }">
      {{ abbrName(getCompanyUserDetails(responsibility_company_user_id).name) }}
    </span>
  </b-list-group-item>
</template>

<script>
import moment from 'moment'
import { EventBus } from '@/components/event-bus'

import { abbrName } from '@/utils/util-functions'
import SelectResponsibilityModal from './SelectResponsibilityModal'

export default {
  name: 'task-message-item',
  data() {
    return {
      user_name: '',
      full_name: '',
      title: ''
    }
  },
  components: {
    SelectResponsibilityModal
  },
  props: ['thread'],
  watch: {
    thread(thread) {
      if (thread) {
        this.user_name = abbrName(this.thread.owner.name)
        this.title = this.thread.title
        this.full_name = this.thread.owner.fullname
      }
    }
  },
  computed: {
    responsibility_company_user_id() {
      const thread = this.$store.state.threads.threads.filter(({ id }) => id == this.thread.id)[0]
      return thread ? thread.responsibility_company_user_id : null
    }
  },
  created() {
    if (this.thread) {
      this.user_name = abbrName(this.thread.owner.name)
      this.title = this.thread.title
      this.full_name = this.thread.owner.fullname
    }
  },
  methods: {
    abbrName,
    getCompanyUserDetails(company_user_id) {
      const user_details = this.$store.state.company_users.company_users.find(e => e.id === company_user_id)

      return user_details
    },
    selectReponsibility() {
      EventBus.$emit('selectReponsibility', JSON.stringify(this.thread))
    }
  }
}
</script>

<style lang="scss" scoped>
.msg-content {
  padding: 0px 12px 4px;
  border-radius: 4px;
  margin-top: 5px;
  margin-bottom: 0;
  white-space: pre-wrap;
  color: white;
  font-weight: bolder;
  font-size: 23px;
}

.responsibility {
  position: absolute;
  right: 0px;
  top: 10px;
}
.message-panel_inner-message {
  display: flex;
  align-items: flex-end;
  background-color: rgba($color: #000000, $alpha: 0) !important;
  border: 0 !important;
  padding: 0px 10px 5px 10px;
  max-width: 90%;
  .b-avatar-text {
    width: 25px !important;
  }
  .avatar {
    min-width: 25px !important;
  }

  .message-dateTime {
    font-size: 12px;
  }
}

.message-panel_inner .message-panel_inner-message:hover {
  visibility: visible;
}
.message-panel_inner {
  visibility: hidden;
}
.message-wrapper {
  // border: 1px solid red;
  display: flex;
  justify-content: space-between;
  // position: relative;
}
</style>
