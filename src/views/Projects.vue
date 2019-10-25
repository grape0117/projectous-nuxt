<template>
  <div>
    <select v-model="selected_user">
      <option v-for="company_user in company_users" :id="company_user.id">{{
        company_user.name
      }}</option>
    </select>
    <Draggable v-bind:selected_user="selected_user"></Draggable>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import Draggable from './Draggable.vue'
@Component({
  components: { Draggable }
})
export default class Projects extends Vue {
  private selected_user: null = null
  //private mounted(): {}
  get company_users() {
    return []
    // return this.$store.state.company_users.company_users
  }
}
</script>
