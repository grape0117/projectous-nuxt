declare module 'vue-native-notification'

interface VueChartJS {
  Line: any
  HorizontalBar: any
  mixins: any
}

declare module 'vue-chartjs' {
  const chartJs: VueChartJS
  export = chartJs
}
