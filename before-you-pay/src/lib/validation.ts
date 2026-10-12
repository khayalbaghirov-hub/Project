import { isDepositInPast } from './rules'

export interface FormValues {
  patient_name: string
  contact: string
  doctor_name: string
  clinic_name: string
  procedure: string
  deposit_date: string
  brief_language: string
}

export type FormErrors = Partial<Record<keyof FormValues, string>>

function lengthError(value: string, min: number, max: number, field: string): string | undefined {
  const n = value.trim().length
  if (n === 0) return `${field} is required`
  if (n < min) return `${field} needs at least ${min} characters`
  if (n > max) return `${field} can be at most ${max} characters`
  return undefined
}

export function validate(v: FormValues, today: string): FormErrors {
  const e: FormErrors = {
    patient_name: lengthError(v.patient_name, 1, 80, 'Your name'),
    contact: lengthError(v.contact, 3, 120, 'Contact'),
    doctor_name: lengthError(v.doctor_name, 1, 120, "Doctor's name"),
    clinic_name: lengthError(v.clinic_name, 1, 120, 'Clinic name'),
    procedure: v.procedure ? undefined : 'Choose a procedure',
    deposit_date: !v.deposit_date
      ? 'Deposit date is required'
      : isDepositInPast(v.deposit_date, today)
        ? 'Deposit date cannot be in the past'
        : undefined,
    brief_language: v.brief_language ? undefined : 'Choose a language',
  }
  for (const k of Object.keys(e) as (keyof FormValues)[]) if (!e[k]) delete e[k]
  return e
}
