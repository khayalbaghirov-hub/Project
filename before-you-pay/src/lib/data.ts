import { supabase } from './supabase'
import type { BriefAnswer, CheckRequest, NewCheckInput, Question } from './types'

export type CheckListItem = CheckRequest & { brief_answers: { question: Question }[] }
export type CheckDetail = CheckRequest & { brief_answers: BriefAnswer[] }

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function fetchChecks(): Promise<CheckListItem[]> {
  const { data, error } = await supabase
    .from('check_requests')
    .select('*, brief_answers(question)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as CheckListItem[]
}

/** Returns null when the check does not exist (deleted, or a malformed id). */
export async function fetchCheck(id: string): Promise<CheckDetail | null> {
  if (!UUID_RE.test(id)) return null
  const { data, error } = await supabase
    .from('check_requests')
    .select('*, brief_answers(*)')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data as CheckDetail | null
}

export async function createCheck(input: NewCheckInput): Promise<void> {
  const { error } = await supabase.from('check_requests').insert(input)
  if (error) throw error
}

export async function deleteCheck(id: string): Promise<void> {
  const { error } = await supabase.from('check_requests').delete().eq('id', id)
  if (error) throw error
}
