<template id="daily-template">
  <div class="wrapper container-fluid">
    <div class="row">
      <div lass="col-sm-12">
        <table>
          <tr>
            <td class="sticky-col">
              <h4>Date</h4>
              <table>
                <tr>
                  <th>Date</th>
                </tr>
                <tr v-for="day in days">
                  <td>{{ day.date }}</td>
                </tr>
              </table>
            </td>
            <td>
              <h4>Me</h4>
              <table>
                <tr>
                  <th>Duration</th>
                </tr>
                <tr v-for="day in days">
                  <td>
                    <span :style="'width: ' + width(day.duration / 15) + 'px; display:inline-block;  background: ' + background(day.duration) + '; overflow: visible'">{{ day.duration ? Math.trunc(day.duration / 36) / 100 : '' }}</span>
                  </td>
                </tr>
              </table>
            </td>
            <td></td>
            <td>
              <h4>Company</h4>
              <table>
                <tr>
                  <th>Duration</th>
                </tr>
                <tr v-for="day in adminDays">
                  <td>
                    <span :style="'width: ' + width(day.duration / 15) + 'px; display:inline-block;  background: ' + adminBackground(day.duration) + '; overflow: visible'">{{ day.duration ? Math.trunc(day.duration / 36) / 100 : '' }}</span>
                  </td>
                </tr>
              </table>
            </td>
            <td v-for="company_user in active_company_users">
              <h4>{{ company_user.name }}</h4>
              <table>
                <tr>
                  <th>Duration</th>
                </tr>
                <tr v-for="day in userDays[company_user.id]">
                  <td>
                    <span :style="'width: ' + width(day.duration / 15) + 'px; display:inline-block;  background: ' + background(day.duration) + '; overflow: visible'">{{ day.duration ? Math.trunc(day.duration / 36) / 100 : '' }}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'daily-template',
  computed: {
    current_company_user() {
      return this.$store.state.settings.current_company_user
    },
    active_company_users() {
      return this.$store.getters['company_users/getActive']
    }
  },
  data() {
    return {
      days: [],
      userDays: [],
      adminDays: []
    }
  },
  created() {
    this.getData()
  },
  methods: {
    userName(company_user_id) {
      const company_user = this.$store.getters['company_users/getById'](company_user_id)
      return company_user ? company_user.name : ''
    },
    width(duration) {
      if (this.current_company_user.user_role !== 'admin') {
        return duration / 36
      } else {
        return duration / 360
      }
    },
    background(duration) {
      if (duration / 3600 > 4) {
        return 'lightgreen'
      } else if (duration / 3600 > 3) {
        return 'yellow'
      } else if (duration / 3600 > 2) {
        return 'orange'
      } else {
        return 'pink'
      }
    },
    adminBackground(duration) {
      if (duration / 3600 > 20) {
        return 'lightgreen'
      } else if (duration / 3600 > 15) {
        return 'yellow'
      } else if (duration / 3600 > 10) {
        return 'orange'
      } else {
        return 'pink'
      }
    },
    getData() {
      let self = this
      this.$http()
        .get('/days', {})
        .then(response => {
          self.days = response.days
          self.adminDays = response.adminDays
          self.userDays = response.userDays
        })
    }
  }
}
</script>

<style>
.view {
  margin: auto;
  width: 600px;
}

.wrapper {
  position: relative;
  width: 100vw;
  overflow-x: scroll;
  border: 1px solid black;
  white-space: nowrap;
}

.sticky-col {
  position: -webkit-sticky;
  position: sticky;
  background-color: white;
}

.first-col {
  width: 100px;
  min-width: 100px;
  max-width: 100px;
  left: 0px;
}

.second-col {
  width: 150px;
  min-width: 150px;
  max-width: 150px;
  left: 100px;
}
</style>
