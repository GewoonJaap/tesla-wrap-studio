
import React, { useState, useMemo, useEffect } from 'react';
import { GalleryItem } from '../types';
import { CAR_MODELS } from '../constants';
import { Search, TrendingUp, Clock, Star, Heart, FolderOpen } from 'lucide-react';
import { processAndDownloadImage } from '../services/imageUtils';

// Sub-components
import GalleryHero from './GalleryHero';
import GalleryControls from './GalleryControls';
import GalleryCard from './GalleryCard';
import GalleryEmptyState from './GalleryEmptyState';
import GallerySkeleton from './GallerySkeleton';

interface GalleryProps {
  items: GalleryItem[];
  onRemix: (item: GalleryItem) => void;
  onPreview3D: (item: GalleryItem) => void;
  onUpload: () => void;
  likedItemIds: Set<string>;
  onToggleLike: (item: GalleryItem) => void;
  isLoggedIn: boolean;
  currentUserId?: string;
  onDelete?: (item: GalleryItem) => void;
  onAuth: () => void;
}

const Gallery: React.FC<GalleryProps> = ({ 
  items, 
  onRemix, 
  onPreview3D, 
  onUpload, 
  likedItemIds, 
  onToggleLike, 
  isLoggedIn,
  currentUserId,
  onDelete,
  onAuth
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'downloads'>('newest');
  
  // Loading state simulation for UX polish when switching categories
  const [isLoading, setIsLoading] = useState(false);

  // Use all car models for filtering
  const availableCategories = CAR_MODELS;

  useEffect(() => {
      // Simulate a quick load when category changes to prevent jarring layout shifts
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 400);
      return () => clearTimeout(timer);
  }, [activeCategory, sortBy]);

  // Filter items by category first
  const categoryItems = useMemo(() => {
    let filtered = items;
    
    if (activeCategory === 'favorites') {
        filtered = items.filter(item => likedItemIds.has(item.id));
    } else if (activeCategory === 'my_wraps') {
        filtered = items.filter(item => item.userId === currentUserId);
    } else if (activeCategory !== 'all') {
        filtered = items.filter(item => item.carModelId === activeCategory);
    }
    
    return filtered;
  }, [items, activeCategory, likedItemIds, currentUserId]);

  // Apply Search & Sort
  const displayItems = useMemo(() => {
    let result = categoryItems;

    // Search
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        result = result.filter(item => 
            item.title.toLowerCase().includes(q) || 
            item.author.toLowerCase().includes(q) ||
            item.tags.some(tag => tag.toLowerCase().includes(q))
        );
    }

    // Sort
    return [...result].sort((a, b) => {
        if (sortBy === 'popular') return b.likes - a.likes;
        if (sortBy === 'downloads') return b.downloads - a.downloads;
        // Default newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  }, [categoryItems, searchQuery, sortBy]);

  // Grouped Collections for the main browse view
  const collections = useMemo(() => {
      // 1. Featured (Mix of likes/downloads + randomness element conceptually)
      const featured = [...items].sort((a, b) => (b.likes * 2 + b.downloads) - (a.likes * 2 + a.downloads)).slice(0, 10);
      // 2. Popular
      const popular = [...items].sort((a, b) => b.likes - a.likes).slice(0, 10);
      // 3. Newest
      const newest = [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);

      return { featured, popular, newest };
  }, [items]);

  const handleDownload = async (e: React.MouseEvent, item: GalleryItem) => {
      e.stopPropagation();
      if (downloadingIds.has(item.id)) return;

      setDownloadingIds(prev => {
          const next = new Set(prev);
          next.add(item.id);
          return next;
      });

      try {
          const response = await fetch(item.imageUrl, { mode: 'cors' });
          const blob = await response.blob();
          const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
          });

          const isPlate = item.carModelId === 'license-plate';
          const limit = isPlate ? 500 * 1024 : 1000 * 1024;
          const maxDim = isPlate ? 420 : 1024;
          
          const filename = `${item.title}.png`;
          await processAndDownloadImage(base64, filename, limit, maxDim);

      } catch (e) {
          console.error("Download failed:", e);
          alert("Failed to process download. Please try again.");
      } finally {
          setDownloadingIds(prev => {
              const next = new Set(prev);
              next.delete(item.id);
              return next;
          });
      }
  };

  const isBrowsingAll = activeCategory === 'all' && !searchQuery && sortBy === 'newest';

  // Helper to render a card to avoid repetition
  const renderCard = (item: GalleryItem, className?: string) => (
      <GalleryCard 
          key={item.id}
          item={item}
          isOwner={currentUserId === item.userId}
          isLiked={likedItemIds.has(item.id)}
          isDownloading={downloadingIds.has(item.id)}
          onRemix={onRemix}
          onPreview3D={onPreview3D}
          onToggleLike={onToggleLike}
          onDownload={handleDownload}
          onDelete={onDelete}
          className={className}
      />
  );

  return (
    <div className="bg-zinc-950 min-h-screen">
      <GalleryHero onUpload={onUpload} />
      
      <GalleryControls 
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        availableCategories={availableCategories}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Main Content Area */}
      {!isBrowsingAll || activeCategory !== 'all' ? (
          // Grid View
          <div className="container mx-auto px-4 sm:px-6 py-8 min-h-[600px]">
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {searchQuery ? (
                        <><Search className="w-5 h-5 text-purple-500" /> Search Results</>
                    ) : activeCategory === 'favorites' ? (
                        <><Heart className="w-5 h-5 text-pink-500 fill-pink-500" /> Your Favorites</>
                    ) : activeCategory === 'my_wraps' ? (
                        <><FolderOpen className="w-5 h-5 text-purple-500" /> My Designs</>
                    ) : (
                        <>{CAR_MODELS.find(c => c.id === activeCategory)?.name || 'Wraps'}</>
                    )}
                    <span className="text-zinc-500 text-sm font-normal ml-2">({displayItems.length})</span>
                 </h2>
              </div>
              
              {isLoading ? (
                  <GallerySkeleton />
              ) : displayItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500 slide-in-from-bottom-2">
                    {displayItems.map(item => renderCard(item))}
                </div>
              ) : (
                  <GalleryEmptyState 
                    activeCategory={activeCategory}
                    isLoggedIn={isLoggedIn}
                    onUpload={onUpload}
                    onAuth={onAuth}
                    resetSearch={() => { setSearchQuery(''); setActiveCategory('all'); }}
                  />
              )}
          </div>
      ) : (
          // Collections View
          <div className="py-8 space-y-12 pb-20">
              
              {/* Featured Section */}
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center gap-2 mb-4 px-4 sm:px-6">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <h2 className="text-xl font-bold text-white">Featured Designs</h2>
                  </div>
                  
                  <div className="relative group/slider">
                      <div className="flex overflow-x-auto gap-4 px-4 sm:px-6 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] snap-x snap-mandatory">
                          {collections.featured.length > 0 ? collections.featured.map(item => (
                              <div key={item.id} className="snap-start shrink-0 w-[280px] sm:w-[320px]">
                                  {renderCard(item)}
                              </div>
                          )) : (
                              <p className="text-zinc-500 text-sm italic px-2">No featured designs available yet.</p>
                          )}
                      </div>
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
                                  {renderCard(item)}
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
                                  {renderCard(item)}
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
