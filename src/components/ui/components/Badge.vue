<template>
  <div class="d-flex rounded px-2" :style="{ backgroundColor: level == 'Urgent' ? color : color + '4b' }" style="align-items: center;">
    <i v-if="level == 'Urgent'" class="icon-fire"></i>
    <p v-else class="rounded m-auto" :class="`bg-${color}-400`" :style="{ backgroundColor: color + 'FF' }" style="width: 10px; height: 10px;"></p>

    <span class="ml-1" :style="{ color: level == 'Urgent' ? '#FFF' : '#172b4d' }" style="font-size: 0.75em;">
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
    level: {
      type: String,
      default: ''
    }
  }
}
</script>
