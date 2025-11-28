'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import { WardrobeItem } from '@/types';
import { sampleWardrobeItems, calculateColorTrends, calculateCategoryUsage, getMostWornItems } from '@/lib/wardrobe';

export default function AnalyticsPage() {
  const [items] = useState<WardrobeItem[]>(sampleWardrobeItems);

  const colorTrends = useMemo(() => calculateColorTrends(items), [items]);
  const categoryUsage = useMemo(() => calculateCategoryUsage(items), [items]);
  const mostWornItems = useMemo(() => getMostWornItems(items, 5), [items]);

  // Calculate total usage
  const totalUsage = items.reduce((sum, item) => sum + item.usageCount, 0);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <Header title="Wardrobe Analytics" />
      
      <main className="pt-16 pb-20 px-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-3 py-4">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Items</p>
            <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-1">
              {items.length}
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Wears</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {totalUsage}
            </p>
          </div>
        </div>

        {/* Color Trends */}
        <section className="mt-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">
            Color Distribution
          </h2>
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-4">
            {/* Color Bar Chart */}
            <div className="flex h-8 rounded-xl overflow-hidden mb-4">
              {colorTrends.map((trend) => (
                <div
                  key={trend.color}
                  className="h-full transition-all duration-300"
                  style={{
                    backgroundColor: trend.colorHex,
                    width: `${trend.percentage}%`,
                    border: trend.colorHex === '#FFFFFF' ? '1px solid #e5e7eb' : 'none',
                  }}
                  title={`${trend.color}: ${trend.percentage}%`}
                />
              ))}
            </div>
            
            {/* Color Legend */}
            <div className="grid grid-cols-2 gap-2">
              {colorTrends.map((trend) => (
                <div key={trend.color} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0 border border-zinc-200 dark:border-zinc-600"
                    style={{ backgroundColor: trend.colorHex }}
                  />
                  <span className="text-sm text-zinc-600 dark:text-zinc-300 truncate">
                    {trend.color}
                  </span>
                  <span className="text-sm text-zinc-400 dark:text-zinc-500 ml-auto">
                    {trend.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Category Usage */}
        <section className="mt-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">
            Category Breakdown
          </h2>
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-4 space-y-3">
            {categoryUsage.map((category) => (
              <div key={category.category}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 capitalize">
                    {category.category}
                  </span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {category.count} items ({category.percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Most Worn Items */}
        <section className="mt-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">
            Most Worn Items
          </h2>
          <div className="space-y-2">
            {mostWornItems.map((item, index) => (
              <div
                key={item.id}
                className="bg-white dark:bg-zinc-800 rounded-xl p-3 flex items-center gap-3"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-semibold text-sm">
                  {index + 1}
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: item.colorHex }}
                >
                  {item.category === 'tops' && '👕'}
                  {item.category === 'bottoms' && '👖'}
                  {item.category === 'shoes' && '👟'}
                  {item.category === 'accessories' && '⌚'}
                  {item.category === 'outerwear' && '🧥'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-zinc-900 dark:text-white truncate">
                    {item.name}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {item.color}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                    {item.usageCount}x
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    worn
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Insights */}
        <section className="mt-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">
            Quick Insights
          </h2>
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-4 text-white">
              <p className="text-sm opacity-90">Your favorite color</p>
              <p className="text-xl font-bold mt-1">
                {colorTrends[0]?.color || 'N/A'}
              </p>
              <p className="text-sm opacity-75 mt-1">
                {colorTrends[0]?.percentage || 0}% of your wardrobe
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
              <p className="text-sm opacity-90">Most items in</p>
              <p className="text-xl font-bold mt-1 capitalize">
                {categoryUsage[0]?.category || 'N/A'}
              </p>
              <p className="text-sm opacity-75 mt-1">
                {categoryUsage[0]?.count || 0} items
              </p>
            </div>
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white">
              <p className="text-sm opacity-90">Average wears per item</p>
              <p className="text-xl font-bold mt-1">
                {items.length > 0 ? Math.round(totalUsage / items.length) : 0}x
              </p>
              <p className="text-sm opacity-75 mt-1">
                Based on {items.length} items
              </p>
            </div>
          </div>
        </section>
      </main>

      <Navigation />
    </div>
  );
}
