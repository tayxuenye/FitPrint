import { WardrobeItem, StyleProfile, ChatMessage } from '@/types';

const STORAGE_KEYS = {
    WARDROBE_ITEMS: 'fitprint:wardrobe:items',
    PROFILE: 'fitprint:profile',
    CHAT_HISTORY: 'fitprint:chat:history',
    CACHE_METADATA: 'fitprint:cache:metadata',
} as const;

// Wardrobe Items Storage
export function saveItem(item: WardrobeItem): void {
    const items = getItems();
    const existingIndex = items.findIndex(i => i.id === item.id);

    if (existingIndex >= 0) {
        items[existingIndex] = item;
    } else {
        items.push(item);
    }

    localStorage.setItem(STORAGE_KEYS.WARDROBE_ITEMS, JSON.stringify(items));
}

export function getItems(): WardrobeItem[] {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem(STORAGE_KEYS.WARDROBE_ITEMS);
        if (!stored) return [];
        return JSON.parse(stored) as WardrobeItem[];
    } catch (error) {
        console.error('Error loading wardrobe items:', error);
        return [];
    }
}

export function updateItem(id: string, updates: Partial<WardrobeItem>): void {
    const items = getItems();
    const index = items.findIndex(i => i.id === id);

    if (index >= 0) {
        items[index] = { ...items[index], ...updates };
        localStorage.setItem(STORAGE_KEYS.WARDROBE_ITEMS, JSON.stringify(items));
    }
}

export function deleteItem(id: string): void {
    const items = getItems();
    const filtered = items.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.WARDROBE_ITEMS, JSON.stringify(filtered));
}

export function toggleFavorite(id: string): void {
    const items = getItems();
    const item = items.find(i => i.id === id);

    if (item) {
        item.isFavorite = !item.isFavorite;
        localStorage.setItem(STORAGE_KEYS.WARDROBE_ITEMS, JSON.stringify(items));
    }
}

export function markAsWorn(id: string): void {
    const items = getItems();
    const item = items.find(i => i.id === id);

    if (item) {
        item.usageCount = (item.usageCount || 0) + 1;
        item.lastWorn = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.WARDROBE_ITEMS, JSON.stringify(items));
    }
}

// Profile Storage
export function saveProfile(profile: StyleProfile): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
}

export function getProfile(): StyleProfile | null {
    if (typeof window === 'undefined') return null;

    try {
        const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
        if (!stored) return null;
        return JSON.parse(stored) as StyleProfile;
    } catch (error) {
        console.error('Error loading profile:', error);
        return null;
    }
}

// Chat History Storage
export function saveChatHistory(messages: ChatMessage[]): void {
    if (typeof window === 'undefined') return;
    // Keep only last 50 messages
    const recentMessages = messages.slice(-50);
    localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(recentMessages));
}

export function getChatHistory(): ChatMessage[] {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
        if (!stored) return [];
        return JSON.parse(stored) as ChatMessage[];
    } catch (error) {
        console.error('Error loading chat history:', error);
        return [];
    }
}

