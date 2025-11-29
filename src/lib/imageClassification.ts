// Client-side image classification using TensorFlow.js MobileNet
// Pretrained model - no training needed, just inference
// This runs in the browser, no API keys needed

'use client';

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

// Category mapping from predictions
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

let model: any = null;
let modelLoading = false;

async function loadModel() {
    if (model) return model;
    if (modelLoading) {
        // Wait for model to load
        while (modelLoading) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return model;
    }

    try {
        modelLoading = true;

        // Check if we're in browser environment
        if (typeof window === 'undefined') {
            console.warn('MobileNet only works in browser');
            modelLoading = false;
            return null;
        }

        // Dynamic import for client-side only
        const mobilenet = await import('@tensorflow-models/mobilenet');
        const tf = await import('@tensorflow/tfjs');

        // Load pretrained MobileNet model (no training needed, just inference)
        // This is a pretrained model that was already trained on ImageNet
        model = await mobilenet.load({
            version: 2,
            alpha: 1.0,
        });

        modelLoading = false;
        return model;
    } catch (error) {
        console.error('Error loading MobileNet model:', error);
        modelLoading = false;
        return null;
    }
}

export async function classifyClothingImage(imageFile: File): Promise<ImageMetadata | null> {
    try {
        // Load model if not already loaded
        const loadedModel = await loadModel();
        if (!loadedModel) {
            return null;
        }

        // Create image element from file
        const imageUrl = URL.createObjectURL(imageFile);
        const img = new Image();

        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = imageUrl;
        });

        // Classify image
        const predictions = await loadedModel.classify(img);

        // Clean up
        URL.revokeObjectURL(imageUrl);

        // Parse predictions
        return parsePredictions(predictions, imageFile);
    } catch (error) {
        console.error('Error classifying image:', error);
        return null;
    }
}

function parsePredictions(predictions: Array<{ className: string; probability: number }>, imageFile: File): ImageMetadata {
    // Get top predictions
    const topPredictions = predictions.slice(0, 10);

    // Map predictions to clothing categories
    let category: ImageMetadata['category'] = 'tops';
    let suggestedName = 'Clothing Item';
    let confidence = 0.5;

    // Check each prediction for clothing-related keywords
    for (const pred of topPredictions) {
        const className = pred.className.toLowerCase();
        const probability = pred.probability;

        // Map to clothing category
        for (const [key, value] of Object.entries(CATEGORY_MAP)) {
            if (className.includes(key)) {
                category = value;
                suggestedName = className.split(',')[0].trim();
                confidence = probability;
                break;
            }
        }

        // Also check for common clothing terms
        const clothingTerms = [
            'shirt', 't-shirt', 'blouse', 'sweater', 'hoodie', 'jacket',
            'coat', 'blazer', 'pants', 'jeans', 'trousers', 'shorts',
            'skirt', 'dress', 'gown', 'shoes', 'sneakers', 'boots',
            'heels', 'sandals', 'watch', 'bag', 'hat', 'scarf'
        ];

        for (const term of clothingTerms) {
            if (className.includes(term) && confidence < probability) {
                for (const [key, value] of Object.entries(CATEGORY_MAP)) {
                    if (term.includes(key) || key.includes(term)) {
                        category = value;
                        suggestedName = className.split(',')[0].trim();
                        confidence = probability;
                        break;
                    }
                }
            }
        }
    }

    // Extract color from predictions or use default
    let color = 'White';
    let colorHex = '#FFFFFF';
    for (const pred of topPredictions) {
        const className = pred.className.toLowerCase();
        for (const [key, value] of Object.entries(COLOR_MAP)) {
            if (className.includes(key)) {
                color = key.charAt(0).toUpperCase() + key.slice(1);
                colorHex = value;
                break;
            }
        }
    }

    // Determine occasion based on category and style
    const occasion: string[] = [];
    if (category === 'outerwear' || category === 'shoes') {
        occasion.push('casual', 'formal');
    } else if (category === 'dresses') {
        occasion.push('casual', 'formal', 'business');
    } else {
        occasion.push('casual');
    }

    // Format suggested name
    suggestedName = suggestedName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ') || 'Clothing Item';

    return {
        suggestedName,
        category,
        color,
        colorHex,
        occasion,
        confidence,
    };
}

