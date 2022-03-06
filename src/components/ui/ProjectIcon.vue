<template>
  <span class="project-icon" :style="{ 'background-color': client.color }">
    <span v-html="icon"></span>
    <span v-if="project" class="dragzone-project-acronym"> {{ project.acronym }} </span>
  </span>
</template>

<script>
export default {
  props: ['project'],
  data() {
    return {
      show_plus: false
    }
  },
  computed: {
    client() {
      if (this.project.client_company_id) {
        return this.$store.getters['clients/getByClientCompanyId'](this.project.client_company_id)
      } else {
        return null
      }
    },
    icon() {
      if (this.client && this.client.url && (this.client.url === this.project.project_url || !this.project.project_url)) {
        return '<img class="project-favicon" src="' + process.env.VUE_APP_API_URL + '/clients/' + this.client.id + '/favicon.png" />'
      } else if (project.project_url) {
        return '<img class="project-favicon" src="' + process.env.VUE_APP_API_URL + '/projects/' + this.project.id + '/favicon.png" />'
      } else {
        return ''
      }
    }
  }
}
</script>

<style>
.project-icon {
  white-space: nowrap;
}
.project-favicon {
  vertical-align: middle;
}
</style>
