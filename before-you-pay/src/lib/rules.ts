import type { Status } from './types'

const DAY_MS = 24 * 60 * 60 * 1000
export const BRIEF_HOURS = 72

/** Device-local date as 'YYYY-MM-DD'. Never use toISOString() for this (rule 7.1). */
export function toLocalDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Whole calendar days from one date key to another. DST-safe: compares dates, not clocks. */
export function daysBetween(fromKey: string, toKey: string): number {
  const [fy, fm, fd] = fromKey.split('-').map(Number)
  const [ty, tm, td] = toKey.split('-').map(Number)
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / DAY_MS)
}

/** Rule 7.3: status comes from the number of answer rows. */
export function deriveStatus(answerCount: number): Status {
  if (answerCount >= 4) return 'ready'
  if (answerCount > 0) return 'in_progress'
  return 'submitted'
}

/** Rule 7.4: due time is created_at + 72 hours. */
export function dueAt(createdAt: string): Date {
  return new Date(Date.parse(createdAt) + BRIEF_HOURS * 60 * 60 * 1000)
}

/** Rule 7.5: overdue when past due and not Ready. */
export function isOverdue(createdAt: string, answerCount: number, now: Date): boolean {
  return now.getTime() > dueAt(createdAt).getTime() && deriveStatus(answerCount) !== 'ready'
}

/** Rule 7.6, saved request: the local date of the due time is later than the deposit date. */
export function dueAfterDeposit(createdAt: string, depositDate: string): boolean {
  return toLocalDateKey(dueAt(createdAt)) > depositDate
}

/** Rule 7.6, form: deposit date is fewer than 3 calendar days from local today. */
export function isDepositSoon(depositDate: string, today: string): boolean {
  const days = daysBetween(today, depositDate)
  return days >= 0 && days < 3
}

/** Rule 7.7: deposit date must be today or later at submission. */
export function isDepositInPast(depositDate: string, today: string): boolean {
  return depositDate < today
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "Wed 14 Oct, 16:30" in device local time. */
export function formatDue(d: Date): string {
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}, ${hh}:${mm}`
}

/** '2026-10-13' -> "13 Oct 2026". */
export function formatDateKey(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}
