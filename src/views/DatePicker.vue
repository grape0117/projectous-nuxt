<template id="date-picker">
  <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" :fill="color">
    <g>
      <path
        d="M93.1,69.8v23.3h325.8c12.8,0,23.2,10.4,23.3,23.3v325.8c0,12.8-10.4,23.2-23.3,23.3H93.1c-12.8,0-23.2-10.4-23.3-23.3
            V116.4c0-12.8,10.4-23.3,23.3-23.3V69.8V46.5c-38.6,0-69.8,31.2-69.8,69.8v325.8c0,38.6,31.2,69.8,69.8,69.8h325.8
            c38.6,0,69.8-31.2,69.8-69.8V116.4c0-38.6-31.2-69.8-69.8-69.8H93.1V69.8z"
      />
      <text :x="x_position" y="450" :fill="color" style="font-size: 270px;">{{ expire_date }}</text>
      <path d="M325.8,23.3v93.1c0,12.9,10.4,23.3,23.3,23.3s23.3-10.4,23.3-23.3V23.3c0-12.9-10.4-23.3-23.3-23.3S325.8,10.4,325.8,23.3" />
      <path
        d="M139.6,23.3v93.1c0,12.9,10.4,23.3,23.3,23.3c12.9,0,23.3-10.4,23.3-23.3V23.3c0-12.9-10.4-23.3-23.3-23.3
            C150.1,0,139.6,10.4,139.6,23.3"
      />
      <path
        d="M46.5,232.7h418.9c12.9,0,23.3-10.4,23.3-23.3c0-12.9-10.4-23.3-23.3-23.3H46.5c-12.9,0-23.3,10.4-23.3,23.3
            C23.3,222.3,33.7,232.7,46.5,232.7"
      />
    </g>
  </svg>
</template>

<script>
export default {
  name: 'date-picker',
  props: ['color', 'expire_date'],
  computed: {
    x_position() {
      return 180 - 90 * (this.expire_date.toString().length - 1)
    }
  },
  methods: {}
}
</script>
