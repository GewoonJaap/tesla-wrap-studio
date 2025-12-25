
import React, { useState, useRef } from 'react';
import { CarModel } from '../types';
import { CAR_MODELS } from '../constants';
import { Car, ChevronDown, Download, HelpCircle, X, Coffee, Box, Palette, Layers, Upload, Grid, Share2, LogIn, User, HardDrive, FileImage, AlertTriangle, CheckCircle2, PlayCircle } from 'lucide-react';
import { Session } from '@supabase/supabase-js';

interface HeaderProps {
  currentView: 'editor' | 'gallery';
  onChangeView: (view: 'editor' | 'gallery') => void;
  selectedModel: CarModel;
  onSelectModel: (model: CarModel) => void;
  onDownload: () => void;
  onImportWrap: (base64: string) => void;
  onOpen3D: () => void;
  onToggleTools: () => void;
  onToggleLayers: () => void;
  onShare: () => void;
  onUpload: () => void;
  session: Session | null;
  onAuth: () => void;
  onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  currentView,
  onChangeView,
  selectedModel, 
  onSelectModel, 
  onDownload, 
  onImportWrap,
  onOpen3D,
  onToggleTools,
  onToggleLayers,
  onShare,
  onUpload,
  session,
  onAuth,
  onSignOut
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [helpTab, setHelpTab] = useState<'guide' | 'usb' | 'troubleshoot'>('guide');
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
          
          {currentView === 'editor' && (
             <button 
               onClick={onToggleTools}
               className="md:hidden p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
             >
               <Palette className="w-5 h-5" />
             </button>
          )}

          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-red-600 to-red-500 p-1.5 sm:p-2 rounded-lg shadow-lg shadow-red-900/20 hidden xs:block cursor-pointer" onClick={() => onChangeView('editor')}>
              <Car className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 hidden lg:block tracking-tight cursor-pointer" onClick={() => onChangeView('editor')}>
              Tesla Wrap Studio
            </h1>
          </div>
          
          {/* Navigation Tabs */}
          <div className="hidden sm:flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 ml-4">
              <button 
                onClick={() => onChangeView('editor')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${currentView === 'editor' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                 <Palette className="w-4 h-4" /> Studio
              </button>
              <button 
                onClick={() => onChangeView('gallery')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${currentView === 'gallery' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                 <Grid className="w-4 h-4" /> Gallery
              </button>
          </div>
          
          {currentView === 'editor' && (
              <>
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
              </>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
           {/* Mobile View Toggle */}
           <button 
                onClick={() => onChangeView(currentView === 'editor' ? 'gallery' : 'editor')}
                className="sm:hidden p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                title={currentView === 'editor' ? 'Go to Gallery' : 'Go to Studio'}
            >
                {currentView === 'editor' ? <Grid className="w-5 h-5" /> : <Palette className="w-5 h-5" />}
            </button>

            {/* Auth Button */}
            {session ? (
                 <div className="relative">
                    <button 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 sm:px-3 sm:py-1.5 rounded-full transition-all border border-zinc-700"
                    >
                        <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold">
                             {session.user.email?.charAt(0).toUpperCase()}
                        </div>
                    </button>
                    {isProfileOpen && (
                         <>
                             <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                             <div className="absolute top-full right-0 mt-2 w-48 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl py-1 z-50">
                                 <div className="px-4 py-2 border-b border-zinc-800">
                                     <p className="text-xs text-zinc-500">Signed in as</p>
                                     <p className="text-sm text-white truncate">{session.user.email}</p>
                                 </div>
                                 <button 
                                     onClick={() => { onSignOut(); setIsProfileOpen(false); }}
                                     className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-800 hover:text-red-300 transition-colors"
                                 >
                                     Sign Out
                                 </button>
                             </div>
                         </>
                    )}
                 </div>
            ) : (
                <button
                    onClick={onAuth}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors px-2 py-1.5 rounded-lg hover:bg-zinc-800"
                >
                    <LogIn className="w-5 h-5" />
                    <span className="hidden sm:inline text-sm font-medium">Sign In</span>
                </button>
            )}

          <div className="h-6 w-px bg-zinc-800 hidden sm:block"></div>

          <button
            onClick={() => setShowHelp(true)}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors hidden sm:block"
            title="Help & Instructions"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {currentView === 'editor' && (
              <>
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
                    className="flex items-center gap-2 bg-zinc-800 text-white border border-zinc-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full hover:bg-zinc-700 transition-all font-medium text-xs sm:text-sm shadow-lg active:scale-95 hidden lg:flex"
                    title="Import Design"
                >
                    <Upload className="w-4 h-4" />
                    <span className="hidden sm:inline">Import</span>
                </button>

                <button
                    onClick={onShare}
                    className="flex items-center gap-2 bg-purple-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full hover:bg-purple-500 transition-all font-medium text-xs sm:text-sm shadow-lg shadow-purple-500/20 active:scale-95"
                    title="Share to Gallery"
                >
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Share</span>
                </button>

                <button
                    onClick={onDownload}
                    className="flex items-center gap-2 bg-white text-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-full hover:bg-zinc-200 transition-all font-medium text-xs sm:text-sm shadow-lg shadow-white/5 active:scale-95"
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
              </>
          )}

          {currentView === 'gallery' && (
              <button
                  onClick={onUpload}
                  className="flex items-center gap-2 bg-white text-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-full hover:bg-zinc-200 transition-all font-medium text-xs sm:text-sm shadow-lg shadow-white/5 active:scale-95"
                  title="Upload Design"
              >
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Upload</span>
              </button>
          )}
        </div>
      </header>
      
      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            
            {/* Header */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-red-500" />
                Custom Wraps Guide
              </h2>
              <button onClick={() => setShowHelp(false)} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-800 bg-zinc-900">
                <button 
                    onClick={() => setHelpTab('guide')}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${helpTab === 'guide' ? 'border-red-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                >
                    Quick Guide
                </button>
                <button 
                    onClick={() => setHelpTab('usb')}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${helpTab === 'usb' ? 'border-red-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                >
                    USB Setup & Specs
                </button>
                <button 
                    onClick={() => setHelpTab('troubleshoot')}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${helpTab === 'troubleshoot' ? 'border-red-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                >
                    Installation & Help
                </button>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-zinc-300 text-sm leading-relaxed scrollbar-thin bg-zinc-900/50">
              
              {helpTab === 'guide' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50">
                          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                              <PlayCircle className="w-4 h-4 text-purple-400" /> How to Use Custom Wraps
                          </h3>
                          <ol className="space-y-3 list-decimal list-inside text-zinc-400">
                              <li><strong className="text-zinc-200">Select Model:</strong> Choose your vehicle from the top menu to load the correct template.</li>
                              <li><strong className="text-zinc-200">Design:</strong> Use the drawing tools or AI Texture Gen to create your wrap. Fill all areas.</li>
                              <li><strong className="text-zinc-200">Export:</strong> Click the "Export" button to save your design as a PNG.</li>
                              <li><strong className="text-zinc-200">Prepare USB:</strong> Create a folder named <code>Wraps</code> on your USB drive.</li>
                              <li><strong className="text-zinc-200">Apply:</strong> Plug the USB into your Tesla. Go to <strong>Toybox &rarr; Paint Shop &rarr; Wraps</strong>.</li>
                          </ol>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                             <h4 className="font-medium text-white mb-1">Wraps</h4>
                             <p className="text-xs text-zinc-500">For changing the entire vehicle body color/texture.</p>
                          </div>
                          <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                             <h4 className="font-medium text-white mb-1">License Plates</h4>
                             <p className="text-xs text-zinc-500">Custom background for your license plate (Select "License Plate" in model menu).</p>
                          </div>
                      </div>
                  </div>
              )}

              {helpTab === 'usb' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      {/* Vehicle Wraps Specs */}
                      <div>
                          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                              <Car className="w-4 h-4 text-blue-400" /> Vehicle Wraps Specs
                          </h3>
                          <ul className="space-y-2 text-xs sm:text-sm">
                              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0"/> Folder: <code className="bg-zinc-800 px-1 rounded">Wraps</code> (Case-sensitive)</li>
                              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0"/> Resolution: <strong>512x512</strong> to <strong>1024x1024</strong></li>
                              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0"/> File Size: Max <strong>1 MB</strong></li>
                              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0"/> Format: .png (Max 10 images)</li>
                          </ul>
                      </div>

                      {/* License Plate Specs */}
                      <div className="pt-4 border-t border-zinc-800">
                          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                              <FileImage className="w-4 h-4 text-purple-400" /> License Plate Specs
                          </h3>
                          <ul className="space-y-2 text-xs sm:text-sm">
                              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0"/> Folder: <code className="bg-zinc-800 px-1 rounded">LicensePlate</code> (Case-sensitive)</li>
                              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0"/> Resolution: <strong>420x100</strong> (Rec) to <strong>420x200</strong> (Max)</li>
                              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0"/> File Size: Max <strong>0.5 MB</strong></li>
                              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0"/> Filename: Max 32 chars (Letters & Numbers only)</li>
                              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0"/> Limit: Max 10 images</li>
                          </ul>
                      </div>

                      <div className="pt-4 border-t border-zinc-800">
                          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                              <HardDrive className="w-4 h-4 text-orange-400" /> USB Drive Setup
                          </h3>
                          <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 space-y-3 font-mono text-xs">
                              <p>1. Format Drive: exFAT, FAT32, MS-DOS FAT, ext3, or ext4.</p>
                              <p>2. Create Folder Structure:</p>
                              <div className="pl-4 border-l-2 border-zinc-700">
                                  <p>USB_ROOT/</p>
                                  <p className="pl-4">├── Wraps/</p>
                                  <p className="pl-4">└── LicensePlate/</p>
                              </div>
                              <p className="text-red-400 flex items-center gap-2 mt-2"><AlertTriangle className="w-3 h-3"/> Ensure no map/firmware updates are on the drive.</p>
                          </div>
                      </div>
                  </div>
              )}

              {helpTab === 'troubleshoot' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                       <div className="bg-zinc-800/30 p-4 rounded-lg">
                          <h3 className="text-white font-bold mb-2">Applying in Vehicle</h3>
                          <div className="space-y-4">
                              <div>
                                  <strong className="text-xs text-blue-400 uppercase tracking-wider block mb-1">For Wraps</strong>
                                  <div className="flex gap-2 items-center text-sm font-medium text-white flex-wrap">
                                      <span className="bg-zinc-700 px-2 py-1 rounded">Toybox</span>
                                      <span>&rarr;</span>
                                      <span className="bg-zinc-700 px-2 py-1 rounded">Paint Shop</span>
                                      <span>&rarr;</span>
                                      <span className="bg-zinc-700 px-2 py-1 rounded">Wraps</span>
                                  </div>
                              </div>
                              <div>
                                  <strong className="text-xs text-purple-400 uppercase tracking-wider block mb-1">For License Plates</strong>
                                  <div className="flex gap-2 items-center text-sm font-medium text-white flex-wrap">
                                      <span className="bg-zinc-700 px-2 py-1 rounded">Settings</span>
                                      <span>&rarr;</span>
                                      <span className="bg-zinc-700 px-2 py-1 rounded">Background</span>
                                      <span>&rarr;</span>
                                      <span className="bg-zinc-700 px-2 py-1 rounded">Image</span>
                                  </div>
                              </div>
                          </div>
                       </div>

                       <div>
                          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-yellow-500" /> Troubleshooting
                          </h3>
                          <ul className="space-y-3 text-zinc-400">
                              <li className="border-l-2 border-zinc-700 pl-3">
                                  <strong className="text-white block">Image not showing?</strong>
                                  Check that your file is a <strong>.png</strong>.
                                  <br/>Wraps must be &lt; 1MB. Plates must be &lt; 0.5MB.
                                  <br/>Ensure filenames have no special characters.
                              </li>
                              <li className="border-l-2 border-zinc-700 pl-3">
                                  <strong className="text-white block">Folder name correct?</strong>
                                  It must be exactly <code>Wraps</code> or <code>LicensePlate</code> (case-sensitive).
                              </li>
                              <li className="border-l-2 border-zinc-700 pl-3">
                                  <strong className="text-white block">NTFS Format?</strong>
                                  Tesla does not currently support NTFS formatted drives for this feature. Please reformat to exFAT or FAT32.
                              </li>
                          </ul>
                       </div>
                  </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-800 flex justify-end bg-zinc-950">
              <button onClick={() => setShowHelp(false)} className="bg-white hover:bg-zinc-200 text-black px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-white/10">
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
