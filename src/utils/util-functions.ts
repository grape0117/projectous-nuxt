import { Normalizer } from '@/utils/Normalizer'
import { ITaskUser } from '@/store/modules/task_users/types'
import { resetTime } from '@/utils/dateFunctions'

export function sortTaskUsersByDay(
  taskUsers: any,
  tasks: any,
  lists: any,
  userId: any
) {
  const normalizedTasks = new Normalizer({ tasks }).flatNormalizationById(
    'tasks'
  )
  const filteredTasks = taskUsers
    .map(({ task_id, company_user_id, next_work_day }: ITaskUser) => ({
      ...normalizedTasks[task_id],
      company_user_id,
      next_work_day
    }))
    .sort(({ sort_order: a }: any, { sort_order: b }: any) => a - b)
    .filter(({ company_user_id }: any) => company_user_id === userId)
  const unmarkedTasks = filteredTasks.filter(
    ({ next_work_day }: ITaskUser) => !next_work_day
  )
  const markedTasks = filteredTasks.filter(
    ({ next_work_day }: ITaskUser) => next_work_day
  )
  const days: any = []
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
          return resetTime(a as Date).getTime() - resetTime(b as Date).getTime()
        })
    } else if (id === 'Unmarked') {
      day_tasks = unmarkedTasks
    } else {
      day_tasks = markedTasks.filter(
        ({ next_work_day }: any) => resetTime(next_work_day).toString() === id
      )
    }
    days.push(day_tasks)
  })
  return days
}
