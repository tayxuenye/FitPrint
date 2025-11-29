'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import WardrobeItemCard from '@/components/WardrobeItemCard';
import AIStylist from '@/components/AIStylist';
import { WardrobeItem, ImageMetadata } from '@/types';
import { sampleWardrobeItems, generateId } from '@/lib/wardrobe';
import { getItems, saveItem, toggleFavorite as toggleFavoriteStorage, deleteItem as deleteItemStorage } from '@/lib/storage';

const categories = ['all', 'tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories'] as const;
type Category = typeof categories[number];

const occasionOptions = ['casual', 'formal', 'work', 'sporty', 'business', 'streetwear'] as const;

const colorOptions = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#000000' },
  { name: 'Navy Blue', hex: '#000080' },
  { name: 'Blue', hex: '#4169E1' },
  { name: 'Grey', hex: '#808080' },
  { name: 'Brown', hex: '#8B4513' },
  { name: 'Khaki', hex: '#C3B091' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Green', hex: '#228B22' },
  { name: 'Pink', hex: '#FFB6C1' },
];

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function WardrobePage() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'tops' as WardrobeItem['category'],
    color: 'White',
    colorHex: '#FFFFFF',
    occasion: [] as string[],
    priceSGD: undefined as number | undefined,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [aiMetadata, setAiMetadata] = useState<ImageMetadata | null>(null);

  // Load items from storage on mount
  useEffect(() => {
    const storedItems = getItems();
    if (storedItems.length > 0) {
      setItems(storedItems);
    } else {
      // Initialize with sample items if storage is empty
      sampleWardrobeItems.forEach(item => saveItem(item));
      setItems(sampleWardrobeItems);
    }
  }, []);

  // Filter items by category and search - memoized for performance
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = debouncedSearchQuery === '' ||
        item.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        item.color.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, selectedCategory, debouncedSearchQuery]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a JPEG, PNG, or WebP image');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploadedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Use TensorFlow.js for client-side image classification
    setIsUploading(true);
    try {
      const { classifyClothingImage } = await import('@/lib/imageClassification');
      const metadata = await classifyClothingImage(file);

      if (metadata) {
        setAiMetadata(metadata);
        // Autofill form with AI metadata
        setNewItem({
          name: metadata.suggestedName,
          category: metadata.category,
          color: metadata.color,
          colorHex: metadata.colorHex,
          occasion: metadata.occasion,
          priceSGD: undefined,
        });
      } else {
        // Fallback to filename-based extraction
        const fallbackMetadata = extractMetadataFromFilename(file);
        setAiMetadata(fallbackMetadata);
        setNewItem({
          name: fallbackMetadata.suggestedName,
          category: fallbackMetadata.category,
          color: fallbackMetadata.color,
          colorHex: fallbackMetadata.colorHex,
          occasion: fallbackMetadata.occasion,
          priceSGD: undefined,
        });
      }
    } catch (error) {
      console.error('Error classifying image:', error);
      // Fallback to filename-based extraction
      const fallbackMetadata = extractMetadataFromFilename(file);
      setAiMetadata(fallbackMetadata);
      setNewItem({
        name: fallbackMetadata.suggestedName,
        category: fallbackMetadata.category,
        color: fallbackMetadata.color,
        colorHex: fallbackMetadata.colorHex,
        occasion: fallbackMetadata.occasion,
        priceSGD: undefined,
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Fallback function for filename-based extraction
  const extractMetadataFromFilename = (file: File): ImageMetadata => {
    const fileName = file.name.toLowerCase();

    const colorOptions = [
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Black', hex: '#000000' },
      { name: 'Navy Blue', hex: '#000080' },
      { name: 'Blue', hex: '#4169E1' },
      { name: 'Grey', hex: '#808080' },
      { name: 'Brown', hex: '#8B4513' },
      { name: 'Khaki', hex: '#C3B091' },
      { name: 'Red', hex: '#FF0000' },
      { name: 'Green', hex: '#228B22' },
      { name: 'Pink', hex: '#FFB6C1' },
    ];

    const categoryMap: Record<string, 'tops' | 'bottoms' | 'dresses' | 'outerwear' | 'shoes' | 'accessories'> = {
      'shirt': 'tops', 't-shirt': 'tops', 'top': 'tops', 'blouse': 'tops',
      'pants': 'bottoms', 'jeans': 'bottoms', 'trousers': 'bottoms',
      'dress': 'dresses',
      'jacket': 'outerwear', 'coat': 'outerwear',
      'shoes': 'shoes', 'sneakers': 'shoes',
      'watch': 'accessories',
    };

    let category: ImageMetadata['category'] = 'tops';
    for (const [key, value] of Object.entries(categoryMap)) {
      if (fileName.includes(key)) {
        category = value;
        break;
      }
    }

    let color = 'White';
    let colorHex = '#FFFFFF';
    for (const colorOption of colorOptions) {
      if (fileName.includes(colorOption.name.toLowerCase())) {
        color = colorOption.name;
        colorHex = colorOption.hex;
        break;
      }
    }

    const suggestedName = fileName
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') || 'Clothing Item';

    return {
      suggestedName,
      category,
      color,
      colorHex,
      occasion: ['casual'],
      confidence: 0.5,
    };
  };

  const handleAddItem = () => {
    if (!newItem.name.trim()) return;

    const item: WardrobeItem = {
      id: generateId(),
      name: newItem.name,
      category: newItem.category,
      color: newItem.color,
      colorHex: newItem.colorHex,
      imageUrl: uploadedImage || undefined,
      occasion: newItem.occasion,
      priceSGD: newItem.priceSGD,
      usageCount: 0,
      isFavorite: false,
      aiExtracted: aiMetadata !== null,
      createdAt: new Date().toISOString(),
    };

    saveItem(item);
    setItems([...items, item]);
    setShowAddModal(false);
    setNewItem({
      name: '',
      category: 'tops',
      color: 'White',
      colorHex: '#FFFFFF',
      occasion: [],
      priceSGD: undefined,
    });
    setUploadedImage(null);
    setUploadedFile(null);
    setAiMetadata(null);
  };

  const handleColorSelect = (colorName: string, colorHex: string) => {
    setNewItem({ ...newItem, color: colorName, colorHex });
  };

  const handleOccasionToggle = (occasion: string) => {
    setNewItem({
      ...newItem,
      occasion: newItem.occasion.includes(occasion)
        ? newItem.occasion.filter(o => o !== occasion)
        : [...newItem.occasion, occasion],
    });
  };

  const handleFavoriteToggle = useCallback(() => {
    // Reload items from storage after favorite toggle
    setItems(getItems());
  }, []);

  const handleDeleteItem = useCallback((deletedItem: WardrobeItem) => {
    deleteItemStorage(deletedItem.id);
    setItems(getItems());
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-700 z-50">
        <div className="flex items-center justify-between h-14 px-4">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">
            My Digital Closet
          </h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors"
            aria-label="Add item"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </header>

      <main className="pt-14 pb-20 px-4">
        {/* Search Bar */}
        <div className="py-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, category, or color"
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto py-2 -mx-4 px-4 no-scrollbar mb-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category
                ? 'bg-purple-600 text-white'
                : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Items Grid - Two Column */}
        <div className="grid grid-cols-2 gap-3">
          {filteredItems.map((item) => (
            <WardrobeItemCard
              key={item.id}
              item={item}
              showUsage
              showDelete
              onFavoriteToggle={handleFavoriteToggle}
              onDelete={handleDeleteItem}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-500 dark:text-zinc-400">
              {debouncedSearchQuery ? 'No items found' : 'No items in this category'}
            </p>
          </div>
        )}
      </main>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white dark:bg-zinc-800 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center sticky top-0 bg-white dark:bg-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Add to Closet</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setUploadedImage(null);
                  setUploadedFile(null);
                  setAiMetadata(null);
                }}
                className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-4 pb-24">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Photo (optional)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full h-32 rounded-xl bg-zinc-100 dark:bg-zinc-700 border-2 border-dashed border-zinc-300 dark:border-zinc-600 flex flex-col items-center justify-center text-zinc-400 hover:text-purple-500 hover:border-purple-500 transition-colors overflow-hidden relative"
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <svg className="animate-spin w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-sm">Processing...</span>
                    </div>
                  ) : uploadedImage ? (
                    <img src={uploadedImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm mt-2">Upload Photo</span>
                    </>
                  )}
                </button>
                {aiMetadata && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    ✓ AI autofilled details from image
                  </p>
                )}
              </div>

              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g., Blue Cotton Shirt"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-700 border-0 text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Category *
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value as WardrobeItem['category'] })}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-700 border-0 text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="tops">Tops</option>
                  <option value="bottoms">Bottoms</option>
                  <option value="dresses">Dresses</option>
                  <option value="outerwear">Outerwear</option>
                  <option value="shoes">Shoes</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Color *
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => handleColorSelect(color.name, color.hex)}
                      className={`w-full aspect-square rounded-xl border-2 transition-all ${newItem.color === color.name
                        ? 'border-purple-500 scale-110'
                        : 'border-zinc-200 dark:border-zinc-600'
                        }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
                <p className="text-sm text-zinc-500 mt-2">Selected: {newItem.color}</p>
              </div>

              {/* Occasion */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Occasion (multi-select)
                </label>
                <div className="flex flex-wrap gap-2">
                  {occasionOptions.map((occasion) => (
                    <button
                      key={occasion}
                      type="button"
                      onClick={() => handleOccasionToggle(occasion)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${newItem.occasion.includes(occasion)
                        ? 'bg-purple-600 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                        }`}
                    >
                      {occasion.charAt(0).toUpperCase() + occasion.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Price (SGD)
                </label>
                <input
                  type="number"
                  value={newItem.priceSGD || ''}
                  onChange={(e) => setNewItem({ ...newItem, priceSGD: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-700 border-0 text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Add Button */}
              <button
                onClick={handleAddItem}
                disabled={!newItem.name.trim()}
                className="w-full py-3 rounded-xl bg-purple-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
              >
                Add to Closet
              </button>
            </div>
          </div>
        </div>
      )}

      <AIStylist wardrobeItems={items} />
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
