import { getUserTaskListFormattedDate, setToMidnight, localDate } from '@/utils/dateFunctions'
import { IList } from '@/store/modules/lists/types'

export function getListId(next_work_day: string | null, lists: any, listId: any = null) {
  if (listId) return listId
  if (!next_work_day) return 'Unmarked'
  const today = setToMidnight(new Date())
  if (localDate(next_work_day).getTime() < today.getTime()) return 'Past'
  if (Date.parse(next_work_day)) {
    const list = lists.find(({ id }: any) => localDate(next_work_day).toString() === id)
    return list ? list.id : 'Unmarked'
  }
}

export function createListsByDays(): IList[] {
  const lists: IList[] = []
  const today = setToMidnight(new Date())
  lists.push({
    id: 'Unmarked',
    title: 'Unmarked',
    group: 'Past Tasks'
  })
  lists.push({
    id: 'Past',
    title: 'Older',
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
  return lists
}

export function createUserLists(lists: any) {
  return lists.map((list: any) => {
    return {
      id: list.id,
      company_user_id: list.userId || list.company_user_id,
      title: list.title,
      group: 'User Lists'
    }
  })
}

export function generateUniqId(length: number) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export function generateUUID(): string {
  const date = new Date()
  return date.getUTCFullYear() + '-' + date.getUTCMonth() + 1 + '-' + date.getDate() + ' ' + date.getUTCHours() + ':' + date.getUTCMinutes() + ':' + date.getUTCSeconds() + ':' + date.getMilliseconds() + ' ' + Math.random()
}

export function format_report_at(due_date: string) {
  let options = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }
  // @ts-ignore
  let formatted_date = due_date.toLocaleString('en-US', options)
  //return moment(due_date).utc().format('MMM Do, h:mm a');
  return formatted_date
}

export function datetimeToJS(datetime: string) {
  if (!datetime) {
    return 0
  }
  // Split timestamp into [ Y, M, D, h, m, s ]
  let t = datetime.split(/[- :]/)

  // @ts-ignore Apply each element to the Date function
  return new Date(Date.UTC(t[0], t[1] - 1, t[2], t[3], t[4], t[5]))
}

export function getCookie(name: string) {
  let v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)')
  return v ? v[2] : null
}

export function abbrName(name: string) {
  if (!name) return ''
  let matches = name.match(/\b(\w)/g) // ['J','S','O','N']
  if (matches) {
    let acronym = matches.join('') // JSON
    return acronym.toUpperCase()
  }
}

export function timeToDecimal(hour: any, min: any) {
  const dec = (min / 6) * 10

  return parseFloat(parseInt(hour, 10) + '.' + (dec < 10 ? '0' : '') + dec)
}

export function totalToDecimal(type: string, data: any) {
  let updated_value: any
  if (type === 'time') {
    updated_value = formatTime(data)
  } else if (type === 'earned') {
    updated_value = Math.trunc(data * 100) / 100
  } else if (type === 'unbilled') {
    updated_value = Math.trunc(data * 100) / 100
    return updated_value
  } else if (type === 'unpaid') {
    updated_value = Math.trunc(data * 100) / 100
  } else if (type === 'total') {
    updated_value = Math.trunc(data * 100) / 100
  }
  return updated_value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export function formatTime(duration: any) {
  let temp_hours: any = Math.trunc(duration / 3600)
  if (temp_hours < 10) {
    temp_hours = `0${temp_hours}`
  }
  let hours = `${temp_hours}:${('00' + Math.trunc((duration % 3600) / 60)).slice(-2)}`
  let decimal = timeToDecimal(Math.trunc(duration / 3600), Math.trunc((duration % 3600) / 60))
  return `${hours} (${decimal})`
}

export function applyTheme() {
  let bgStyle = getCookie('bg-style')
  if (bgStyle) {
    try {
      let style = JSON.parse(bgStyle)
      bgStyle = `background-color:${style}`
    } catch (error) {
      bgStyle = `background-color:${bgStyle}`
    }
  } else {
    const style_color = 'rgba(255, 165, 0, 0.6)'
    bgStyle = `background-color:${style_color}`
  }

  return bgStyle
}
