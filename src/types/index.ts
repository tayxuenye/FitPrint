export interface WardrobeItem {
  id: string;
  name: string;
  category: 'tops' | 'bottoms' | 'dresses' | 'outerwear' | 'shoes' | 'accessories';
  color: string;
  colorHex: string;
  imageUrl?: string; // Optional: may not have image if manually entered
  occasion: string[]; // e.g., ['casual', 'work', 'formal']
  priceSGD?: number; // Purchase price in Singapore Dollars
  usageCount: number;
  lastWorn?: string; // ISO date string
  isFavorite: boolean;
  aiExtracted: boolean; // Whether metadata was AI-extracted or manual
  createdAt: string; // ISO date string
}

export interface Outfit {
  id: string;
  items: WardrobeItem[];
  occasion: string;
  reasoning: string; // AI explanation for why these items work together
  createdAt: string;
}

export interface StyleProfile {
  totalItems: number;
  favoritePieces: number; // Count of items marked as favorite
  eventsPlanned: number;
  outfitsReady: number;
  favoriteStyle: 'casual' | 'formal' | 'sporty' | 'business' | 'streetwear';
  mostLovedPieces: WardrobeItem[]; // Top 3 most worn items
  colorPreference: string; // Most common color in wardrobe
  styleScore: number; // Percentage (0-100) based on outfit coordination
  wardrobeBreakdown: {
    tops: number;
    bottoms: number;
    outerwear: number;
    dresses: number;
    shoes: number;
    accessories: number;
  };
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  icon: string; // Emoji
  description: string;
  unlocked: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  outfits?: Outfit[]; // Included when assistant recommends outfits
  timestamp: string;
}

export interface ImageMetadata {
  suggestedName: string;
  category: 'tops' | 'bottoms' | 'dresses' | 'outerwear' | 'shoes' | 'accessories';
  color: string;
  colorHex: string;
  occasion: string[]; // e.g., ['casual', 'work']
  confidence: number; // 0-1
}

export interface ChatRequest {
  message: string;
  wardrobeItems: WardrobeItem[];
  conversationHistory?: ChatMessage[];
}

export interface ChatResponse {
  message: string;
  outfits?: Outfit[];
}

// Legacy types for backward compatibility
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
