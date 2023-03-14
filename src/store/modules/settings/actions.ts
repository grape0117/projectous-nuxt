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
    const { task_user, task }: any = await this._vm.$http().post('/users/' + company_user_id + '/tasks', {
      list: list,
      sort_order: sort_order
    })

    commit('tasks/UPDATE', task)
    commit('task_users/UPDATE', task_user)
  },
  openModal(context, modal) {
    // @ts-ignore
    // @ts-ignore
    window.$_app.$bvModal.show(modal + '-modal')
  },
  /**
   * When opening a modal from another modal we need to turn off the modal_stack system,
   * add the current modal into the stack, hide the current modal (which calls closedModal without effect),
   * and open the desired modal.
   * TODO: Any data can be passed between the modals as needed with some modification to this action.
   * Data could also be passed from the originating modal component.
   * @param context
   * @param {any} currentModal
   * @param {any} newModal
   */
  openModalFromModal(context, { currentModal, nextModal }) {
    //1. Make sure the modal we want will open, not something from the stack
    context.state.check_modal_stack = false

    //2. Add the current modal to the stack so it comes back when the next modal is closed.
    context.state.modal_stack.push(currentModal)

    //3. Close the current modal. This will cause closedModal action to fire, but it should not do anything.
    // @ts-ignore
    window.$_app.$bvModal.hide(currentModal)

    //4. Open the next modal
    // @ts-ignore
    window.$_app.$bvModal.show(nextModal)
  },
  /**
   * This action fires when a bootstrap modal closes. If permitted (check_modal_stack === true),
   * it checks to see if another modal should be displayed and displays that modal. This will
   * typically happen when a user open a modal from another modal and dismisses it. The original modal
   * will be displayed again.
   *
   * @param context
   */
  closedModal(context) {
    if (context.state.check_modal_stack) {
      let next_modal = context.state.modal_stack.pop()
      // @ts-ignore
      window.$_app.$bvModal.show(next_modal + '-modal')
    }
    context.commit('setCheckModalStack', true)
  },
  /**
   * This is used when we need to insert values into the next modal in the stack
   * instead of just letting the closedModal event fire.
   * Setting check_modal_stack to false will prevent the closedModal action
   * from opening the next modal without the data from the other modal.
   * @param context
   * @param {string} modal
   * @param {any} entity
   * @param {boolean} pop
   * @param {boolean} push
   */
  closeModal(context, { modal, entity, pop, push }) {
    //1. We want to make sure we are manually opening the next modal in the stack
    context.commit('setCheckModalStack', false)

    //2. Hide the current modal
    // @ts-ignore
    window.$_app.$bvModal.hide(modal + '-modal')

    //3. Optionally add current modal to stack TODO: should this be after the pop?
    if (push) {
      context.commit('pushModalStack', modal)
    }

    //4. Get the next modal with relevant data if needed from closing modal TODO: why not always pop if something exists in the stack?
    if (true || pop) {
      let next_modal = context.state.modal_stack.pop() //TODO: does this work properly?
      if (modal === 'client' && next_modal === 'project') {
        context.commit('settings/setCurrentEditProjectClient', entity, {
          root: true
        })
      }

      //5. Open the next modal
      // @ts-ignore
      window.$_app.$bvModal.show(next_modal + '-modal').modal()
    }
  },
  checkForRunningTimers(context) {
    let running_timer = context.rootState.timers.timers.find((timer: any) => {
      return timer.status === 'running'
    })

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
    // this.bvModal.show('project-modal')
    window.$_app.$bvModal.show('project-modal')
  },
  loadCurrentCompanyUser(context, { user_id, company_id }) {
    let company_user = context.rootState.company_users.company_users.find(({ company_id: companyId, user_id: userId }: ICompanyUser) => companyId == company_id && userId == user_id)
    context.commit('setCurrentCompanyUser', company_user)
  },
  async setCurrentCompany({ commit, dispatch, rootState }, company_id) {
    // @ts-ignore
    const company = await this._vm.$http().post('/set-current-company/' + company_id, {}, function() {
      rootState.companies.companies.find((c: any) => {
        if (company_id == c.id) {
          commit('setCurrentCompany', company)
          dispatch('getData')
          return true
        }
      })
    })
  },
  setCurrentCompanyId(context, company_id) {
    context.commit('setCurrentCompanyId', company_id)
  },
  setCurrentProject: (context, project) => {
    context.commit('setCurrentProject', project)
  },
  setUnreadMessageNum: (context, unread_messages_num) => {
    context.commit('setUnreadMessageNum', unread_messages_num)
  },
  increaseUnreadMessageNum: context => {
    context.commit('increaseUnreadMessageNum')
  }
}
