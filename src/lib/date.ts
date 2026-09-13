import type { DateFilter } from '../types'

const DAY_MS = 86_400_000

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function startOfDay(timestamp: number): number {
  const date = new Date(timestamp)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

export function toDateTimeInputValue(timestamp: number | null): string {
  if (timestamp === null) return ''
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function fromDateTimeInputValue(value: string): number | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const hour = Number(match[4])
  const minute = Number(match[5])

  const time = new Date(year, month - 1, day, hour, minute, 0, 0).getTime()
  return Number.isNaN(time) ? null : time
}

export function formatDueDate(timestamp: number): string {
  const date = new Date(timestamp)
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`
  const diff = Math.round((startOfDay(timestamp) - startOfDay(Date.now())) / DAY_MS)

  if (diff === 0) return `今天 ${time}`
  if (diff === 1) return `明天 ${time}`
  if (diff === -1) return `昨天 ${time}`
  return `${date.getMonth() + 1}月${date.getDate()}日 ${time}`
}

export function isOverdue(timestamp: number): boolean {
  return timestamp < Date.now()
}

export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}月${date.getDate()}日 ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function isSameDay(a: number, b: number): boolean {
  const dateA = new Date(a)
  const dateB = new Date(b)
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  )
}

export function matchesDateFilter(
  dueDate: number | null,
  filter: DateFilter,
  completed: boolean,
  now: number = Date.now(),
): boolean {
  switch (filter) {
    case 'all':
      return true
    case 'none':
      return dueDate === null
    case 'today':
      return dueDate !== null && isSameDay(dueDate, now)
    case 'tomorrow':
      return dueDate !== null && isSameDay(dueDate, now + DAY_MS)
    case 'overdue':
      return dueDate !== null && !completed && dueDate < now
    case 'week': {
      if (dueDate === null) return false
      const start = startOfDay(now)
      return dueDate >= start && dueDate < start + 7 * DAY_MS
    }
  }
}
