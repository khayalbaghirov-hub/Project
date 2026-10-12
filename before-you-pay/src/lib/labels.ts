import type { Language, Procedure, Question, Status, Verdict } from './types'

export const PROCEDURES: { code: Procedure; label: string }[] = [
  { code: 'rhinoplasty', label: 'Rhinoplasty' },
  { code: 'eyelid', label: 'Eyelid surgery' },
  { code: 'facelift', label: 'Facelift / lifting' },
  { code: 'contouring', label: 'Facial contouring (jaw, cheekbone)' },
  { code: 'breast', label: 'Breast surgery' },
  { code: 'liposuction', label: 'Liposuction / body contouring' },
  { code: 'other', label: 'Other' },
]

export const procedureLabel = (code: Procedure) =>
  PROCEDURES.find((p) => p.code === code)?.label ?? code

// Fixed card order on the Brief (rule 7.15). `hint` feeds the sample report on the home screen.
export const QUESTIONS: { code: Question; title: string; hint: string }[] = [
  { code: 'who', title: 'Who is this doctor', hint: 'Licence and board registration' },
  { code: 'locals', title: 'What locals say', hint: 'Korean-language reviews and signals' },
  { code: 'cost', title: 'What it costs', hint: 'All-in price, in writing' },
  { code: 'fix', title: 'If it goes wrong', hint: 'Revision policy, in writing' },
]

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
  { code: 'zh', label: '中文' },
]

export const languageLabel = (code: Language) =>
  LANGUAGES.find((l) => l.code === code)?.label ?? code

export const VERDICTS: Record<Verdict | 'pending', { label: string; className: string }> = {
  verified: { label: 'Verified', className: 'bg-verified-soft text-verified' },
  not_verified: { label: 'Not verified', className: 'bg-sand text-ink-soft' },
  concern: { label: 'Concern', className: 'bg-red-50 text-red-700' },
  clinic_refused: { label: 'Clinic refused', className: 'bg-orange-50 text-orange-700' },
  pending: { label: 'Pending', className: 'bg-white text-ink-soft border border-dashed border-line' },
}

export const STATUSES: Record<Status, { label: string; className: string; dot: string }> = {
  submitted: { label: 'Submitted', className: 'bg-sand text-ink-soft', dot: 'bg-ink-soft/60' },
  in_progress: { label: 'In progress', className: 'bg-amber-50 text-amber-800', dot: 'bg-amber-500' },
  ready: { label: 'Ready', className: 'bg-verified-soft text-verified', dot: 'bg-verified' },
}
