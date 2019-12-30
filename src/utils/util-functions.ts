import {
  getUserTaskListFormattedDate,
  setToMidnight,
  localDate
} from '@/utils/dateFunctions'
import { IList } from '@/store/modules/lists/types'

export function getListId(
  next_work_day: string | null,
  lists: any,
  listId: any = null
) {
  if (listId) return listId
  if (!next_work_day) return 'Unmarked'
  const today = setToMidnight(new Date())
  if (localDate(next_work_day).getTime() < today.getTime()) return 'Past'
  if (Date.parse(next_work_day)) {
    const list = lists.find(
      ({ id }: any) => localDate(next_work_day).toString() === id
    )
    return list ? list.id : 'Unmarked'
  }
}

export function createListsByDays(): IList[] {
  const lists: IList[] = []
  const today = setToMidnight(new Date())
  lists.push({
    id: 'Past',
    title: 'Outdated tasks',
    group: 'Past Tasks'
  })
  lists.push({
    id: today.toString(),
    title: getUserTaskListFormattedDate(today),
    group: 'Current Tasks'
  })
  for (let day = 1; day < 7; day++) {
    const date = setToMidnight(new Date())
    date.setDate(setToMidnight(new Date()).getDate() + day)
    lists.push({
      id: date.toString(),
      title: getUserTaskListFormattedDate(date),
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
  return lists.map(({ id, label: title, company_user_id: userId }: any) => {
    return {
      id,
      userId,
      title,
      group: 'User Lists'
    }
  })
}

export function generateUniqId(length: number) {
  return Math.floor(Math.random() * length)
}
