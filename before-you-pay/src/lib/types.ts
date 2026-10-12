export type Procedure = 'rhinoplasty' | 'eyelid' | 'facelift' | 'contouring' | 'breast' | 'liposuction' | 'other'
export type Question = 'who' | 'locals' | 'cost' | 'fix'
export type Verdict = 'verified' | 'not_verified' | 'concern' | 'clinic_refused'
export type Language = 'en' | 'ru' | 'zh'
export type Status = 'submitted' | 'in_progress' | 'ready' // derived, never stored

export interface CheckRequest {
  id: string
  patient_name: string
  contact: string
  doctor_name: string
  clinic_name: string
  procedure: Procedure
  deposit_date: string // 'YYYY-MM-DD'
  brief_language: Language
  created_at: string
}

export interface BriefAnswer {
  id: string
  request_id: string
  question: Question
  verdict: Verdict
  summary: string
  source: string | null
  updated_at: string
}

export type NewCheckInput = Omit<CheckRequest, 'id' | 'created_at'>
