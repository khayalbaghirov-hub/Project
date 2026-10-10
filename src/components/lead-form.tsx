import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { ArrowUpRight, Check, LockKeyhole, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { copy, procedureValues, timingValues, priorityValues, paymentValues } from '@/lib/copy';
import { leadSchema, type Language } from '@/lib/lead-schema';
import { submitLead } from '@/lib/leads.functions';

export function LeadForm({ language }: { language: Language }) {
  const t = copy[language];
  const send = useServerFn(submitLead);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error' | 'invalid'>('idle');
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = leadSchema.safeParse({ ...Object.fromEntries(form), consent: form.get('consent') === 'on', language });
    if (!result.success) { setStatus('invalid'); return; }
    setStatus('sending');
    try { const response = await send({ data: result.data }); setStatus(response.ok ? 'success' : 'error'); }
    catch { setStatus('error'); }
  }
  function select(name: string, label: string, values: string[], labels: string[]) {
    return <label className="field"><span>{label} <span className="required-mark">*</span></span><select name={name} required defaultValue=""><option value="" disabled>{t.select}</option>{values.map((v, i) => <option key={v} value={v}>{labels[i]}</option>)}</select></label>;
  }
  function choices(name: string, legend: string, values: string[], labels: string[]) {
    return <fieldset className="choice-field"><legend>{legend} <span className="required-mark">*</span></legend><div className="choices">{values.map((v, i) => <label className="choice" key={v}><input type="radio" name={name} value={v} required /><span>{labels[i]}</span></label>)}</div></fieldset>;
  }
  return <section id="consultation" className="form-band"><div className="page-width form-layout"><div className="form-intro"><span className="section-kicker">DOCTOR SIGNAL</span><h2>{t.formTitle}</h2><p>{t.formIntro}</p><div className="privacy-note"><LockKeyhole size={16} />{t.privacy}</div></div>
    {status === 'success' ? <div className="success-state" role="status"><span className="success-icon"><Check /></span><h3>{t.success}</h3></div> : <form onSubmit={onSubmit} className="lead-form">
      <div className="form-grid"><label className="field"><span>{t.name} <span className="required-mark">*</span></span><input name="name" required maxLength={100} autoComplete="given-name" placeholder={t.namePlaceholder} /></label><label className="field"><span>{t.contact} <span className="required-mark">*</span></span><input name="contact" required minLength={3} maxLength={150} placeholder={t.contactPlaceholder} /></label>
      {select('procedure', t.procedure, procedureValues, t.procedures)}{select('timing', t.timing, timingValues, t.timings)}</div>
      <label className="field"><span>{t.country} <span className="required-mark">*</span></span><input name="country_city" required maxLength={150} placeholder={t.countryPlaceholder} /></label>
      {choices('matters_most', t.matters, priorityValues, t.priorities)}{choices('would_pay', t.payment, paymentValues, t.payments)}
      <label className="field"><span>{t.comment} <span className="optional">({t.optional})</span></span><textarea name="comment" maxLength={2000} rows={3} placeholder={t.commentPlaceholder} /></label>
      <label className="consent"><input type="checkbox" name="consent" required /><span>{t.consent}</span></label>
      {(status === 'error' || status === 'invalid') && <p role="alert" className="form-error">{status === 'error' ? t.error : t.invalid}</p>}
      <Button type="submit" size="lg" className="send-button" disabled={status === 'sending'}>{status === 'sending' ? <><LoaderCircle className="animate-spin" />{t.sending}</> : <>{t.send}<ArrowUpRight /></>}</Button>
    </form>}
  </div></section>;
}
