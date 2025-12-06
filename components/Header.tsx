import React, { useState } from 'react';
import { CarModel } from '../types';
import { CAR_MODELS } from '../constants';
import { Car, ChevronDown, Download, HelpCircle, X, Coffee, Box } from 'lucide-react';

interface HeaderProps {
  selectedModel: CarModel;
  onSelectModel: (model: CarModel) => void;
  onDownload: () => void;
  onOpen3D: () => void;
}

const Header: React.FC<HeaderProps> = ({ selectedModel, onSelectModel, onDownload, onOpen3D }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6 z-50 shrink-0 shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-red-600 to-red-500 p-2 rounded-lg shadow-lg shadow-red-900/20">
              <Car className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 hidden sm:block tracking-tight">
              Tesla Wrap Studio
            </h1>
          </div>
          
          <div className="h-6 w-px bg-zinc-800 hidden sm:block mx-2"></div>

          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-200 px-4 py-2 rounded-lg transition-all border border-zinc-700 hover:border-zinc-600 outline-none focus:ring-2 focus:ring-red-500/20"
            >
              <span className="text-sm font-medium">{selectedModel.name}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHelp(true)}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
            title="Help & Instructions"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          <a
            href="https://buymeacoffee.com/mrproper"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#FFDD00] text-black px-3 py-2 sm:px-4 sm:py-2 rounded-full hover:bg-[#FFDD00]/90 transition-all font-medium text-sm shadow-lg shadow-yellow-500/10 active:scale-95"
          >
            <Coffee className="w-4 h-4" />
            <span className="hidden sm:inline">Buy me a coffee</span>
          </a>

          <button
            onClick={onOpen3D}
            className="flex items-center gap-2 bg-zinc-800 text-white border border-zinc-600 px-4 py-2 rounded-full hover:bg-zinc-700 transition-all font-medium text-sm shadow-lg active:scale-95"
          >
            <Box className="w-4 h-4" />
            <span className="hidden sm:inline">3D Preview</span>
          </button>

          <button
            onClick={onDownload}
            className="flex items-center gap-2 bg-white text-black px-5 py-2 rounded-full hover:bg-zinc-200 transition-all font-medium text-sm shadow-lg shadow-white/5 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export Wrap</span>
          </button>
        </div>
      </header>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-red-500" />
                How to Use Custom Wraps
              </h2>
              <button 
                onClick={() => setShowHelp(false)}
                className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 text-zinc-300 text-sm leading-relaxed scrollbar-thin">
              <section className="space-y-3">
                <h3 className="text-white font-semibold text-base">1. Create Your Design</h3>
                <p>Use the tools on the left to draw or generate AI textures. You can also select from the inspiration gallery. The template wireframe helps you see where the wrap will apply on the car.</p>
              </section>

              <section className="space-y-3">
                <h3 className="text-white font-semibold text-base">2. Export & Save</h3>
                <p>Click <strong className="text-white">Export Wrap</strong> to download your design as a PNG file. The file is automatically sized correctly for your Tesla based on the model template (usually 1024x1024 or higher).</p>
              </section>

              <section className="space-y-3">
                <h3 className="text-white font-semibold text-base">3. USB Drive Setup</h3>
                <ul className="list-disc pl-5 space-y-2 text-zinc-400">
                  <li>Format a USB drive to <strong>exFAT</strong> or <strong>FAT32</strong>.</li>
                  <li>Create a folder named <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-red-400 font-mono">Wraps</code> at the root of the drive.</li>
                  <li>Copy your downloaded PNG file into the <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-red-400 font-mono">Wraps</code> folder.</li>
                  <li>Ensure the file name uses only alphanumeric characters, underscores, or dashes (e.g., <code className="text-zinc-500">my_cool_wrap.png</code>).</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-white font-semibold text-base">4. Apply in Vehicle</h3>
                <p>Plug the USB drive into your Tesla. Go to <strong className="text-white">Toybox &rarr; Paint Shop &rarr; Wraps</strong> to select and apply your custom design.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Cybertruck Interface</span>
                    <img 
                      src="https://github.com/GewoonJaap/custom-tesla-wraps/raw/master/images/paint-shop-wraps-ct.png" 
                      alt="Cybertruck Paint Shop Interface" 
                      className="w-full rounded-lg border border-zinc-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Model 3/Y Interface</span>
                    <img 
                      src="https://github.com/GewoonJaap/custom-tesla-wraps/raw/master/images/paint-shop-wraps-m3.png" 
                      alt="Model 3/Y Paint Shop Interface" 
                      className="w-full rounded-lg border border-zinc-800"
                    />
                  </div>
                </div>
              </section>

              <div className="bg-zinc-950/50 p-4 rounded-lg border border-zinc-800 text-xs">
                <strong className="block mb-1 text-zinc-400 uppercase tracking-wider">Requirements</strong>
                <ul className="grid grid-cols-2 gap-2">
                  <li>• Format: PNG</li>
                  <li>• Size: Max 1 MB</li>
                  <li>• Resolution: Matches Template (1:1)</li>
                  <li>• No map/firmware files on USB</li>
                </ul>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setShowHelp(false)}
                className="bg-zinc-100 hover:bg-white text-black px-6 py-2 rounded-lg font-medium transition-colors"
              >
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