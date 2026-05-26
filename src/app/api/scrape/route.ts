import { type NextRequest } from 'next/server';
import { scrapeProduct } from '@/lib/scraper';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return Response.json({ error: 'URL requise' }, { status: 400 });
    }

    const result = await scrapeProduct(url);
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    if (message.includes('timeout') || message.includes('abort')) {
      return Response.json({ error: 'Le site met trop de temps. Réessayez ou essayez un autre lien.' }, { status: 504 });
    }
    return Response.json({ error: message }, { status: 422 });
  }
}
