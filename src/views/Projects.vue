<template>
  <div>
    <select v-model="selected_user">
      <option v-for="company_user in company_users" :id="company_user.id">{{
        company_user.name
      }}</option>
    </select>
    <Dragable v-bind:selected_user="selected_user"></Dragable>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
//import Dragable from 'Dragable'
@Component({
  //components: { Dragable }
})
export default class Projects extends Vue {
  //selected_user: null
  //private mounted(): {}
}
</script>
