import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { LockKeyhole, ArrowRight, LoaderCircle, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/auth')({
  head: () => ({ meta: [
    { title: 'Administrator sign in — Doctor Signal' }, { name: 'description', content: 'Secure sign in for Doctor Signal project administrators.' },
    { property: 'og:title', content: 'Administrator sign in — Doctor Signal' }, { property: 'og:description', content: 'Secure administrator access to consultation requests.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex, nofollow' },
  ] }),
  component: Auth,
});

const emailSchema = z.string().trim().email().max(255);

function Auth() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<'link' | 'signin' | 'signup'>('link');

  async function finish() {
    const { data: admin, error: roleError } = await supabase.rpc('claim_admin');
    if (roleError || !admin) { await supabase.auth.signOut(); setError('This account does not have administrator access.'); return; }
    await navigate({ to: '/admin' });
  }

  // If a sign-in link lands here with a valid session, continue to /admin.
  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => { if (active && data.user) void finish(); });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setNotice('');
    const parsed = emailSchema.safeParse(new FormData(event.currentTarget).get('email'));
    if (!parsed.success) { setError('Enter a valid email.'); return; }
    setBusy(true);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({ email: parsed.data, options: { emailRedirectTo: `${window.location.origin}/admin`, shouldCreateUser: true } });
      if (otpError) { setError(otpError.status === 429 ? 'Too many emails requested. Please wait a few minutes and try again.' : 'Unable to send the sign-in link. Please try again.'); return; }
      setNotice('Check your inbox and open the sign-in link on this device. It expires in 1 hour.');
    } catch { setError('Unable to send the sign-in link. Please try again.'); }
    finally { setBusy(false); }
  }

  async function submitPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setNotice('');
    const form = new FormData(event.currentTarget);
    const parsed = z.object({ email: emailSchema, password: z.string().min(mode === 'signup' ? 8 : 1).max(256) }).safeParse(Object.fromEntries(form));
    if (!parsed.success) { setError(mode === 'signup' ? 'Enter a valid email and a password of at least 8 characters.' : 'Enter a valid email and password.'); return; }
    setBusy(true);
    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({ ...parsed.data, options: { emailRedirectTo: `${window.location.origin}/admin` } });
        if (signUpError) { setError('Unable to create the account. It may already exist, try signing in.'); return; }
        if (!data.session) { setNotice('Account created. Check your email to confirm it, then sign in.'); setMode('signin'); return; }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword(parsed.data);
        if (signInError) { setError('Unable to sign in. Check your email and password, or use a one-time email link.'); return; }
      }
      await finish();
    } catch { setError('Unable to continue. Please try again.'); }
    finally { setBusy(false); }
  }

  const switchTo = (next: typeof mode) => { setMode(next); setError(''); setNotice(''); };
  const signup = mode === 'signup';
  const messages = <>{error && <p role="alert" className="auth-error">{error}</p>}{notice && <p role="status">{notice}</p>}</>;

  return <main className="auth-page"><div className="auth-panel"><Link to="/" className="wordmark">Doctor Signal<span className="wordmark-dot" /></Link><span className="section-kicker">PROJECT ADMINISTRATION</span>
    {mode === 'link' ? <>
      <h1>Administrator sign in</h1>
      <form onSubmit={sendLink}><label className="field"><span>Email</span><input name="email" type="email" autoComplete="username" required maxLength={255} /></label>{messages}<Button type="submit" disabled={busy} size="lg">{busy ? <LoaderCircle className="animate-spin" /> : <Mail />}{busy ? 'Sending…' : 'Sign in with a one-time email link'}<ArrowRight /></Button></form>
      <Button variant="link" type="button" onClick={() => switchTo('signin')}>Sign in with a password instead</Button>
    </> : <>
      <h1>{signup ? 'Create administrator account' : 'Sign in with password'}</h1>
      <form onSubmit={submitPassword}><label className="field"><span>Email</span><input name="email" type="email" autoComplete="username" required maxLength={255} /></label><label className="field"><span>Password</span><input name="password" type="password" autoComplete={signup ? 'new-password' : 'current-password'} required minLength={signup ? 8 : undefined} maxLength={256} /></label>{messages}<Button type="submit" disabled={busy} size="lg">{busy ? <LoaderCircle className="animate-spin" /> : <LockKeyhole />}{busy ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}<ArrowRight /></Button></form>
      <Button variant="link" type="button" onClick={() => switchTo(signup ? 'signin' : 'signup')}>{signup ? 'Already have an account? Sign in' : 'No account yet? Create one'}</Button>
      <Button variant="link" type="button" onClick={() => switchTo('link')}>Use a one-time email link instead</Button>
    </>}
    <p>Access is restricted to authorised project administrators.</p><Button variant="link" asChild><Link to="/">Back to Doctor Signal</Link></Button></div></main>;
}
