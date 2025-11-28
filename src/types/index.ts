export interface WardrobeItem {
  id: string;
  name: string;
  category: 'tops' | 'bottoms' | 'shoes' | 'accessories' | 'outerwear';
  color: string;
  colorHex: string;
  imageUrl: string;
  usageCount: number;
  lastWorn?: string;
  createdAt: string;
}

export interface Outfit {
  id: string;
  items: WardrobeItem[];
  occasion: string;
  score: number;
  reasoning: string;
  createdAt: string;
}

export interface ColorTrend {
  color: string;
  colorHex: string;
  count: number;
  percentage: number;
}

export interface CategoryUsage {
  category: string;
  count: number;
  percentage: number;
}

export interface WardrobeAnalytics {
  totalItems: number;
  colorTrends: ColorTrend[];
  categoryUsage: CategoryUsage[];
  mostWornItems: WardrobeItem[];
  recentOutfits: Outfit[];
}
