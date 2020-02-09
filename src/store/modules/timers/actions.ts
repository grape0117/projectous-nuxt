// @ts-ignore
import Vue from 'vue'
import { ActionTree } from 'vuex'
import { IModuleState, ITimer } from './types'
import { IRootState } from '@/store/types'

export const actions: ActionTree<IModuleState, IRootState> = {
  async restartTimer(context, timer) {
    // @ts-ignore
    const response = await this._vm
      .$http()
      .post('/timer/restart/' + timer.id, timer)
    context.commit('updateTimer', response.timer)
    context.dispatch(
      'projects/setCurrentProjectById',
      response.timer.project_id,
      { root: true }
    )
    response.timers.forEach(function(timer: any) {
      context.commit('upsertTimer', timer)
    })
  },
  async stopTimer(context, timer) {
    // @ts-ignore
    const response = await this._vm
      .$http()
      .post('/timer/stop/' + timer.id, timer)
    context.commit('updateTimer', response.timer)
  },
  async hideTimer(context, timer) {
    // @ts-ignore
    const response = await this._vm
      .$http()
      .post('/timer/hide/' + timer.id, timer)
    context.commit('updateTimer', response.timer)
  },
  async saveTimer(context, data) {
    // @ts-ignore
    const response = await this._vm.$http().post('/timer/save/ajax', data)
    context.commit('updateTimer', response.timer)
    Vue.set(
      context.rootState.settings,
      'timer_watch',
      context.rootState.settings.timer_watch + 1
    )
  },
  async startTimer(context, timer) {
    // @ts-ignore
    const response = await this._vm
      .$http()
      .post('/timer/start-project-timer', timer)
    context.commit('upsertTimer', response.timer)
    context.dispatch(
      'projects/setCurrentProjectById',
      response.timer.project_id,
      { root: true }
    )
    response.timers.forEach(function(timer: any) {
      context.commit('upsertTimer', timer)
    })
  },
  async addTimer(context, data) {
    if (!data)
      data = {
        current_company_id: context.rootState.settings.current_company.id,
        company_client_id: '',
        project_id: '',
        task_id: '',
        is_billable: 1,
        report_at: ''
      }

    // @ts-ignore
    const response = await this._vm.$http().post('/timer/save/ajax', data)
    context.commit('upsertTimer', response.timer)
    context.commit('settings/setCurrentEditTimer', response.timer, {
      root: true
    })
    //$('#timer-modal').modal();
  },
  async editTimer(context, timer) {
    if (
      !context.getters['settings/isAdmin'] &&
      (timer.is_paid || timer.invoice_id)
    ) {
      alert('This timer has already been processed. No changes can be made.')
    }
    //TODO: if reviewed, prevent access

    context.commit('settings/setCurrentEditTimer', timer, { root: true })

    const data = {
      timer_id: timer.id,
      user_id: timer.user_id,
      project_id: timer.project_id
    }
    // @ts-ignore
    const response = await this._vm.$http().get('timer/timelog-history', data)
    context.commit('settings/setCurrentEditTimerHistory', response[0], {
      root: true
    })
    //$('#timer-modal').modal({});
  },
  async stopTaskTimer(context, task) {
    // @ts-ignore
    const response = await this._vm.$http().post('/timer/stop-task-timer', {
      project_id: task.project_id,
      task_id: task.task_id
    })
    context.commit('stopTimer', response.timer)
  },
  async restartTaskTimer(context, task) {
    // @ts-ignore
    const response = await this._vm.$http().post('/timer/start', {
      project_id: task.project_id,
      task_id: task.task_id
    })
    context.commit('startTimer', response.timer)
  },
  async deleteTimer(context, timer_id) {
    // @ts-ignore
    const response = await this._vm
      .$http()
      .post('/timer/delete/' + timer_id, {})
    context.commit('deleteTimer', timer_id)
    //$('#timer-modal').modal('hide');
  }
}
