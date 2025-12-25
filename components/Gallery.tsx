
import React, { useState, useMemo } from 'react';
import { GalleryItem } from '../types';
import { CAR_MODELS } from '../constants';
import { Heart, Download, Edit3, Box, Search, TrendingUp, Clock, Star, Upload, User, LogIn } from 'lucide-react';

interface GalleryProps {
  items: GalleryItem[];
  onRemix: (item: GalleryItem) => void;
  onPreview3D: (item: GalleryItem) => void;
  onUpload: () => void;
  likedItemIds: Set<string>;
  onToggleLike: (item: GalleryItem) => void;
  isLoggedIn: boolean;
}

const Gallery: React.FC<GalleryProps> = ({ items, onRemix, onPreview3D, onUpload, likedItemIds, onToggleLike, isLoggedIn }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Use all car models for filtering
  const availableCategories = CAR_MODELS;

  // Filter items by category first
  const categoryItems = useMemo(() => {
    if (activeCategory === 'favorites') {
        return items.filter(item => likedItemIds.has(item.id));
    }
    if (activeCategory === 'all') return items;
    return items.filter(item => item.carModelId === activeCategory);
  }, [items, activeCategory, likedItemIds]);

  // Search Results logic
  // If we are in 'favorites' mode, search WITHIN favorites
  const displayItems = useMemo(() => {
    if (!searchQuery) return categoryItems;
    const q = searchQuery.toLowerCase();
    return categoryItems.filter(item => 
      item.title.toLowerCase().includes(q) || 
      item.author.toLowerCase().includes(q) ||
      item.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }, [categoryItems, searchQuery]);

  // Grouped Collections for the main browse view (only used when not searching and not in favorites view)
  const collections = useMemo(() => {
      // 1. Featured: Mix of likes and simple weighted randomness (simulated by downloads count for demo)
      const featured = [...categoryItems].sort((a, b) => (b.likes + b.downloads * 2) - (a.likes + a.downloads * 2)).slice(0, 10);
      
      // 2. Popular: Sorted by likes
      const popular = [...categoryItems].sort((a, b) => b.likes - a.likes).slice(0, 10);

      // 3. Newest: Sorted by Date
      const newest = [...categoryItems].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);

      return { featured, popular, newest };
  }, [categoryItems]);

  const handleDownload = (e: React.MouseEvent, item: GalleryItem) => {
      e.stopPropagation();
      const link = document.createElement('a');
      link.href = item.imageUrl;
      link.download = `${item.title.replace(/\s+/g, '-')}-wrap.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // Reusable Card Component
  const GalleryCard: React.FC<{ item: GalleryItem, className?: string }> = ({ item, className = "" }) => (
    <div 
        className={`group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 transition-all hover:shadow-2xl hover:shadow-purple-900/10 flex flex-col h-full ${className}`}
    >
        {/* Image Area */}
        <div className="relative aspect-square bg-zinc-950 overflow-hidden">
            <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />
            
            {/* Overlay Actions */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px] gap-2">
                <button 
                    onClick={() => onPreview3D(item)}
                    className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:scale-105"
                >
                    <Box className="w-4 h-4" /> 3D
                </button>
                <button 
                    onClick={() => onRemix(item)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75 hover:scale-105 shadow-lg shadow-purple-600/20"
                >
                    <Edit3 className="w-4 h-4" /> Remix
                </button>
            </div>

            {/* Top Stats */}
            <div className="absolute top-3 right-3 flex gap-2">
                    <div className="bg-black/50 backdrop-blur-md px-2 py-1 rounded-md text-[10px] text-white font-medium border border-white/10 uppercase">
                    {item.carModelId.replace('model', 'M-').substring(0, 10)}
                    </div>
            </div>
        </div>

        {/* Content Area */}
        <div className="p-4 flex flex-col gap-3 flex-1">
            <div className="flex justify-between items-start">
                <div className="min-w-0">
                    <h3 className="font-bold text-white text-base sm:text-lg leading-tight truncate pr-2" title={item.title}>{item.title}</h3>
                    <p className="text-sm text-zinc-500 truncate">by <span className="text-zinc-400 hover:text-purple-400 cursor-pointer transition-colors">@{item.author}</span></p>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); onToggleLike(item); }}
                    className={`p-2 rounded-full transition-colors shrink-0 ${likedItemIds.has(item.id) ? 'bg-pink-500/10 text-pink-500' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}
                >
                    <Heart className={`w-4 h-4 ${likedItemIds.has(item.id) ? 'fill-current' : ''}`} />
                </button>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-auto">
                {item.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 truncate max-w-[80px]">
                        #{tag}
                    </span>
                ))}
            </div>

            {/* Footer Stats */}
            <div className="pt-3 mt-1 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500 font-medium">
                <div className="flex gap-3">
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {item.likes}</span>
                    <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {item.downloads}</span>
                </div>
                <button 
                    onClick={(e) => handleDownload(e, item)}
                    className="text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                    <Download className="w-3.5 h-3.5" /> Save
                </button>
            </div>
        </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-950 scrollbar-thin">
      {/* Hero Section */}
      <div className="relative h-64 sm:h-80 overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-red-900 to-zinc-900 opacity-80" />
        <div className="absolute inset-0 bg-[url('https://github.com/GewoonJaap/custom-tesla-wraps/blob/master/images/wrap.jpg?raw=true')] bg-cover bg-center mix-blend-overlay opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
        
        <div className="relative h-full container mx-auto px-6 flex flex-col justify-center items-start">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-purple-300 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Star className="w-3 h-3 fill-current" /> Community Showcase
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white mb-4 tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700">
            Discover. <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-red-500">Remix.</span> Drive.
          </h1>
          <p className="text-zinc-300 max-w-xl text-lg mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Explore thousands of custom Tesla wraps created by the community. Preview in 3D, remix designs, or download for your vehicle.
          </p>
          <button 
             onClick={onUpload}
             className="px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200"
          >
             <Upload className="w-5 h-5" /> Share Your Design
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-lg border-b border-zinc-800">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
             <button 
                onClick={() => setActiveCategory('favorites')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${activeCategory === 'favorites' ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
             >
                <Heart className={`w-4 h-4 ${activeCategory === 'favorites' ? 'fill-white' : ''}`} /> Favorites
             </button>
             
             <div className="w-px h-6 bg-zinc-800 shrink-0 mx-1" />

             <button 
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeCategory === 'all' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
             >
                All Models
             </button>
             {availableCategories.map(cat => (
                 <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeCategory === cat.id ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                 >
                    {cat.name}
                 </button>
             ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                    type="text" 
                    placeholder="Search wraps..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-full pl-9 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder:text-zinc-600"
                />
             </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {searchQuery || activeCategory === 'favorites' ? (
          // Grid View for Search Results OR Favorites
          <div className="container mx-auto px-4 sm:px-6 py-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  {searchQuery ? (
                     <><Search className="w-5 h-5 text-purple-500" /> Search Results ({displayItems.length})</>
                  ) : (
                     <><Heart className="w-5 h-5 text-pink-500 fill-pink-500" /> Your Favorites ({displayItems.length})</>
                  )}
              </h2>
              
              {displayItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {displayItems.map(item => (
                        <GalleryCard key={item.id} item={item} />
                    ))}
                </div>
              ) : (
                  <div className="py-20 text-center">
                    <div className="bg-zinc-900/50 rounded-2xl p-8 max-w-md mx-auto border border-zinc-800 border-dashed">
                        {activeCategory === 'favorites' ? (
                            <>
                                <Heart className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">No favorites yet</h3>
                                <p className="text-zinc-500 mb-6">
                                    {isLoggedIn 
                                        ? "Go explore the gallery and like some designs to see them here!" 
                                        : "Sign in to save and view your favorite designs."}
                                </p>
                                {isLoggedIn ? (
                                    <button onClick={() => setActiveCategory('all')} className="px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-zinc-200">
                                        Browse Wraps
                                    </button>
                                ) : (
                                    <div className="flex justify-center text-sm text-zinc-400">
                                        <LogIn className="w-4 h-4 mr-2" /> Log in via the header
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <Search className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">No wraps found</h3>
                                <p className="text-zinc-500 mb-6">We couldn't find any designs matching your search.</p>
                                <button onClick={() => {setSearchQuery('');}} className="px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-zinc-200">
                                    Clear Search
                                </button>
                            </>
                        )}
                    </div>
                  </div>
              )}
          </div>
      ) : (
          // Swipable Sections for Browse Mode
          <div className="py-8 space-y-12 pb-20">
              
              {/* Featured Section */}
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center gap-2 mb-4 px-4 sm:px-6">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <h2 className="text-xl font-bold text-white">Featured Designs</h2>
                  </div>
                  
                  <div className="relative group/slider">
                      {/* Using CSS utility for hiding scrollbar but allowing scroll */}
                      <div className="flex overflow-x-auto gap-4 px-4 sm:px-6 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] snap-x snap-mandatory">
                          {collections.featured.length > 0 ? collections.featured.map(item => (
                              <div key={item.id} className="snap-start shrink-0 w-[280px] sm:w-[320px]">
                                  <GalleryCard item={item} />
                              </div>
                          )) : (
                              <p className="text-zinc-500 text-sm italic px-2">No featured designs available yet.</p>
                          )}
                      </div>
                      {/* Fade hint */}
                      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-zinc-950 to-transparent pointer-events-none" />
                  </div>
              </div>

              {/* Popular Section */}
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="flex items-center gap-2 mb-4 px-4 sm:px-6">
                      <TrendingUp className="w-5 h-5 text-red-500" />
                      <h2 className="text-xl font-bold text-white">Popular Community Wraps</h2>
                  </div>
                  <div className="relative group/slider">
                      <div className="flex overflow-x-auto gap-4 px-4 sm:px-6 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] snap-x snap-mandatory">
                          {collections.popular.length > 0 ? collections.popular.map(item => (
                              <div key={item.id} className="snap-start shrink-0 w-[280px] sm:w-[320px]">
                                  <GalleryCard item={item} />
                              </div>
                          )) : (
                              <p className="text-zinc-500 text-sm italic px-2">No popular designs available yet.</p>
                          )}
                      </div>
                      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-zinc-950 to-transparent pointer-events-none" />
                  </div>
              </div>

              {/* Newest Section */}
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="flex items-center gap-2 mb-4 px-4 sm:px-6">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <h2 className="text-xl font-bold text-white">Newest Arrivals</h2>
                  </div>
                  <div className="relative group/slider">
                      <div className="flex overflow-x-auto gap-4 px-4 sm:px-6 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] snap-x snap-mandatory">
                          {collections.newest.length > 0 ? collections.newest.map(item => (
                              <div key={item.id} className="snap-start shrink-0 w-[280px] sm:w-[320px]">
                                  <GalleryCard item={item} />
                              </div>
                          )) : (
                              <p className="text-zinc-500 text-sm italic px-2">No designs found.</p>
                          )}
                      </div>
                      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-zinc-950 to-transparent pointer-events-none" />
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Gallery;
