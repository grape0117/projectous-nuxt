<template>
  <tr @click="editClient(client)" class="client-row" :style="{ 'background-color': client.color ? client.color : null }">
    <td>{{ client.name }}</td>
  </tr>
</template>

<script>
export default {
  name: 'clients-row',
  props: ['client'],
  methods: {
    async editClient() {
      await this.$store.dispatch('clients/editClient', this.client.id)
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
  background: rgba($color: #000000, $alpha: 0.5);
}
</style>
