import React, { useState, useEffect, useRef } from 'react';
import { CarModel, DrawingState, ToolType } from '../types';
import { PRESET_COLORS, GITHUB_BASE_URL } from '../constants';
import { generateTexture } from '../services/geminiService';
import { 
  Brush, 
  Eraser, 
  Sparkles, 
  RotateCcw, 
  Palette,
  Loader2,
  Image as ImageIcon,
  Key,
  X,
  ExternalLink,
  Upload,
  Trash2,
  MoveDiagonal,
  Circle,
  ArrowRight,
  Scissors
} from 'lucide-react';

interface ToolbarProps {
  state: DrawingState;
  selectedModel: CarModel;
  onChange: (updates: Partial<DrawingState>) => void;
  onClear: () => void;
  onApplyTexture: (base64Texture: string) => void;
  getCanvasData: () => string | undefined;
}

const Toolbar: React.FC<ToolbarProps> = ({ state, selectedModel, onChange, onClear, onApplyTexture, getCanvasData }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSecondaryColorPicker, setShowSecondaryColorPicker] = useState(false);
  const [customReference, setCustomReference] = useState<string | null>(null);
  
  const [apiKey, setApiKey] = useState<string>('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (typeof event.target?.result === 'string') {
                setCustomReference(event.target.result);
              }
            };
            reader.readAsDataURL(blob);
            e.preventDefault(); 
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const getCompositeReference = async (): Promise<string | undefined> => {
    if (customReference) return customReference;
    const canvasData = getCanvasData();
    const templateUrl = `${GITHUB_BASE_URL}/${selectedModel.folderName}/template.png`;

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(canvasData); 
        return;
      }

      const bgImg = new Image();
      const templateImg = new Image();
      bgImg.crossOrigin = "anonymous";
      templateImg.crossOrigin = "anonymous";

      let imagesLoaded = 0;
      let hasError = false;

      const checkDone = () => {
        if (hasError) {
           resolve(canvasData);
           return;
        }
        if (imagesLoaded === 2) {
          canvas.width = templateImg.naturalWidth || 1024;
          canvas.height = templateImg.naturalHeight || 1024;
          ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
          ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/png'));
        }
      };

      const onError = (e: any) => {
        console.error("Error loading composite images", e);
        hasError = true;
        checkDone();
      };

      const onLoad = () => {
        imagesLoaded++;
        checkDone();
      };

      bgImg.onload = onLoad;
      bgImg.onerror = onError;
      templateImg.onload = onLoad;
      templateImg.onerror = onError;

      bgImg.src = canvasData || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAANSURBVBhXY2BgYAAAAAQAAVzN/2kAAAAASUVORK5CYII=';
      templateImg.src = templateUrl;
    });
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (!apiKey) {
      setShowKeyModal(true);
      return;
    }
    setIsGenerating(true);
    try {
      const referenceData = await getCompositeReference();
      const textureUrl = await generateTexture(prompt, apiKey, referenceData);
      onApplyTexture(textureUrl);
    } catch (e) {
      console.error(e);
      alert('Failed to generate texture. Please check your API key and try again.');
      if ((e as any).toString().includes('400') || (e as any).toString().includes('403')) {
        setShowKeyModal(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveKey = () => {
    if (tempKey.trim()) {
      localStorage.setItem('gemini_api_key', tempKey.trim());
      setApiKey(tempKey.trim());
      setShowKeyModal(false);
      setTempKey('');
    }
  };

  const handleApplyExample = (filename: string) => {
    const url = `${GITHUB_BASE_URL}/${selectedModel.folderName}/example/${filename}`;
    onApplyTexture(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setCustomReference(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setCustomReference(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <aside className="w-80 bg-zinc-900 border-l border-zinc-800 flex flex-col h-full shrink-0 overflow-y-auto">
        
        {/* AI Section */}
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">AI Texture Gen</h2>
            </div>
            <button 
              onClick={() => {
                setTempKey(apiKey);
                setShowKeyModal(true);
              }}
              className="text-zinc-500 hover:text-white transition-colors p-1 rounded-md hover:bg-zinc-800"
              title="Manage API Key"
            >
              <Key className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div 
              className={`relative border border-dashed rounded-lg transition-all overflow-hidden group ${customReference ? 'border-purple-500/50' : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/30'}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              {customReference ? (
                <div className="relative aspect-video w-full bg-zinc-950">
                   <img src={customReference} alt="Reference" className="w-full h-full object-contain" />
                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                     <button 
                        onClick={() => setCustomReference(null)}
                        className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600 transition-colors"
                        title="Remove image"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 flex flex-col items-center justify-center gap-2 cursor-pointer py-6"
                >
                  <Upload className="w-6 h-6 text-zinc-500" />
                  <div className="text-center">
                    <p className="text-xs font-medium text-zinc-300">Input Image (Optional)</p>
                    <p className="text-[10px] text-zinc-500 mt-1">Click, drop, or paste (Ctrl+V)</p>
                  </div>
                </div>
              )}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleFileSelect} 
                className="hidden" 
              />
            </div>

            <textarea 
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-sm text-white resize-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none placeholder:text-zinc-600 transition-all"
              rows={3}
              placeholder="Describe the new style (e.g., 'Neon cyberpunk grid', 'Rusty metal')..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isGenerating ? 'Generating...' : 'Generate Texture'}
            </button>
          </div>
        </div>

        {/* Examples Section */}
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Inspiration</h2>
          </div>
          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
            {selectedModel.examples.map((example) => (
              <button
                key={example}
                onClick={() => handleApplyExample(example)}
                className="relative aspect-square rounded-lg overflow-hidden border border-zinc-700 hover:border-white transition-all group focus:ring-2 focus:ring-white/50"
                title={example.replace('.png', '').replace(/_/g, ' ')}
              >
                <img 
                  src={`${GITHUB_BASE_URL}/${selectedModel.folderName}/example/${example}`}
                  alt={example}
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[10px] text-white font-medium px-1 text-center leading-tight drop-shadow-md">
                    {example.replace('.png', '').replace(/_/g, ' ')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tools Section */}
        <div className="p-6 space-y-8 flex-1">
          
          {/* Tool Selection */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Tools</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onChange({ tool: ToolType.BRUSH })}
                className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-all border ${
                  state.tool === ToolType.BRUSH 
                    ? 'bg-zinc-800 border-white/20 text-white shadow-lg' 
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <Brush className="w-5 h-5" />
                <span className="text-[10px]">Brush</span>
              </button>
              <button
                onClick={() => onChange({ tool: ToolType.ERASER })}
                className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-all border ${
                  state.tool === ToolType.ERASER 
                    ? 'bg-zinc-800 border-white/20 text-white shadow-lg' 
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <Eraser className="w-5 h-5" />
                <span className="text-[10px]">Eraser</span>
              </button>
              <button
                onClick={() => onChange({ tool: ToolType.GRADIENT })}
                className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-all border ${
                  state.tool === ToolType.GRADIENT 
                    ? 'bg-zinc-800 border-white/20 text-white shadow-lg' 
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <MoveDiagonal className="w-5 h-5" />
                <span className="text-[10px]">Gradient</span>
              </button>
              <button
                onClick={() => onChange({ tool: ToolType.TRANSFORM })}
                className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-all border ${
                  state.tool === ToolType.TRANSFORM 
                    ? 'bg-zinc-800 border-white/20 text-white shadow-lg' 
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <Scissors className="w-5 h-5" />
                <span className="text-[10px]">Select</span>
              </button>
            </div>
          </div>

          {/* Gradient Settings */}
          {state.tool === ToolType.GRADIENT && (
             <div className="space-y-4 animate-in slide-in-from-left-4">
                <div className="flex justify-between items-center">
                   <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Type</h3>
                   <div className="flex bg-zinc-800 rounded-lg p-1 gap-1">
                      <button 
                        onClick={() => onChange({ gradientType: 'linear' })}
                        className={`p-1.5 rounded ${state.gradientType === 'linear' ? 'bg-zinc-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                        title="Linear Gradient"
                      >
                         <ArrowRight className="w-4 h-4"/>
                      </button>
                      <button 
                        onClick={() => onChange({ gradientType: 'radial' })}
                        className={`p-1.5 rounded ${state.gradientType === 'radial' ? 'bg-zinc-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                        title="Radial Gradient"
                      >
                         <Circle className="w-4 h-4"/>
                      </button>
                   </div>
                </div>
             </div>
          )}

          {/* Brush Settings */}
          {(state.tool === ToolType.BRUSH || state.tool === ToolType.ERASER) && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Size</h3>
                <span className="text-xs text-zinc-400 font-mono">{state.brushSize}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={state.brushSize}
                onChange={(e) => onChange({ brushSize: parseInt(e.target.value) })}
                className="w-full accent-white h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer hover:bg-zinc-700 transition-colors"
              />
            </div>
          )}
          
          {/* Transform Settings info */}
          {state.tool === ToolType.TRANSFORM && (
             <div className="bg-zinc-950/50 p-3 rounded-lg border border-zinc-800 text-xs text-zinc-400 animate-in slide-in-from-left-4">
                <p className="mb-2"><strong>Mode: Cut & Transform</strong></p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Draw a box to select an area.</li>
                  <li>Release to cut and float the selection.</li>
                  <li>Drag to move, corners to scale.</li>
                </ul>
             </div>
          )}

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Opacity</h3>
              <span className="text-xs text-zinc-400 font-mono">{Math.round(state.opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={state.opacity}
              onChange={(e) => onChange({ opacity: parseFloat(e.target.value) })}
              className="w-full accent-white h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer hover:bg-zinc-700 transition-colors"
            />
          </div>

          {/* Color Picker (Primary) */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                {state.tool === ToolType.GRADIENT ? 'Start Color' : 'Color'}
              </h3>
              <button 
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className={`text-xs flex items-center gap-1 transition-colors ${showColorPicker ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                  <Palette className="w-3 h-3" /> Custom
              </button>
            </div>
            
            <div className="grid grid-cols-5 gap-2 mb-3">
              {PRESET_COLORS.slice(0, 10).map((color) => (
                <button
                  key={color}
                  onClick={() => onChange({ color })}
                  className={`w-full aspect-square rounded-full border-2 transition-all ${
                    state.color === color && state.tool !== ToolType.ERASER ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-110 hover:border-zinc-600'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            {showColorPicker && (
               <div className="pt-3 border-t border-zinc-800 mt-2 animate-in slide-in-from-top-2">
                   <div className="flex gap-2">
                     <div 
                        className="w-10 h-10 rounded border border-zinc-700"
                        style={{ backgroundColor: state.color }}
                     />
                     <input 
                        type="text" 
                        value={state.color}
                        onChange={(e) => onChange({ color: e.target.value })}
                        className="flex-1 bg-zinc-950 border border-zinc-700 rounded px-3 text-sm font-mono text-zinc-300 focus:border-white outline-none"
                     />
                     <input 
                        type="color" 
                        value={state.color}
                        onChange={(e) => onChange({ color: e.target.value })}
                        className="w-10 h-10 bg-transparent rounded cursor-pointer opacity-0 absolute"
                     />
                   </div>
               </div>
            )}
          </div>

          {/* Color Picker (Secondary - For Gradient) */}
          {state.tool === ToolType.GRADIENT && (
            <div className="animate-in slide-in-from-left-4">
              <div className="flex justify-between items-center mb-3 pt-4 border-t border-zinc-800">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">End Color</h3>
                <button 
                    onClick={() => setShowSecondaryColorPicker(!showSecondaryColorPicker)}
                    className={`text-xs flex items-center gap-1 transition-colors ${showSecondaryColorPicker ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                    <Palette className="w-3 h-3" /> Custom
                </button>
              </div>
              
              <div className="grid grid-cols-5 gap-2 mb-3">
                {PRESET_COLORS.slice(0, 10).map((color) => (
                  <button
                    key={color}
                    onClick={() => onChange({ secondaryColor: color })}
                    className={`w-full aspect-square rounded-full border-2 transition-all ${
                      state.secondaryColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-110 hover:border-zinc-600'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              {showSecondaryColorPicker && (
                <div className="pt-3 border-t border-zinc-800 mt-2 animate-in slide-in-from-top-2">
                    <div className="flex gap-2">
                      <div 
                          className="w-10 h-10 rounded border border-zinc-700"
                          style={{ backgroundColor: state.secondaryColor }}
                      />
                      <input 
                          type="text" 
                          value={state.secondaryColor}
                          onChange={(e) => onChange({ secondaryColor: e.target.value })}
                          className="flex-1 bg-zinc-950 border border-zinc-700 rounded px-3 text-sm font-mono text-zinc-300 focus:border-white outline-none"
                      />
                      <input 
                          type="color" 
                          value={state.secondaryColor}
                          onChange={(e) => onChange({ secondaryColor: e.target.value })}
                          className="w-10 h-10 bg-transparent rounded cursor-pointer opacity-0 absolute"
                      />
                    </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Actions */}
        <div className="p-6 border-t border-zinc-800">
          <button
            onClick={onClear}
            className="w-full border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 px-4 py-3 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            Clear Active Layer
          </button>
        </div>
      </aside>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-500" />
                Enter Gemini API Key
              </h2>
              <button 
                onClick={() => setShowKeyModal(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-zinc-400 text-sm">
                To generate AI textures, you need an API key from Google AI Studio. The key is stored locally on your device.
              </p>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 uppercase">API Key</label>
                <input 
                  type="password" 
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all font-mono text-sm"
                />
              </div>

              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                Get an API key here <ExternalLink className="w-3 h-3" />
              </a>

              <div className="pt-2">
                <button
                  onClick={handleSaveKey}
                  disabled={!tempKey.trim()}
                  className="w-full bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-white font-medium py-2.5 rounded-lg transition-all"
                >
                  Save API Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Toolbar;