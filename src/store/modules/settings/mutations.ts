import { MutationTree } from 'vuex'
import { IModuleState, IProject } from '@/store/modules/settings/types'
import Vue from 'vue'
import {
  ADD_PROJECTS,
  UPSERT_PROJECT,
  DELETE_PROJECT,
  UPDATE_PROJECT,
  UPDATE_PROJECT_ATTRIBUTE,
  ADD_PROJECT
} from '@/store/modules/projects/mutations-types'

export const mutations: MutationTree<IModuleState> = {
  [ADD_PROJECTS](state: IModuleState, projects: any[]) {
    this.commit(
      'ADD_MANY',
      { module: 'projects', entities: projects },
      //@ts-ignore
      { root: true }
    )
  },
  setCurrentEditInvoice(state, invoice) {
    Vue.set(state, 'current_edit_invoice', JSON.parse(JSON.stringify(invoice)))
  },
  setCurrentEditPayment(state, payment) {
    Vue.set(state, 'current_edit_payment', JSON.parse(JSON.stringify(payment)))
  },
  setCurrentEditTimerProject(state: IModuleState, project) {
    state.current_edit_timer['project_id'] = project.id
  },
  setCurrentEditProjectCompanyClient(state, client) {
    Vue.set(state.current_edit_project, 'client_id', client.client_id)
  },
  setCurrentCompanyId(state, company_id) {
    Vue.set(state, 'current_company_id', company_id)
  },
  setCurrentCompany(state, company) {
    Vue.set(state, 'current_company', JSON.parse(JSON.stringify(company)))
  },
  setCurrentProject(state, project) {
    if (project)
      Vue.set(state, 'current_project', JSON.parse(JSON.stringify(project)))
  },
  setCurrentCompanyUser(state, user) {
    //console.log(user);
    Vue.set(state, 'current_company_user', JSON.parse(JSON.stringify(user)))
  },
  setCurrentEditCompanyUser(state, company_user) {
    Vue.set(
      state,
      'current_edit_company_user',
      JSON.parse(JSON.stringify(company_user))
    )
  },
  setCurrentEditCompanyClient(state, company_client) {
    Vue.set(
      state,
      'current_edit_company_client',
      JSON.parse(JSON.stringify(company_client))
    )
  },
  setCurrentEditProject(state, project) {
    Vue.set(state, 'current_edit_project', JSON.parse(JSON.stringify(project)))
  },
  setCurrentEditTask(state, task) {
    console.log(task)
    Vue.set(state, 'current_edit_task', JSON.parse(JSON.stringify(task)))
  },
  setCurrentEditTimer(state, timer) {
    /**
     * Without this bit of code, the modal will sometimes keep notes from previous timers.
     * It appears to be an issue with v-html but that's not definitive.
     *
     * Also, because we're using jQuery, there's no reactivity to setting the html.
     * If we don't do an id check, the modal notes fields get cleared out and Vue won't know to put the right data back.
     */
    console.log('setting defaults')
    if (timer.id != state.current_edit_timer.id) {
      $('#timerUserNotes').html('')
      $('#timerInvoiceNotes').html('')
      $('#timerAdminNotes').html('')
      $('#duration_hours').val('')
      $('#duration_minutes').val('')
      $('#duration_seconds').val('')
    }
    Object.keys(timer).map(function(timerKey, index) {
      Vue.set(
        state.current_edit_timer,
        timerKey,
        timer[timerKey] ? timer[timerKey] : ''
      )
    })
  },
  setCurrentEditTimerHistory: function(state, history) {
    Vue.set(state.current_edit_timer, 'histories', history)
  },
  setCheckActionStack: function(state, value) {
    Vue.set(state, 'check_action_stack', value)
  },
  popActionStack: function(state) {
    var action_stack = state.action_stack
    var popped = action_stack.pop()
    Vue.set(state, 'action_stack', action_stack)
    return popped
  },
  pushActionStack: function(state, action) {
    console.log(state.action_stack)
    state.action_stack.push(action)
    console.log(state.action_stack)
  },
  createProject: function(state) {
    Object.keys(state.current_edit_project).map(function(objectKey, index) {
      object[objectKey] = ''
    })
  },
  setCurrentRunningTimer: function(state, timer) {
    //console.log('setCurreRunTim')
    //console.log(timer);
    Vue.set(state, 'current_running_timer', timer)
  }
}
