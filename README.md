# BELLALURE

Boutique catalogue e-commerce premium pour le marche africain (Kinshasa, RDC) et la diaspora.

## Demarrage rapide

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Pages

| Route | Description |
|-------|------------|
| `/` | Page d'accueil avec hero, nouveautes, tendances, categories, promos |
| `/catalogue` | Catalogue complet avec filtres (categorie, prix, badge, tri) |
| `/produit/[slug]` | Page produit avec galerie, tailles, couleurs, WhatsApp |
| `/admin` | Panel admin (mot de passe : `bellalure2024`) |

## Structure du projet

```
src/
  app/              # Pages Next.js App Router
    catalogue/      # Page catalogue avec filtres
    produit/[slug]/ # Page detail produit
    admin/          # Panel d'administration
  components/
    home/           # Sections page d'accueil (Hero, Trending, etc.)
    layout/         # Header, Footer, MobileNav
    ui/             # Badge, SearchOverlay, WhatsAppFloat
  data/
    products.ts     # Catalogue de 109 produits
  lib/
    config.ts       # Configuration site + WhatsApp
    types.ts        # Types TypeScript + categories
    ThemeProvider.tsx # Dark mode
```

## Modifier le catalogue

### Ajouter un produit

Ouvrir `src/data/products.ts` et ajouter un objet au tableau :

```typescript
{
  id: 'prod-110',
  name: 'Nom du Produit',
  slug: 'nom-du-produit',           // URL du produit
  category: 'vetements-femmes',      // voir categories ci-dessous
  price: 89,
  originalPrice: 120,                // optionnel, pour les promos
  currency: 'USD',
  description: 'Description du produit.',
  images: [                          // 1 a 4 images
    'https://picsum.photos/seed/mon-produit-1/800/1000',
    'https://picsum.photos/seed/mon-produit-2/800/1000',
  ],
  sizes: ['S','M','L','XL'],         // optionnel
  colors: [                          // optionnel
    { name: 'Noir', hex: '#000000' },
  ],
  badge: 'nouveau',                  // optionnel: nouveau, best-seller, tendance, promo
  stock: 20,
  rating: 4.5,
  reviews: 50,
  featured: true,                    // optionnel: affiche en "Selection Premium"
  trending: true,                    // optionnel: affiche en "Tendances TikTok"
  newArrival: true,                  // optionnel: affiche en "Nouveautes"
}
```

### Categories disponibles

- `vetements-femmes` — Femmes
- `vetements-hommes` — Hommes
- `sneakers` — Sneakers
- `sacs` — Sacs
- `montres` — Montres
- `accessoires` — Accessoires
- `beaute` — Beaute
- `gadgets` — Gadgets
- `maison` — Maison
- `streetwear` — Streetwear
- `tendance-tiktok` — TikTok Trends

### Ajouter une categorie

1. Ajouter le type dans `src/lib/types.ts` (type `Category`)
2. Ajouter l'info dans le tableau `CATEGORIES`
3. Ajouter des produits avec cette categorie

## Modifier le numero WhatsApp

Ouvrir `src/lib/config.ts` et modifier :

```typescript
whatsapp: {
  number: '+33758167830',  // Remplacer par votre numero
}
```

Le format du message pre-rempli est aussi modifiable dans ce fichier.

## Fonctionnalites

- 109 produits repartis en 11 categories
- Commande via WhatsApp avec message pre-rempli
- Filtres : categorie, prix, badge, tri, recherche
- Galerie produit avec zoom au survol
- Selecteur de taille et couleur
- Dark mode
- Recherche plein ecran
- Panel admin avec ajout/modification/suppression
- Countdown promotionnel
- Section Lookbook, Temoignages, Livraison
- Navigation mobile bottom bar
- Bouton WhatsApp flottant
- SEO optimise
- Responsive mobile-first

## Stack technique

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Lucide React Icons

## Panel Admin

Accessible via `/admin` avec le mot de passe `bellalure2024`.

Fonctionnalites :
- Statistiques (total produits, stock, ruptures, promos)
- Tableau de gestion des produits
- Ajouter / modifier / supprimer des produits
- Recherche et filtre par categorie
- Les modifications sont en memoire (se reinitialise au rechargement)

## Deploiement

```bash
npm run build
npm start
```

Compatible avec Vercel, Netlify, ou tout hebergement Node.js.
