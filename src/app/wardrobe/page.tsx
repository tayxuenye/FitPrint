'use client';

import { useState, useRef } from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import WardrobeItemCard from '@/components/WardrobeItemCard';
import { WardrobeItem } from '@/types';
import { sampleWardrobeItems, generateId } from '@/lib/wardrobe';

const categories = ['all', 'tops', 'bottoms', 'shoes', 'accessories', 'outerwear'] as const;
type Category = typeof categories[number];

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

export default function WardrobePage() {
  const [items, setItems] = useState<WardrobeItem[]>(sampleWardrobeItems);
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'tops' as WardrobeItem['category'],
    color: 'White',
    colorHex: '#FFFFFF',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter(item => item.category === selectedCategory);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = () => {
    if (!newItem.name.trim()) return;

    const item: WardrobeItem = {
      id: generateId(),
      name: newItem.name,
      category: newItem.category,
      color: newItem.color,
      colorHex: newItem.colorHex,
      imageUrl: uploadedImage || '/wardrobe/default.svg',
      usageCount: 0,
      createdAt: new Date().toISOString(),
    };

    setItems([...items, item]);
    setShowAddModal(false);
    setNewItem({
      name: '',
      category: 'tops',
      color: 'White',
      colorHex: '#FFFFFF',
    });
    setUploadedImage(null);
  };

  const handleColorSelect = (colorName: string, colorHex: string) => {
    setNewItem({ ...newItem, color: colorName, colorHex });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <Header title="My Wardrobe" />
      
      <main className="pt-16 pb-20 px-4">
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto py-4 -mx-4 px-4 no-scrollbar">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {/* Add New Item Card */}
          <button
            onClick={() => setShowAddModal(true)}
            className="aspect-square rounded-xl bg-white dark:bg-zinc-800 border-2 border-dashed border-zinc-300 dark:border-zinc-600 flex flex-col items-center justify-center text-zinc-400 hover:text-purple-500 hover:border-purple-500 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm mt-2">Add Item</span>
          </button>

          {filteredItems.map((item) => (
            <WardrobeItemCard key={item.id} item={item} showUsage />
          ))}
        </div>

        {/* Item Count */}
        <p className="text-center text-zinc-500 dark:text-zinc-400 mt-6 text-sm">
          {filteredItems.length} items in {selectedCategory === 'all' ? 'your wardrobe' : selectedCategory}
        </p>
      </main>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white dark:bg-zinc-800 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Add Wardrobe Item</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Photo (optional)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 rounded-xl bg-zinc-100 dark:bg-zinc-700 border-2 border-dashed border-zinc-300 dark:border-zinc-600 flex flex-col items-center justify-center text-zinc-400 hover:text-purple-500 hover:border-purple-500 transition-colors overflow-hidden"
                >
                  {uploadedImage ? (
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
              </div>

              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Item Name
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
                  Category
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value as WardrobeItem['category'] })}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-700 border-0 text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="tops">Tops</option>
                  <option value="bottoms">Bottoms</option>
                  <option value="shoes">Shoes</option>
                  <option value="accessories">Accessories</option>
                  <option value="outerwear">Outerwear</option>
                </select>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => handleColorSelect(color.name, color.hex)}
                      className={`w-full aspect-square rounded-xl border-2 transition-all ${
                        newItem.color === color.name
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

              {/* Add Button */}
              <button
                onClick={handleAddItem}
                disabled={!newItem.name.trim()}
                className="w-full py-3 rounded-xl bg-purple-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
              >
                Add to Wardrobe
              </button>
            </div>
          </div>
        </div>
      )}

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
