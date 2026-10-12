import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check, CircleNotch, Info, WarningCircle } from '@phosphor-icons/react'
import { QUESTIONS, STATUSES, VERDICTS } from '../lib/labels'
import type { Status, Verdict } from '../lib/types'

export const CONCEPT_NOTE =
  'Doctor Signal is a concept-stage project developed at IE Business School. Demo build: use made-up details only.'

export function Page({ children }: { children: ReactNode }) {
  return <div className="mx-auto min-h-[100dvh] w-full max-w-[480px] px-[22px]">{children}</div>
}

export function Wordmark({ size = 'md' }: { size?: 'md' | 'sm' }) {
  return (
    <span
      className={`inline-flex items-center gap-2 font-bold tracking-[-0.01em] text-ink ${
        size === 'md' ? 'text-[19px]' : 'text-[15px]'
      }`}
    >
      Doctor Signal
      <span className={`rounded-full bg-ink ${size === 'md' ? 'size-2' : 'size-1.5'}`} />
    </span>
  )
}

/** Site header: wordmark on the left, optional back link and right-hand slot. */
export function SiteHeader({ back, right }: { back?: string; right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 -mx-[22px] border-b border-line bg-cream/90 px-[22px] backdrop-blur-md">
      <div className="flex h-[64px] items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          {back && (
            <Link
              to={back}
              aria-label="Back"
              className="-ml-2 grid size-10 place-items-center rounded-lg text-ink transition hover:bg-sand active:scale-95"
            >
              <ArrowLeft size={20} weight="bold" />
            </Link>
          )}
          <Link to="/" aria-label="Doctor Signal home">
            <Wordmark size={back ? 'sm' : 'md'} />
          </Link>
        </div>
        {right}
      </div>
    </header>
  )
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-verified-soft px-3 py-[7px] text-[10px] font-bold tracking-[0.1em] text-verified uppercase">
      {children}
    </span>
  )
}

export function ConceptNote({ children = CONCEPT_NOTE }: { children?: ReactNode }) {
  return (
    <p className="flex items-start gap-2 text-[11px] leading-[1.7] text-ink-soft">
      <Info size={12} className="mt-[3px] shrink-0" aria-hidden />
      {children}
    </p>
  )
}

export function StatusChip({ status }: { status: Status }) {
  const s = STATUSES[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${s.className}`}>
      <span className={`size-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

export function VerdictBadge({ verdict }: { verdict: Verdict | 'pending' }) {
  const v = VERDICTS[verdict]
  return (
    <span className={`inline-flex shrink-0 items-center rounded-[5px] px-2 py-0.5 text-[11px] font-semibold ${v.className}`}>
      {v.label}
    </span>
  )
}

export function OverdueChip() {
  return (
    <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
      Overdue
    </span>
  )
}

export function DepositWarning({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-700">
      <WarningCircle size={15} weight="bold" aria-hidden />
      {compact ? 'Due after deposit' : 'Your brief is due after your deposit date'}
    </span>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className}`} aria-hidden />
}

export function Spinner({ size = 18 }: { size?: number }) {
  return <CircleNotch size={size} weight="bold" className="animate-spin" aria-hidden />
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rise mt-6 rounded-lg border border-line bg-white p-6">
      <WarningCircle size={24} weight="bold" className="text-red-600" aria-hidden />
      <p className="mt-3 text-[15px] font-medium text-ink">{message}</p>
      <button onClick={onRetry} className={`${primaryButton} mt-4 w-auto`}>
        Try again
      </button>
    </div>
  )
}

export function Banner({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  return (
    <div role="alert" className="rise flex items-start gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
      <WarningCircle size={18} weight="bold" className="mt-px shrink-0" aria-hidden />
      <span className="flex-1">{children}</span>
      {onClose && (
        <button onClick={onClose} className="text-xs font-medium underline underline-offset-2">
          Dismiss
        </button>
      )}
    </div>
  )
}

/** The sample brief shown on the home screen: what the patient gets, before they order one. */
export function SampleReport() {
  return (
    <div className="relative pb-6">
      <div className="rounded-xl border border-line bg-white p-5 shadow-[0_24px_48px_-28px_rgba(20,33,61,0.28)]">
        <div className="flex items-center justify-between">
          <Wordmark size="sm" />
          <span className="rounded-full border border-sample px-2 py-0.5 text-[9px] font-bold tracking-[0.08em] text-sample uppercase">
            Sample brief
          </span>
        </div>
        <p className="mt-4 text-[17px] font-bold tracking-tight text-ink">Before You Pay brief</p>
        <p className="mt-0.5 text-[11px] text-ink-soft">Rhinoplasty · Seoul · details hidden in sample</p>

        <div className="mt-4 flex items-center gap-3 rounded-lg bg-sand/70 p-3">
          <span className="grid size-9 place-items-center rounded-full bg-line text-sm font-semibold text-ink-soft">D</span>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[12px] font-semibold text-ink">
              Dr. <span className="inline-block h-2 w-16 rounded-full bg-line" />
            </p>
            <p className="text-[10px] text-ink-soft">Plastic surgery clinic, Gangnam</p>
          </div>
        </div>

        <ul className="mt-3 divide-y divide-line">
          {QUESTIONS.map((q) => (
            <li key={q.code} className="flex items-start gap-3 py-2.5">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-verified-soft text-verified">
                <Check size={11} weight="bold" aria-hidden />
              </span>
              <div>
                <p className="text-[12px] font-semibold text-ink">{q.title}</p>
                <p className="text-[10px] text-ink-soft">{q.hint}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-2 flex justify-between border-t border-line pt-2.5 text-[9px] text-ink-soft">
          <span>Checked against open Korean registries</span>
          <span>No medical advice</span>
        </div>
      </div>

      <div className="absolute bottom-0 left-4 flex items-center gap-2 rounded-lg bg-ink px-3 py-2 shadow-lg">
        <span className="live-dot size-1.5 rounded-full bg-emerald-400" />
        <div>
          <p className="text-[11px] font-semibold text-white">Four answers in 72 hours</p>
          <p className="text-[9px] text-white/70">Refundable if we are late</p>
        </div>
      </div>
    </div>
  )
}

export const primaryButton =
  'flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3.5 text-[14px] font-medium text-white transition hover:bg-ink/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-ink/25'
