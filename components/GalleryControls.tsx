
import React from 'react';
import { Search, FolderOpen, Heart, ArrowUpDown, Filter } from 'lucide-react';
import { CarModel } from '../types';

interface GalleryControlsProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  availableCategories: CarModel[];
  sortBy: 'newest' | 'popular' | 'downloads';
  setSortBy: (sort: 'newest' | 'popular' | 'downloads') => void;
}

const GalleryControls: React.FC<GalleryControlsProps> = ({
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  availableCategories,
  sortBy,
  setSortBy
}) => {
  return (
    <div className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex flex-col lg:flex-row gap-4 justify-between items-center">
        
        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-hide mask-fade-right">
           <button 
              onClick={() => setActiveCategory('my_wraps')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 border ${activeCategory === 'my_wraps' ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/20' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700'}`}
           >
              <FolderOpen className={`w-4 h-4 ${activeCategory === 'my_wraps' ? 'fill-white/20' : ''}`} /> My Wraps
           </button>

           <button 
              onClick={() => setActiveCategory('favorites')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 border ${activeCategory === 'favorites' ? 'bg-pink-600 border-pink-500 text-white shadow-lg shadow-pink-600/20' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700'}`}
           >
              <Heart className={`w-4 h-4 ${activeCategory === 'favorites' ? 'fill-white' : ''}`} /> Favorites
           </button>
           
           <div className="w-px h-6 bg-zinc-800 shrink-0 mx-2" />

           <button 
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${activeCategory === 'all' ? 'bg-white border-white text-black shadow-lg shadow-white/10' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700'}`}
           >
              All Models
           </button>
           {availableCategories.map(cat => (
               <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${activeCategory === cat.id ? 'bg-white border-white text-black shadow-lg shadow-white/10' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700'}`}
               >
                  {cat.name}
               </button>
           ))}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
           {/* Search */}
           <div className="relative flex-1 lg:w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
              <input 
                  type="text" 
                  placeholder="Search wraps, tags..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-full pl-9 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all placeholder:text-zinc-600"
              />
           </div>

           {/* Sort Dropdown */}
           <div className="relative group shrink-0">
              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 text-sm font-medium text-zinc-300 cursor-pointer hover:border-zinc-700 hover:text-white transition-colors">
                  <ArrowUpDown className="w-4 h-4" />
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent outline-none appearance-none cursor-pointer w-full h-full absolute inset-0 opacity-0"
                  >
                    <option value="newest">Newest First</option>
                    <option value="popular">Most Popular</option>
                    <option value="downloads">Most Downloads</option>
                  </select>
                  <span>
                    {sortBy === 'newest' ? 'Newest' : sortBy === 'popular' ? 'Popular' : 'Downloads'}
                  </span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryControls;
