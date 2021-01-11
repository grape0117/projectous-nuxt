<template>
  <tr @click="editClient(client)" class="client-row">
    <td>{{ client.name }}</td>
  </tr>
</template>

<script>
export default {
  name: 'clients-row',
  props: ['client'],
  methods: {
    editClient: function() {
      this.$store.dispatch('clients/editClient', this.client.id)
    }
  }
}
</script>

<style lang="scss">
.client-row {
  background: rgba($color: #000000, $alpha: 0.4);
  cursor: pointer;
  color: white;
}
.client-row:hover {
  background: rgba($color: #000000, $alpha: 0.6);
}
</style>
