export interface ScrapedProduct {
  name: string;
  description: string;
  price: number | null;
  originalPrice: number | null;
  currency: string;
  images: string[];
}

function extractMeta(html: string, property: string): string | null {
  const ogPattern = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
    'i'
  );
  const match = html.match(ogPattern);
  if (match) return match[1];

  const reversePattern = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
    'i'
  );
  const reverseMatch = html.match(reversePattern);
  return reverseMatch ? reverseMatch[1] : null;
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : '';
}

function extractImages(html: string, baseUrl: string, hostname: string): string[] {
  const images: string[] = [];
  const seen = new Set<string>();

  const ogImage = extractMeta(html, 'og:image');
  if (ogImage) {
    const url = resolveUrl(ogImage, baseUrl);
    if (url && !seen.has(url)) {
      seen.add(url);
      images.push(url);
    }
  }

  if (hostname.includes('aliexpress')) {
    const aeImgRegex = /(?:imgUrl|imageUrl|imagePathList)["']?\s*[:=]\s*["']([^"']+)["']/gi;
    let aeMatch;
    while ((aeMatch = aeImgRegex.exec(html)) !== null && images.length < 15) {
      const src = aeMatch[1].replace(/^\/\//, 'https://');
      if (src.includes('.jpg') || src.includes('.png') || src.includes('.webp')) {
        const url = resolveUrl(src, baseUrl);
        if (url && !seen.has(url)) {
          seen.add(url);
          images.push(url);
        }
      }
    }
  }

  if (hostname.includes('alibaba')) {
    const aliImgRegex = /data-(?:lazy-)?src=["']([^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/gi;
    let aliMatch;
    while ((aliMatch = aliImgRegex.exec(html)) !== null && images.length < 15) {
      const src = aliMatch[1].replace(/^\/\//, 'https://');
      const url = resolveUrl(src, baseUrl);
      if (url && !seen.has(url)) {
        seen.add(url);
        images.push(url);
      }
    }
  }

  if (hostname.includes('amazon')) {
    const hiResRegex = /"hiRes"\s*:\s*"([^"]+)"/g;
    let hiResMatch;
    while ((hiResMatch = hiResRegex.exec(html)) !== null && images.length < 15) {
      const url = hiResMatch[1];
      if (!seen.has(url)) {
        seen.add(url);
        images.push(url);
      }
    }
    const largeRegex = /"large"\s*:\s*"([^"]+)"/g;
    let largeMatch;
    while ((largeMatch = largeRegex.exec(html)) !== null && images.length < 15) {
      const url = largeMatch[1];
      if (!seen.has(url)) {
        seen.add(url);
        images.push(url);
      }
    }
  }

  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*/gi;
  let imgMatch;
  while ((imgMatch = imgRegex.exec(html)) !== null && images.length < 15) {
    const src = imgMatch[1];
    if (isProductImage(src, imgMatch[0])) {
      const url = resolveUrl(src, baseUrl);
      if (url && !seen.has(url)) {
        seen.add(url);
        images.push(url);
      }
    }
  }

  return images;
}

function isProductImage(src: string, tag: string): boolean {
  const lower = src.toLowerCase();
  if (lower.includes('logo') || lower.includes('icon') || lower.includes('favicon')) return false;
  if (lower.includes('banner') || lower.includes('sprite') || lower.includes('pixel')) return false;
  if (lower.endsWith('.svg') || lower.endsWith('.gif')) return false;
  if (lower.includes('1x1') || lower.includes('tracking')) return false;

  const widthMatch = tag.match(/width=["']?(\d+)/i);
  const heightMatch = tag.match(/height=["']?(\d+)/i);
  if (widthMatch && parseInt(widthMatch[1]) < 50) return false;
  if (heightMatch && parseInt(heightMatch[1]) < 50) return false;

  return true;
}

function resolveUrl(url: string, base: string): string | null {
  try {
    if (url.startsWith('data:')) return null;
    if (url.startsWith('//')) url = 'https:' + url;
    return new URL(url, base).href;
  } catch {
    return null;
  }
}

function extractPrice(html: string, hostname: string): { price: number | null; originalPrice: number | null; currency: string } {
  let price: number | null = null;
  let originalPrice: number | null = null;
  let currency = 'USD';

  const ogPrice = extractMeta(html, 'product:price:amount') || extractMeta(html, 'og:price:amount');
  if (ogPrice) {
    price = parseFloat(ogPrice.replace(/[^0-9.]/g, ''));
  }
  const ogCurrency = extractMeta(html, 'product:price:currency') || extractMeta(html, 'og:price:currency');
  if (ogCurrency) currency = ogCurrency;

  if (hostname.includes('aliexpress') && !price) {
    const aePrice = html.match(/(?:formatedAmount|displayAmount|minAmount)["']?\s*[:=]\s*["']?\$?\s*(\d+[.,]?\d*)/i);
    if (aePrice) price = parseFloat(aePrice[1].replace(',', '.'));
    const aeOrig = html.match(/(?:originAmount|maxAmount)["']?\s*[:=]\s*["']?\$?\s*(\d+[.,]?\d*)/i);
    if (aeOrig) {
      const op = parseFloat(aeOrig[1].replace(',', '.'));
      if (op > (price || 0)) originalPrice = op;
    }
  }

  if (hostname.includes('alibaba') && !price) {
    const aliPrice = html.match(/(?:price|ladderPrice)["']?\s*:\s*["']?(\d+[.,]?\d*)/i);
    if (aliPrice) price = parseFloat(aliPrice[1].replace(',', '.'));
  }

  const jsonLdMatches = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const m of jsonLdMatches) {
    try {
      const data = JSON.parse(m[1]);
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        const offer = item.offers?.offers?.[0] || item.offers || item;
        if (offer.price && !price) {
          price = parseFloat(String(offer.price));
          if (offer.priceCurrency) currency = offer.priceCurrency;
        }
        if (offer.highPrice && !originalPrice) {
          originalPrice = parseFloat(String(offer.highPrice));
        }
      }
    } catch {
      // skip
    }
  }

  if (!price) {
    const pricePatterns = [
      /(?:price|prix|cost)["\s:]*(?:[$€£])\s*(\d+[.,]?\d*)/i,
      /(?:[$€£])\s*(\d+[.,]?\d*)/,
      /(\d+[.,]\d{2})\s*(?:USD|EUR|GBP|\$|€|£)/,
    ];
    for (const pattern of pricePatterns) {
      const match = html.match(pattern);
      if (match) {
        price = parseFloat(match[1].replace(',', '.'));
        break;
      }
    }
  }

  return { price, originalPrice, currency };
}

function extractJsonLdName(html: string): string | null {
  const jsonLdMatches = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const m of jsonLdMatches) {
    try {
      const data = JSON.parse(m[1]);
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item['@type'] === 'Product' && item.name) return item.name;
        if (item.name && item.offers) return item.name;
      }
    } catch {
      // skip
    }
  }
  return null;
}

function extractDescription(html: string): string {
  const ogDesc = extractMeta(html, 'og:description');
  if (ogDesc) return decodeHtmlEntities(ogDesc);

  const metaDesc = extractMeta(html, 'description');
  if (metaDesc) return decodeHtmlEntities(metaDesc);

  const jsonLdMatches = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const m of jsonLdMatches) {
    try {
      const data = JSON.parse(m[1]);
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item.description) return item.description;
      }
    } catch {
      // skip
    }
  }

  return '';
}

export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec)))
    .trim();
}

function getUserAgent(hostname: string): string {
  if (hostname.includes('aliexpress') || hostname.includes('alibaba')) {
    return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
  }
  return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
}

export async function scrapeProduct(url: string): Promise<ScrapedProduct> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
  } catch {
    throw new Error('URL invalide');
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  const response = await fetch(parsedUrl.href, {
    headers: {
      'User-Agent': getUserAgent(hostname),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate',
      'Cache-Control': 'no-cache',
    },
    signal: AbortSignal.timeout(20000),
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`Impossible de charger la page (${response.status})`);
  }

  const html = await response.text();

  if (html.length < 500) {
    throw new Error('La page semble vide ou bloquée');
  }

  const name =
    extractMeta(html, 'og:title') ||
    extractJsonLdName(html) ||
    extractTitle(html) ||
    'Produit sans nom';

  const description = extractDescription(html);
  const { price, originalPrice, currency } = extractPrice(html, hostname);
  const images = extractImages(html, parsedUrl.href, hostname);

  return {
    name: decodeHtmlEntities(name),
    description: description.slice(0, 500),
    price,
    originalPrice,
    currency,
    images,
  };
}
