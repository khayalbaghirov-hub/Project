import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  CaretRight,
  Check,
  ClipboardText,
  FileText,
  Handshake,
  ShieldCheck,
  X,
} from '@phosphor-icons/react'
import { fetchChecks, type CheckListItem } from '../lib/data'
import { useLiveChanges, useNow } from '../lib/hooks'
import { procedureLabel } from '../lib/labels'
import { deriveStatus, dueAfterDeposit, dueAt, formatDue, isOverdue } from '../lib/rules'
import {
  ConceptNote,
  DepositWarning,
  ErrorBlock,
  Eyebrow,
  OverdueChip,
  Page,
  primaryButton,
  SampleReport,
  SiteHeader,
  Skeleton,
  StatusChip,
  Wordmark,
} from '../components/ui'

type State = { kind: 'loading' } | { kind: 'error' } | { kind: 'ready'; checks: CheckListItem[] }

const TRUST = ['No money from clinics', 'Brief within 72 hours', 'No medical advice']

const STEPS = [
  { icon: ClipboardText, title: 'Tell us who you are about to pay', detail: 'Doctor, clinic, procedure and your deposit date.' },
  { icon: ShieldCheck, title: 'We check four things', detail: 'Licence, what locals say, the all-in price and the revision policy, in writing.' },
  { icon: FileText, title: 'Read your brief before you pay', detail: 'One page with four answers, in English, Russian or Chinese.' },
]

const CANS = [
  "Check the doctor's licence and specialty",
  'Read Korean-language reviews for you',
  "Get the clinic's price and revision policy in writing",
  'Tell you when a clinic refuses to answer',
]
const CANNOTS = ['Give medical advice', 'Tell you whether to have surgery', 'Guarantee results']

export default function MyChecks() {
  const [state, setState] = useState<State>({ kind: 'loading' })
  const now = useNow()

  // Live refreshes keep the current list on screen; only a first load or retry shows skeletons.
  const load = useCallback(async (showLoading: boolean) => {
    if (showLoading) setState({ kind: 'loading' })
    try {
      setState({ kind: 'ready', checks: await fetchChecks() })
    } catch {
      setState((s) => (showLoading || s.kind !== 'ready' ? { kind: 'error' } : s))
    }
  }, [])

  useEffect(() => {
    load(true)
  }, [load])
  useLiveChanges('my-checks', () => load(false))

  const checks = state.kind === 'ready' ? state.checks : []
  const readyCount = checks.filter((c) => deriveStatus(c.brief_answers.length) === 'ready').length
  const isEmpty = state.kind === 'ready' && checks.length === 0

  return (
    <Page>
      <SiteHeader
        right={
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-ink-soft">
            <span className="live-dot size-1.5 rounded-full bg-verified" />
            Live
          </span>
        }
      />

      {/* Hero */}
      <section className="rise pt-9 pb-8">
        <Eyebrow>
          <ShieldCheck size={13} weight="bold" aria-hidden />
          Independent doctor check · Seoul
        </Eyebrow>
        <h1 className="mt-[18px] text-[34px] leading-[1.15] font-bold tracking-[-0.03em] text-ink">
          Before you pay, know <span className="text-verified">exactly who</span> you are paying in Korea
        </h1>
        <p className="mt-[18px] text-[15px] leading-[1.7] text-ink-soft">
          Order an independent check of the Korean doctor and clinic you are about to pay. Get one page with four
          answers before your deposit leaves.
        </p>
        <Link to="/new" className={`${primaryButton} mt-6 h-[50px]`}>
          Check a doctor
          <ArrowUpRight size={16} weight="bold" aria-hidden />
        </Link>
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-ink-soft">
          {TRUST.map((t) => (
            <li key={t} className="trust-dot flex items-center gap-2">
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-3.5">
          <ConceptNote />
        </div>
      </section>

      <section className="rise pb-4" style={{ '--i': 2 } as CSSProperties}>
        <SampleReport />
      </section>

      {/* Your checks */}
      <section id="checks" className="pt-10 pb-6">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-[25px] font-semibold tracking-tight text-ink">Your checks</h2>
          {state.kind === 'ready' && checks.length > 0 && (
            <p className="text-[13px] text-ink-soft">
              <span className="font-semibold text-ink tabular-nums">{readyCount}</span>{' '}
              {readyCount === 1 ? 'brief' : 'briefs'} ready of{' '}
              <span className="font-semibold text-ink tabular-nums">{checks.length}</span>
            </p>
          )}
        </div>

        {state.kind === 'loading' && (
          <div aria-busy="true" aria-label="Loading your checks" className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-[118px]" />
            ))}
          </div>
        )}

        {state.kind === 'error' && (
          <ErrorBlock message="Could not load your checks. Check your connection." onRetry={() => load(true)} />
        )}

        {isEmpty && (
          <div className="rise rounded-lg border border-dashed border-line bg-white p-6">
            <p className="text-[14px] leading-[1.7] text-ink-soft">
              No checks yet. Tell us the doctor and clinic you are about to pay, and get four answers before your
              deposit.
            </p>
            <Link to="/new" className={`${primaryButton} mt-5`}>
              Check my first doctor
              <ArrowUpRight size={16} weight="bold" aria-hidden />
            </Link>
          </div>
        )}

        {state.kind === 'ready' && checks.length > 0 && (
          <ul className="space-y-3">
            {checks.map((c, i) => {
              const answers = c.brief_answers.length
              const status = deriveStatus(answers)
              const overdue = isOverdue(c.created_at, answers, now)
              return (
                <li key={c.id} className="rise" style={{ '--i': i } as CSSProperties}>
                  <Link
                    to={`/check/${c.id}`}
                    className="group block rounded-lg border border-line bg-white p-4 transition hover:border-ink/25 active:scale-[0.99]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-semibold tracking-tight text-ink">{c.doctor_name}</p>
                        <p className="truncate text-[13px] text-ink-soft">{c.clinic_name}</p>
                      </div>
                      <CaretRight size={18} className="mt-0.5 shrink-0 text-line transition group-hover:text-ink-soft" />
                    </div>
                    <p className="mt-2 text-[12px] text-ink-soft">{procedureLabel(c.procedure)}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                      <StatusChip status={status} />
                      {overdue ? (
                        <OverdueChip />
                      ) : (
                        status !== 'ready' && (
                          <span className="text-xs text-ink-soft tabular-nums">Due by {formatDue(dueAt(c.created_at))}</span>
                        )
                      )}
                      {status !== 'ready' && dueAfterDeposit(c.created_at, c.deposit_date) && <DepositWarning compact />}
                    </div>
                  </Link>
                </li>
              )
            })}
            <li>
              <Link
                to="/new"
                className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-ink/25 py-4 text-[14px] font-medium text-ink transition hover:bg-white active:scale-[0.99]"
              >
                Check another doctor
                <ArrowUpRight size={16} weight="bold" aria-hidden />
              </Link>
            </li>
          </ul>
        )}
      </section>

      {/* How it works */}
      <section className="py-10">
        <h2 className="mb-7 text-[25px] font-semibold tracking-tight text-ink">How it works</h2>
        <ol className="space-y-6">
          {STEPS.map(({ icon: Icon, title, detail }, i) => (
            <li key={title} className="relative min-h-[75px] pl-[65px]">
              <span className="absolute top-0 left-0 grid size-[43px] place-items-center rounded-lg bg-sand text-ink">
                <Icon size={22} aria-hidden />
              </span>
              <span className="absolute top-[49px] left-[13px] text-[10px] text-ink-soft tabular-nums">0{i + 1}</span>
              <h3 className="text-[14px] leading-[1.6] font-semibold text-ink">{title}</h3>
              <p className="text-[12px] leading-[1.8] text-ink-soft">{detail}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Independence band */}
      <section className="-mx-[22px] bg-sand px-[22px] py-8">
        <div className="flex items-start gap-4">
          <Handshake size={30} className="mt-1 shrink-0 text-ink" aria-hidden />
          <div>
            <h2 className="text-[21px] leading-snug font-semibold tracking-tight text-ink">
              On your side. Not the clinics'.
            </h2>
            <p className="mt-2.5 text-[12px] leading-[1.8] text-ink-soft">
              Agencies are paid by the clinic. We take no money from clinics, so we can tell you honestly when
              something looks wrong, including when a clinic refuses to answer.
            </p>
          </div>
        </div>
      </section>

      {/* Scope */}
      <section className="py-10">
        <h2 className="mb-7 text-[25px] font-semibold tracking-tight text-ink">An honest look at our role</h2>
        <div>
          <h3 className="mb-4 flex items-center gap-2.5 text-[15px] font-semibold text-ink">
            <ShieldCheck size={18} aria-hidden />
            What we can do
          </h3>
          <ul className="grid gap-3.5">
            {CANS.map((x) => (
              <li key={x} className="flex items-start gap-3 text-[13px] leading-[1.7] text-ink-soft">
                <Check size={16} className="mt-[3px] shrink-0 text-ink" aria-hidden />
                {x}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-7 border-t border-line pt-6">
          <h3 className="mb-4 flex items-center gap-2.5 text-[15px] font-semibold text-ink">
            <X size={18} className="text-ink-soft" aria-hidden />
            What we cannot do
          </h3>
          <ul className="grid gap-3.5">
            {CANNOTS.map((x) => (
              <li key={x} className="flex items-start gap-3 text-[13px] leading-[1.7] text-ink-soft">
                <X size={16} className="mt-[3px] shrink-0" aria-hidden />
                {x}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="-mx-[22px] border-t border-line px-[22px] pt-7 pb-10">
        <Wordmark size="sm" />
        <p className="mt-4 text-[10px] leading-[1.9] text-ink-soft">
          A concept-stage student project of IE Business School (Spain). We are not a medical provider and give no
          medical advice.
        </p>
        <div className="mt-2">
          <ConceptNote />
        </div>
      </footer>
    </Page>
  )
}
