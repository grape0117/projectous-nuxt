<template>
  <div class="change-company-page">
    <div class="change-company-page__block">
      <div class="change-company-page__block-title">
        <span>Change Company</span>
      </div>
      <div class="change-company-page__block-form">
        <b-form autocomplete="off" @submit="setCurrentCompany">
          <b-form-group id="input-group-1" label="Available Companies:" label-for="email">
            <select id="current_company_id" name="company[]" v-model="chosen_company">
              <option value="0">Select Company</option>
              <option v-for="(company, index) in available_companies" :company="company" :key="index" :value="company.id">{{ company.name }}</option>
            </select>
          </b-form-group>
          <div class="d-flex justify-content-end">
            <b-button type="submit" variant="primary">Set Current Company</b-button>
          </div>
        </b-form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class ChangeCompany extends Vue {
  private chosen_company = 0
  private available_companies = []

  created() {
    //fetch available companies for user
    // @ts-ignore
    this.$http()
      .get('/get-companies')
      // @ts-ignore
      .then(response => {
        if (response.success) {
          this.available_companies = response.companies
          this.chosen_company = this.$store.state.settings.current_company_id
        } else {
          alert(response.message)
        }
      })
  }

  // @ts-ignore
  async getAppDataFromApi(updated_at) {
    try {
      // @ts-ignore
      return await this.$http().get('/test-tasks/' + updated_at)
    } catch (e) {}
  }

  private async setCurrentCompany(e: any) {
    e.preventDefault()
    if (this.chosen_company == 0) {
      alert('Please select a company!')
      return
    }
    // @ts-ignore
    await this.$store.dispatch('settings/setCurrentCompany', this.chosen_company)
    const appData = await this.getAppDataFromApi(0)
    this.$store.dispatch('PROCESS_INCOMING_DATA', appData)
  }
}
</script>

<style>
.change-company-page {
  width: 100%;
  height: 100vh;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #cccccc;
}
.change-company-page__block {
  display: block;
  width: 100%;
  max-width: 400px;
  height: auto;
  padding: 1.5rem;
  position: relative;
  background: #ffffff;
  border-radius: 4px;
  box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
}
.change-company-page__block-title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.0125em;
  line-height: 2rem;
  word-break: break-all;
}
.change-company-page__block-title span {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.0125em;
  padding: 16px 24px 10px;
}
.right {
  float: right;
}
</style>
