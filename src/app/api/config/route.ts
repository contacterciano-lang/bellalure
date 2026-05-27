import { type NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface ConfigRow {
  key: string;
  value: unknown;
}

/** Returns all config as a flat object: { [key]: value } */
export async function GET() {
  try {
    const { data, error } = await getSupabase().from('site_config').select('key, value');

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    const config: Record<string, unknown> = {};
    for (const row of (data || []) as ConfigRow[]) {
      config[row.key] = row.value;
    }
    return Response.json(config);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return Response.json({ error: message }, { status: 500 });
  }
}

/** Upserts a single { key, value } config entry. */
export async function PUT(request: NextRequest) {
  try {
    const { key, value } = await request.json();
    if (!key) {
      return Response.json({ error: 'key requis' }, { status: 400 });
    }

    const { error } = await getSupabase()
      .from('site_config')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return Response.json({ error: message }, { status: 500 });
  }
}
