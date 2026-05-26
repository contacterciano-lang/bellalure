export const siteConfig = {
  name: 'Bellalure',
  slogan: 'La mode et les tendances du monde entier, livrees jusqu\'a vous.',
  description: 'Boutique en ligne premium — Mode femme & homme, chaussures, sacs et accessoires livres a Kinshasa et partout dans le monde.',
  whatsapp: {
    number: '+33758167830',
    message: (productName: string, size?: string, color?: string, quantity?: number, price?: number) => {
      const lines: string[] = [
        `Bonjour Bellalure !`,
        ``,
        `Je souhaite commander :`,
        `Produit : ${productName}`,
      ];
      if (size) lines.push(`Taille : ${size}`);
      if (color) lines.push(`Couleur : ${color}`);
      if (quantity && quantity > 1) lines.push(`Quantite : ${quantity}`);
      if (price) lines.push(`Prix : $${price.toFixed(2)}`);
      lines.push(``, `Merci de confirmer la disponibilite et les frais de livraison.`);
      return lines.join('\n');
    },
  },
  currency: 'USD',
  social: {
    instagram: 'https://instagram.com/bellalure',
    tiktok: 'https://tiktok.com/@bellalure',
    facebook: 'https://facebook.com/bellalure',
  },
  delivery: {
    zones: [
      { name: 'Kinshasa', fee: 5, delay: '1-2 jours' },
      { name: 'Provinces RDC', fee: 15, delay: '5-10 jours' },
      { name: 'International', fee: 30, delay: '15-30 jours' },
    ],
    payment: ['Mobile Money', 'Airtel Money', 'Orange Money', 'Wave', 'Cash'],
  },
};

export function getWhatsAppUrl(
  productName: string,
  size?: string,
  color?: string,
  quantity?: number,
  price?: number,
): string {
  const msg = encodeURIComponent(
    siteConfig.whatsapp.message(productName, size, color, quantity, price),
  );
  return `https://wa.me/${siteConfig.whatsapp.number.replace(/[^0-9+]/g, '')}?text=${msg}`;
}
