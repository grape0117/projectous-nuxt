<template>
  <div class="bar">
    <bar-chart :chart-data="datacollection" :options="chartOptions"></bar-chart>
    <div class="buttons">
      <button @click="fillData()">Randomize</button>
      <!-- <button @click="fillData(50)">test</button> -->
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
        labels: ['Greenbite', 'Diseno', 'Client', 'Client', 'Client', 'Client', 'Client', 'Client'],
        datasets: [
          {
            label: 'Dark Turquoise',
            backgroundColor: '#00D7DB',
            data: [this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt()]
          },
          {
            label: 'Medium Sea Green',
            backgroundColor: '#39C85E',
            data: [this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt()]
          },
          {
            label: 'Radical Red',
            backgroundColor: '#FF464A',
            data: [this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt()]
          },
          {
            label: 'Coral',
            backgroundColor: '#FF794C',
            data: [this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt()]
          },
          {
            label: 'Your Pink',
            backgroundColor: '#FFC8B6',
            data: [this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt()]
          },
          {
            label: 'Wood Bark',
            backgroundColor: '#2A221E',
            data: [this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt()]
          },
          {
            label: 'Persimmon',
            backgroundColor: '#E34708',
            data: [this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt()]
          },
          {
            label: 'Electric Indigo',
            backgroundColor: '#7A05F3',
            data: [this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt()]
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
  max-width: 600px;
  margin: 150px auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
