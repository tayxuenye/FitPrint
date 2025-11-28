import { NextRequest, NextResponse } from 'next/server';
import { WardrobeItem, Outfit } from '@/types';

// Hugging Face API configuration
const HF_API_URL = 'https://api-inference.huggingface.co/models/gpt2';

interface RecommendRequest {
  items: WardrobeItem[];
  occasion?: string;
}

// Generate outfit recommendations using AI/ML logic
async function generateOutfitRecommendations(
  items: WardrobeItem[],
  occasion: string = 'casual'
): Promise<Outfit[]> {
  // Group items by category
  const tops = items.filter(i => i.category === 'tops');
  const bottoms = items.filter(i => i.category === 'bottoms');
  const shoes = items.filter(i => i.category === 'shoes');
  const accessories = items.filter(i => i.category === 'accessories');
  const outerwear = items.filter(i => i.category === 'outerwear');

  const outfits: Outfit[] = [];

  // Color harmony rules for scoring
  const colorHarmonyRules: Record<string, string[]> = {
    'White': ['Black', 'Navy Blue', 'Blue', 'Grey', 'Khaki', 'Brown', 'Red'],
    'Black': ['White', 'Grey', 'Red', 'Silver'],
    'Navy Blue': ['White', 'Khaki', 'Brown', 'Grey'],
    'Blue': ['White', 'Khaki', 'Brown', 'Grey'],
    'Grey': ['White', 'Black', 'Blue', 'Navy Blue', 'Red'],
    'Khaki': ['White', 'Navy Blue', 'Blue', 'Brown'],
    'Brown': ['White', 'Navy Blue', 'Blue', 'Khaki'],
    'Red': ['White', 'Black', 'Grey', 'Blue'],
  };

  // Occasion-based scoring
  const occasionPreferences: Record<string, { categories: string[]; colors: string[] }> = {
    casual: {
      categories: ['tops', 'bottoms', 'shoes'],
      colors: ['White', 'Blue', 'Grey', 'Black', 'Khaki'],
    },
    formal: {
      categories: ['tops', 'outerwear', 'bottoms', 'shoes', 'accessories'],
      colors: ['Navy Blue', 'Black', 'White', 'Grey', 'Brown'],
    },
    sporty: {
      categories: ['tops', 'bottoms', 'shoes'],
      colors: ['White', 'Red', 'Black', 'Grey'],
    },
    business: {
      categories: ['tops', 'outerwear', 'bottoms', 'shoes', 'accessories'],
      colors: ['Navy Blue', 'White', 'Black', 'Grey', 'Brown'],
    },
  };

  const prefs = occasionPreferences[occasion] || occasionPreferences.casual;

  // Generate combinations
  const combinations: WardrobeItem[][] = [];

  // Basic combination: top + bottom + shoes
  tops.forEach(top => {
    bottoms.forEach(bottom => {
      shoes.forEach(shoe => {
        combinations.push([top, bottom, shoe]);

        // Add accessory if available
        if (accessories.length > 0) {
          accessories.forEach(acc => {
            combinations.push([top, bottom, shoe, acc]);
          });
        }

        // Add outerwear for formal occasions
        if (occasion === 'formal' || occasion === 'business') {
          outerwear.forEach(outer => {
            combinations.push([top, outer, bottom, shoe]);
            if (accessories.length > 0) {
              accessories.forEach(acc => {
                combinations.push([top, outer, bottom, shoe, acc]);
              });
            }
          });
        }
      });
    });
  });

  // Create outfits with reasoning
  combinations.forEach((combo, index) => {
    const reasons: string[] = [];

    // Color harmony
    const colors = combo.map(item => item.color);
    const hasHarmoniousColors = colors.some((color, i) => {
      const harmonious = colorHarmonyRules[color] || [];
      return colors.some((otherColor, j) => i !== j && harmonious.includes(otherColor));
    });
    if (hasHarmoniousColors) {
      reasons.push('The colors complement each other beautifully');
    }

    // Occasion preference
    const hasPreferredColors = combo.some(item => prefs.colors.includes(item.color));
    if (hasPreferredColors) {
      reasons.push(`Colors match ${occasion} style`);
    }

    // Variety bonus
    const uniqueCategories = new Set(combo.map(item => item.category)).size;
    if (uniqueCategories >= 3) {
      reasons.push('Good variety of item types');
    }

    // Usage-based (prefer less worn items for freshness)
    const avgUsage = combo.reduce((sum, item) => sum + (item.usageCount || 0), 0) / combo.length;
    if (avgUsage < 10) {
      reasons.push('Fresh combination with less-worn items');
    }

    if (reasons.length === 0) {
      reasons.push('Basic matching outfit');
    }

    outfits.push({
      id: `outfit-${index + 1}`,
      items: combo,
      occasion,
      reasoning: reasons.join('. ') + '.',
      createdAt: new Date().toISOString(),
    });
  });

  // Helper function to score outfits
  function scoreOutfit(items: WardrobeItem[], occasion: string): number {
    let score = 50;
    const prefs = occasionPreferences[occasion] || occasionPreferences.casual;

    // Color harmony scoring
    const colors = items.map(item => item.color);
    colors.forEach((color, i) => {
      const harmonious = colorHarmonyRules[color] || [];
      colors.forEach((otherColor, j) => {
        if (i !== j && harmonious.includes(otherColor)) {
          score += 10;
        }
      });
    });

    // Occasion preference scoring
    const hasPreferredColors = items.some(item => prefs.colors.includes(item.color));
    if (hasPreferredColors) {
      score += 15;
    }

    // Variety bonus
    const uniqueCategories = new Set(items.map(item => item.category)).size;
    if (uniqueCategories >= 3) {
      score += 10;
    }

    return Math.min(100, score);
  }

  // Score outfits and sort by score, then return top 5
  const scoredOutfits = outfits.map(outfit => ({
    outfit,
    score: scoreOutfit(outfit.items, occasion),
  }));

  scoredOutfits.sort((a, b) => b.score - a.score);

  return scoredOutfits.slice(0, 5).map(({ outfit }) => outfit);
}

// Optional: Call Hugging Face API for text-based reasoning
async function enhanceWithHuggingFace(outfit: Outfit): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiKey) {
    return outfit.reasoning;
  }

  try {
    const itemDescriptions = outfit.items
      .map(item => `${item.color} ${item.name}`)
      .join(', ');

    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `Style tip for outfit with ${itemDescriptions}:`,
        parameters: {
          max_new_tokens: 50,
          temperature: 0.7,
        },
      }),
    });

    if (response.ok) {
      const result = await response.json();
      if (Array.isArray(result) && result[0]?.generated_text) {
        return result[0].generated_text;
      }
    }
  } catch (error) {
    // Log error for debugging but fallback to original reasoning
    console.warn('Hugging Face API unavailable, using fallback reasoning:', error);
  }

  return outfit.reasoning;
}

export async function POST(request: NextRequest) {
  try {
    const body: RecommendRequest = await request.json();
    const { items, occasion = 'casual' } = body;

    if (!items || items.length < 3) {
      return NextResponse.json(
        { error: 'Please select at least 3 items (top, bottom, shoes) for recommendations' },
        { status: 400 }
      );
    }

    const outfits = await generateOutfitRecommendations(items, occasion);

    // Optionally enhance with Hugging Face (if API key is configured)
    const enhancedOutfits = await Promise.all(
      outfits.map(async (outfit) => ({
        ...outfit,
        reasoning: await enhanceWithHuggingFace(outfit),
      }))
    );

    return NextResponse.json({ outfits: enhancedOutfits });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
