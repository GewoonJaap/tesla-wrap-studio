import React, { useState, useRef } from 'react';
import { CarModel } from '../types';
import { CAR_MODELS } from '../constants';
import { Car, ChevronDown, Download, HelpCircle, X, Coffee, Box, Palette, Layers, Upload } from 'lucide-react';

interface HeaderProps {
  selectedModel: CarModel;
  onSelectModel: (model: CarModel) => void;
  onDownload: () => void;
  onImportWrap: (base64: string) => void;
  onOpen3D: () => void;
  onToggleTools: () => void;
  onToggleLayers: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  selectedModel, 
  onSelectModel, 
  onDownload, 
  onImportWrap,
  onOpen3D,
  onToggleTools,
  onToggleLayers
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          onImportWrap(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset value so same file can be selected again
    if (e.target) e.target.value = '';
  };

  return (
    <>
      <header className="h-14 sm:h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-3 sm:px-6 z-[100] shrink-0 shadow-md">
        <div className="flex items-center gap-2 sm:gap-4">
          
          <button 
            onClick={onToggleTools}
            className="md:hidden p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <Palette className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-red-600 to-red-500 p-1.5 sm:p-2 rounded-lg shadow-lg shadow-red-900/20 hidden xs:block">
              <Car className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 hidden lg:block tracking-tight">
              Tesla Wrap Studio
            </h1>
          </div>
          
          <div className="h-6 w-px bg-zinc-800 hidden lg:block mx-2"></div>

          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-200 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-all border border-zinc-700 hover:border-zinc-600 outline-none focus:ring-2 focus:ring-red-500/20 max-w-[160px] sm:max-w-none"
            >
              <span className="text-xs sm:text-sm font-medium truncate">{selectedModel.name}</span>
              <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setIsOpen(false)}
                />
                <div className="absolute top-full mt-2 left-0 w-72 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl overflow-hidden py-1 z-50 max-h-[80vh] overflow-y-auto ring-1 ring-black/50">
                  {CAR_MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        onSelectModel(model);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-zinc-800 transition-colors flex items-center justify-between group ${
                        selectedModel.id === model.id ? 'bg-zinc-800/80 text-white' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className={selectedModel.id === model.id ? 'font-medium' : ''}>{model.name}</span>
                      {selectedModel.id === model.id && <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            onClick={() => setShowHelp(true)}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors hidden sm:block"
            title="Help & Instructions"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          <a
            href="https://buymeacoffee.com/mrproper"
            target="_blank"
            rel="noopener noreferrer"
            className="items-center gap-2 bg-[#FFDD00] text-black px-3 py-2 sm:px-4 sm:py-2 rounded-full hover:bg-[#FFDD00]/90 transition-all font-medium text-sm shadow-lg shadow-yellow-500/10 active:scale-95 hidden xl:flex"
          >
            <Coffee className="w-4 h-4" />
            <span className="hidden sm:inline">Buy me a coffee</span>
          </a>

          {selectedModel.id !== 'license-plate' && (
            <button
                onClick={onOpen3D}
                className="flex items-center gap-2 bg-zinc-800 text-white border border-zinc-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full hover:bg-zinc-700 transition-all font-medium text-xs sm:text-sm shadow-lg active:scale-95"
                title="3D Preview"
            >
                <Box className="w-4 h-4" />
                <span className="hidden sm:inline">3D</span>
            </button>
          )}

          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-zinc-800 text-white border border-zinc-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full hover:bg-zinc-700 transition-all font-medium text-xs sm:text-sm shadow-lg active:scale-95"
            title="Import Design"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span>
          </button>

          <button
            onClick={onDownload}
            className="flex items-center gap-2 bg-white text-black px-3 py-1.5 sm:px-5 sm:py-2 rounded-full hover:bg-zinc-200 transition-all font-medium text-xs sm:text-sm shadow-lg shadow-white/5 active:scale-95"
            title="Export Texture"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button 
            onClick={onToggleLayers}
            className="md:hidden p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors ml-1"
          >
            <Layers className="w-5 h-5" />
          </button>
        </div>
      </header>

      {showHelp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-red-500" />
                Instructions
              </h2>
              <button onClick={() => setShowHelp(false)} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 text-zinc-300 text-sm leading-relaxed scrollbar-thin">
              <section className="space-y-3">
                <h3 className="text-white font-semibold text-base">License Plates</h3>
                <p>Tesla supports custom license plate background images (PNG, max 0.5 MB, 420x100px recommended). Create a folder named <strong>LicensePlate</strong> on your USB drive.</p>
              </section>

              <section className="space-y-3">
                <h3 className="text-white font-semibold text-base">Vehicle Wraps</h3>
                <p>For custom wraps, create a folder named <strong>Wraps</strong> on your USB drive. Exported PNGs should be under 1 MB.</p>
              </section>

              <section className="space-y-3 text-zinc-400 text-xs bg-zinc-950 p-4 rounded-lg border border-zinc-800">
                <p>Note: Orientation for wraps is TOP = FRONT of car, BOTTOM = REAR of car.</p>
              </section>
            </div>

            <div className="p-4 border-t border-zinc-800 flex justify-end">
              <button onClick={() => setShowHelp(false)} className="bg-zinc-100 hover:bg-white text-black px-6 py-2 rounded-lg font-medium transition-colors">
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;