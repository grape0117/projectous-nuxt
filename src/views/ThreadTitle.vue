<template>
  <b-list-group-item class="message-panel_inner-message" style="float: right;" v-if="thread">
    <b-avatar class="mr-1 mb-2" :text="user_name" v-b-tooltip.hover :title="full_name" size="25px" />
    <div>
      <div class="message-wrapper">
        <div class="message-container">
          <pre class="msg-content" style="color: white;">{{ title }}</pre>
        </div>
      </div>
    </div>
  </b-list-group-item>
</template>

<script>
import moment from 'moment'
import { abbrName } from '@/utils/util-functions'

export default {
  name: 'task-message-item',
  data() {
    return {
      user_name: '',
      full_name: '',
      title: ''
    }
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
  created() {
    if (this.thread) {
      this.user_name = abbrName(this.thread.owner.name)
      this.title = this.thread.title
      this.full_name = this.thread.owner.fullname
    }
  },
  methods: {
    abbrName
  }
}
</script>

<style lang="scss" scoped>
.msg-content {
  padding: 8px 12px;
  background-color: gray;
  // border: solid 1px grey;
  border-radius: 4px;
  margin-top: 5px;
  margin-bottom: 0;
  white-space: pre-wrap;
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
