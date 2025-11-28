'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import WardrobeItemCard from '@/components/WardrobeItemCard';
import { WardrobeItem, Outfit } from '@/types';
import { sampleWardrobeItems } from '@/lib/wardrobe';

const occasions = ['casual', 'formal', 'sporty', 'business'] as const;
type Occasion = typeof occasions[number];

export default function RecommendationsPage() {
  const [items] = useState<WardrobeItem[]>(sampleWardrobeItems);
  const [selectedItems, setSelectedItems] = useState<WardrobeItem[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion>('casual');
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showItemSelector, setShowItemSelector] = useState(true);

  const toggleItem = (item: WardrobeItem) => {
    setSelectedItems((prev) => {
      const isSelected = prev.some((i) => i.id === item.id);
      if (isSelected) {
        return prev.filter((i) => i.id !== item.id);
      }
      return [...prev, item];
    });
  };

  const handleGetRecommendations = async () => {
    if (selectedItems.length < 3) {
      setError('Please select at least 3 items (top, bottom, shoes)');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: selectedItems,
          occasion: selectedOccasion,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get recommendations');
      }

      setOutfits(data.outfits);
      setShowItemSelector(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setShowItemSelector(true);
    setOutfits([]);
    setSelectedItems([]);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <Header title="Outfit Recommendations" />
      
      <main className="pt-16 pb-20 px-4">
        {showItemSelector ? (
          <>
            {/* Occasion Selector */}
            <div className="py-4">
              <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                Select Occasion
              </h2>
              <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
                {occasions.map((occasion) => (
                  <button
                    key={occasion}
                    onClick={() => setSelectedOccasion(occasion)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedOccasion === occasion
                        ? 'bg-purple-600 text-white'
                        : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    {occasion.charAt(0).toUpperCase() + occasion.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Items Count */}
            <div className="flex justify-between items-center py-2">
              <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Select Items ({selectedItems.length} selected)
              </h2>
              {selectedItems.length > 0 && (
                <button
                  onClick={() => setSelectedItems([])}
                  className="text-sm text-purple-600 dark:text-purple-400"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
              {items.map((item) => (
                <WardrobeItemCard
                  key={item.id}
                  item={item}
                  isSelected={selectedItems.some((i) => i.id === item.id)}
                  onSelect={toggleItem}
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Get Recommendations Button */}
            <div className="fixed bottom-20 left-4 right-4">
              <button
                onClick={handleGetRecommendations}
                disabled={isLoading || selectedItems.length < 3}
                className="w-full py-4 rounded-xl bg-purple-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating Outfits...
                  </span>
                ) : (
                  `Get AI Recommendations (${selectedItems.length} items)`
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Recommendations Results */}
            <div className="py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Recommended Outfits
                </h2>
                <button
                  onClick={handleReset}
                  className="text-sm text-purple-600 dark:text-purple-400 font-medium"
                >
                  ← Select New Items
                </button>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                For {selectedOccasion} occasions
              </p>
            </div>

            {/* Outfits List */}
            <div className="space-y-4">
              {outfits.map((outfit, index) => (
                <div
                  key={outfit.id}
                  className="bg-white dark:bg-zinc-800 rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-zinc-900 dark:text-white">
                        Outfit #{index + 1}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                            {outfit.score}/100
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Outfit Items */}
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {outfit.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex-shrink-0 w-20"
                      >
                        <div
                          className="w-20 h-20 rounded-xl flex items-center justify-center text-2xl"
                          style={{ backgroundColor: item.colorHex }}
                        >
                          {item.category === 'tops' && '👕'}
                          {item.category === 'bottoms' && '👖'}
                          {item.category === 'shoes' && '👟'}
                          {item.category === 'accessories' && '⌚'}
                          {item.category === 'outerwear' && '🧥'}
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 truncate text-center">
                          {item.name.split(' ').slice(0, 2).join(' ')}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* AI Reasoning */}
                  <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-700">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      <span className="font-medium">AI Insight: </span>
                      {outfit.reasoning}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <Navigation />

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
