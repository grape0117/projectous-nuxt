import { GetterTree } from 'vuex'
import { IRootState } from '@/store/types'
import { IModuleState } from './types'

export const getters: GetterTree<IModuleState, IRootState> = {
  runningTimers: (state: IModuleState) => {
    return state.timers.filter(function(timer) {
      return timer.status == 'running'
    })
  },
  myTodayTimers: (state: IModuleState, _getters, rootState: IRootState) => {
    let midnight = new Date()
    midnight.setHours(0, 0, 0, 0)
    console.log(rootState.settings.current_company_user_id)

    return state.timers.filter(function(timer) {
      return new Date(timer.report_at) >= midnight
      if (new Date(timer.report_at) < midnight) {
        return false
      }

      return timer.company_user_id == rootState.settings.current_company_user_id
    })
  }
}
