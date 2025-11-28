import { NextRequest, NextResponse } from 'next/server';
import { ChatRequest, ChatResponse, WardrobeItem, Outfit } from '@/types';

// Color harmony rules
const COLOR_HARMONY: Record<string, string[]> = {
    'White': ['Black', 'Navy Blue', 'Blue', 'Grey', 'Khaki', 'Brown', 'Red'],
    'Black': ['White', 'Grey', 'Red', 'Silver'],
    'Navy Blue': ['White', 'Khaki', 'Brown', 'Grey'],
    'Blue': ['White', 'Khaki', 'Brown', 'Grey'],
    'Grey': ['White', 'Black', 'Blue', 'Navy Blue', 'Red'],
    'Khaki': ['White', 'Navy Blue', 'Blue', 'Brown'],
    'Brown': ['White', 'Navy Blue', 'Blue', 'Khaki'],
    'Red': ['White', 'Black', 'Grey', 'Blue'],
};

// Occasion preferences
const OCCASION_PREFERENCES: Record<string, { categories: string[]; colors: string[] }> = {
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
    work: {
        categories: ['tops', 'bottoms', 'shoes', 'accessories'],
        colors: ['Navy Blue', 'White', 'Black', 'Grey'],
    },
    party: {
        categories: ['tops', 'bottoms', 'shoes', 'accessories'],
        colors: ['Black', 'Red', 'Blue', 'White'],
    },
    date: {
        categories: ['tops', 'bottoms', 'shoes', 'accessories'],
        colors: ['Navy Blue', 'White', 'Black', 'Grey', 'Red'],
    },
};

function parseUserIntent(message: string): { occasion?: string; count?: number } {
    const lowerMessage = message.toLowerCase();

    // Extract occasion
    for (const [occasion, _] of Object.entries(OCCASION_PREFERENCES)) {
        if (lowerMessage.includes(occasion)) {
            return { occasion };
        }
    }

    // Check for specific keywords
    if (lowerMessage.includes('interview') || lowerMessage.includes('job')) {
        return { occasion: 'business' };
    }
    if (lowerMessage.includes('date')) {
        return { occasion: 'date' };
    }
    if (lowerMessage.includes('party') || lowerMessage.includes('celebration')) {
        return { occasion: 'party' };
    }
    if (lowerMessage.includes('formal') || lowerMessage.includes('wedding') || lowerMessage.includes('dinner')) {
        return { occasion: 'formal' };
    }
    if (lowerMessage.includes('sport') || lowerMessage.includes('gym') || lowerMessage.includes('workout')) {
        return { occasion: 'sporty' };
    }

    return { occasion: 'casual' }; // Default
}

function generateOutfits(
    items: WardrobeItem[],
    occasion: string = 'casual',
    maxOutfits: number = 5
): Outfit[] {
    const prefs = OCCASION_PREFERENCES[occasion] || OCCASION_PREFERENCES.casual;

    // Filter items by occasion if they have occasion tags
    let availableItems = items;
    const itemsWithOccasion = items.filter(item =>
        item.occasion.length > 0 && item.occasion.some(occ =>
            occ.toLowerCase() === occasion.toLowerCase() ||
            (occasion === 'business' && occ === 'work')
        )
    );

    if (itemsWithOccasion.length >= 3) {
        availableItems = itemsWithOccasion;
    }

    // Group by category
    const tops = availableItems.filter(i => i.category === 'tops');
    const bottoms = availableItems.filter(i => i.category === 'bottoms');
    const dresses = availableItems.filter(i => i.category === 'dresses');
    const shoes = availableItems.filter(i => i.category === 'shoes');
    const accessories = availableItems.filter(i => i.category === 'accessories');
    const outerwear = availableItems.filter(i => i.category === 'outerwear');

    const outfits: Outfit[] = [];
    const seenCombinations = new Set<string>();

    // Generate combinations
    // For dresses, they can be standalone
    dresses.forEach(dress => {
        shoes.forEach(shoe => {
            const combo = [dress, shoe];
            const comboKey = combo.map(i => i.id).sort().join('-');

            if (!seenCombinations.has(comboKey) && combo.length >= 2) {
                seenCombinations.add(comboKey);
                outfits.push(createOutfit(combo, occasion));
            }

            // Add accessories
            accessories.forEach(acc => {
                const comboWithAcc = [dress, shoe, acc];
                const comboKeyWithAcc = comboWithAcc.map(i => i.id).sort().join('-');
                if (!seenCombinations.has(comboKeyWithAcc)) {
                    seenCombinations.add(comboKeyWithAcc);
                    outfits.push(createOutfit(comboWithAcc, occasion));
                }
            });
        });
    });

    // Standard combinations: top + bottom + shoes
    tops.forEach(top => {
        bottoms.forEach(bottom => {
            shoes.forEach(shoe => {
                const combo = [top, bottom, shoe];
                const comboKey = combo.map(i => i.id).sort().join('-');

                if (!seenCombinations.has(comboKey)) {
                    seenCombinations.add(comboKey);
                    outfits.push(createOutfit(combo, occasion));
                }

                // Add outerwear for formal/business
                if (occasion === 'formal' || occasion === 'business') {
                    outerwear.forEach(outer => {
                        const comboWithOuter = [top, outer, bottom, shoe];
                        const comboKeyWithOuter = comboWithOuter.map(i => i.id).sort().join('-');
                        if (!seenCombinations.has(comboKeyWithOuter)) {
                            seenCombinations.add(comboKeyWithOuter);
                            outfits.push(createOutfit(comboWithOuter, occasion));
                        }
                    });
                }

                // Add accessories
                accessories.forEach(acc => {
                    const comboWithAcc = [top, bottom, shoe, acc];
                    const comboKeyWithAcc = comboWithAcc.map(i => i.id).sort().join('-');
                    if (!seenCombinations.has(comboKeyWithAcc)) {
                        seenCombinations.add(comboKeyWithAcc);
                        outfits.push(createOutfit(comboWithAcc, occasion));
                    }
                });
            });
        });
    });

    // Score and sort outfits
    outfits.sort((a, b) => {
        const scoreA = scoreOutfit(a.items, occasion);
        const scoreB = scoreOutfit(b.items, occasion);
        return scoreB - scoreA;
    });

    return outfits.slice(0, maxOutfits);
}

function scoreOutfit(items: WardrobeItem[], occasion: string): number {
    const prefs = OCCASION_PREFERENCES[occasion] || OCCASION_PREFERENCES.casual;
    let score = 50;

    // Color harmony scoring
    const colors = items.map(item => item.color);
    colors.forEach((color, i) => {
        const harmonious = COLOR_HARMONY[color] || [];
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

    // Category variety bonus
    const uniqueCategories = new Set(items.map(item => item.category)).size;
    if (uniqueCategories >= 3) {
        score += 10;
    }

    return Math.min(100, score);
}

function createOutfit(items: WardrobeItem[], occasion: string): Outfit {
    const score = scoreOutfit(items, occasion);

    // Generate reasoning
    const reasons: string[] = [];

    // Color harmony
    const colors = items.map(item => item.color);
    const hasHarmoniousColors = colors.some((color, i) => {
        const harmonious = COLOR_HARMONY[color] || [];
        return colors.some((otherColor, j) => i !== j && harmonious.includes(otherColor));
    });

    if (hasHarmoniousColors) {
        reasons.push('The colors complement each other beautifully');
    }

    // Category variety
    const uniqueCategories = new Set(items.map(item => item.category)).size;
    if (uniqueCategories >= 3) {
        reasons.push('This combination includes a good variety of pieces');
    }

    // Occasion appropriateness
    const prefs = OCCASION_PREFERENCES[occasion] || OCCASION_PREFERENCES.casual;
    const hasAppropriateColors = items.some(item => prefs.colors.includes(item.color));
    if (hasAppropriateColors) {
        reasons.push(`Perfect for ${occasion} occasions`);
    }

    // Default reasoning
    if (reasons.length === 0) {
        reasons.push('A stylish combination that works well together');
    }

    return {
        id: `outfit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        items,
        occasion,
        reasoning: reasons.join('. ') + '.',
        createdAt: new Date().toISOString(),
    };
}

export async function POST(request: NextRequest) {
    try {
        const body: ChatRequest = await request.json();
        const { message, wardrobeItems } = body;

        if (!message || !wardrobeItems) {
            return NextResponse.json(
                { error: 'Message and wardrobe items are required' },
                { status: 400 }
            );
        }

        if (wardrobeItems.length < 2) {
            return NextResponse.json({
                message: "You need at least 2 items in your wardrobe to get outfit recommendations. Add more items to your closet first!",
                outfits: [],
            });
        }

        // Parse user intent
        const { occasion } = parseUserIntent(message);

        // Generate outfits with timeout
        const timeoutPromise = new Promise<Outfit[]>((_, reject) => {
            setTimeout(() => reject(new Error('Timeout')), 5000);
        });

        const outfitsPromise = Promise.resolve(generateOutfits(wardrobeItems, occasion, 5));

        let outfits: Outfit[];
        try {
            outfits = await Promise.race([outfitsPromise, timeoutPromise]);
        } catch (error) {
            // Timeout or error - return partial results or error message
            return NextResponse.json({
                message: "I'm having trouble generating recommendations right now. Please try again with a simpler request.",
                outfits: [],
            });
        }

        if (outfits.length === 0) {
            return NextResponse.json({
                message: `I couldn't find enough items for a ${occasion} outfit. Try adding more items to your wardrobe or asking for a different occasion.`,
                outfits: [],
            });
        }

        // Generate response message
        let responseMessage = `Here are ${outfits.length} outfit recommendation${outfits.length > 1 ? 's' : ''} for ${occasion} occasions:\n\n`;
        outfits.forEach((outfit, index) => {
            const itemNames = outfit.items.map(item => item.name).join(', ');
            responseMessage += `${index + 1}. ${itemNames}\n`;
        });

        return NextResponse.json({
            message: responseMessage,
            outfits,
        } as ChatResponse);
    } catch (error) {
        console.error('Error processing chat request:', error);
        return NextResponse.json(
            {
                message: "I'm sorry, I encountered an error. Please try again.",
                outfits: [],
            },
            { status: 500 }
        );
    }
}

