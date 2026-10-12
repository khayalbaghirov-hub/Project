import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowSquareOut, CaretDown, LockSimple, ShieldCheck, WarningCircle } from '@phosphor-icons/react'
import { createCheck } from '../lib/data'
import { useNow } from '../lib/hooks'
import { LANGUAGES, PROCEDURES } from '../lib/labels'
import { isDepositSoon, toLocalDateKey } from '../lib/rules'
import { DEPOSIT_URL } from '../lib/supabase'
import type { Language, Procedure } from '../lib/types'
import { validate, type FormValues } from '../lib/validation'
import { Banner, ConceptNote, Eyebrow, Page, SiteHeader, Spinner } from '../components/ui'

const EMPTY: FormValues = {
  patient_name: '',
  contact: '',
  doctor_name: '',
  clinic_name: '',
  procedure: '',
  deposit_date: '',
  brief_language: 'en',
}

const inputClass =
  'min-h-[46px] w-full rounded-[5px] border border-line bg-white px-[13px] py-3 text-[15px] text-ink placeholder:text-ink-soft/70 outline-none transition focus:border-ink focus:ring-2 focus:ring-verified-soft aria-[invalid=true]:border-red-400 disabled:bg-sand/50 disabled:text-ink-soft'

export default function NewCheck() {
  const navigate = useNavigate()
  const today = toLocalDateKey(useNow())
  const [values, setValues] = useState<FormValues>(EMPTY)
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({})
  const [saving, setSaving] = useState(false)
  const inFlight = useRef(false) // state updates too late to stop a fast double tap
  const [saveError, setSaveError] = useState(false)

  const errors = validate(values, today)
  const isValid = Object.keys(errors).length === 0
  const showError = (k: keyof FormValues) => (touched[k] ? errors[k] : undefined)
  const depositSoon = values.deposit_date !== '' && !errors.deposit_date && isDepositSoon(values.deposit_date, today)

  const set = (k: keyof FormValues) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [k]: e.target.value }))
  const blur = (k: keyof FormValues) => () => setTouched((t) => ({ ...t, [k]: true }))

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!isValid || inFlight.current) return // AC-2.5: no double submit
    inFlight.current = true
    setSaving(true)
    setSaveError(false)
    try {
      await createCheck({
        patient_name: values.patient_name.trim(),
        contact: values.contact.trim(),
        doctor_name: values.doctor_name.trim(),
        clinic_name: values.clinic_name.trim(),
        procedure: values.procedure as Procedure,
        deposit_date: values.deposit_date,
        brief_language: values.brief_language as Language,
      })
      navigate('/')
    } catch {
      setSaveError(true)
      inFlight.current = false
      setSaving(false)
    }
  }

  return (
    <Page>
      <SiteHeader back="/" />

      <div className="rise pt-8 pb-7">
        <Eyebrow>
          <ShieldCheck size={13} weight="bold" aria-hidden />
          New check
        </Eyebrow>
        <h1 className="mt-[18px] text-[28px] leading-[1.2] font-bold tracking-[-0.02em] text-ink">
          Who are you about to pay?
        </h1>
        <p className="mt-3 text-[14px] leading-[1.8] text-ink-soft">
          We check the doctor and get written answers from the clinic, before your deposit leaves.
        </p>
      </div>

      <form onSubmit={submit} noValidate className="pb-12">
        <fieldset disabled={saving} className="grid gap-[21px]">
          <Field id="patient_name" label="Your name" error={showError('patient_name')}>
            <input
              id="patient_name"
              className={inputClass}
              value={values.patient_name}
              onChange={set('patient_name')}
              onBlur={blur('patient_name')}
              maxLength={80}
              autoComplete="name"
              placeholder="What should we call you?"
              aria-invalid={!!showError('patient_name')}
            />
          </Field>

          <Field
            id="contact"
            label="Contact"
            hint="Where we send your brief: email, WhatsApp, Telegram or WeChat."
            error={showError('contact')}
          >
            <input
              id="contact"
              className={inputClass}
              value={values.contact}
              onChange={set('contact')}
              onBlur={blur('contact')}
              maxLength={120}
              placeholder="@username or phone number"
              aria-invalid={!!showError('contact')}
            />
          </Field>

          <div className="h-px bg-line" />

          <Field id="doctor_name" label="Doctor's name" hint="Any script is fine, e.g. 김민수." error={showError('doctor_name')}>
            <input
              id="doctor_name"
              className={inputClass}
              value={values.doctor_name}
              onChange={set('doctor_name')}
              onBlur={blur('doctor_name')}
              maxLength={120}
              aria-invalid={!!showError('doctor_name')}
            />
          </Field>

          <Field id="clinic_name" label="Clinic name" error={showError('clinic_name')}>
            <input
              id="clinic_name"
              className={inputClass}
              value={values.clinic_name}
              onChange={set('clinic_name')}
              onBlur={blur('clinic_name')}
              maxLength={120}
              aria-invalid={!!showError('clinic_name')}
            />
          </Field>

          <Field id="procedure" label="Procedure" error={showError('procedure')}>
            <div className="relative">
              <select
                id="procedure"
                className={`${inputClass} appearance-none pr-10 ${values.procedure ? '' : 'text-ink-soft/70'}`}
                value={values.procedure}
                onChange={set('procedure')}
                onBlur={blur('procedure')}
                aria-invalid={!!showError('procedure')}
              >
                <option value="" disabled>
                  Select an option
                </option>
                {PROCEDURES.map((p) => (
                  <option key={p.code} value={p.code} className="text-ink">
                    {p.label}
                  </option>
                ))}
              </select>
              <CaretDown size={16} className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-ink-soft" />
            </div>
          </Field>

          <Field id="deposit_date" label="Deposit date" hint="When you are due to pay the clinic." error={showError('deposit_date')}>
            <input
              id="deposit_date"
              type="date"
              className={inputClass}
              value={values.deposit_date}
              min={today}
              onChange={set('deposit_date')}
              onBlur={blur('deposit_date')}
              aria-invalid={!!showError('deposit_date')}
            />
          </Field>
          {depositSoon && (
            <p
              role="status"
              className="rise -mt-2 flex gap-2 rounded-[5px] border border-orange-200 bg-orange-50 px-3.5 py-3 text-[13px] leading-snug text-orange-800"
            >
              <WarningCircle size={18} weight="bold" className="shrink-0" aria-hidden />
              Your brief may arrive after your deposit date. Consider asking the clinic to hold the deposit.
            </p>
          )}

          <fieldset>
            <legend className="mb-3 text-[13px] font-semibold text-ink">Brief language</legend>
            <div role="radiogroup" className="flex flex-wrap gap-2">
              {LANGUAGES.map((l) => {
                const active = values.brief_language === l.code
                return (
                  <button
                    key={l.code}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setValues((v) => ({ ...v, brief_language: l.code }))}
                    className={`flex items-center gap-2 rounded-[5px] border px-3.5 py-2.5 text-[13px] transition active:scale-[0.97] ${
                      active ? 'border-ink bg-sand font-medium text-ink' : 'border-line bg-white text-ink-soft'
                    }`}
                  >
                    <span
                      className={`grid size-3.5 place-items-center rounded-full border ${
                        active ? 'border-ink' : 'border-ink-soft/50'
                      }`}
                    >
                      {active && <span className="size-1.5 rounded-full bg-ink" />}
                    </span>
                    {l.label}
                  </button>
                )
              })}
            </div>
          </fieldset>
        </fieldset>

        {/* Price block */}
        <div className="mt-9 rounded-lg border border-line bg-white p-5">
          <p className="text-[11px] font-bold tracking-[0.1em] text-verified uppercase">Your brief</p>
          <p className="mt-2 text-[30px] leading-none font-bold tracking-tight text-ink tabular-nums">USD 120</p>
          <p className="mt-2 text-[13px] leading-[1.7] text-ink-soft">
            Fully refundable if we cannot deliver within 72 hours.
          </p>
          {DEPOSIT_URL ? (
            <a
              href={DEPOSIT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-[5px] border border-line bg-white px-4 py-2.5 text-[13px] font-medium text-ink transition hover:border-ink active:scale-[0.98]"
            >
              Pay refundable deposit
              <ArrowSquareOut size={15} weight="bold" aria-hidden />
            </a>
          ) : (
            <span className="mt-4 inline-flex items-center gap-2 rounded-[5px] border border-dashed border-line px-4 py-2.5 text-[13px] text-ink-soft">
              Deposit link not set up yet
            </span>
          )}
        </div>

        <div className="mt-6 space-y-3">
          {saveError && <Banner>Could not submit. Your details are still here. Try again.</Banner>}
          <button
            type="submit"
            disabled={!isValid || saving}
            className="flex h-[50px] w-full items-center justify-between rounded-[5px] bg-ink px-5 text-[14px] font-medium text-white transition hover:bg-ink/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-ink/25"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <Spinner /> Submitting...
              </span>
            ) : (
              'Submit check'
            )}
            <ArrowRight size={18} weight="bold" aria-hidden />
          </button>
        </div>

        <div className="mt-6 space-y-2">
          <p className="flex items-start gap-2 text-[11px] leading-[1.7] text-ink-soft">
            <LockSimple size={12} className="mt-[3px] shrink-0 text-ink" aria-hidden />
            We verify facts and collect written answers. We do not give medical advice.
          </p>
          <ConceptNote />
        </div>
      </form>
    </Page>
  )
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-[9px]">
      <label htmlFor={id} className="text-[13px] font-semibold text-ink">
        {label} <span className="text-verified">*</span>
      </label>
      {children}
      {error ? (
        <p className="text-[12px] text-red-600">{error}</p>
      ) : (
        hint && <p className="text-[12px] text-ink-soft">{hint}</p>
      )}
    </div>
  )
}
