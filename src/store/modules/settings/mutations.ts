import { MutationTree } from 'vuex'
import { IModuleState } from '@/store/modules/settings/types'
import Vue from 'vue'

export const mutations: MutationTree<IModuleState> = {
  registerModals(state, bvModal) {
    state.bvModal = bvModal
  },
  setCurrentEditTimerProject(state, project) {
    state.current_edit_timer.project_id = project.id
  },
  setCurrentEditProjectCompanyClient(state, client) {
    state.current_edit_project.client_id = client.client_id
  },
  setCurrentCompanyId(state, company_id) {
    state.current_company_id = company_id
  },
  setCurrentCompany(state, company) {
    state.current_company = JSON.parse(JSON.stringify(company))
  },
  setCurrentProject(state, project) {
    state.current_project = JSON.parse(JSON.stringify(project))
  },
  setCurrentCompanyUser(state, user) {
    state.current_company_user = JSON.parse(JSON.stringify(user))
  },
  setCurrentEditCompanyUser(state, company_user) {
    state.current_edit_company_user = JSON.parse(JSON.stringify(company_user))
  },
  setCurrentEditCompanyClient(state, client) {
    console.log('open client modal', client)
    state.current_edit_client = client
    if (client.id) {
      state.bvModal.show('client-modal')
    } else {
      state.bvModal.hide('client-modal')
    }
  },
  setCurrentEditProject(state, project) {
    console.log('open project modal')
    state.current_edit_project = project
    if (project.id) {
      state.bvModal.show('project-modal')
    } else {
      state.bvModal.hide('project-modal')
    }
  },
  setCurrentEditTask(state, task) {
    state.current_edit_task = JSON.parse(JSON.stringify(task))
    if (task.id) {
      state.bvModal.show('task-modal')
    } else {
      state.bvModal.hide('task-modal')
    }
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
      alert('check values in modal')
    }
    Object.keys(timer).map(function(timerKey, index) {
      state.current_edit_timer.timerKey = timer[timerKey] ? timer[timerKey] : ''
    })
  },
  setCurrentEditTimerHistory: function(state, history) {
    state.current_edit_timer.histories = history
  },
  setCheckActionStack(state, value) {
    state.check_action_stack = value
  },
  popActionStack(state) {
    let action_stack = state.action_stack
    let popped = action_stack.pop()
    state.action_stack = action_stack
    return popped
  },
  pushActionStack(state, action) {
    //console.log(state.action_stack)
    //@ts-ignore no idea why this is bad
    state.action_stack.push(action)
    //console.log(state.action_stack)
  },
  setCurrentRunningTimer(state, timer) {
    //console.log('setCurreRunTim')
    //console.log(timer);
    state.current_running_timer = timer
  }
}
