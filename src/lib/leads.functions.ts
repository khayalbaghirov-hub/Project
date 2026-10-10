import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { leadSchema } from './lead-schema';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import type { Database } from '@/integrations/supabase/types';

export const submitLead = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => leadSchema.parse(input))
  .handler(async ({ data }) => {
    const url = process.env['SUPABASE_URL'];
    const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
    if (!url || !key) return { ok: false };
    const client = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (headers.get('Authorization') === `Bearer ${key}` && key.startsWith('sb_')) headers.delete('Authorization');
        headers.set('apikey', key);
        return fetch(input, { ...init, headers });
      } },
    });
    const { error } = await client.from('leads').insert(data);
    return { ok: !error };
  });

export const getLeads = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: admin, error: roleError } = await context.supabase.rpc('is_admin');
    if (roleError || !admin) throw new Error('Administrator access required.');
    const rows: Database['public']['Tables']['leads']['Row'][] = [];
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await context.supabase.from('leads').select('*').order('created_at', { ascending: false }).order('id').range(offset, offset + 999);
      if (error) throw new Error('Unable to load requests. Please try again.');
      rows.push(...(data ?? []));
      if (!data || data.length < 1000) break;
    }
    return rows;
  });
