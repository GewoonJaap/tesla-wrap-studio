
import React from 'react';
import { Heart, FolderOpen, Search, LogIn } from 'lucide-react';

interface GalleryEmptyStateProps {
  activeCategory: string;
  isLoggedIn: boolean;
  onUpload: () => void;
  onAuth: () => void;
  resetSearch: () => void;
}

const GalleryEmptyState: React.FC<GalleryEmptyStateProps> = ({ 
  activeCategory, 
  isLoggedIn, 
  onUpload, 
  onAuth,
  resetSearch
}) => {
  return (
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
                      <button onClick={resetSearch} className="px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-zinc-200">
                          Browse Wraps
                      </button>
                  ) : (
                      <button onClick={onAuth} className="px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-zinc-200 flex items-center gap-2 mx-auto">
                          <LogIn className="w-4 h-4" /> Sign In to View Favorites
                      </button>
                  )}
              </>
          ) : activeCategory === 'my_wraps' ? (
              <>
                  <FolderOpen className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No designs yet</h3>
                  <p className="text-zinc-500 mb-6">
                      {isLoggedIn 
                          ? "You haven't uploaded any designs yet. Get creative in the Studio!" 
                          : "Sign in to manage your uploaded designs."}
                  </p>
                  {isLoggedIn ? (
                      <button onClick={onUpload} className="px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-zinc-200">
                          Upload Design
                      </button>
                  ) : (
                      <button onClick={onAuth} className="px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-zinc-200 flex items-center gap-2 mx-auto">
                          <LogIn className="w-4 h-4" /> Sign In to View Your Designs
                      </button>
                  )}
              </>
          ) : (
              <>
                  <Search className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No wraps found</h3>
                  <p className="text-zinc-500 mb-6">We couldn't find any designs matching your criteria.</p>
                  <button onClick={resetSearch} className="px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-zinc-200">
                      Clear Search
                  </button>
              </>
          )}
      </div>
    </div>
  );
};

export default GalleryEmptyState;
