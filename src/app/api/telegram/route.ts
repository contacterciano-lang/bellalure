import { type NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { scrapeProduct } from '@/lib/scraper';
import {
  sendMessage,
  sendPhoto,
  editMessage,
  answerCallback,
  isAdmin,
  type InlineButton,
} from '@/lib/telegram';
import type { Category } from '@/lib/types';

export const dynamic = 'force-dynamic';

const CATEGORIES: { slug: Category; label: string }[] = [
  { slug: 'femmes', label: 'Femmes' },
  { slug: 'hommes', label: 'Hommes' },
  { slug: 'sneakers', label: 'Sneakers' },
  { slug: 'sacs', label: 'Sacs' },
  { slug: 'montres', label: 'Montres' },
  { slug: 'accessoires', label: 'Accessoires' },
  { slug: 'beaute', label: 'Beauté' },
  { slug: 'maison', label: 'Maison' },
  { slug: 'electronique', label: 'Électronique' },
  { slug: 'tendances-tiktok', label: 'Tendances TikTok' },
  { slug: 'promotions', label: 'Promotions' },
  { slug: 'nouveautes', label: 'Nouveautés' },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

function isUrl(text: string): boolean {
  return /^https?:\/\//i.test(text.trim()) ||
    /^(www\.|amazon\.|aliexpress\.|alibaba\.|fr\.aliexpress)/i.test(text.trim());
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 3) + '...';
}

const pendingScrapes = new Map<number, {
  name: string;
  description: string;
  price: number | null;
  originalPrice: number | null;
  currency: string;
  images: string[];
  sourceUrl: string;
}>();

async function handleUrl(chatId: number, url: string) {
  const loadingMsg = await sendMessage(chatId, '🔍 Scraping en cours...');
  const loadingMsgId = loadingMsg?.result?.message_id;

  try {
    const scraped = await scrapeProduct(url);

    pendingScrapes.set(chatId, { ...scraped, sourceUrl: url });

    const priceText = scraped.price
      ? `💰 ${scraped.price} ${scraped.currency}`
      : '💰 Prix non trouvé (modifiable)';

    const origText = scraped.originalPrice
      ? `\n💸 Ancien prix: ${scraped.originalPrice} ${scraped.currency}`
      : '';

    const imgText = `📸 ${scraped.images.length} image(s) trouvée(s)`;

    const text =
      `✅ <b>Produit trouvé!</b>\n\n` +
      `📦 <b>${truncate(scraped.name, 200)}</b>\n` +
      `${priceText}${origText}\n` +
      `${imgText}\n\n` +
      `📝 ${truncate(scraped.description, 200)}\n\n` +
      `👇 <b>Choisis la catégorie:</b>`;

    const buttons: InlineButton[][] = [
      CATEGORIES.slice(0, 3).map((c) => ({
        text: c.label,
        callback_data: `cat:${c.slug}`,
      })),
      CATEGORIES.slice(3).map((c) => ({
        text: c.label,
        callback_data: `cat:${c.slug}`,
      })),
      [{ text: '❌ Annuler', callback_data: 'cancel' }],
    ];

    if (loadingMsgId) {
      await editMessage(chatId, loadingMsgId, text, buttons);
    } else {
      await sendMessage(chatId, text, buttons);
    }

    if (scraped.images[0]) {
      await sendPhoto(chatId, scraped.images[0], '📸 Aperçu du produit');
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    const errorText =
      `❌ <b>Erreur de scraping</b>\n\n${message}\n\n` +
      `💡 Essaye:\n` +
      `- Un lien direct vers la page produit\n` +
      `- Un lien Amazon, AliExpress ou Alibaba\n` +
      `- Le lien desktop (pas mobile)`;

    if (loadingMsgId) {
      await editMessage(chatId, loadingMsgId, errorText);
    } else {
      await sendMessage(chatId, errorText);
    }
  }
}

async function handleCategorySelection(chatId: number, messageId: number, callbackId: string, category: Category) {
  const scraped = pendingScrapes.get(chatId);
  if (!scraped) {
    await answerCallback(callbackId, 'Session expirée. Renvoie le lien.');
    return;
  }

  pendingScrapes.delete(chatId);
  await answerCallback(callbackId, `Catégorie: ${category}`);

  const catLabel = CATEGORIES.find((c) => c.slug === category)?.label || category;
  await editMessage(chatId, messageId, '⏳ Enregistrement en cours...');

  const slug = slugify(scraped.name);
  const id = `dyn-${Date.now()}`;

  const { error } = await getSupabase().from('products').insert({
    id,
    name: scraped.name,
    slug,
    category,
    price: scraped.price || 0,
    original_price: scraped.originalPrice || null,
    currency: scraped.currency || 'USD',
    description: scraped.description,
    images: scraped.images.length > 0 ? scraped.images : [],
    sizes: [],
    badge: 'nouveau',
    stock: 10,
    rating: 4.5,
    reviews: 0,
    new_arrival: true,
    source_url: scraped.sourceUrl,
  });

  if (error) {
    await editMessage(
      chatId,
      messageId,
      `❌ <b>Erreur</b>\n\n${error.message}`,
    );
    return;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bellalure.vercel.app';

  await editMessage(
    chatId,
    messageId,
    `✅ <b>Produit ajouté!</b>\n\n` +
      `📦 ${truncate(scraped.name, 150)}\n` +
      `🏷 ${catLabel}\n` +
      `💰 ${scraped.price || 0} ${scraped.currency}\n` +
      `📸 ${scraped.images.length} image(s)\n\n` +
      `🔗 <a href="${siteUrl}/produit/${slug}">Voir sur le site</a>`,
  );
}

async function handleListProducts(chatId: number) {
  const { data, error } = await getSupabase()
    .from('products')
    .select('id, name, slug, category, price, currency, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    await sendMessage(chatId, `❌ Erreur: ${error.message}`);
    return;
  }

  if (!data || data.length === 0) {
    await sendMessage(chatId, '📭 Aucun produit dans la base de données.');
    return;
  }

  const { count } = await getSupabase().from('products').select('*', { count: 'exact', head: true });

  let text = `📦 <b>Derniers produits</b> (${data.length}/${count || '?'} total)\n\n`;

  data.forEach((p, i) => {
    text += `${i + 1}. <b>${truncate(p.name, 60)}</b>\n`;
    text += `   🏷 ${p.category} | 💰 ${p.price} ${p.currency}\n\n`;
  });

  await sendMessage(chatId, text);
}

async function handleDeleteProduct(chatId: number) {
  const { data, error } = await getSupabase()
    .from('products')
    .select('id, name, slug')
    .order('created_at', { ascending: false })
    .limit(8);

  if (error || !data || data.length === 0) {
    await sendMessage(chatId, '📭 Aucun produit à supprimer.');
    return;
  }

  const buttons: InlineButton[][] = data.map((p) => [
    {
      text: `🗑 ${truncate(p.name, 40)}`,
      callback_data: `del:${p.id}`,
    },
  ]);
  buttons.push([{ text: '❌ Annuler', callback_data: 'cancel' }]);

  await sendMessage(chatId, '🗑 <b>Quel produit supprimer?</b>', buttons);
}

async function handleDeleteConfirm(chatId: number, messageId: number, callbackId: string, productId: string) {
  await answerCallback(callbackId);

  const { error } = await getSupabase().from('products').delete().eq('id', productId);

  if (error) {
    await editMessage(chatId, messageId, `❌ Erreur: ${error.message}`);
    return;
  }

  await editMessage(chatId, messageId, '✅ Produit supprimé!');
}

async function handleStats(chatId: number) {
  const { count: totalCount } = await getSupabase()
    .from('products')
    .select('*', { count: 'exact', head: true });

  const { data: categories } = await getSupabase()
    .from('products')
    .select('category');

  const catCounts: Record<string, number> = {};
  categories?.forEach((row) => {
    catCounts[row.category] = (catCounts[row.category] || 0) + 1;
  });

  let text =
    `📊 <b>Statistiques Bellalure</b>\n\n` +
    `📦 Total produits (base): ${totalCount || 0}\n\n` +
    `<b>Par catégorie:</b>\n`;

  for (const cat of CATEGORIES) {
    text += `  ${cat.label}: ${catCounts[cat.slug] || 0}\n`;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bellalure.vercel.app';
  text += `\n🌐 <a href="${siteUrl}">Voir le site</a>`;
  text += `\n⚙️ <a href="${siteUrl}/admin">Panel admin</a>`;

  await sendMessage(chatId, text);
}

async function handleHelp(chatId: number) {
  await sendMessage(
    chatId,
    `🤖 <b>Bellalure Bot - Guide</b>\n\n` +
      `<b>Ajouter un produit:</b>\n` +
      `Envoie simplement le lien du produit (Amazon, AliExpress, Alibaba, etc.)\n\n` +
      `<b>Commandes:</b>\n` +
      `/produits - Voir les derniers produits\n` +
      `/supprimer - Supprimer un produit\n` +
      `/stats - Statistiques du site\n` +
      `/aide - Afficher ce message\n\n` +
      `<b>Sites supportés:</b>\n` +
      `Amazon, AliExpress, Alibaba, et la plupart des sites e-commerce\n\n` +
      `💡 <i>Colle juste le lien, choisis la catégorie, c'est tout!</i>`,
  );
}

async function handlePriceUpdate(chatId: number, text: string) {
  const match = text.match(/^\/prix\s+(\S+)\s+(\d+(?:[.,]\d+)?)/);
  if (!match) {
    await sendMessage(chatId, '📝 Usage: <code>/prix slug-du-produit 25</code>');
    return;
  }

  const [, slug, priceStr] = match;
  const newPrice = parseFloat(priceStr.replace(',', '.'));

  const { data, error } = await getSupabase()
    .from('products')
    .update({ price: newPrice })
    .eq('slug', slug)
    .select('name')
    .single();

  if (error || !data) {
    await sendMessage(chatId, `❌ Produit "${slug}" non trouvé.`);
    return;
  }

  await sendMessage(chatId, `✅ Prix de <b>${data.name}</b> mis à jour: ${newPrice} USD`);
}

async function handleStockUpdate(chatId: number, text: string) {
  const match = text.match(/^\/stock\s+(\S+)\s+(\d+)/);
  if (!match) {
    await sendMessage(chatId, '📝 Usage: <code>/stock slug-du-produit 50</code>');
    return;
  }

  const [, slug, stockStr] = match;
  const newStock = parseInt(stockStr);

  const { data, error } = await getSupabase()
    .from('products')
    .update({ stock: newStock })
    .eq('slug', slug)
    .select('name')
    .single();

  if (error || !data) {
    await sendMessage(chatId, `❌ Produit "${slug}" non trouvé.`);
    return;
  }

  await sendMessage(chatId, `✅ Stock de <b>${data.name}</b> mis à jour: ${newStock}`);
}

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();

    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message?.chat?.id;
      const messageId = cb.message?.message_id;
      const data = cb.data as string;

      if (!chatId || !isAdmin(chatId)) {
        await answerCallback(cb.id, 'Non autorisé');
        return Response.json({ ok: true });
      }

      if (data === 'cancel') {
        pendingScrapes.delete(chatId);
        await answerCallback(cb.id, 'Annulé');
        await editMessage(chatId, messageId, '❌ Action annulée.');
        return Response.json({ ok: true });
      }

      if (data.startsWith('cat:')) {
        const category = data.slice(4) as Category;
        await handleCategorySelection(chatId, messageId, cb.id, category);
        return Response.json({ ok: true });
      }

      if (data.startsWith('del:')) {
        const productId = data.slice(4);
        await handleDeleteConfirm(chatId, messageId, cb.id, productId);
        return Response.json({ ok: true });
      }

      await answerCallback(cb.id);
      return Response.json({ ok: true });
    }

    const message = update.message;
    if (!message?.text) return Response.json({ ok: true });

    const chatId = message.chat.id;
    const text = message.text.trim();

    if (!isAdmin(chatId)) {
      await sendMessage(chatId, '🔒 Bot réservé à l\'administrateur.');
      return Response.json({ ok: true });
    }

    if (text === '/start' || text === '/aide' || text === '/help') {
      await handleHelp(chatId);
    } else if (text === '/produits') {
      await handleListProducts(chatId);
    } else if (text === '/supprimer') {
      await handleDeleteProduct(chatId);
    } else if (text === '/stats') {
      await handleStats(chatId);
    } else if (text.startsWith('/prix')) {
      await handlePriceUpdate(chatId, text);
    } else if (text.startsWith('/stock')) {
      await handleStockUpdate(chatId, text);
    } else if (isUrl(text)) {
      await handleUrl(chatId, text);
    } else {
      await sendMessage(
        chatId,
        `🤖 Je ne comprends pas.\n\n` +
          `Envoie un <b>lien produit</b> pour l'ajouter, ou tape /aide pour les commandes.`,
      );
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error('Telegram webhook error:', err);
    return Response.json({ ok: true });
  }
}
