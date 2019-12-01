export const resetTime = (date: Date) => {
  const day = new Date(date)
  day.setHours(0)
  day.setMinutes(0)
  day.setSeconds(0)
  return day
}

export const getUserFriendlyDate = (datetime: Date) => {
  const day = resetTime(new Date(datetime))
  const today = resetTime(new Date())
  const tomorrow = resetTime(new Date())
  tomorrow.setDate(resetTime(new Date()).getDate() + 1)
  if (day.toString() === today.toString()) return 'Today'
  else if (day.toString() === tomorrow.toString()) return 'Tomorrow'
  else {
    const weekDay = new Date(datetime).toLocaleString('en-us', {
      weekday: 'long'
    })
    const date = day.getDate()
    const month = new Date(datetime).toLocaleString('en-us', { month: 'short' })
    return `${weekDay}, ${date} ${month}`
  }
}

export const formatDateToYYYY_MM_DD = (datetime: Date) => {
  const date = new Date(datetime)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDay() + 1
  return `${year}-${month}-${day < 10 ? `0${day}` : day}`
}
