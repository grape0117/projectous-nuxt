import { ActionTree } from 'vuex'
import { IModuleState } from './types'
import { ITask } from '../tasks/types'
import { IRootState } from '@/store/types'

const company_user_id: number = 1

const UUID = () => {
  const date = new Date()
  return (
    date.getUTCFullYear() +
    '-' +
    date.getUTCMonth() +
    1 +
    '-' +
    date.getDate() +
    ' ' +
    date.getUTCHours() +
    ':' +
    date.getUTCMinutes() +
    ':' +
    date.getUTCSeconds() +
    ':' +
    date.getMilliseconds() +
    ' ' +
    Math.random()
  )
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
    const { task_user, task }: any = await this._vm
      .$http()
      .post('users/' + company_user_id + '/tasks', {
        list: list,
        sort_order: sort_order
      })

    commit('tasks/UPDATE', task)
    commit('task_users/UPDATE', task_user)
  },
  openModal: function() {},
  closedModal: function(context) {
    console.log('closedModal')
    console.log('check_action_stack', context.state.check_action_stack)
    console.log('action_stack', context.state.action_stack)
    if (context.state.check_action_stack) {
      var next_action = context.state.action_stack.pop()
      console.log('next_action', next_action)
      $('#' + next_action + '-modal').modal()
    }
    console.log('setting check to true')
    context.commit('setCheckActionStack', true)
  },
  closeModal: function(context, { modal, object, pop, push }) {
    //We want to manually open modal
    context.commit('setCheckActionStack', false)
    console.log('closing ' + modal)
    $('#' + modal + '-modal').modal('hide')

    if (push) {
      context.commit('pushActionStack', modal)
    }

    if (pop) {
      var next_action = context.state.action_stack.pop() //TODO: does this work properly?
      console.log(next_action)
      if (modal == 'client' && next_action == 'project') {
        console.log('client', object)
        context.commit('settings/setCurrentEditProjectCompanyClient', object, {
          root: true
        })
      }
      $('#' + next_action + '-modal').modal()
    }

    if (typeof callback == 'function') callback()
  },
  checkForRunningTimers: function(context) {
    var running_timer = context.rootState.timers.timers.find(function(timer) {
      //console.log(timer.status);
      return timer.status == 'running'
    })

    //console.log(running_timer);
    context.commit('setCurrentRunningTimer', running_timer)
  },
  setCurrentEditInvoice: function(context, invoice) {
    context.commit('setCurrentEditInvoice', invoice)
  },
  setCurrentEditPayment: function(context, payment) {
    context.commit('setCurrentEditPayment', payment)
  },
  editProject: function(context, project) {
    $('#project-modal').modal({})
  },
  loadCurrentCompany: function(context, company_id, store, whoknows) {
    var company = context.rootState.companies.companies.find(function(company) {
      return company.id == company_id
    })
    context.commit('setCurrentCompany', company)
  },
  loadCurrentCompanyUser: function(context, { user_id, company_id }) {
    var company = context.rootState.company_users.company_users.find(function(
      company_user
    ) {
      if (
        company_user.company_id == company_id &&
        company_user.user_id == user_id
      ) {
        return true
      }
    })

    context.commit('setCurrentCompanyUser', company)
  },
  setCurrentCompany: function(context, company_id) {
    ajax('/set-current-company/' + company_id, {}, function() {
      context.rootState.companies.companies.find(function(company) {
        if (company_id == company.id) {
          context.commit('setCurrentCompany', company)
          context.dispatch('getData')
          return true
        }
      })
    })
  },
  setCurrentProject: (context, project) => {
    context.commit('setCurrentProject', project)
  },
  setCurrentModuleSettings: function(context, payload) {
    console.log('Settings', payload)
    $.post('/set-current-modules', payload, function() {
      console.log('OkGreat!')
    })
    context.dispatch('getData')
    // context.commit('setCurrentModuleSettings')
  },
  setRemovableStatusOfCurrentEditUser: context => {
    var data = {
      user_id: context.state.current_edit_company_user.user_id,
      company_id: context.state.current_edit_company_user.company_id
    }
    console.log('Payload', data)
    if (data.user_id == context.state.current_user_id) {
      Vue.set(context.state, 'current_edit_company_user_removable', false)
    } else {
      $.get('number-timers-user', data, function(response) {
        Vue.set(
          context.state,
          'current_edit_company_user_removable',
          response[0] == 0
        )
      })
    }
  },
  getData: function(context) {
    var self = this
    $.get('/timers/getJson', function(response) {
      Vue.set(context.state, 'current_user_id', response.user_id) //This does not need to be in Vue because doesn't change for a given user
      Vue.set(context.state, 'modules', response.modules)
      //console.log(response.projects);
      context.commit('company_users/load', response.users, { root: true })
      context.commit('company_clients/load', response.company_clients, {
        root: true
      })
      context.commit('companies/load', response.my_companies, { root: true })

      context.dispatch(
        'settings/loadCurrentCompanyUser',
        { user_id: response.user_id, company_id: response.current_company_id },
        { root: true }
      )
      context.dispatch(
        'settings/loadCurrentCompany',
        response.current_company_id,
        { root: true }
      )
      //TODO:store.commit('company_users/setCurrentCompanyUserById', response.user_id);
      context.commit('tasks/load', response.tasks, { root: true })
      context.commit('projects/load', response.projects, { root: true })
      //TODO: store.commit('task_types/load', response.task_types);
      context.commit('timers/load', response.timers, { root: true })
      context.commit('timers/loadDepartments', response.departments, {
        root: true
      })
      context.commit('timers/loadSystems', response.systems, { root: true })
      context.commit('timers/loadActions', response.actions, { root: true })
      context.commit('notifications/load', response.notifications, {
        root: true
      })
      context.state.notes = response.notes

      context.dispatch('checkForRunningTimers', { root: true })
      //TODO: Vue.set(self.settings, 'sort_by', 'recent');
      EventBus.$emit('refresh')
    })
  },
  getNewData: function(context) {
    var self = this
    //return;
    $.get('/timers/getNewJson?last_seen_at=' + context.last_seen_at, function(
      response
    ) {
      if (response.items.length) {
        //alert('data was updated');
        console.log(response.items)
      }
      context.state.last_seen_at = new Date(response.last_seen_at)
      var update_type = 'upsert'
      response.items.forEach(function(item) {
        update_type = item.update_type ? item.update_type : 'upsert'
        switch (item.item_type) {
          case 'task_users':
            //console.log('tasks/task_user_'+update_type)
            context.commit('tasks/task_user_' + update_type, item.value, {
              root: true
            })
            break
          case 'timelog':
            console.log('timelog', item.value)
            context.commit('timers/upsert', item.value, { root: true })
            break
          case 'tasks':
            console.log('task', item.value)
            //if(context.state.tasks['project_'+task.item.value.id])
            context.commit('tasks/upsert_displayed_tasks', item.value, {
              root: true
            })
            context.commit(item.item_type + '/' + update_type, item.value, {
              root: true
            })
            break
          case 'notifications':
            console.log('notifications', item.value)
            context.commit('notifications/upsert', item.value, { root: true })
          default:
            console.log('default')
            context.commit(item.item_type + '/' + update_type, item.value, {
              root: true
            })
        }
      })
    })
  }
}
