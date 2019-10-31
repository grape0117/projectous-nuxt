<template>
  <div>
    <nav-regular></nav-regular>
    <!--<div id="notification" class="collapse" style="z-index: 5000; position: fixed; background: pink; width: 100%;">Notifications:
            <notification-row v-bind:notification="notification" v-bind:nested="false" v-for="notification in notifications"></notification-row>
            <button @click="newConversation()">New</button>
        </div>-->
  </div>
</template>

<script>
import NavRegular from './NavRegular.vue'
export default {
  components: {
    NavRegular
  },
  computed: {
    notifications: function() {
      //alert('getting notifications')
      //return this.$store.getters['notifications/getNestedNotifications'];
    }
  },
  methods: {
    newConversation: function() {
      $('#task-modal').modal({})
    }
  }
}
</script>
