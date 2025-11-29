'use client';

import { useState, useEffect, useMemo } from 'react';
import Navigation from '@/components/Navigation';
import AIStylist from '@/components/AIStylist';
import { WardrobeItem, StyleProfile } from '@/types';
import { getItems, getDeletedItems, restoreItem, permanentDeleteItem } from '@/lib/storage';
import WardrobeItemCard from '@/components/WardrobeItemCard';
import ConfirmDialog from '@/components/ConfirmDialog';
import { calculateStyleProfile } from '@/lib/profile';

export default function ProfilePage() {
    const [items, setItems] = useState<WardrobeItem[]>([]);
    const [profile, setProfile] = useState<StyleProfile | null>(null);
    const [deletedItems, setDeletedItems] = useState<WardrobeItem[]>([]);
    const [showRecycleBin, setShowRecycleBin] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; itemId?: string; itemName?: string; type?: 'single' | 'all' }>({ isOpen: false });

    useEffect(() => {
        const storedItems = getItems();
        setItems(storedItems);
        if (storedItems.length > 0) {
            const calculatedProfile = calculateStyleProfile(storedItems);
            setProfile(calculatedProfile);
        }
        const deleted = getDeletedItems();
        setDeletedItems(deleted);
    }, []);

    if (!profile) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
                <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-700 z-50">
                    <div className="flex items-center justify-center h-14 px-4">
                        <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">Profile</h1>
                    </div>
                </header>
                <main className="pt-14 pb-20 px-4 flex items-center justify-center min-h-screen">
                    <p className="text-zinc-500 dark:text-zinc-400">No wardrobe items yet. Add items to see your profile!</p>
                </main>
                <Navigation />
            </div>
        );
    }

    const styleIcons: Record<StyleProfile['favoriteStyle'], string> = {
        casual: '👕',
        formal: '🎩',
        sporty: '🏃',
        business: '💼',
        streetwear: '👟',
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-700 z-50">
                <div className="flex items-center justify-center h-14 px-4">
                    <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">Profile</h1>
                </div>
            </header>

            <main className="pt-14 pb-20 px-4 space-y-6">
                {/* Statistics Section - 2x2 Grid */}
                <section>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">Statistics</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-4">
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Items in Closet</p>
                            <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-1">
                                {profile.totalItems}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-4">
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Favorite Pieces</p>
                            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                                {profile.favoritePieces}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-4">
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Events Planned</p>
                            <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-1">
                                {profile.eventsPlanned}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-4">
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Outfits Ready</p>
                            <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-1">
                                {profile.outfitsReady}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Style Insights */}
                <section>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">Style Insights</h2>
                    <div className="bg-white dark:bg-zinc-800 rounded-2xl p-4 space-y-4">
                        {/* Favorite Style */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{styleIcons[profile.favoriteStyle]}</span>
                                <div>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Favorite Style</p>
                                    <p className="text-lg font-semibold text-zinc-900 dark:text-white capitalize">
                                        {profile.favoriteStyle}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Color Preference */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-12 h-12 rounded-full border-2 border-zinc-200 dark:border-zinc-700"
                                    style={{
                                        backgroundColor: items.find(i => i.color === profile.colorPreference)?.colorHex || '#808080',
                                    }}
                                />
                                <div>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Color Preference</p>
                                    <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                                        {profile.colorPreference}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Style Score */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">Style Score</p>
                                <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                                    {profile.styleScore}%
                                </p>
                            </div>
                            <div className="w-24 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                                    style={{ width: `${profile.styleScore}%` }}
                                />
                            </div>
                        </div>

                        {/* Most Loved Pieces */}
                        {profile.mostLovedPieces.length > 0 && (
                            <div>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Most Loved Pieces</p>
                                <div className="space-y-2">
                                    {profile.mostLovedPieces.map((item, index) => (
                                        <div key={item.id} className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: item.colorHex }}>
                                                {item.category === 'tops' && '👕'}
                                                {item.category === 'bottoms' && '👖'}
                                                {item.category === 'shoes' && '👟'}
                                                {item.category === 'accessories' && '⌚'}
                                                {item.category === 'outerwear' && '🧥'}
                                                {item.category === 'dresses' && '👗'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                                                    {item.name}
                                                </p>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                    Worn {item.usageCount} times
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Wardrobe Breakdown */}
                <section>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">Wardrobe Breakdown</h2>
                    <div className="bg-white dark:bg-zinc-800 rounded-2xl p-4 space-y-3">
                        {Object.entries(profile.wardrobeBreakdown).map(([category, count]) => (
                            <div key={category}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 capitalize">
                                        {category}
                                    </span>
                                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                        {count} {count === 1 ? 'item' : 'items'}
                                    </span>
                                </div>
                                <div className="h-2 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                                        style={{
                                            width: `${profile.totalItems > 0 ? (count / profile.totalItems) * 100 : 0}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Achievements */}
                <section>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">Achievements</h2>
                    <div className="grid grid-cols-3 gap-3">
                        {profile.achievements.map((achievement) => (
                            <div
                                key={achievement.id}
                                className={`bg-white dark:bg-zinc-800 rounded-2xl p-4 text-center ${achievement.unlocked ? '' : 'opacity-50'
                                    }`}
                            >
                                <div className="text-4xl mb-2">{achievement.icon}</div>
                                <p className="text-xs font-medium text-zinc-900 dark:text-white mb-1">
                                    {achievement.name}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    {achievement.description}
                                </p>
                                {achievement.unlocked && (
                                    <div className="mt-2">
                                        <span className="text-xs text-green-600 dark:text-green-400">✓ Unlocked</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Recycle Bin Section */}
                <section className="mt-6">
                    <button
                        onClick={() => setShowRecycleBin(!showRecycleBin)}
                        className="w-full flex items-center justify-between p-4 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🗑️</span>
                            <div className="text-left">
                                <h3 className="font-semibold text-zinc-900 dark:text-white">Recycle Bin</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    {deletedItems.length} deleted item{deletedItems.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <svg
                            className={`w-5 h-5 text-zinc-400 transition-transform ${showRecycleBin ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {showRecycleBin && (
                        <div className="mt-4 space-y-3">
                            {deletedItems.length === 0 ? (
                                <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                                    <p>Recycle bin is empty</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        {deletedItems.map((item) => (
                                            <div key={item.id} className="relative">
                                                <WardrobeItemCard
                                                    item={item}
                                                    showUsage={false}
                                                />
                                                <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            restoreItem(item.id);
                                                            const storedItems = getItems();
                                                            setItems(storedItems);
                                                            if (storedItems.length > 0) {
                                                                const calculatedProfile = calculateStyleProfile(storedItems);
                                                                setProfile(calculatedProfile);
                                                            }
                                                            setDeletedItems(getDeletedItems());
                                                        }}
                                                        className="flex-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors"
                                                    >
                                                        Restore
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setDeleteConfirm({ isOpen: true, itemId: item.id, itemName: item.name, type: 'single' });
                                                        }}
                                                        className="flex-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {deletedItems.length > 0 && (
                                        <button
                                            onClick={() => {
                                                setDeleteConfirm({ isOpen: true, type: 'all' });
                                            }}
                                            className="w-full mt-4 px-4 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                                        >
                                            Empty Recycle Bin
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </section>
            </main>

            <AIStylist wardrobeItems={items} />
            <Navigation />

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                title={deleteConfirm.type === 'all' ? 'Empty Recycle Bin' : 'Permanently Delete Item'}
                message={
                    deleteConfirm.type === 'all'
                        ? `Permanently delete all ${deletedItems.length} items? This cannot be undone.`
                        : `Permanently delete "${deleteConfirm.itemName}"? This cannot be undone.`
                }
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                onConfirm={() => {
                    if (deleteConfirm.type === 'all') {
                        deletedItems.forEach(item => permanentDeleteItem(item.id));
                        setDeletedItems(getDeletedItems());
                    } else if (deleteConfirm.itemId) {
                        permanentDeleteItem(deleteConfirm.itemId);
                        setDeletedItems(getDeletedItems());
                    }
                    setDeleteConfirm({ isOpen: false });
                }}
                onCancel={() => setDeleteConfirm({ isOpen: false })}
            />
        </div>
    );
}

