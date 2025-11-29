'use client';

import { useState, memo, useMemo } from 'react';
import { WardrobeItem } from '@/types';
import { toggleFavorite } from '@/lib/storage';

interface WardrobeItemCardProps {
  item: WardrobeItem;
  isSelected?: boolean;
  onSelect?: (item: WardrobeItem) => void;
  showUsage?: boolean;
  onFavoriteToggle?: () => void;
  onDelete?: (item: WardrobeItem) => void;
  showDelete?: boolean;
}

function WardrobeItemCard({
  item,
  isSelected = false,
  onSelect,
  showUsage = false,
  onFavoriteToggle,
  onDelete,
  showDelete = false,
}: WardrobeItemCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(item.id);
    onFavoriteToggle?.();
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete?.(item);
  };

  const formatDate = useMemo(() => {
    if (!item.lastWorn) return 'Never';
    const date = new Date(item.lastWorn);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, [item.lastWorn]);

  const costPerWear = useMemo(() => {
    if (!item.priceSGD || item.usageCount === 0) return null;
    return (item.priceSGD / item.usageCount).toFixed(2);
  }, [item.priceSGD, item.usageCount]);

  return (
    <div
      onClick={() => onSelect?.(item)}
      className={`relative rounded-xl overflow-hidden bg-white dark:bg-zinc-800 cursor-pointer transition-all duration-200 border border-zinc-200 dark:border-zinc-700 ${isSelected
        ? 'ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-zinc-900 scale-95'
        : 'hover:scale-105'
        }`}
    >
      {/* Favorite Heart Icon */}
      <button
        onClick={handleFavoriteClick}
        className="absolute top-2 left-2 z-10 p-1.5 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm hover:bg-white dark:hover:bg-zinc-800 transition-colors"
        aria-label={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <svg
          className={`w-5 h-5 transition-colors ${item.isFavorite
            ? 'text-red-500 fill-red-500'
            : 'text-zinc-400 dark:text-zinc-500'
            }`}
          fill={item.isFavorite ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>

      {/* Delete Button */}
      {showDelete && onDelete && (
        <button
          onClick={handleDeleteClick}
          className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm hover:bg-red-500 hover:text-white transition-colors"
          aria-label="Delete item"
        >
          <svg
            className="w-5 h-5 text-zinc-400 dark:text-zinc-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      )}

      {/* Image or Color Swatch */}
      <div
        className="aspect-square flex items-center justify-center relative"
        style={{ backgroundColor: item.colorHex }}
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to emoji if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              if (target.parentElement) {
                target.parentElement.innerHTML = `
                  <div class="text-center p-2">
                    <span class="text-3xl">
                      ${item.category === 'tops' ? '👕' : ''}
                      ${item.category === 'bottoms' ? '👖' : ''}
                      ${item.category === 'shoes' ? '👟' : ''}
                      ${item.category === 'accessories' ? '⌚' : ''}
                      ${item.category === 'outerwear' ? '🧥' : ''}
                      ${item.category === 'dresses' ? '👗' : ''}
                    </span>
                  </div>
                `;
              }
            }}
          />
        ) : (
          <div className="text-center p-2">
            <span className="text-3xl">
              {item.category === 'tops' && '👕'}
              {item.category === 'bottoms' && '👖'}
              {item.category === 'shoes' && '👟'}
              {item.category === 'accessories' && '⌚'}
              {item.category === 'outerwear' && '🧥'}
              {item.category === 'dresses' && '👗'}
            </span>
          </div>
        )}
      </div>

      <div className="p-2">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-white truncate">
          {item.name}
        </h3>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 capitalize">
            {item.category}
          </span>
        </div>
        {showUsage && (
          <>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Last worn: {formatDate}
            </p>
            {costPerWear && (
              <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mt-0.5">
                ${costPerWear} SGD per wear
              </p>
            )}
          </>
        )}
      </div>

      {isSelected && (
        <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/60 z-20 rounded-xl flex items-center justify-center p-3">
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-3 shadow-xl w-full mx-2">
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-white mb-1.5">
              Delete Item
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3 break-words line-clamp-2">
              Delete "{item.name}"? It will be moved to the recycle bin.
            </p>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 px-2 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleConfirmDelete();
                }}
                className="flex-1 px-2 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(WardrobeItemCard);
