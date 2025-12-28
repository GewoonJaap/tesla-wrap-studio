
import React from 'react';
import { CarModel, GalleryItem } from '../types';
import { CAR_MODELS } from '../constants';
import { 
  ArrowRight, Sparkles, Zap, Shield, Monitor, 
  Download, MousePointer, Layers, CheckCircle2, 
  Palette, Star, Flame, Box
} from 'lucide-react';
import GalleryCard from './GalleryCard';

interface HomePageProps {
  onNavigate: (view: 'editor' | 'gallery' | 'faq' | 'about' | 'guide') => void;
  onSelectModel: (model: CarModel) => void;
  featuredWraps: GalleryItem[];
  // Props needed for GalleryCard
  likedItemIds: Set<string>;
  onToggleLike: (item: GalleryItem) => void;
  onPreview3D: (item: GalleryItem) => void;
  onRemix: (item: GalleryItem) => void;
  onDownload: (e: React.MouseEvent, item: GalleryItem) => void;
  currentUserId?: string;
  isDownloadingIds: Set<string>;
  downloadedIds?: Set<string>;
}

const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectModel,
  featuredWraps,
  likedItemIds,
  onToggleLike,
  onPreview3D,
  onRemix,
  onDownload,
  currentUserId,
  isDownloadingIds,
  downloadedIds
}) => {

  const handleModelClick = (model: CarModel) => {
    onSelectModel(model);
    onNavigate('editor');
  };

  return (
    <div className="bg-zinc-950 min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-900/40 via-zinc-950/0 to-zinc-950/0" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Sparkles className="w-3 h-3" /> Updated for Holiday Update 2025
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700">
            Free Tesla Wrap Creator <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-red-500">& Custom Wrap Downloader</span>
          </h1>
          
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Design your own custom wraps or download thousands of community-made wraps for your Tesla's 3D visualization. Export ready-to-use .png files for the Toybox Paint Shop.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <button 
              onClick={() => onNavigate('editor')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold text-lg rounded-full hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-2"
            >
              Start Designing <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => onNavigate('gallery')}
              className="w-full sm:w-auto px-8 py-4 bg-zinc-900 text-white font-bold text-lg rounded-full border border-zinc-800 hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
            >
              Download Wraps
            </button>
          </div>
          
          <div className="mt-12 flex items-center justify-center gap-8 text-zinc-500 text-sm font-medium animate-in fade-in duration-1000 delay-300">
             <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> No Software Needed</span>
             <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Instant PNG Export</span>
             <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> 100% Free</span>
          </div>
        </div>
      </section>

      {/* 2. MODEL SELECTOR */}
      <section className="py-20 bg-zinc-900/30 border-y border-zinc-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Select Model to Customize</h2>
            <p className="text-zinc-400">Choose your vehicle below to load the official Tesla Paint Shop UV templates.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CAR_MODELS.filter(m => m.id !== 'license-plate').map((model) => (
              <button
                key={model.id}
                onClick={() => handleModelClick(model)}
                className="group relative flex flex-col items-center p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-purple-500/50 hover:bg-zinc-800 transition-all"
              >
                <div className="w-full aspect-video bg-zinc-950 rounded-lg mb-4 overflow-hidden relative">
                   <img 
                     src={`https://raw.githubusercontent.com/GewoonJaap/custom-tesla-wraps/master/${model.folderName}/vehicle_image.png`}
                     alt={`${model.name} Preview`}
                     className="w-full h-full object-contain p-2 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                     loading="lazy"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                   <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                      <div className="bg-purple-600 text-white p-1.5 rounded-full">
                        <ArrowRight className="w-3 h-3" />
                      </div>
                   </div>
                </div>
                <span className="text-sm font-medium text-zinc-300 group-hover:text-white text-center">
                  {model.name}
                </span>
              </button>
            ))}
             <button
                onClick={() => handleModelClick(CAR_MODELS.find(m => m.id === 'license-plate')!)}
                className="group relative flex flex-col items-center p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-blue-500/50 hover:bg-zinc-800 transition-all"
              >
                <div className="w-full aspect-video bg-zinc-950 rounded-lg mb-4 flex items-center justify-center border border-dashed border-zinc-800 group-hover:border-zinc-600">
                    <span className="text-xs text-zinc-500 font-mono border-2 border-zinc-700 px-2 py-1 rounded">LICENSE</span>
                </div>
                <span className="text-sm font-medium text-zinc-300 group-hover:text-white text-center">
                  License Plate
                </span>
              </button>
          </div>
        </div>
      </section>

      {/* 3. COMMUNITY SHOWCASE */}
      <section className="py-24 bg-gradient-to-b from-zinc-900/50 to-zinc-950 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-orange-500 font-bold mb-3 uppercase tracking-wider text-xs">
                 <Flame className="w-4 h-4 fill-orange-500" /> Hot & Trending
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                Download Trending <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-500">Tesla Wraps</span>
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Discover the most popular custom skins created by the community. 
                <span className="text-zinc-300 font-medium"> Preview on your model in 3D</span>, remix designs to make them your own, and 
                <span className="text-zinc-300 font-medium"> download the .png file</span> for your car instantly.
              </p>
            </div>
            <div className="hidden md:block">
                <button 
                  onClick={() => onNavigate('gallery')}
                  className="group flex items-center gap-3 px-6 py-3 bg-zinc-900 border border-zinc-700 rounded-full text-zinc-300 hover:text-white hover:border-zinc-500 hover:bg-zinc-800 transition-all"
                >
                  <span className="font-medium">Explore Full Library</span>
                  <div className="w-8 h-8 rounded-full bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center border border-zinc-700 group-hover:border-zinc-600 transition-colors">
                     <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
            </div>
          </div>

          {/* Featured Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredWraps.slice(0, 4).map((item) => (
               <GalleryCard 
                  key={item.id}
                  item={item}
                  isOwner={item.userId === currentUserId}
                  isLiked={likedItemIds.has(item.id)}
                  isDownloading={isDownloadingIds.has(item.id)}
                  isDownloaded={downloadedIds?.has(item.id)}
                  onRemix={onRemix}
                  onPreview3D={onPreview3D}
                  onToggleLike={onToggleLike}
                  onDownload={onDownload}
                  className="bg-zinc-900 shadow-2xl shadow-black/50 border-zinc-800 hover:border-purple-500/30"
               />
            ))}
          </div>
          
          {/* Mobile Action */}
          <div className="mt-10 text-center md:hidden">
            <button 
              onClick={() => onNavigate('gallery')}
              className="w-full px-6 py-4 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
            >
              <Box className="w-4 h-4" />
              Browse All 3D Wraps
            </button>
          </div>

          {/* Value Props Strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-zinc-900">
             {[
                { label: 'Free Downloads', val: '100% Free' },
                { label: 'Compatible Models', val: 'Model 3, Y, Cybertruck' },
                { label: 'Format', val: '.PNG (Toybox Ready)' },
                { label: 'Community Designs', val: 'Growing Library' },
             ].map((stat, i) => (
                 <div key={i} className="text-center md:text-left">
                    <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{stat.label}</div>
                    <div className="text-sm font-bold text-zinc-200">{stat.val}</div>
                 </div>
             ))}
          </div>
        </div>
      </section>

      {/* 4. COMPARISON / FEATURES */}
      <section className="py-24 bg-zinc-900 border-t border-zinc-800">
         <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
               <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Why use our Wrap Creator?</h2>
                  <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                    Traditionally, creating custom Tesla wraps required expensive software like Photoshop, finding specific UV templates, and complex texture mapping skills. We made it accessible to everyone.
                  </p>
                  
                  <div className="space-y-6">
                     <div className="flex gap-4">
                        <div className="bg-purple-500/10 p-3 rounded-xl h-fit">
                           <Monitor className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                           <h3 className="text-white font-bold text-lg">No Photoshop Needed</h3>
                           <p className="text-zinc-500">Design entirely in your browser. Our studio handles the complex 3D mapping automatically.</p>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <div className="bg-blue-500/10 p-3 rounded-xl h-fit">
                           <Layers className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                           <h3 className="text-white font-bold text-lg">Official Tesla UV Templates</h3>
                           <p className="text-zinc-500">We use the official UV maps for Model 3, Model Y, and Cybertruck. Your designs are automatically cropped to fit.</p>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <div className="bg-green-500/10 p-3 rounded-xl h-fit">
                           <Zap className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                           <h3 className="text-white font-bold text-lg">AI Texture Generation</h3>
                           <p className="text-zinc-500">Describe what you want ("Cyberpunk neon city"), and our AI generates the wrap texture for you.</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-zinc-950 p-8 rounded-2xl border border-zinc-800 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-32 bg-purple-600/20 blur-[100px] rounded-full" />
                  <h3 className="text-zinc-400 font-medium uppercase tracking-wider text-xs mb-6">How It Works</h3>
                  
                  <div className="space-y-0 relative">
                      <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-zinc-800" />
                      
                      {[
                        { title: 'Select Model', desc: 'Choose from 9 supported Tesla vehicles.', icon: MousePointer },
                        { title: 'Design or Generate', desc: 'Use AI or upload your own images.', icon: Palette },
                        { title: 'Export PNG', desc: 'Auto-optimized for Tesla Paint Shop.', icon: Download },
                        { title: 'Load in Car', desc: 'Plug USB into Toybox > Paint Shop.', icon: CheckCircle2 }
                      ].map((step, idx) => (
                        <div key={idx} className="flex gap-6 relative mb-8 last:mb-0">
                           <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0 z-10 shadow-lg">
                              <step.icon className="w-5 h-5 text-white" />
                           </div>
                           <div className="pt-2">
                              <h4 className="text-white font-bold text-lg">{step.title}</h4>
                              <p className="text-zinc-500 text-sm">{step.desc}</p>
                           </div>
                        </div>
                      ))}
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 5. FAQ SNIPPET */}
      <section className="py-24">
         <div className="container mx-auto px-6 max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-white mb-12">Common Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
               <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                  <h3 className="text-white font-bold mb-2">Is this Tesla wrap creator free?</h3>
                  <p className="text-zinc-400 text-sm">Yes! The wrap designer, gallery access, and PNG export tools are 100% free to use.</p>
               </div>
               <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                  <h3 className="text-white font-bold mb-2">Does this change my car's paint?</h3>
                  <p className="text-zinc-400 text-sm">No, this only changes the 3D visualization on your Tesla's touchscreen (Toybox). It does not affect the physical vehicle.</p>
               </div>
               <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                  <h3 className="text-white font-bold mb-2">How do I install the wrap?</h3>
                  <p className="text-zinc-400 text-sm">Save the exported PNG to a folder named "Wraps" on a USB drive. Plug it into your car's USB port.</p>
               </div>
               <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                  <h3 className="text-white font-bold mb-2">Which models are supported?</h3>
                  <p className="text-zinc-400 text-sm">We support custom wraps for Cybertruck, Model 3 (Highland & Legacy), and Model Y (including 2025 refresh).</p>
               </div>
            </div>
            <button 
               onClick={() => onNavigate('guide')}
               className="mt-12 text-purple-400 hover:text-purple-300 font-medium hover:underline"
            >
               Read full Installation Guide & FAQ &rarr;
            </button>
         </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 bg-gradient-to-b from-zinc-900 to-black border-t border-zinc-800 text-center">
          <div className="container mx-auto px-6">
             <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Ready to customize your Tesla?</h2>
             <p className="text-zinc-400 mb-10 max-w-xl mx-auto">Join thousands of owners creating unique designs today.</p>
             <button 
               onClick={() => onNavigate('editor')}
               className="px-10 py-4 bg-white text-black font-bold text-xl rounded-full hover:scale-105 transition-transform shadow-xl shadow-white/10"
             >
               Start Designing Now
             </button>
          </div>
      </section>
    </div>
  );
};

export default HomePage;
