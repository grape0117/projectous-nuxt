import { getUserFriendlyDate, resetTime } from '@/utils/dateFunctions'
import { IList } from '@/store/modules/lists/types'

export function getListId(
  next_work_day: Date | string | null,
  lists: any,
  listId: any = null
) {
  if (listId) return listId
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

export function createListsByDays(): IList[] {
  const lists: IList[] = []
  const today = resetTime(new Date())
  lists.push({
    id: 'Past',
    title: 'Outdated tasks',
    group: 'Past Tasks'
  })
  lists.push({
    id: today.toString(),
    title: getUserFriendlyDate(today),
    group: 'Current Tasks'
  })
  for (let day = 1; day < 7; day++) {
    const date = resetTime(new Date())
    date.setDate(resetTime(new Date()).getDate() + day)
    lists.push({
      id: date.toString(),
      title: getUserFriendlyDate(date),
      group: 'Current Tasks'
    })
  }
  lists.push({
    id: 'Unmarked',
    title: 'Unmarked',
    group: 'Unsorted'
  })
  return lists
}

export function createUserLists(lists: any) {
  return lists.map(({ id, label: title }: any) => {
    return {
      id,
      title,
      group: 'User Lists'
    }
  })
}
