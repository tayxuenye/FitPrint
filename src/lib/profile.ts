import { WardrobeItem, StyleProfile, Achievement } from '@/types';

export function calculateStyleProfile(items: WardrobeItem[]): StyleProfile {
    const totalItems = items.length;
    const favoritePieces = items.filter(i => i.isFavorite).length;

    // Calculate wardrobe breakdown
    const wardrobeBreakdown = {
        tops: items.filter(i => i.category === 'tops').length,
        bottoms: items.filter(i => i.category === 'bottoms').length,
        outerwear: items.filter(i => i.category === 'outerwear').length,
        dresses: items.filter(i => i.category === 'dresses').length,
        shoes: items.filter(i => i.category === 'shoes').length,
        accessories: items.filter(i => i.category === 'accessories').length,
    };

    // Determine favorite style (most common occasion)
    const favoriteStyle = determineFavoriteStyle(items);

    // Get color preference
    const colorPreference = getColorPreference(items);

    // Calculate style score
    const styleScore = calculateStyleScore(items);

    // Get most loved pieces
    const mostLovedPieces = getMostLovedPieces(items, 3);

    // Check achievements
    const achievements = checkAchievements({
        totalItems,
        favoritePieces,
        eventsPlanned: 0, // TODO: implement event planning
        outfitsReady: 0, // TODO: implement outfit tracking
        favoriteStyle,
        mostLovedPieces,
        colorPreference,
        styleScore,
        wardrobeBreakdown,
        achievements: [],
    });

    return {
        totalItems,
        favoritePieces,
        eventsPlanned: 0,
        outfitsReady: 0,
        favoriteStyle,
        mostLovedPieces,
        colorPreference,
        styleScore,
        wardrobeBreakdown,
        achievements,
    };
}

export function determineFavoriteStyle(items: WardrobeItem[]): StyleProfile['favoriteStyle'] {
    const occasionCounts: Record<string, number> = {};

    items.forEach(item => {
        item.occasion.forEach(occ => {
            // Map occasion to style
            let style: StyleProfile['favoriteStyle'] = 'casual';
            if (occ === 'formal' || occ === 'business') {
                style = occ === 'formal' ? 'formal' : 'business';
            } else if (occ === 'sporty') {
                style = 'sporty';
            } else if (occ === 'streetwear') {
                style = 'streetwear';
            }

            occasionCounts[style] = (occasionCounts[style] || 0) + 1;
        });
    });

    // Find most common style
    let maxCount = 0;
    let favoriteStyle: StyleProfile['favoriteStyle'] = 'casual';

    Object.entries(occasionCounts).forEach(([style, count]) => {
        if (count > maxCount) {
            maxCount = count;
            favoriteStyle = style as StyleProfile['favoriteStyle'];
        }
    });

    return favoriteStyle;
}

export function getColorPreference(items: WardrobeItem[]): string {
    if (items.length === 0) return 'N/A';

    const colorCounts: Record<string, number> = {};

    items.forEach(item => {
        colorCounts[item.color] = (colorCounts[item.color] || 0) + 1;
    });

    let maxCount = 0;
    let favoriteColor = items[0].color;

    Object.entries(colorCounts).forEach(([color, count]) => {
        if (count > maxCount) {
            maxCount = count;
            favoriteColor = color;
        }
    });

    return favoriteColor;
}

export function calculateStyleScore(items: WardrobeItem[]): number {
    if (items.length === 0) return 0;

    let score = 50; // Base score

    // Bonus for variety of categories
    const uniqueCategories = new Set(items.map(i => i.category)).size;
    if (uniqueCategories >= 4) score += 20;
    else if (uniqueCategories >= 3) score += 10;

    // Bonus for color variety
    const uniqueColors = new Set(items.map(i => i.color)).size;
    if (uniqueColors >= 5) score += 15;
    else if (uniqueColors >= 3) score += 10;

    // Bonus for having items with occasion tags
    const itemsWithOccasions = items.filter(i => i.occasion.length > 0).length;
    const occasionRatio = itemsWithOccasions / items.length;
    score += Math.round(occasionRatio * 15);

    return Math.min(100, score);
}

export function getMostLovedPieces(items: WardrobeItem[], limit: number = 3): WardrobeItem[] {
    return [...items]
        .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
        .slice(0, limit);
}

export function checkAchievements(profile: StyleProfile): Achievement[] {
    const achievements: Achievement[] = [
        {
            id: 'style-master',
            name: 'Style Master',
            icon: '👑',
            description: 'Achieved a style score above 80',
            unlocked: profile.styleScore >= 80,
        },
        {
            id: 'wardrobe-builder',
            name: 'Wardrobe Builder',
            icon: '🏗️',
            description: 'Added 10+ items to your wardrobe',
            unlocked: profile.totalItems >= 10,
        },
        {
            id: 'fashion-lover',
            name: 'Fashion Lover',
            icon: '❤️',
            description: 'Marked 5+ items as favorites',
            unlocked: profile.favoritePieces >= 5,
        },
        {
            id: 'color-enthusiast',
            name: 'Color Enthusiast',
            icon: '🎨',
            description: 'Wardrobe with 5+ different colors',
            unlocked: Object.values(profile.wardrobeBreakdown).reduce((a, b) => a + b, 0) >= 5,
        },
        {
            id: 'versatile-wardrobe',
            name: 'Versatile Wardrobe',
            icon: '🔄',
            description: 'Items in 4+ different categories',
            unlocked: Object.values(profile.wardrobeBreakdown).filter(count => count > 0).length >= 4,
        },
        {
            id: 'trendsetter',
            name: 'Trendsetter',
            icon: '⭐',
            description: 'Most loved piece worn 20+ times',
            unlocked: profile.mostLovedPieces.length > 0 && (profile.mostLovedPieces[0]?.usageCount || 0) >= 20,
        },
    ];

    return achievements;
}

