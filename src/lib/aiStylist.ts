// Client-side AI Stylist using transformers.js with pretrained GPT-2
// Pretrained LLM - no training needed, just inference
// Runs locally in the browser, no API keys needed

'use client';

import { WardrobeItem, Outfit } from '@/types';

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

function parseUserIntent(message: string): { occasion?: string; count?: number; isQuestion?: boolean; needsOutfit?: boolean } {
    const lowerMessage = message.toLowerCase().trim();

    // FIRST: Check for occasion keywords (before checking for questions)
    // This ensures "party", "interview", etc. are detected even if the message contains "help"

    // Check for specific occasion keywords first
    if (lowerMessage.includes('party') || lowerMessage.includes('celebration')) {
        return { occasion: 'party', needsOutfit: true };
    }
    if (lowerMessage.includes('interview') || lowerMessage.includes('job')) {
        return { occasion: 'business', needsOutfit: true };
    }
    if (lowerMessage.includes('date')) {
        return { occasion: 'date', needsOutfit: true };
    }
    if (lowerMessage.includes('formal') || lowerMessage.includes('wedding') || lowerMessage.includes('dinner')) {
        return { occasion: 'formal', needsOutfit: true };
    }
    if (lowerMessage.includes('sport') || lowerMessage.includes('gym') || lowerMessage.includes('workout')) {
        return { occasion: 'sporty', needsOutfit: true };
    }

    // Extract occasion from OCCASION_PREFERENCES keys
    for (const [occasion, _] of Object.entries(OCCASION_PREFERENCES)) {
        if (lowerMessage.includes(occasion)) {
            return { occasion, needsOutfit: true };
        }
    }

    // Check for weather-related statements
    const weatherStatements = ['cold', 'hot', 'warm', 'cool', 'rainy', 'sunny', 'snowing', 'windy', 'freezing', 'chilly'];
    if (weatherStatements.some(w => lowerMessage.includes(w))) {
        return { occasion: 'casual', needsOutfit: true };
    }

    // Check for outfit-related keywords (pick, choose, suggest, recommend, wear, outfit, etc.)
    const outfitKeywords = ['outfit', 'wear', 'dress', 'clothes', 'style', 'recommend', 'suggest', 'pick', 'choose', 'need', 'want'];
    const hasOutfitKeyword = outfitKeywords.some(keyword => lowerMessage.includes(keyword));

    // If message contains outfit keywords, treat as outfit request
    if (hasOutfitKeyword) {
        return { occasion: 'casual', needsOutfit: true }; // Default to casual if no specific occasion
    }

    // Check if it's a greeting (only if no outfit keywords)
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
    if (greetings.some(g => lowerMessage.includes(g)) && lowerMessage.length < 20) {
        return { isQuestion: true, needsOutfit: false };
    }

    // Check if it's a general question (only if no outfit keywords)
    // Remove 'help' from questions since it's too generic - check for more specific questions
    const questions = ['what can you do', 'what do you do', 'how can you help', 'what are you', 'who are you'];
    if (questions.some(q => lowerMessage.includes(q))) {
        return { isQuestion: true, needsOutfit: false };
    }

    // If message is very short and doesn't contain outfit-related keywords, treat as question
    if (lowerMessage.length < 15 && !hasOutfitKeyword) {
        return { isQuestion: true, needsOutfit: false };
    }

    // Default: treat as outfit request
    return { occasion: 'casual', needsOutfit: true };
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

// FastAPI backend URL (change if running on different port)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function callFastAPI(endpoint: string, data: any) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`❌ FastAPI call failed (${endpoint}):`, error);
        throw error;
    }
}

export async function generateAIResponse(
    message: string,
    wardrobeItems: WardrobeItem[],
    outfits: Outfit[]
): Promise<{ message: string; outfits: Outfit[] }> {
    console.log('🤖 generateAIResponse called with message:', message);

    // Parse user intent
    const { occasion, isQuestion, needsOutfit } = parseUserIntent(message);
    console.log('📝 Parsed intent:', { occasion, isQuestion, needsOutfit });

    // Handle greetings and questions
    if (isQuestion && !needsOutfit) {
        const lowerMessage = message.toLowerCase();
        console.log('❓ Detected as question, checking for greeting...');

        if (lowerMessage.match(/\b(hello|hi|hey|good morning|good afternoon|good evening)\b/)) {
            console.log('👋 Greeting detected, returning greeting response');
            return {
                message: "Hello! 👋 I'm your personal AI stylist. I can help you pick the perfect outfit for any occasion! Just tell me what event you're attending or what you need help with.",
                outfits: [],
            };
        }

        if (lowerMessage.match(/\b(what can you do|what do you do|how can you help|what are you|who are you)\b/)) {
            return {
                message: "I'm your AI stylist! I can:\n\n✨ Recommend outfits for any occasion (party, interview, date, casual, etc.)\n🎨 Help you style items from your wardrobe\n💡 Suggest color combinations and styling tips\n📅 Plan outfits for specific events\n\nJust tell me what you need! For example: 'Help me pick something for a party' or 'What should I wear to an interview?'",
                outfits: [],
            };
        }

        // Generic question response
        return {
            message: "I'm here to help you with outfit recommendations! Tell me what occasion you need help with, or ask me to suggest an outfit. For example:\n\n• 'Help me pick something for a party'\n• 'What should I wear to an interview?'\n• 'I need a casual outfit'\n• 'Suggest something for a date'",
            outfits: [],
        };
    }

    // Generate outfit combinations (necessary logic to create outfits from items)
    const generatedOutfits = generateOutfits(wardrobeItems, occasion || 'casual', 5);

    if (generatedOutfits.length === 0) {
        return {
            message: `I couldn't find enough items for a ${occasion} outfit. Try adding more items to your wardrobe or asking for a different occasion.`,
            outfits: [],
        };
    }

    // Use FastAPI backend for AI text generation (GPT4All)
    try {
        const outfitDescriptions = generatedOutfits.map((outfit) => {
            return outfit.items.map(i => `${i.name} (${i.color})`).join(' + ');
        });

        console.log('🤖 Calling FastAPI backend for AI response...');
        console.log('📡 Backend URL:', API_BASE_URL);

        // Generate main response using FastAPI backend
        const responseData = await callFastAPI('/generate-response', {
            message,
            occasion: occasion || 'casual',
            wardrobeItems: wardrobeItems.map(item => ({
                id: item.id,
                name: item.name,
                color: item.color,
                category: item.category,
                colorHex: item.colorHex,
            })),
            outfitDescriptions,
        });

        let aiResponse = responseData.message || '';

        // Log whether AI was used
        if (responseData.ai_used) {
            console.log('✅ AI (GPT4All) was used for this response');
        } else {
            console.log('⚠️ Rule-based fallback was used (AI not available or filtered)');
        }

        // Generate AI reasoning for each outfit using FastAPI backend
        const enhancedOutfits = await Promise.all(
            generatedOutfits.map(async (outfit) => {
                try {
                    const reasoningData = await callFastAPI('/generate-reasoning', {
                        message: '',
                        occasion: occasion || 'casual',
                        wardrobeItems: outfit.items.map(item => ({
                            id: item.id,
                            name: item.name,
                            color: item.color,
                            category: item.category,
                            colorHex: item.colorHex,
                        })),
                        outfitDescriptions: [outfit.items.map(i => `${i.name} (${i.color})`).join(', ')],
                    });

                    return {
                        ...outfit,
                        reasoning: reasoningData.message || outfit.reasoning,
                    };
                } catch (error) {
                    console.warn('Failed to generate reasoning for outfit, using fallback:', error);
                    const colors = outfit.items.map(i => i.color).join(' and ');
                    return {
                        ...outfit,
                        reasoning: `This ${colors} combination creates a stylish look perfect for ${occasion || 'casual'} occasions.`,
                    };
                }
            })
        );

        return {
            message: aiResponse,
            outfits: enhancedOutfits,
        };
    } catch (error) {
        console.error('❌ FastAPI backend error, using fallback:', error);
        console.log('💡 Make sure the FastAPI backend is running on http://localhost:8000');
        console.log('💡 Check backend terminal for GPT4All loading status');

        // Use rule-based fallback
        const occasionName = occasion || 'casual';
        const occasionContext = occasionName === 'business' ? 'job interview' :
            occasionName === 'party' ? 'party' :
                occasionName === 'date' ? 'date' :
                    occasionName === 'formal' ? 'formal event' :
                        occasionName === 'sporty' ? 'sporty activity' :
                            'casual occasion';

        return {
            message: `Perfect! I've curated ${generatedOutfits.length} stylish outfit${generatedOutfits.length > 1 ? 's' : ''} for your ${occasionContext}. Each combination is carefully selected from your wardrobe to help you look your best!`,
            outfits: generatedOutfits.map(outfit => ({
                ...outfit,
                reasoning: outfit.reasoning || `A stylish combination perfect for ${occasionContext}.`,
            })),
        };
    }

    // Minimal fallback (only if AI completely fails)
    const occasionName = occasion || 'casual';
    const occasionContext = occasionName === 'business' ? 'job interview' :
        occasionName === 'party' ? 'party' :
            occasionName === 'date' ? 'date' :
                occasionName === 'formal' ? 'formal event' :
                    occasionName === 'sporty' ? 'sporty activity' :
                        'casual occasion';

    return {
        message: `Perfect! I've curated ${generatedOutfits.length} stylish outfit${generatedOutfits.length > 1 ? 's' : ''} for your ${occasionContext}. Each combination is carefully selected from your wardrobe to help you look your best!`,
        outfits: generatedOutfits.map(outfit => ({
            ...outfit,
            reasoning: `A stylish combination perfect for ${occasionContext}.`,
        })),
    };
}

