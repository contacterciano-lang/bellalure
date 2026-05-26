export type Badge = 'nouveau' | 'best-seller' | 'tendance' | 'promo';

export type Category =
  | 'femme'
  | 'homme'
  | 'chaussures'
  | 'accessoires'
  | 'sacs';

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: Category;
  price: number;
  originalPrice?: number;
  currency: string;
  description: string;
  images: string[];
  sizes?: string[];
  colors?: ProductColor[];
  badge?: Badge;
  stock: number;
  rating: number;
  reviews: number;
  featured?: boolean;
  trending?: boolean;
  newArrival?: boolean;
}

export interface CategoryInfo {
  slug: Category;
  name: string;
  description: string;
  image: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { slug: 'femme', name: 'Femme', description: 'Mode féminine tendance', image: 'https://img.baba-blog.com/2024/06/the-womens-clothing6.jpg?x-oss-process=style%2Ffull' },
  { slug: 'homme', name: 'Homme', description: 'Style masculin moderne', image: 'https://img.baba-blog.com/2024/02/boomber-jacket.jpeg?x-oss-process=style%2Ffull' },
  { slug: 'chaussures', name: 'Chaussures', description: 'Sneakers & chaussures sport', image: 'https://img.baba-blog.com/2025/04/Wholesale-New-Men-Running-Shoes.jpg?x-oss-process=style%2Ffull' },
  { slug: 'accessoires', name: 'Accessoires', description: 'Montres, bijoux & accessoires', image: 'https://xcimg.szwego.com/img/126da278/20250822/i1755803206442_9024_0_0.jpg' },
  { slug: 'sacs', name: 'Sacs', description: 'Sacs & maroquinerie', image: 'https://xcimg.szwego.com/img/755f7c0e/20231104/i1699103077_4944_0.jpg' },
];
