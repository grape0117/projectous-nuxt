import { MutationTree } from 'vuex'
import { IModuleState } from '@/store/modules/settings/types'
import Vue from 'vue'

export const mutations: MutationTree<IModuleState> = {
  registerModals(state, bvModal) {
    //@ts-ignore
    console.log(window.$_app.$bvModal)
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
      window.$_app.$bvModal.show('client-modal')
    } else {
      window.$_app.$bvModal.hide('client-modal')
    }
  },
  setCurrentEditProject(state, project) {
    console.log('open project modal')
    state.current_edit_project = project
    if (project.id) {
      window.$_app.$bvModal.show('project-modal')
    } else {
      window.$_app.$bvModal.hide('project-modal')
    }
  },
  setCurrentEditTask(state, task) {
    state.current_edit_task = JSON.parse(JSON.stringify(task))
    if (task.id) {
      window.$_app.$bvModal.show('task-modal')
    } else {
      window.$_app.$bvModal.hide('task-modal')
    }
  },
  setCurrentEditTimer(state, timer) {
    state.current_edit_timer = timer
    if (timer.id) {
      window.$_app.$bvModal.show('timer-modal')
    } else {
      window.$_app.$bvModal.hide('timer-modal')
    }
  },
  setCurrentEditTimerHistory: function(state, history) {
    state.current_edit_timer.histories = history
  },
  setCheckModalStack(state, value) {
    state.check_modal_stack = value
  },
  setSetting(state, { setting, value }: { setting: string; value: any }) {
    // @ts-ignore
    state[setting] = value
  },
  popActionStack(state) {
    let modal_stack = state.modal_stack
    let popped = modal_stack.pop()
    state.modal_stack = modal_stack
    return popped
  },
  pushActionStack(state, action: string) {
    state.modal_stack.push(action)
  },
  setCurrentRunningTimer(state, timer) {
    //console.log('setCurreRunTim')
    //console.log(timer);
    state.current_running_timer = timer
  }
}
