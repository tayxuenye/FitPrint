import { WardrobeItem, Outfit, WardrobeAnalytics, ColorTrend, CategoryUsage } from '@/types';

// Sample predefined wardrobe items
export const sampleWardrobeItems: WardrobeItem[] = [
  {
    id: '1',
    name: 'White Cotton T-Shirt',
    category: 'tops',
    color: 'White',
    colorHex: '#FFFFFF',
    imageUrl: '/wardrobe/white-tshirt.svg',
    occasion: ['casual', 'sporty'],
    priceSGD: 25,
    usageCount: 15,
    lastWorn: '2024-01-15',
    isFavorite: true,
    aiExtracted: false,
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Navy Blue Blazer',
    category: 'outerwear',
    color: 'Navy Blue',
    colorHex: '#000080',
    imageUrl: '/wardrobe/navy-blazer.svg',
    occasion: ['formal', 'business'],
    priceSGD: 150,
    usageCount: 8,
    lastWorn: '2024-01-14',
    isFavorite: true,
    aiExtracted: false,
    createdAt: '2024-01-01',
  },
  {
    id: '3',
    name: 'Black Slim Jeans',
    category: 'bottoms',
    color: 'Black',
    colorHex: '#000000',
    imageUrl: '/wardrobe/black-jeans.svg',
    occasion: ['casual', 'streetwear'],
    priceSGD: 80,
    usageCount: 20,
    lastWorn: '2024-01-15',
    isFavorite: false,
    aiExtracted: false,
    createdAt: '2024-01-01',
  },
  {
    id: '4',
    name: 'Brown Leather Shoes',
    category: 'shoes',
    color: 'Brown',
    colorHex: '#8B4513',
    imageUrl: '/wardrobe/brown-shoes.svg',
    occasion: ['formal', 'business', 'casual'],
    priceSGD: 200,
    usageCount: 12,
    lastWorn: '2024-01-14',
    isFavorite: false,
    aiExtracted: false,
    createdAt: '2024-01-01',
  },
  {
    id: '5',
    name: 'Grey Hoodie',
    category: 'tops',
    color: 'Grey',
    colorHex: '#808080',
    imageUrl: '/wardrobe/grey-hoodie.svg',
    occasion: ['casual', 'sporty'],
    priceSGD: 45,
    usageCount: 10,
    lastWorn: '2024-01-13',
    isFavorite: false,
    aiExtracted: false,
    createdAt: '2024-01-01',
  },
  {
    id: '6',
    name: 'Khaki Chinos',
    category: 'bottoms',
    color: 'Khaki',
    colorHex: '#C3B091',
    imageUrl: '/wardrobe/khaki-chinos.svg',
    occasion: ['casual', 'business'],
    priceSGD: 60,
    usageCount: 7,
    lastWorn: '2024-01-12',
    isFavorite: false,
    aiExtracted: false,
    createdAt: '2024-01-01',
  },
  {
    id: '7',
    name: 'Red Sneakers',
    category: 'shoes',
    color: 'Red',
    colorHex: '#FF0000',
    imageUrl: '/wardrobe/red-sneakers.svg',
    occasion: ['casual', 'sporty'],
    priceSGD: 120,
    usageCount: 5,
    lastWorn: '2024-01-11',
    isFavorite: false,
    aiExtracted: false,
    createdAt: '2024-01-01',
  },
  {
    id: '8',
    name: 'Silver Watch',
    category: 'accessories',
    color: 'Silver',
    colorHex: '#C0C0C0',
    imageUrl: '/wardrobe/silver-watch.svg',
    occasion: ['formal', 'business', 'casual'],
    priceSGD: 300,
    usageCount: 18,
    lastWorn: '2024-01-15',
    isFavorite: true,
    aiExtracted: false,
    createdAt: '2024-01-01',
  },
  {
    id: '9',
    name: 'Denim Jacket',
    category: 'outerwear',
    color: 'Blue',
    colorHex: '#4169E1',
    imageUrl: '/wardrobe/denim-jacket.svg',
    occasion: ['casual', 'streetwear'],
    priceSGD: 90,
    usageCount: 6,
    lastWorn: '2024-01-10',
    isFavorite: false,
    aiExtracted: false,
    createdAt: '2024-01-01',
  },
  {
    id: '10',
    name: 'Striped Polo',
    category: 'tops',
    color: 'Blue/White',
    colorHex: '#87CEEB',
    imageUrl: '/wardrobe/striped-polo.svg',
    occasion: ['casual', 'business'],
    priceSGD: 40,
    usageCount: 4,
    lastWorn: '2024-01-09',
    isFavorite: false,
    aiExtracted: false,
    createdAt: '2024-01-01',
  },
];

export function generateId(): string {
  // Use crypto.randomUUID if available, fallback to timestamp-based ID
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export function calculateColorTrends(items: WardrobeItem[]): ColorTrend[] {
  const colorMap = new Map<string, { colorHex: string; count: number }>();

  items.forEach(item => {
    const existing = colorMap.get(item.color);
    if (existing) {
      existing.count++;
    } else {
      colorMap.set(item.color, { colorHex: item.colorHex, count: 1 });
    }
  });

  const total = items.length;
  return Array.from(colorMap.entries())
    .map(([color, { colorHex, count }]) => ({
      color,
      colorHex,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

export function calculateCategoryUsage(items: WardrobeItem[]): CategoryUsage[] {
  const categoryMap = new Map<string, number>();

  items.forEach(item => {
    const existing = categoryMap.get(item.category) || 0;
    categoryMap.set(item.category, existing + 1);
  });

  const total = items.length;
  return Array.from(categoryMap.entries())
    .map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

export function getMostWornItems(items: WardrobeItem[], limit = 5): WardrobeItem[] {
  return [...items]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, limit);
}

export function calculateAnalytics(
  items: WardrobeItem[],
  outfits: Outfit[]
): WardrobeAnalytics {
  return {
    totalItems: items.length,
    colorTrends: calculateColorTrends(items),
    categoryUsage: calculateCategoryUsage(items),
    mostWornItems: getMostWornItems(items),
    recentOutfits: outfits.slice(-5),
  };
}
