export const siteConfig = {
  name: 'Bellalure',
  slogan: 'La mode et les tendances du monde entier, livrées jusqu\'à vous.',
  description: 'Boutique en ligne premium — Mode femme & homme, chaussures, sacs et accessoires livrés à Kinshasa et partout dans le monde.',
  whatsapp: {
    number: '+33758167830',
    message: (productName: string, size?: string, color?: string) => {
      let details = '';
      if (size) details += `\n📏 Taille : ${size}`;
      if (color) details += `\n🎨 Couleur : ${color}`;
      return `Bonjour Bellalure 👋\n\nJe souhaite commander :\n🛍️ Modèle : ${productName}${details}\n\nMerci de me confirmer la disponibilité et le prix de livraison.`;
    },
  },
  currency: 'USD',
  social: {
    instagram: 'https://instagram.com/bellalure',
    tiktok: 'https://tiktok.com/@bellalure',
    facebook: 'https://facebook.com/bellalure',
  },
  delivery: {
    zones: ['Kinshasa', 'France', 'Belgique', 'International'],
    payment: ['Mobile Money', 'Airtel Money', 'Orange Money', 'Wave', 'Virement bancaire'],
  },
};

export function getWhatsAppUrl(productName: string, size?: string, color?: string): string {
  const msg = encodeURIComponent(siteConfig.whatsapp.message(productName, size, color));
  return `https://wa.me/${siteConfig.whatsapp.number.replace(/[^0-9+]/g, '')}?text=${msg}`;
}
