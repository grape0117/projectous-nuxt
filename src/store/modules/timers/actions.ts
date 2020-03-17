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
    context.commit(
      'UPDATE',
      { module: 'timers', entity: response.timer },
      { root: true }
    )
    /*    context.dispatch(
      'projects/setCurrentProjectById',
      response.timer.project_id,
      { root: true }
    )*/
    response.timers.forEach(function(timerFromResponse: any) {
      context.commit(
        'UPSERT',
        { module: 'timers', entity: timerFromResponse },
        { root: true }
      )
    })
  },
  async stopTimer(context, timer) {
    // @ts-ignore
    const response = await this._vm
      .$http()
      .post('/timer/stop/' + timer.id, timer)
    context.commit(
      'UPDATE',
      { module: 'timers', entity: response.timer },
      { root: true }
    )
  },
  async pauseTimer(context, timer) {
    // @ts-ignore
    const response = await this._vm
      .$http()
      .post('/timer/pause/' + timer.id, timer)
    context.commit(
      'UPDATE',
      { module: 'timers', entity: response.timer },
      { root: true }
    )
  },
  async hideTimer(context, timer) {
    // @ts-ignore
    const response = await this._vm
      .$http()
      .post('/timer/hide/' + timer.id, timer)
    context.commit(
      'UPDATE',
      { module: 'timers', entity: response.timer },
      { root: true }
    )
  },

  async saveTimer(context, timer) {
    // @ts-ignore
    const response = await this._vm
      .$http()
      .post('/timer/save/' + timer.id, timer)
    context.commit(
      'UPSERT',
      { module: 'timers', entity: response.timer },
      { root: true }
    )
  },
  async startTimer(context, timer) {
    // @ts-ignore
    const response = await this._vm
      .$http()
      .post('/timer/start-project-timer', timer)
    //console.log(response.timer)
    context.commit(
      'UPSERT',
      { module: 'timers', entity: response.timer },
      { root: true }
    )
    //TODO:?
    /*context.dispatch(
      'projects/setCurrentProjectById',
      response.timer.project_id,
      { root: true }
    )*/
    response.timers.forEach(function(timer: any) {
      context.commit(
        'UPSERT',
        { module: 'timers', entity: timer },
        { root: true }
      )
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
    context.commit(
      'UPSERT',
      { module: 'timers', entity: response.timer },
      { root: true }
    )
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

    //alert('setting timer')

    context.commit('settings/setCurrentEditTimer', timer, { root: true })

    /*const data = {
      timer_id: timer.id,
      user_id: timer.user_id,
      project_id: timer.project_id
    }
    // @ts-ignore
    const response = await this._vm.$http().get('timer/timelog-history', data)
    context.commit('settings/setCurrentEditTimerHistory', response[0], {
      root: true
    })*/
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
  async deleteTimer(context, timer) {
    // @ts-ignore
    const response = await this._vm
      .$http()
      .post('/timer/delete/' + timer.id, {})
    context.commit(
      'DELETE',
      { module: 'timers', entity: timer },
      { root: true }
    )
    //$('#timer-modal').modal('hide');
  }
}
