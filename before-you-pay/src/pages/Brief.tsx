import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Info, ShieldCheck } from '@phosphor-icons/react'
import { deleteCheck, fetchCheck, type CheckDetail } from '../lib/data'
import { useLiveChanges, useNow } from '../lib/hooks'
import { languageLabel, procedureLabel, QUESTIONS } from '../lib/labels'
import { deriveStatus, dueAfterDeposit, dueAt, formatDateKey, formatDue, isOverdue } from '../lib/rules'
import type { BriefAnswer, Question } from '../lib/types'
import {
  Banner,
  DepositWarning,
  ErrorBlock,
  OverdueChip,
  Page,
  primaryButton,
  Skeleton,
  Spinner,
  StatusChip,
  SiteHeader,
  Eyebrow,
  ConceptNote,
  VerdictBadge,
} from '../components/ui'

type State =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'not_found' }
  | { kind: 'ready'; check: CheckDetail }

export default function Brief() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const now = useNow()
  const [state, setState] = useState<State>({ kind: 'loading' })
  const [flashing, setFlashing] = useState<Set<Question>>(new Set())
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(false)
  const seen = useRef<Map<Question, string> | null>(null)

  const load = useCallback(
    async (showLoading: boolean) => {
      if (showLoading) setState({ kind: 'loading' })
      try {
        const check = await fetchCheck(id)
        if (!check) {
          setState({ kind: 'not_found' })
          return
        }
        // Highlight answers that are new or edited since the last fetch (not on first load).
        const next = new Map(check.brief_answers.map((a) => [a.question, a.updated_at]))
        if (seen.current) {
          const changed = new Set<Question>()
          next.forEach((updated, q) => {
            if (seen.current!.get(q) !== updated) changed.add(q)
          })
          if (changed.size) setFlashing(changed)
        }
        seen.current = next
        setState({ kind: 'ready', check })
      } catch {
        setState((s) => (showLoading || s.kind !== 'ready' ? { kind: 'error' } : s))
      }
    },
    [id],
  )

  useEffect(() => {
    seen.current = null
    load(true)
  }, [load])
  useLiveChanges(`brief-${id}`, () => load(false))

  useEffect(() => {
    if (!flashing.size) return
    const t = window.setTimeout(() => setFlashing(new Set()), 2500)
    return () => window.clearTimeout(t)
  }, [flashing])

  async function confirmDelete() {
    setDeleting(true)
    try {
      await deleteCheck(id)
      navigate('/')
    } catch {
      setDeleting(false)
      setConfirming(false)
      setDeleteError(true)
    }
  }

  if (state.kind === 'loading') {
    return (
      <Page>
        <SiteHeader back="/" />
        <div aria-busy="true" aria-label="Loading brief">
          <Skeleton className="mt-2 h-7 w-3/4" />
          <Skeleton className="mt-2 h-5 w-1/2" />
          <Skeleton className="mt-4 h-6 w-48" />
          <div className="mt-8 space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>
        </div>
      </Page>
    )
  }

  if (state.kind === 'error') {
    return (
      <Page>
        <SiteHeader back="/" />
        <ErrorBlock message="Could not load this brief." onRetry={() => load(true)} />
      </Page>
    )
  }

  if (state.kind === 'not_found') {
    return (
      <Page>
        <SiteHeader back="/" />
        <div className="rise mt-6 rounded-lg border border-line bg-white p-6">
          <p className="text-[15px] font-medium text-ink">This check no longer exists.</p>
          <Link to="/" className={`${primaryButton} mt-5`}>
            Back to my checks
          </Link>
        </div>
      </Page>
    )
  }

  const { check } = state
  const answerCount = check.brief_answers.length
  const status = deriveStatus(answerCount)
  const overdue = isOverdue(check.created_at, answerCount, now)
  const byQuestion = new Map<Question, BriefAnswer>(check.brief_answers.map((a) => [a.question, a]))

  return (
    <Page>
      <SiteHeader back="/" />

      <header className="rise pt-8">
        <Eyebrow>
          <ShieldCheck size={13} weight="bold" aria-hidden />
          Before You Pay brief
        </Eyebrow>
        <h1 className="mt-[18px] text-[28px] leading-[1.15] font-bold tracking-[-0.02em] text-ink">{check.doctor_name}</h1>
        <p className="mt-1.5 text-[15px] text-ink-soft">{check.clinic_name}</p>
        <p className="mt-3 text-[13px] text-ink-soft">
          {procedureLabel(check.procedure)} <span className="px-1 text-line">/</span> Brief in{' '}
          {languageLabel(check.brief_language)}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
          <StatusChip status={status} />
          {overdue ? (
            <OverdueChip />
          ) : (
            status !== 'ready' && (
              <span className="text-xs text-ink-soft tabular-nums">Due by {formatDue(dueAt(check.created_at))}</span>
            )
          )}
        </div>

        <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 border-t border-line pt-4 text-[13px]">
          <dt className="text-ink-soft">Deposit date</dt>
          <dd className="text-ink tabular-nums">{formatDateKey(check.deposit_date)}</dd>
          <dt className="text-ink-soft">Progress</dt>
          <dd className="text-ink tabular-nums">
            {answerCount} of 4 answers ready
          </dd>
        </dl>
        {status !== 'ready' && dueAfterDeposit(check.created_at, check.deposit_date) && (
          <div className="mt-3">
            <DepositWarning />
          </div>
        )}
      </header>

      {deleteError && (
        <div className="mt-5">
          <Banner onClose={() => setDeleteError(false)}>Could not delete. Try again.</Banner>
        </div>
      )}

      <ol className="mt-7 space-y-3">
        {QUESTIONS.map((q, i) => {
          const a = byQuestion.get(q.code)
          return (
            <li
              key={q.code}
              className={`rise relative rounded-lg border bg-white p-4 ${
                a ? 'border-line' : 'border-dashed border-line'
              } ${flashing.has(q.code) ? 'flash' : ''}`}
              style={{ '--i': i + 1 } as CSSProperties}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span
                    className={`grid size-[30px] shrink-0 place-items-center rounded-lg text-[12px] font-semibold tabular-nums ${
                      a ? 'bg-sand text-ink' : 'border border-dashed border-line text-ink-soft'
                    }`}
                  >
                    0{i + 1}
                  </span>
                  <div>
                    <h2 className="text-[15px] leading-tight font-semibold tracking-tight text-ink">{q.title}</h2>
                    <p className="mt-0.5 text-[11px] text-ink-soft">{q.hint}</p>
                  </div>
                </div>
                <VerdictBadge verdict={a ? a.verdict : 'pending'} />
              </div>
              {a ? (
                <>
                  <p className="mt-3 text-[14px] leading-[1.7] text-ink">{a.summary}</p>
                  {a.verdict === 'clinic_refused' && (
                    <p className="mt-2.5 rounded-[5px] border border-orange-200 bg-orange-50 px-3 py-2 text-[13px] leading-snug text-orange-900">
                      The clinic would not answer this in writing. A refusal before the deposit is information in
                      itself.
                    </p>
                  )}
                  {a.source && (
                    <p className="mt-2.5 border-t border-line pt-2.5 text-[11px] text-ink-soft">Source: {a.source}</p>
                  )}
                </>
              ) : (
                <p className="mt-3 text-[13px] text-ink-soft">We are checking this.</p>
              )}
            </li>
          )
        })}
      </ol>

      <div className="mt-6 space-y-2">
        <p className="flex items-start gap-2 text-[12px] leading-[1.7] text-ink-soft">
          <Info size={13} className="mt-[3px] shrink-0" aria-hidden />
          We do not give medical advice. This brief reports facts and written answers only.
        </p>
        <ConceptNote />
      </div>

      <div className="mt-6 border-t border-line pt-4 pb-12">
        <button
          onClick={() => setConfirming(true)}
          className="rounded-lg px-1 py-2 text-sm font-medium text-red-600 transition active:scale-[0.98]"
        >
          Cancel this check
        </button>
      </div>

      {confirming && (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
          onClick={() => !deleting && setConfirming(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="dialog-in w-full max-w-[400px] rounded-xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-title" className="text-[17px] font-semibold tracking-tight text-ink">
              Cancel this check?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Your details and any answers will be permanently deleted.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <button
                onClick={() => setConfirming(false)}
                disabled={deleting}
                className="rounded-[5px] border border-line py-3 text-sm font-medium text-ink transition active:scale-[0.98] disabled:opacity-50"
              >
                Keep it
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex items-center justify-center gap-2 rounded-[5px] bg-red-600 py-3 text-sm font-medium text-white transition active:scale-[0.98] disabled:opacity-70"
              >
                {deleting && <Spinner size={16} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  )
}
