<template>
  <div id="app">
    <nav-bar></nav-bar>
    <div class="container-fluid">
      <div class="row-no-padding">
        <router-view />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  computed: {
    current_edit_project: () => this.$store.state.settings.current_edit_project,
    current_edit_company_user: () =>
      this.$store.state.settings.current_edit_company_user,
    current_edit_company_client: () =>
      this.$store.state.settings.current_edit_company_client,
    current_edit_task: () => this.$store.state.settings.current_edit_task,
    current_edit_timer: () => this.$store.state.settings.current_edit_timer,
    current_edit_task_type: () =>
      this.$store.state.settings.current_edit_task_type
  },
  watch: {
    current_edit_company_user() {
      if (current_edit_company_user.id) {
      }
    }
  }
}
</script>
