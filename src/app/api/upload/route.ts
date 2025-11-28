import { NextRequest, NextResponse } from 'next/server';
import { ImageMetadata } from '@/types';

// Color name to hex mapping
const COLOR_MAP: Record<string, string> = {
    'white': '#FFFFFF',
    'black': '#000000',
    'navy': '#000080',
    'navy blue': '#000080',
    'blue': '#4169E1',
    'grey': '#808080',
    'gray': '#808080',
    'brown': '#8B4513',
    'khaki': '#C3B091',
    'red': '#FF0000',
    'green': '#228B22',
    'pink': '#FFB6C1',
    'beige': '#F5F5DC',
    'tan': '#D2B48C',
    'maroon': '#800000',
    'burgundy': '#800020',
    'purple': '#800080',
    'yellow': '#FFFF00',
    'orange': '#FFA500',
};

// Category mapping from AI responses
const CATEGORY_MAP: Record<string, 'tops' | 'bottoms' | 'dresses' | 'outerwear' | 'shoes' | 'accessories'> = {
    'shirt': 'tops',
    't-shirt': 'tops',
    'tshirt': 'tops',
    'top': 'tops',
    'blouse': 'tops',
    'sweater': 'tops',
    'hoodie': 'tops',
    'jacket': 'outerwear',
    'coat': 'outerwear',
    'blazer': 'outerwear',
    'pants': 'bottoms',
    'jeans': 'bottoms',
    'trousers': 'bottoms',
    'shorts': 'bottoms',
    'skirt': 'bottoms',
    'dress': 'dresses',
    'gown': 'dresses',
    'shoes': 'shoes',
    'sneakers': 'shoes',
    'boots': 'shoes',
    'heels': 'shoes',
    'sandals': 'shoes',
    'watch': 'accessories',
    'bag': 'accessories',
    'hat': 'accessories',
    'scarf': 'accessories',
};

// Occasion mapping
const OCCASION_MAP: Record<string, string[]> = {
    'formal': ['formal', 'business'],
    'casual': ['casual'],
    'sport': ['sporty'],
    'sporty': ['sporty'],
    'business': ['business', 'work'],
    'work': ['work', 'business'],
    'street': ['streetwear'],
    'streetwear': ['streetwear'],
};

async function extractMetadataWithHuggingFace(imageFile: File): Promise<ImageMetadata | null> {
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    if (!apiKey) {
        // Return null if no API key - graceful degradation
        return null;
    }

    try {
        // Convert file to base64
        const arrayBuffer = await imageFile.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        // Use a vision model for image classification
        // Using a general image classification model
        const response = await fetch(
            'https://api-inference.huggingface.co/models/google/vit-base-patch16-224',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: base64,
                }),
            }
        );

        if (!response.ok) {
            throw new Error('Hugging Face API error');
        }

        const result = await response.json();

        // Parse the result (this is a simplified version)
        // In a real implementation, you'd use a more sophisticated model
        // For now, we'll use a fallback approach
        return null;
    } catch (error) {
        console.error('Hugging Face API error:', error);
        return null;
    }
}

// Fallback metadata extraction using heuristics
function extractMetadataFallback(imageFile: File): ImageMetadata {
    const fileName = imageFile.name.toLowerCase();

    // Try to extract category from filename
    let category: ImageMetadata['category'] = 'tops';
    for (const [key, value] of Object.entries(CATEGORY_MAP)) {
        if (fileName.includes(key)) {
            category = value;
            break;
        }
    }

    // Try to extract color from filename
    let color = 'White';
    let colorHex = '#FFFFFF';
    for (const [key, value] of Object.entries(COLOR_MAP)) {
        if (fileName.includes(key)) {
            color = key.charAt(0).toUpperCase() + key.slice(1);
            colorHex = value;
            break;
        }
    }

    // Generate suggested name
    const suggestedName = fileName
        .replace(/\.[^/.]+$/, '') // Remove extension
        .replace(/[-_]/g, ' ') // Replace dashes/underscores with spaces
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ') || 'Clothing Item';

    // Default occasions based on category
    const occasion: string[] = category === 'outerwear' || category === 'shoes'
        ? ['casual', 'formal']
        : ['casual'];

    return {
        suggestedName,
        category,
        color,
        colorHex,
        occasion,
        confidence: 0.5, // Low confidence for fallback
    };
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const imageFile = formData.get('image') as File;

        if (!imageFile) {
            return NextResponse.json(
                { error: 'No image file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(imageFile.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Please upload JPEG, PNG, or WebP' },
                { status: 400 }
            );
        }

        // Validate file size (5MB max)
        if (imageFile.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File size exceeds 5MB limit' },
                { status: 400 }
            );
        }

        // Try Hugging Face API first
        let metadata = await extractMetadataWithHuggingFace(imageFile);

        // Fallback to heuristic extraction if API fails
        if (!metadata) {
            metadata = extractMetadataFallback(imageFile);
        }

        return NextResponse.json(metadata);
    } catch (error) {
        console.error('Error processing image upload:', error);

        // Graceful degradation - return basic metadata
        const formData = await request.formData();
        const imageFile = formData.get('image') as File;

        if (imageFile) {
            const fallbackMetadata = extractMetadataFallback(imageFile);
            return NextResponse.json(fallbackMetadata);
        }

        return NextResponse.json(
            { error: 'Failed to process image' },
            { status: 500 }
        );
    }
}

