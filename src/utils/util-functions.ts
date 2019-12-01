import { getUserFriendlyDate, resetTime } from '@/utils/dateFunctions'
import { IList } from '@/store/modules/lists/types'
import store from '@/store'

function getListId(next_work_day: Date | string | null, lists: any) {
  if (!next_work_day) return 'Unmarked'
  const today = resetTime(new Date())
  if (resetTime(next_work_day as Date).getTime() < today.getTime())
    return 'Past'
  if (Date.parse(next_work_day as string)) {
    const list = lists.find(
      ({ id }: any) => resetTime(next_work_day as Date).toString() === id
    )
    return list ? list.id : 'Unmarked'
  }
}

export function sortUserTasksByDay(tasks: any, lists: any) {
  const { tasks: allTasks, lookup } = store.state.tasks
  const today = resetTime(new Date())
  return tasks
    .map(({ id, task_id, company_user_id, next_work_day }: any) => ({
      id,
      task_id,
      title: allTasks[lookup[task_id]].title,
      company_user_id,
      next_work_day,
      listId: !next_work_day
        ? 'Unmarked'
        : resetTime(next_work_day).getTime() < today.getTime()
        ? 'Past'
        : getListId(next_work_day, lists)
    }))
    .sort(({ sort_order: a }: any, { sort_order: b }: any) => a - b)
}

export function createListsByDays(): IList[] {
  const lists: IList[] = []
  const today = resetTime(new Date())
  lists.push({
    id: 'Past',
    title: 'Outdated tasks'
  })
  lists.push({
    id: today.toString(),
    title: getUserFriendlyDate(today)
  })
  for (let day = 1; day < 7; day++) {
    const date = resetTime(new Date())
    date.setDate(resetTime(new Date()).getDate() + day)
    lists.push({
      id: date.toString(),
      title: getUserFriendlyDate(date)
    })
  }
  lists.push({
    id: 'Unmarked',
    title: 'Unmarked'
  })
  return lists
}
