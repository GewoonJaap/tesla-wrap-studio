
import React from 'react';

const GallerySkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col h-full animate-pulse">
            {/* Image Placeholder */}
            <div className="aspect-square bg-zinc-800 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 animate-[shimmer_2s_infinite]" />
            </div>
            
            {/* Content Placeholder */}
            <div className="p-4 flex flex-col gap-3 flex-1">
                <div className="flex justify-between items-start">
                    <div className="space-y-2 w-full">
                        <div className="h-5 bg-zinc-800 rounded w-3/4" />
                        <div className="h-3 bg-zinc-800 rounded w-1/2" />
                    </div>
                    <div className="w-8 h-8 bg-zinc-800 rounded-full shrink-0" />
                </div>
                
                <div className="flex gap-2 mt-auto pt-2">
                    <div className="h-4 bg-zinc-800 rounded w-12" />
                    <div className="h-4 bg-zinc-800 rounded w-16" />
                </div>

                <div className="pt-3 mt-1 border-t border-zinc-800 flex justify-between">
                     <div className="h-3 bg-zinc-800 rounded w-20" />
                     <div className="h-3 bg-zinc-800 rounded w-12" />
                </div>
            </div>
        </div>
      ))}
    </div>
  );
};

export default GallerySkeleton;
