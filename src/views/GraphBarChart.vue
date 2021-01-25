<template>
  <div class="bar">
    <bar-chart :chart-data="datacollection" :options="chartOptions"></bar-chart>
    <div class="buttons">
      <button @click="fillData()">Randomize</button>
      <button @click="fillData(50)">test</button>
    </div>
  </div>
</template>

<script>
import BarChart from '@/chartJS/BarChart'

export default {
  components: {
    BarChart
  },
  data() {
    return {
      datacollection: {},
      chartOptions: {}
    }
  },
  mounted() {
    this.fillData()
    this.fillChartOptions()
  },
  methods: {
    fillData(num = 0) {
      this.datacollection = {
        // labels: [this.getRandomInt(), this.getRandomInt()],
        labels: ['Data One', 'Data Two'],
        datasets: [
          {
            label: 'Red',
            backgroundColor: '#f87979',
            data: [this.getRandomInt() + num, this.getRandomInt()]
          },
          {
            label: 'Black',
            backgroundColor: '#000000',
            data: [this.getRandomInt(), this.getRandomInt()]
          }
        ]
      }
    },

    fillChartOptions() {
      this.chartOptions = {
        scales: {
          yAxes: [
            {
              stacked: true
            }
          ],
          xAxes: [
            {
              stacked: true
            }
          ]
        }
      }
    },

    getRandomInt() {
      return Math.floor(Math.random() * (50 - 5 + 1)) + 5
    }
  }
}
</script>

<style lang="scss">
.bar {
  border: 1px solid red;
  max-width: 600px;
  margin: 150px auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
