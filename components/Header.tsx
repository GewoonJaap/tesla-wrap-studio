
import React, { useState, useRef, useEffect } from 'react';
import { CarModel } from '../types';
import { CAR_MODELS } from '../constants';
import { 
  Car, ChevronDown, Download, HelpCircle, X, Box, Palette, Layers, 
  Upload, Grid, Share2, LogIn, Menu, LogOut, FileImage, 
  AlertTriangle, CheckCircle2, PlayCircle, Loader2, HardDrive, User, Info
} from 'lucide-react';
import { Session } from '@supabase/supabase-js';

interface HeaderProps {
  currentView: 'editor' | 'gallery' | 'faq' | 'about';
  onChangeView: (view: 'editor' | 'gallery' | 'faq' | 'about') => void;
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
  isDownloading?: boolean;
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
  onSignOut,
  isDownloading = false
}) => {
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [helpTab, setHelpTab] = useState<'guide' | 'usb' | 'troubleshoot'>('guide');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close mobile menu whenever view changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentView]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          onImportWrap(event.target.result);
          setIsMobileMenuOpen(false); // Close menu if open
        }
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  // Helper to handle view change and close menu
  const handleChangeView = (view: 'editor' | 'gallery' | 'faq' | 'about') => {
      onChangeView(view);
      setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="h-14 sm:h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-3 sm:px-6 z-[100] shrink-0 shadow-md relative">
        
        {/* LEFT SECTION */}
        <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 -ml-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo (Hidden on small mobile if in Editor to save space for dropdown) */}
            <div className={`items-center gap-3 ${currentView === 'editor' ? 'hidden sm:flex' : 'flex'}`}>
                <div 
                    className="bg-gradient-to-tr from-red-600 to-red-500 p-1.5 sm:p-2 rounded-lg shadow-lg shadow-red-900/20 cursor-pointer" 
                    onClick={() => handleChangeView('editor')}
                >
                    <Car className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h1 
                    className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 hidden xl:block tracking-tight cursor-pointer" 
                    onClick={() => handleChangeView('editor')}
                >
                    Tesla Wrap Studio
                </h1>
            </div>

            {/* Desktop Nav Tabs */}
            <div className="hidden lg:flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 ml-4">
              <button 
                onClick={() => handleChangeView('editor')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${currentView === 'editor' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                 <Palette className="w-4 h-4" /> Studio
              </button>
              <button 
                onClick={() => handleChangeView('gallery')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${currentView === 'gallery' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                 <Grid className="w-4 h-4" /> Gallery
              </button>
            </div>
            
            {/* Divider */}
            {currentView === 'editor' && <div className="h-6 w-px bg-zinc-800 hidden lg:block mx-2"></div>}

            {/* Model Selector (Visible on Mobile in Editor) */}
            {currentView === 'editor' && (
                <div className="relative">
                    <button
                        onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                        className="flex items-center gap-2 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-200 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-all border border-zinc-700 hover:border-zinc-600 outline-none focus:ring-2 focus:ring-red-500/20 max-w-[140px] xs:max-w-[180px] sm:max-w-[240px]"
                    >
                        <span className="text-xs sm:text-sm font-medium truncate">{selectedModel.name}</span>
                        <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform shrink-0 ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isModelDropdownOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsModelDropdownOpen(false)} />
                        <div className="absolute top-full mt-2 left-0 w-72 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl overflow-hidden py-1 z-50 max-h-[80vh] overflow-y-auto ring-1 ring-black/50">
                        {CAR_MODELS.map((model) => (
                            <button
                            key={model.id}
                            onClick={() => {
                                onSelectModel(model);
                                setIsModelDropdownOpen(false);
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
            )}
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-2">
            
            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />

                {session ? (
                    <div className="relative">
                        <button 
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-full transition-all border border-zinc-700"
                        >
                            <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold">
                                {session.user.email?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs font-medium max-w-[100px] truncate">{session.user.email}</span>
                        </button>
                        {isProfileOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                                <div className="absolute top-full right-0 mt-2 w-48 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl py-1 z-50">
                                    <button 
                                        onClick={() => { onSignOut(); setIsProfileOpen(false); }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-800 hover:text-red-300 transition-colors flex items-center gap-2"
                                    >
                                        <LogOut className="w-4 h-4"/> Sign Out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={onAuth}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-800 text-sm font-medium"
                    >
                        <LogIn className="w-4 h-4" /> Sign In
                    </button>
                )}
                
                <div className="h-6 w-px bg-zinc-800"></div>
                
                <button
                    onClick={() => setShowHelp(true)}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
                    title="Help"
                >
                    <HelpCircle className="w-5 h-5" />
                </button>

                {currentView === 'editor' && (
                    <>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 bg-zinc-800 text-white border border-zinc-600 px-4 py-2 rounded-full hover:bg-zinc-700 transition-all font-medium text-sm shadow-lg active:scale-95"
                        >
                            <Upload className="w-4 h-4" /> Import
                        </button>
                        <button
                            onClick={onShare}
                            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-500 transition-all font-medium text-sm shadow-lg shadow-purple-500/20 active:scale-95"
                        >
                            <Share2 className="w-4 h-4" /> Share
                        </button>
                    </>
                )}
            </div>

            {/* Primary Action Button (Always Visible) */}
            {currentView === 'editor' ? (
                <button
                    onClick={onDownload}
                    disabled={isDownloading}
                    className="flex items-center gap-2 bg-white text-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-full hover:bg-zinc-200 transition-all font-medium text-xs sm:text-sm shadow-lg shadow-white/5 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shrink-0"
                >
                    {isDownloading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4" />}
                    <span>{isDownloading ? 'Processing' : 'Export'}</span>
                </button>
            ) : (
                <button
                    onClick={onUpload}
                    className="flex items-center gap-2 bg-white text-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-full hover:bg-zinc-200 transition-all font-medium text-xs sm:text-sm shadow-lg shadow-white/5 active:scale-95 shrink-0"
                >
                    <Upload className="w-4 h-4" />
                    <span>Upload</span>
                </button>
            )}

            {/* Mobile Tools & Layers Toggles (Visible on Editor) */}
            {currentView === 'editor' && (
                 <div className="flex lg:hidden items-center gap-1 ml-1">
                    <button 
                        onClick={onToggleTools}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <Palette className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={onToggleLayers}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <Layers className="w-6 h-6" />
                    </button>
                 </div>
            )}
        </div>
      </header>
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="absolute top-14 left-0 right-0 bg-zinc-900 border-b border-zinc-800 shadow-2xl animate-in slide-in-from-top-5 duration-200 flex flex-col max-h-[80vh] overflow-y-auto">
                
                {/* 1. Auth Section */}
                <div className="p-4 border-b border-zinc-800 bg-zinc-950/50">
                    {session ? (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                                    {session.user.email?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white">Signed In</span>
                                    <span className="text-xs text-zinc-400 truncate max-w-[150px]">{session.user.email}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => { onSignOut(); setIsMobileMenuOpen(false); }}
                                className="p-2 bg-zinc-800 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                         <button
                            onClick={() => { onAuth(); setIsMobileMenuOpen(false); }}
                            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                            <LogIn className="w-5 h-5" /> Sign In to Save Designs
                        </button>
                    )}
                </div>

                {/* 2. Navigation */}
                <div className="p-2 grid grid-cols-2 gap-2 border-b border-zinc-800">
                     <button 
                        onClick={() => handleChangeView('editor')}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${currentView === 'editor' ? 'bg-zinc-800 text-white ring-1 ring-zinc-700' : 'text-zinc-500 hover:bg-zinc-800/50'}`}
                     >
                        <Palette className="w-6 h-6" />
                        <span className="text-xs font-medium">Studio</span>
                     </button>
                     <button 
                        onClick={() => handleChangeView('gallery')}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${currentView === 'gallery' ? 'bg-zinc-800 text-white ring-1 ring-zinc-700' : 'text-zinc-500 hover:bg-zinc-800/50'}`}
                     >
                        <Grid className="w-6 h-6" />
                        <span className="text-xs font-medium">Gallery</span>
                     </button>
                     <button 
                        onClick={() => handleChangeView('faq')}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${currentView === 'faq' ? 'bg-zinc-800 text-white ring-1 ring-zinc-700' : 'text-zinc-500 hover:bg-zinc-800/50'}`}
                     >
                        <HelpCircle className="w-6 h-6" />
                        <span className="text-xs font-medium">FAQ & Guide</span>
                     </button>
                     <button 
                        onClick={() => handleChangeView('about')}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${currentView === 'about' ? 'bg-zinc-800 text-white ring-1 ring-zinc-700' : 'text-zinc-500 hover:bg-zinc-800/50'}`}
                     >
                        <Info className="w-6 h-6" />
                        <span className="text-xs font-medium">About</span>
                     </button>
                </div>

                {/* 3. Editor Actions (Only if in Editor) */}
                {currentView === 'editor' && (
                    <div className="p-4 border-b border-zinc-800">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Editor Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                             <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
                             >
                                <div className="p-2 bg-zinc-900 rounded-md"><Upload className="w-4 h-4 text-orange-400"/></div>
                                <span className="text-sm font-medium">Import Image</span>
                             </button>
                             <button 
                                onClick={() => { onShare(); setIsMobileMenuOpen(false); }}
                                className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
                             >
                                <div className="p-2 bg-zinc-900 rounded-md"><Share2 className="w-4 h-4 text-purple-400"/></div>
                                <span className="text-sm font-medium">Share Design</span>
                             </button>
                        </div>
                    </div>
                )}

                {/* 4. General Links */}
                <div className="p-4">
                     <button 
                        onClick={() => { setShowHelp(true); setIsMobileMenuOpen(false); }}
                        className="w-full flex items-center justify-between p-3 bg-zinc-900 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                     >
                        <span className="flex items-center gap-3">
                            <HelpCircle className="w-5 h-5" /> Installation Guide
                        </span>
                        <ChevronDown className="w-4 h-4 -rotate-90" />
                     </button>
                </div>

            </div>
        </div>
      )}
      
      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
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
                    USB & Specs
                </button>
                <button 
                    onClick={() => setHelpTab('troubleshoot')}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${helpTab === 'troubleshoot' ? 'border-red-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                >
                    Help
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
