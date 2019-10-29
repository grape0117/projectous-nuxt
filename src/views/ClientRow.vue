<template id="clients-row">
  <tr @click="editClient(client)" class="table-row-hover">
    <td>{{ client.name }}</td>
  </tr>
</template>

<script>
export default {
  name: 'clients-row',
  props: ['client'],
  methods: {
    editClient: function() {
      this.$store.dispatch('company_clients/editClient', this.client)
    }
  }
}
</script>
