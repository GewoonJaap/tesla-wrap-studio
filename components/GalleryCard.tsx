
import React from 'react';
import { GalleryItem } from '../types';
import { Heart, Download, Edit3, Box, Trash2, Loader2, Sparkles } from 'lucide-react';

interface GalleryCardProps {
  item: GalleryItem;
  isOwner: boolean;
  isLiked: boolean;
  isDownloading: boolean;
  onRemix: (item: GalleryItem) => void;
  onPreview3D: (item: GalleryItem) => void;
  onToggleLike: (item: GalleryItem) => void;
  onDownload: (e: React.MouseEvent, item: GalleryItem) => void;
  onDelete?: (item: GalleryItem) => void;
  className?: string;
}

const GalleryCard: React.FC<GalleryCardProps> = ({ 
  item, 
  isOwner, 
  isLiked, 
  isDownloading,
  onRemix, 
  onPreview3D, 
  onToggleLike, 
  onDownload, 
  onDelete,
  className = ""
}) => {
  // Check if "New" (Created within last 3 days)
  const isNew = new Date(item.createdAt).getTime() > Date.now() - (3 * 24 * 60 * 60 * 1000);

  return (
    <div 
        className={`group bg-zinc-900 border border-zinc-800/60 rounded-2xl overflow-hidden hover:border-zinc-600 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/10 flex flex-col h-full hover:-translate-y-1 ${className}`}
    >
        {/* Image Area */}
        <div className="relative aspect-square bg-zinc-950 overflow-hidden">
            <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 will-change-transform"
                loading="lazy"
            />
            {/* Subtle Gradient Overlay always visible for text readability if we had text over image, but here adds depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Center Actions Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/20 backdrop-blur-[2px] gap-3">
                <button 
                    onClick={() => onPreview3D(item)}
                    className="bg-white text-black w-10 h-10 rounded-full flex items-center justify-center transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 shadow-lg"
                    title="View in 3D"
                >
                    <Box className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => onRemix(item)}
                    className="bg-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75 hover:scale-110 shadow-lg shadow-purple-600/30"
                    title="Remix this design"
                >
                    <Edit3 className="w-4 h-4" />
                </button>
            </div>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
                {isNew && (
                    <div className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-blue-500/20 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 fill-white" /> NEW
                    </div>
                )}
            </div>

            {/* Model Badge */}
            <div className="absolute top-3 right-3">
                <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] text-zinc-300 font-medium border border-white/10 uppercase tracking-wide">
                    {item.carModelId.replace('model', 'M-').substring(0, 10)}
                </div>
            </div>

            {/* Owner Actions */}
            {isOwner && onDelete && (
                <button 
                     onClick={(e) => { e.stopPropagation(); onDelete(item); }}
                     className="absolute bottom-3 left-3 bg-red-500/90 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-md transition-all shadow-lg hover:scale-110 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                     title="Delete your design"
                >
                     <Trash2 className="w-4 h-4" />
                </button>
            )}
        </div>

        {/* Content Area */}
        <div className="p-4 flex flex-col gap-3 flex-1">
            <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-white text-base leading-snug truncate group-hover:text-purple-300 transition-colors" title={item.title}>
                        {item.title}
                    </h3>
                    <p className="text-xs text-zinc-500 truncate mt-0.5">
                        by <span className="text-zinc-400 hover:text-white cursor-pointer transition-colors">@{item.author}</span>
                    </p>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); onToggleLike(item); }}
                    className={`p-2 rounded-full transition-all shrink-0 hover:scale-110 active:scale-95 ${isLiked ? 'bg-pink-500/10 text-pink-500' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-pink-400'}`}
                >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                </button>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-auto">
                {item.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-zinc-800/50 text-zinc-400 border border-zinc-800 truncate max-w-[80px] hover:border-zinc-600 transition-colors">
                        #{tag}
                    </span>
                ))}
            </div>

            {/* Footer Stats */}
            <div className="pt-3 mt-1 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500 font-medium">
                <div className="flex gap-4">
                    <span className="flex items-center gap-1.5 hover:text-pink-400 transition-colors cursor-default">
                        <Heart className="w-3.5 h-3.5" /> {item.likes}
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-blue-400 transition-colors cursor-default">
                        <Download className="w-3.5 h-3.5" /> {item.downloads}
                    </span>
                </div>
                <button 
                    onClick={(e) => onDownload(e, item)}
                    className="text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group/dl"
                    disabled={isDownloading}
                >
                    {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 group-hover/dl:translate-y-0.5 transition-transform" />}
                    <span className="hidden sm:inline">{isDownloading ? 'Saving...' : 'Save'}</span>
                </button>
            </div>
        </div>
    </div>
  );
};

export default GalleryCard;
