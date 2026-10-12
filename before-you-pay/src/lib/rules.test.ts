// Run every test as a device in Almaty (UTC+5), where UTC and local dates differ at night.
;(globalThis as unknown as { process: { env: Record<string, string> } }).process.env.TZ = 'Asia/Almaty'

import { describe, expect, it } from 'vitest'
import {
  daysBetween,
  deriveStatus,
  dueAfterDeposit,
  formatDue,
  isDepositInPast,
  isDepositSoon,
  isOverdue,
  toLocalDateKey,
} from './rules'
import { validate, type FormValues } from './validation'

const HOUR = 60 * 60 * 1000

describe('toLocalDateKey (rule 7.1)', () => {
  it('uses the local date, not UTC (AC-2.9: 01:00 on 13 Oct in Almaty)', () => {
    const d = new Date('2026-10-12T20:00:00Z') // 01:00 on 13 Oct in UTC+5
    expect(d.toISOString().slice(0, 10)).toBe('2026-10-12') // the bug we avoid
    expect(toLocalDateKey(d)).toBe('2026-10-13')
  })
})

describe('daysBetween', () => {
  it('counts across a month end', () => {
    expect(daysBetween('2026-10-30', '2026-11-02')).toBe(3)
  })
  it('is negative for past dates', () => {
    expect(daysBetween('2026-10-12', '2026-10-11')).toBe(-1)
  })
})

describe('deriveStatus (rule 7.3)', () => {
  it.each([
    [0, 'submitted'],
    [1, 'in_progress'],
    [3, 'in_progress'],
    [4, 'ready'],
  ])('%i answers -> %s', (n, status) => {
    expect(deriveStatus(n)).toBe(status)
  })
})

describe('isOverdue (rule 7.5)', () => {
  const now = new Date('2026-10-12T12:00:00Z')
  const hoursAgo = (h: number) => new Date(now.getTime() - h * HOUR).toISOString()

  it('is overdue after 72h with 3 answers (AC-1.4)', () => {
    expect(isOverdue(hoursAgo(80), 3, now)).toBe(true)
  })
  it('is not overdue once Ready, even after 72h', () => {
    expect(isOverdue(hoursAgo(80), 4, now)).toBe(false)
  })
  it('is not overdue before 72h', () => {
    expect(isOverdue(hoursAgo(20), 0, now)).toBe(false)
  })
})

describe('dueAfterDeposit (rule 7.6, saved request)', () => {
  // Created 10:00 on 12 Oct local, so due 10:00 on 15 Oct local
  const created = '2026-10-12T05:00:00Z'
  it('warns when the due date is after the deposit date (AC-1.5)', () => {
    expect(dueAfterDeposit(created, '2026-10-14')).toBe(true)
  })
  it('does not warn when due on the deposit date', () => {
    expect(dueAfterDeposit(created, '2026-10-15')).toBe(false)
  })
  it('compares local dates: due 20:00 UTC is already the next day in Almaty', () => {
    // due at 2026-10-15T20:00Z = 01:00 on 16 Oct in Almaty
    expect(dueAfterDeposit('2026-10-12T20:00:00Z', '2026-10-15')).toBe(true)
  })
})

describe('deposit date rules on the form (rules 7.6, 7.7)', () => {
  const today = '2026-10-12'
  it('warns for today, tomorrow and the day after (AC-2.3)', () => {
    expect(isDepositSoon('2026-10-12', today)).toBe(true)
    expect(isDepositSoon('2026-10-13', today)).toBe(true)
    expect(isDepositSoon('2026-10-14', today)).toBe(true)
  })
  it('does not warn from 3 days out', () => {
    expect(isDepositSoon('2026-10-15', today)).toBe(false)
  })
  it('rejects past dates (AC-2.2)', () => {
    expect(isDepositInPast('2026-10-11', today)).toBe(true)
    expect(isDepositInPast('2026-10-12', today)).toBe(false)
  })
})

describe('formatDue', () => {
  it('formats in local time', () => {
    expect(formatDue(new Date('2026-10-14T11:30:00Z'))).toBe('Wed 14 Oct, 16:30')
  })
})

describe('validate (New check form)', () => {
  const valid: FormValues = {
    patient_name: 'Aigerim',
    contact: '@aigerim',
    doctor_name: '김민수',
    clinic_name: 'Seoul Line Clinic',
    procedure: 'rhinoplasty',
    deposit_date: '2026-10-20',
    brief_language: 'en',
  }
  it('accepts a Hangul doctor name (AC-2.8)', () => {
    expect(validate(valid, '2026-10-12')).toEqual({})
  })
  it('rejects blank and whitespace-only names (AC-2.1)', () => {
    expect(validate({ ...valid, patient_name: '   ' }, '2026-10-12').patient_name).toBe('Your name is required')
  })
  it('rejects a contact under 3 characters', () => {
    expect(validate({ ...valid, contact: 'ab' }, '2026-10-12').contact).toBeDefined()
  })
  it('rejects a past deposit date (AC-2.2)', () => {
    expect(validate({ ...valid, deposit_date: '2026-10-11' }, '2026-10-12').deposit_date).toBe(
      'Deposit date cannot be in the past',
    )
  })
})
