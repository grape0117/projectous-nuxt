<template>
  <div>
    <h1>Techaround daily email</h1>
    <h3>Yesterday</h3>
    <div style="margin: 30px">
      <table cellspacing="5">
        <tr>
          <th align="left" width="200px">User</th>
          <th align="left">Client</th>
          <th align="left">Project</th>
          <th align="left">Duration</th>
          <th align="left">Profit</th>
          <th align="left" width="55%">Notes</th>
        </tr>
        <tr v-for="user in yesterday" class="">
          <td>{{ user.user_name }}</td>
          <td>{{ user.client_name }}</td>
          <td>{{ user.project_name }}</td>
          <td align="right">{{ user.duration }}</td>
          <td class="money" align="right">{{ money(user.profit) }}</td>
          <td>{{ user.notes }}</td>
        </tr>
        <tr class="{{}}">
          <td class="bbold">Totals</td>
          <td></td>
          <td></td>
          <td align="right"></td>
          <td class="bbold" align="right">${{}}</td>
          <td></td>
        </tr>
      </table>
    </div>
    <h3>Month to date</h3>
    <div style="margin: 30px">
      <h4>By project</h4>
      <div style="margin: 30px;">
        <table cellpadding="5" style="">
          <tr>
            <th class="name_odd" style="padding: 0 16px 0 16px;" width="25">Name</th>
            <th class="name_odd" style="padding: 0 16px 0 16px;">Ratio</th>
            <th class="name_odd" style="padding: 0 16px 0 16px;">Hours</th>
            <th class="money user_odd hhide" style="padding: 0 16px 0 16px;">Per day</th>
            <th class="money user_odd hhide" style="padding: 0 16px 0 16px;">Projected</th>
            <th class="money user_odd hhide" style="padding: 0 16px 0 16px;">Earned</th>
            <th class="money invoicable_odd hhide" style="padding: 0 16px 0 16px;">Per day</th>
            <th class="money invoicable_odd" style="padding: 0 16px 0 16px;">Invoicable</th>
            <th class="money invoicable_odd" style="padding: 0 16px 0 16px;">Invoicable Projected</th>
            <th class="money profit_odd hhide" style="padding: 0 16px 0 16px;">Per day</th>
            <th class="money profit_odd" style="padding: 0 16px 0 16px;">Profit</th>
            <th class="money profit_odd" style="padding: 0 16px 0 16px;">Profit Projected</th>
          </tr>
          <tr @click="editProject(project)" v-for="project in month_to_date_per_project" :class="project_class(project)">
            <td class="">{{ project.name }}</td>
            <td class="">{{ project.monthly_target }} {{ project.monthly_target / project.invoicable_projected }}</td>
            <td class="" style="text-align: right !important;">{{ project.hours }}</td>
            <td class="money">{{ money(project.dollars_average) }}</td>
            <td class="money">{{ money(project.dollars_projected) }}</td>
            <td class="money">{{ money(project.dollars_total) }}</td>
            <td class="money">{{ money(project.invoicable_average) }}</td>
            <td class="money">{{ money(project.invoicable_dollars) }}</td>
            <td class="money">{{ money(project.invoicable_projected) }}</td>
            <td class="money">{{ money(project.profit_average) }}</td>
            <td class="money">{{ money(project.profit_dollars) }}</td>
            <td class="money">{{ money(project.profit_projected) }}</td>
          </tr>
        </table>
      </div>
      <h4>By user</h4>
      <div style="margin: 30px">
        <table cellpadding="5" style="">
          <tr>
            <th class="name_odd" style="padding: 0 16px 0 16px;" width="25">Name</th>
            <th class="name_odd" style="padding: 0 16px 0 16px;">Hours</th>
            <th class="money" style="padding: 0 16px 0 16px;">Per day</th>
            <th class="money" style="padding: 0 16px 0 16px;">Earned</th>
            <th class="money" style="padding: 0 16px 0 16px;">Projected</th>
            <th class="money" style="padding: 0 16px 0 16px;">Per day</th>
            <th class="money" style="padding: 0 16px 0 16px;">Invoicable</th>
            <th class="money" style="padding: 0 16px 0 16px;">Projected</th>
            <th class="money" style="padding: 0 16px 0 16px;">Per day</th>
            <th class="money" style="padding: 0 16px 0 16px;">Profit</th>
            <th class="money" style="padding: 0 16px 0 16px;">Projected</th>
          </tr>
          <tr v-for="user in month_to_date_per_user">
            <td class="">{{ user.name }}</td>
            <td class="" style="text-align: right !important;">{{ user.hours }}</td>
            <td class="money">{{ money(user.dollars_average) }}</td>
            <td class="money">{{ money(user.dollars_total) }}</td>
            <td class="money">{{ money(user.dollars_projected) }}</td>
            <td class="money">{{ money(user.invoicable_average) }}</td>
            <td class="money">{{ money(user.invoicable_dollars) }}</td>
            <td class="money">{{ money(user.invoicable_projected) }}</td>
            <td class="money">{{ money(user.profit_average) }}</td>
            <td class="money">{{ money(user.profit_dollars) }}</td>
            <td class="money">{{ money(user.profit_projected) }}</td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'profit',
  data() {
    return {
      yesterday: [],
      month_to_date_per_project: [],
      month_to_date_per_user: []
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    editProject(project) {
      this.$store.commit('settings/setCurrentEditProject', project)
    },
    getData() {
      let self = this
      this.$http()
        .get('/profitability')
        .then(function(response) {
          self.yesterday = response.yesterday
          self.month_to_date_per_project = response.month_to_date_per_project
          self.month_to_date_per_user = response.month_to_date_per_user
        })
    },
    money(amount) {
      if (!amount) return ''
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(amount)
    },
    project_class(project) {
      let ratio = project.monthly_target / project.invoicable_projected
      console.log(ratio + '...' + project.invoicable_projected + ' ' + project.monthly_target)
      if (ratio > 1.5) {
        return 'over_alert'
      } else if (ratio > 1.1) {
        return 'over_warning'
      } else if (ratio > 0.9) {
        return 'on_target'
      } else if (ratio > 0.5) {
        return 'below_target'
      } else if (ratio > 0) {
        return 'missing_out'
      } else {
        return 'opportunity'
      }
    }
  }
}
</script>
<style>
.money {
  text-align: right;
}
.over_alert {
  background: red;
}
.over_warning {
  background: orange;
}
.on_target {
  background: green;
}
.below_target {
  background: yellow;
}
.missing_out {
  background: purple;
}
.opportunity {
  background: black;
  color: white;
}
</style>
