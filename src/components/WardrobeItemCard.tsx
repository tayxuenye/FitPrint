'use client';

import { WardrobeItem } from '@/types';

interface WardrobeItemCardProps {
  item: WardrobeItem;
  isSelected?: boolean;
  onSelect?: (item: WardrobeItem) => void;
  showUsage?: boolean;
}

export default function WardrobeItemCard({
  item,
  isSelected = false,
  onSelect,
  showUsage = false,
}: WardrobeItemCardProps) {
  return (
    <div
      onClick={() => onSelect?.(item)}
      className={`relative rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-zinc-900 scale-95'
          : 'hover:scale-105'
      }`}
    >
      {/* Color swatch as placeholder for image */}
      <div
        className="aspect-square flex items-center justify-center"
        style={{ backgroundColor: item.colorHex }}
      >
        <div className="text-center p-2">
          <span className="text-3xl">
            {item.category === 'tops' && '👕'}
            {item.category === 'bottoms' && '👖'}
            {item.category === 'shoes' && '👟'}
            {item.category === 'accessories' && '⌚'}
            {item.category === 'outerwear' && '🧥'}
          </span>
        </div>
      </div>
      
      <div className="p-2">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-white truncate">
          {item.name}
        </h3>
        <div className="flex items-center gap-1 mt-1">
          <div
            className="w-3 h-3 rounded-full border border-zinc-300"
            style={{ backgroundColor: item.colorHex }}
          />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {item.color}
          </span>
        </div>
        {showUsage && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            Worn {item.usageCount}x
          </p>
        )}
      </div>
      
      {isSelected && (
        <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
}
