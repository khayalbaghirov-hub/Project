import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { queryOptions, useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { Download, LogOut, RefreshCw, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getLeads } from '@/lib/leads.functions';
import { makeCsv } from '@/lib/csv';
import { supabase } from '@/integrations/supabase/client';
import { copy, procedureValues, priorityValues, paymentValues, timingValues } from '@/lib/copy';

const leadsQuery = queryOptions({ queryKey: ['admin', 'leads'], queryFn: () => getLeads(), staleTime: 30_000 });
export const Route = createFileRoute('/_authenticated/admin')({
  head: () => ({ meta: [
    { title: 'Consultation requests — Doctor Signal Admin' }, { name: 'description', content: 'Private consultation requests, project insights and CSV export.' },
    { property: 'og:title', content: 'Consultation requests — Doctor Signal Admin' }, { property: 'og:description', content: 'Private administration for Doctor Signal.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex, nofollow' },
  ] }),
  loader: async ({ context }) => {
    // Grants the role only to the designated, verified owner email; no-op for everyone else.
    await supabase.rpc('claim_admin');
    return context.queryClient.ensureQueryData(leadsQuery);
  },
  pendingComponent: () => <div className="page-width empty-state">Loading requests…</div>,
  errorComponent: ({ error, reset }) => <div className="auth-page"><div className="auth-panel"><h1>Requests unavailable</h1><p>{error instanceof Error && error.message === 'Administrator access required.' ? error.message : 'Unable to load requests. Please try again or sign in with an administrator account.'}</p><Button onClick={reset}>Try again</Button><Button asChild variant="link"><Link to="/auth">Sign in</Link></Button></div></div>,
  notFoundComponent: () => <div className="empty-state">Requests not found.</div>,
  component: Admin,
});

function Admin() {
  const { data: leads, isFetching, refetch } = useSuspenseQuery(leadsQuery);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  async function signOut() { await queryClient.cancelQueries(); queryClient.clear(); await supabase.auth.signOut(); await navigate({ to: '/auth', replace: true }); }
  function exportCsv() {
    const headers = ['id', 'created_at', 'language', 'name', 'contact', 'procedure', 'timing', 'country_city', 'matters_most', 'would_pay', 'comment', 'consent'];
    const url = URL.createObjectURL(new Blob([makeCsv(headers, leads)], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a'); link.href = url; link.download = `doctor-signal-leads-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(url);
  }
  const label = (value: string, values: string[], labels: string[]) => labels[values.indexOf(value)] ?? value;
  function counter(title: string, key: 'procedure' | 'matters_most' | 'would_pay', values: string[], labels: string[]) {
    return <div className="counter"><h3>{title}</h3>{values.map((value, i) => <div className="counter-line" key={value}><span>{labels[i]}</span><b>{leads.filter(lead => lead[key] === value).length}</b></div>)}</div>;
  }
  return <main className="admin-page page-width"><header className="admin-header"><Link to="/" className="wordmark">Doctor Signal<span className="wordmark-dot" /></Link><Button variant="ghost" onClick={signOut}><LogOut />Sign out</Button></header><div className="admin-title"><div><span className="section-kicker">PROJECT ADMINISTRATION</span><h1 className="m-0 text-3xl">Consultation requests</h1><p>Newest requests first</p></div><div className="flex gap-2"><Button variant="outline" size="icon" title="Refresh requests" aria-label="Refresh requests" onClick={() => refetch()} disabled={isFetching}><RefreshCw className={isFetching ? 'animate-spin' : ''} /></Button><Button onClick={exportCsv} disabled={!leads.length}><Download />Export CSV</Button></div></div><div className="counter-grid"><div className="counter"><h3>Total leads</h3><strong>{leads.length}</strong></div>{counter('By procedure', 'procedure', procedureValues, copy.en.procedures)}{counter('What matters most', 'matters_most', priorityValues, copy.en.priorities)}{counter('Would pay USD 120', 'would_pay', paymentValues, copy.en.payments)}</div>
    {!leads.length ? <div className="empty-state"><Inbox className="mx-auto mb-4" /><h2>No requests yet</h2></div> : <div className="table-wrap"><table className="leads-table"><thead><tr>{['Received', 'Name', 'Contact', 'Procedure', 'Timing', 'Country / city', 'Priority', 'Would pay', 'Comment', 'Language', 'Consent'].map(title => <th key={title}>{title}</th>)}</tr></thead><tbody>{leads.map(lead => <tr key={lead.id}><td>{new Date(lead.created_at).toLocaleString('en-GB')}</td><td>{lead.name}</td><td>{lead.contact}</td><td>{label(lead.procedure, procedureValues, copy.en.procedures)}</td><td>{label(lead.timing, timingValues, copy.en.timings)}</td><td>{lead.country_city}</td><td>{label(lead.matters_most, priorityValues, copy.en.priorities)}</td><td>{label(lead.would_pay, paymentValues, copy.en.payments)}</td><td>{lead.comment || '—'}</td><td>{lead.language.toUpperCase()}</td><td>{lead.consent ? 'Yes' : 'No'}</td></tr>)}</tbody></table></div>}
  </main>;
}
