export const setToMidnight = (date: Date) => {
  date.setHours(0)
  date.setMinutes(0)
  date.setSeconds(0)
  date.setMilliseconds(0)
  return date
}

/*
Use this anytime you want to create a Date object from a mysql Date format '2020-12-10' so it doesn't create a UTC-relative local time
 */
export const localDate = (date: string) => {
  console.log(date)
  return new Date(date + ' 00:00')
}

export const getUserTaskListFormattedDate = (date: Date) => {
  const today = setToMidnight(new Date())
  const tomorrow = setToMidnight(new Date())
  tomorrow.setDate(setToMidnight(new Date()).getDate() + 1)
  if (date.toString() === today.toString()) return 'Today'
  else if (date.toString() === tomorrow.toString()) return 'Tomorrow'
  else {
    const weekDay = date.toLocaleString('en-us', {
      weekday: 'short'
    })
    const day = date.getDate()
    const month = date.toLocaleString('en-us', { month: 'short' })
    return `${weekDay} ${day}`
  }
}

export const formatDateToYYYY_MM_DD = (datetime: string) => {
  const date = new Date(datetime)
  const year = date.getFullYear()
  const month = ('00' + (date.getMonth() + 1).toString()).slice(-2)
  const day = ('00' + date.getDate().toString()).slice(-2)
  return `${year}-${month}-${day}`
}
