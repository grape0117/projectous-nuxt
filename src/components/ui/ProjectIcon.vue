<template>
  <span v-if="project.acronym" class="project-icon">
    <span v-html="icon"></span>
    <span v-if="project" class="dragzone-project-acronym" :style="{ 'background-color': client ? client.color : '' }" style="margin-right: 6px;"> {{ project.acronym }} </span>
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
      } else if (this.project.project_url) {
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
.sidebar-timer .dragzone-project-acronym {
  padding: 1px 3px 1px 5px;
  color: white;
  font-size: 11px;
  font-weight: bold;
}
</style>
