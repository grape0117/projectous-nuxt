<template>
  <div class="d-flex rounded px-1" :style="{ backgroundColor: label == 'Urgent' ? color : color + 'AF' }" style="align-items: center; width: fit-content;">
    <i v-if="label == 'Urgent'" class="icon-fire" :style="{ 'font-size': size == 'lg' ? '1em' : '0.7em' }"></i>
    <p v-else class="rounded m-auto" :class="`bg-${color}-400`" :style="{ backgroundColor: color + 'FF' }" style="width: 7px; height: 7px;"></p>

    <span class="ml-1" :style="{ color: label == 'Urgent' ? '#FFF' : '#DDD', 'font-size': size == 'lg' ? '1em' : '0.7em' }">
      <slot></slot>
    </span>
  </div>
</template>
<script>
export default {
  props: {
    color: {
      type: String,
      default: 'teal'
    },
    label: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'sm'
    }
  }
}
</script>
