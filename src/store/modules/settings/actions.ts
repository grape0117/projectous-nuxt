import { ActionTree } from 'vuex'
import { IModuleState } from './types'
import { IRootState } from '@/store/types'
import { ICompanyUser } from '@/store/modules/company_users/types.ts'

const company_user_id: number = 1

const UUID = () => {
  const date = new Date()
  return date.getUTCFullYear() + '-' + date.getUTCMonth() + 1 + '-' + date.getDate() + ' ' + date.getUTCHours() + ':' + date.getUTCMinutes() + ':' + date.getUTCSeconds() + ':' + date.getMilliseconds() + ' ' + Math.random()
}

export const actions: ActionTree<IModuleState, IRootState> = {
  async createUserTask({ dispatch, commit }: any, { list, sort_order }) {
    //@Mikhail: how do I both use TS with optional properties but also use TS to help avoid errors? Just use ignore with a note?
    const newTask: any = {
      id: UUID(),
      title: 'title'
    }
    const new_task = dispatch('task/CREATE', newTask)
    const new_task_user = dispatch('task_user/CREATE', {
      task: new_task,
      list,
      sort_order
    })
    //@ts-ignore
    const { task_user, task }: any = await this._vm.$http().post('users/' + company_user_id + '/tasks', {
      list: list,
      sort_order: sort_order
    })

    commit('tasks/UPDATE', task)
    commit('task_users/UPDATE', task_user)
  },
  openModal(context, { modal }) {
    // @ts-ignore
    //BvModal.show(modal + '-modal')
    //$('#'+modal+'-modal').modal({});
  },
  closedModal(context) {
    console.log('closedModal')
    console.log('check_action_stack', context.state.check_action_stack)
    console.log('action_stack', context.state.action_stack)
    if (context.state.check_action_stack) {
      let next_action = context.state.action_stack.pop()
      console.log('next_action', next_action)
      // @ts-ignore
      //BvModal.show(next_action + '-modal')
    }
    console.log('setting check to true')
    context.commit('setCheckActionStack', true)
  },
  closeModal(context, { modal, object, pop, push }) {
    //We want to manually open modal
    context.commit('setCheckActionStack', false)
    console.log('closing ' + modal)
    // @ts-ignore
    //BvModal.hide(modal + '-modal')

    if (push) {
      context.commit('pushActionStack', modal)
    }

    if (pop) {
      let next_action = context.state.action_stack.pop() //TODO: does this work properly?
      console.log(next_action)
      if (modal === 'client' && next_action === 'project') {
        console.log('client', object)
        context.commit('settings/setCurrentEditProjectCompanyClient', object, {
          root: true
        })
      }
      // @ts-ignore
      //BvModal.show(next_action + '-modal').modal()
    }
  },
  checkForRunningTimers(context) {
    let running_timer = context.rootState.timers.timers.find((timer: any) => {
      //console.log(timer.status);
      return timer.status === 'running'
    })

    //console.log(running_timer);
    context.commit('setCurrentRunningTimer', running_timer)
  },
  setCurrentEditInvoice(context, invoice) {
    context.commit('setCurrentEditInvoice', invoice)
  },
  setCurrentEditPayment(context, payment) {
    context.commit('setCurrentEditPayment', payment)
  },
  editProject(context, project) {
    // @ts-ignore
    //BvModal.show('project-modal')
  },
  loadCurrentCompanyUser(context, { user_id, company_id }) {
    let company_user = context.rootState.company_users.company_users.find(({ company_id: companyId, user_id: userId }: ICompanyUser) => companyId == company_id && userId == user_id)
    context.commit('setCurrentCompanyUser', company_user)
  },
  setCurrentCompany({ commit, dispatch, rootState }, company_id) {
    // @ts-ignore
    const company = this._vm.$http().put('/set-current-company/' + company_id, {}, function() {
      rootState.companies.companies.find((c: any) => {
        if (company_id == c.id) {
          commit('setCurrentCompany', company)
          dispatch('getData')
          return true
        }
      })
    })
  },
  setCurrentProject: (context, project) => {
    context.commit('setCurrentProject', project)
  }
}
