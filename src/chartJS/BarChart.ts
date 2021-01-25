import { Line, HorizontalBar, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins

export default {
  // extends: Line,
  extends: HorizontalBar,
  mixins: [reactiveProp],
  props: ['options'],
  data() {
    return {}
  },
  mounted() {
    // this.chartData is created in the mixin.
    // If you want to pass options please create a local options object
    // @ts-expect-error
    this.renderChart(this.chartData, this.options)
  }
}
