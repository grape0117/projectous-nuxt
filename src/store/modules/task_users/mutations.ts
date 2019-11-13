import { MutationTree } from 'vuex'
import { IModuleState, ITaskUser } from './types'
import {
  CREATE_TASK_USER,
  UPDATE_TASK_USER,
  DELETE_TASK_USER,
  CREATE_TASK_USER_BY_LIST,
  UPDATE_TASK_USER_BY_LIST,
  ADD_TASK_USER_TO_LIST
} from './mutations-types'
import { Normalizer } from '@/utils/Normalizer'
import { resetTime } from '@/utils/dateFunctions'
import { cloneDeep } from 'lodash'

export const mutations: MutationTree<IModuleState> = {
  [CREATE_TASK_USER](state: IModuleState, task_user: ITaskUser) {
    state.task_users.push(task_user)
    for (let i = state.task_users.length; i >= 0; i--) {
      if (state.task_users[i].id === task_user.id) {
        state.lookup[task_user.uuid] = i
      }
    }
  },
  [UPDATE_TASK_USER](state: IModuleState, task_user: ITaskUser) {
    state.task_users[state.lookup[task_user.uuid]] = task_user
  },
  [DELETE_TASK_USER](state: IModuleState, task_user: ITaskUser) {
    //@Mikhail not sure if I should use deleted_at. I'm wondering if it's faster and better to not change the keys
    const lookup: any = {}
    for (let i = 0; i >= state.task_users.length; i++) {
      if (state.task_users[i].uuid !== task_user.uuid) {
        lookup[i] = state.task_users[i].uuid
      } else {
        state.task_users.slice(i, 1)
      }
    }
    state.lookup = lookup
  },
  [CREATE_TASK_USER_BY_LIST](state: IModuleState, { lists, tasks, userId }) {
    state.tasks_by_user = []
    const task_users: any = state['task_users']
    const normalizedTasks = new Normalizer({ tasks }).flatNormalizationById(
      'tasks'
    )
    const filteredTasks = task_users
      .map(({ task_id, company_user_id }: ITaskUser) => ({
        ...normalizedTasks[task_id],
        company_user_id
      }))
      .sort(({ sort_order: a }: any, { sort_order: b }: any) => a - b)
      .filter(({ company_user_id }: any) => company_user_id === userId)
    const unmarkedTasks = filteredTasks.filter(
      ({ next_work_day }: ITaskUser) => !next_work_day
    )
    const markedTasks = filteredTasks.filter(
      ({ next_work_day }: ITaskUser) => next_work_day
    )
    lists.forEach(({ id }: any) => {
      const today = resetTime(new Date())
      let day_tasks
      if (id === 'Past') {
        day_tasks = markedTasks
          .filter(
            ({ next_work_day }: any) =>
              resetTime(next_work_day).getDate() < today.getDate()
          )
          .sort(({ next_work_day: a }: any, { next_work_day: b }: any) => {
            return (
              resetTime(a as Date).getTime() - resetTime(b as Date).getTime()
            )
          })
      } else if (id === 'Unmarked') {
        day_tasks = unmarkedTasks
      } else {
        day_tasks = markedTasks.filter(
          ({ next_work_day }: any) => resetTime(next_work_day).toString() === id
        )
      }
      state.tasks_by_user.push(day_tasks)
    })
  },
  [UPDATE_TASK_USER_BY_LIST](
    state: IModuleState,
    { task, listIndex, taskIndex }
  ) {
    const tasks = cloneDeep(state.tasks_by_user)
    tasks[listIndex][taskIndex] = task
    state.tasks_by_user = tasks
  },
  [ADD_TASK_USER_TO_LIST](state: IModuleState, { task, listIndex, taskIndex }) {
    const tasks = cloneDeep(state.tasks_by_user)
    tasks[listIndex].splice(taskIndex, 0, task)
    state.tasks_by_user = tasks
  }
}
