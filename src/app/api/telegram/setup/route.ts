import { type NextRequest } from 'next/server';
import { setWebhook } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');

  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return Response.json({ error: 'Secret invalide' }, { status: 403 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    return Response.json({ error: 'NEXT_PUBLIC_SITE_URL non configuré' }, { status: 500 });
  }

  const webhookUrl = `${siteUrl}/api/telegram`;
  const result = await setWebhook(webhookUrl);

  return Response.json({ webhookUrl, result });
}
