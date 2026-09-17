import React from 'react';
import { Category } from '../types';

interface CategoryBarProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
}

// Blinkit-style emoji icon mapping with colorful backgrounds
const categoryStyle: Record<string, { emoji: string; bg: string; activeBg: string }> = {
  Sparkles:       { emoji: '✨', bg: 'bg-purple-50',  activeBg: 'bg-purple-100' },
  Milk:           { emoji: '🥛', bg: 'bg-blue-50',    activeBg: 'bg-blue-100' },
  Apple:          { emoji: '🍎', bg: 'bg-red-50',     activeBg: 'bg-red-100' },
  Croissant:      { emoji: '🥐', bg: 'bg-amber-50',   activeBg: 'bg-amber-100' },
  Cookie:         { emoji: '🍪', bg: 'bg-orange-50',  activeBg: 'bg-orange-100' },
  CupSoda:        { emoji: '🥤', bg: 'bg-cyan-50',    activeBg: 'bg-cyan-100' },
  Wheat:          { emoji: '🌾', bg: 'bg-yellow-50',  activeBg: 'bg-yellow-100' },
  Flame:          { emoji: '🔥', bg: 'bg-red-50',     activeBg: 'bg-red-100' },
  Coffee:         { emoji: '☕', bg: 'bg-amber-50',   activeBg: 'bg-amber-100' },
  Sparkle:        { emoji: '🧹', bg: 'bg-teal-50',    activeBg: 'bg-teal-100' },
  Smile:          { emoji: '😊', bg: 'bg-pink-50',    activeBg: 'bg-pink-100' },
  HeartHandshake: { emoji: '👶', bg: 'bg-rose-50',    activeBg: 'bg-rose-100' },
  BookOpen:       { emoji: '📚', bg: 'bg-indigo-50',  activeBg: 'bg-indigo-100' },
};

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  return (
    <div className="w-full bg-white border-b border-gray-100 sticky top-[93px] z-30">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const isSelected = cat.id === selectedCategoryId;
            const style = categoryStyle[cat.icon] || { emoji: '🛒', bg: 'bg-gray-50', activeBg: 'bg-gray-100' };

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 border ${
                  isSelected
                    ? 'bg-[#0C831F] text-white border-[#0C831F] shadow-md shadow-green-600/20'
                    : `${style.bg} hover:${style.activeBg} text-gray-700 border-gray-200 hover:border-gray-300`
                }`}
              >
                <span className="text-base leading-none">{style.emoji}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
