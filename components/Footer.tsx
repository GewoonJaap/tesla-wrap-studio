
import React from 'react';
import { Car, Github, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: any) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 py-12 px-6 shrink-0">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-xl">
               <Car className="w-6 h-6 text-red-600" /> Tesla Wrap Studio
            </div>
            <p className="text-zinc-400 text-base leading-relaxed max-w-md">
              The advanced online visualizer for designing custom Tesla wraps. 
              Create, remix, and share designs for Cybertruck, Model 3, and Model Y. 
              Powered by Google Gemini AI.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-white font-bold text-lg">Explore</h4>
            <ul className="space-y-3 text-zinc-400">
              <li><button onClick={() => onNavigate('editor')} className="hover:text-white transition-colors text-base">Wrap Editor</button></li>
              <li><button onClick={() => onNavigate('gallery')} className="hover:text-white transition-colors text-base">Community Gallery</button></li>
              <li><button onClick={() => onNavigate('gallery')} className="hover:text-white transition-colors text-base">Featured Designs</button></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-bold text-lg">Support & Info</h4>
            <ul className="space-y-3 text-zinc-400">
              <li><button onClick={() => onNavigate('guide')} className="hover:text-white transition-colors text-base">Installation Guide</button></li>
              <li><button onClick={() => onNavigate('faq')} className="hover:text-white transition-colors text-base">FAQ</button></li>
              <li><button onClick={() => onNavigate('about')} className="hover:text-white transition-colors text-base">About Us</button></li>
              <li><a href="https://github.com/GewoonJaap/custom-tesla-wraps" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-base">GitHub Repo</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-zinc-500">
          <p>&copy; {currentYear} Tesla Wrap Studio. Not affiliated with Tesla, Inc.</p>
          <div className="flex items-center gap-6">
             <a href="https://github.com/GewoonJaap/custom-tesla-wraps" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 flex items-center gap-2 transition-colors"><Github className="w-5 h-5" /> GitHub</a>
             <span className="flex items-center gap-2 text-zinc-600">Made with <Heart className="w-4 h-4 text-red-900 fill-red-900" /> in The Netherlands</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
