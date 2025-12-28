
import React from 'react';
import { Star, Upload } from 'lucide-react';

interface GalleryHeroProps {
  onUpload: () => void;
}

const GalleryHero: React.FC<GalleryHeroProps> = ({ onUpload }) => {
  return (
    <div className="relative w-full overflow-hidden shrink-0">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-red-900 to-zinc-900 opacity-80" />
      <div className="absolute inset-0 bg-[url('https://github.com/GewoonJaap/custom-tesla-wraps/blob/master/images/wrap.jpg?raw=true')] bg-cover bg-center mix-blend-overlay opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
      
      <div className="relative container mx-auto px-6 py-20 sm:py-24 lg:py-28 flex flex-col justify-center items-start min-h-[400px]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-purple-300 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Star className="w-3 h-3 fill-current" /> Community Showcase
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-white mb-4 tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700 leading-tight">
          Download Free <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-red-500">Custom Tesla Wraps</span>
        </h1>
        <p className="text-zinc-300 max-w-xl text-lg mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          Explore thousands of custom Tesla skins created by the community. Download free .png files for your Cybertruck, Model 3, or Model Y Paint Shop.
        </p>
        <button 
           onClick={onUpload}
           className="px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200"
        >
           <Upload className="w-5 h-5" /> Share Your Design
        </button>
      </div>
    </div>
  );
};

export default GalleryHero;
