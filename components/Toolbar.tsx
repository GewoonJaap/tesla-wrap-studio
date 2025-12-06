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
  Upload,
  Trash2,
  MoveDiagonal,
  Circle,
  ArrowRight,
  Scissors,
  Type,
  Bold,
  Italic,
  CaseSensitive,
  Plus,
  Key
} from 'lucide-react';

interface ToolbarProps {
  state: DrawingState;
  selectedModel: CarModel;
  onChange: (updates: Partial<DrawingState>) => void;
  onClear: () => void;
  onApplyTexture: (base64Texture: string) => void;
  getCanvasData: () => string | undefined;
}

const FONTS = [
  'Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 
  'Verdana', 'Georgia', 'Garamond', 'Comic Sans MS', 'Trebuchet MS', 'Impact'
];

const Toolbar: React.FC<ToolbarProps> = ({ state, selectedModel, onChange, onClear, onApplyTexture, getCanvasData }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSecondaryColorPicker, setShowSecondaryColorPicker] = useState(false);
  const [customReference, setCustomReference] = useState<string | null>(null);
  
  // API Key State
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  
  // Text Tool Local State
  const [textContent, setTextContent] = useState('Tesla');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load API Key from local storage
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) setApiKey(savedKey);

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

  const handleSaveApiKey = (value: string) => {
    setApiKey(value);
    localStorage.setItem('gemini_api_key', value);
  };

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
      setShowApiKeyInput(true);
      alert("Please enter your Google Gemini API Key to generate textures.");
      return;
    }

    setIsGenerating(true);
    try {
      const referenceData = await getCompositeReference();
      const textureUrl = await generateTexture(prompt, referenceData, apiKey);
      onApplyTexture(textureUrl);
    } catch (e: any) {
      console.error(e);
      alert(`Failed to generate texture: ${e.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddText = () => {
    if (!textContent.trim()) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Font construction
    const fontString = `${state.isItalic ? 'italic' : ''} ${state.isBold ? 'bold' : ''} ${state.fontSize * 5}px "${state.fontFamily}"`;
    ctx.font = fontString;
    
    // Measure
    const metrics = ctx.measureText(textContent);
    const padding = state.hasShadow ? state.shadowBlur * 2 + 10 : 0;
    const width = Math.ceil(metrics.width) + padding * 2;
    // Approximate height since measureText height support varies
    const height = Math.ceil(state.fontSize * 5 * 1.5) + padding * 2; 

    canvas.width = width;
    canvas.height = height;

    // Redo context after resize
    ctx.font = fontString;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    
    if (state.hasShadow) {
        ctx.shadowColor = state.shadowColor;
        ctx.shadowBlur = state.shadowBlur;
        ctx.shadowOffsetX = 2; // Default offset
        ctx.shadowOffsetY = 2;
    }

    ctx.fillStyle = state.color;
    ctx.fillText(textContent, width / 2, height / 2);

    onApplyTexture(canvas.toDataURL());
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
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                className={`p-1.5 rounded-lg transition-colors ${apiKey ? 'text-green-400 bg-green-400/10' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                title="Configure API Key"
            >
                <Key className="w-4 h-4" />
            </button>
          </div>

          {showApiKeyInput && (
            <div className="mb-4 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800 animate-in slide-in-from-top-2">
                <label className="text-xs text-zinc-400 block mb-1.5">Gemini API Key</label>
                <div className="flex gap-2">
                    <input 
                        type="password"
                        value={apiKey}
                        onChange={(e) => handleSaveApiKey(e.target.value)}
                        placeholder="Enter AI Studio Key..."
                        className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:border-purple-500 outline-none"
                    />
                </div>
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[10px] text-purple-400 hover:underline mt-1.5 inline-block">
                    Get an API key
                </a>
            </div>
          )}
          
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
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onChange({ tool: ToolType.BRUSH })}
                className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-all border ${
                  state.tool === ToolType.BRUSH 
                    ? 'bg-zinc-800 border-white/20 text-white shadow-lg' 
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <Brush className="w-4 h-4" />
                <span className="text-[10px]">Brush</span>
              </button>
              <button
                onClick={() => onChange({ tool: ToolType.ERASER })}
                className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-all border ${
                  state.tool === ToolType.ERASER 
                    ? 'bg-zinc-800 border-white/20 text-white shadow-lg' 
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <Eraser className="w-4 h-4" />
                <span className="text-[10px]">Eraser</span>
              </button>
              <button
                onClick={() => onChange({ tool: ToolType.GRADIENT })}
                className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-all border ${
                  state.tool === ToolType.GRADIENT 
                    ? 'bg-zinc-800 border-white/20 text-white shadow-lg' 
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <MoveDiagonal className="w-4 h-4" />
                <span className="text-[10px]">Gradient</span>
              </button>
              <button
                onClick={() => onChange({ tool: ToolType.TRANSFORM })}
                className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-all border ${
                  state.tool === ToolType.TRANSFORM 
                    ? 'bg-zinc-800 border-white/20 text-white shadow-lg' 
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <Scissors className="w-4 h-4" />
                <span className="text-[10px]">Select</span>
              </button>
              <button
                onClick={() => onChange({ tool: ToolType.TEXT })}
                className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-all border ${
                  state.tool === ToolType.TEXT 
                    ? 'bg-zinc-800 border-white/20 text-white shadow-lg' 
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <Type className="w-4 h-4" />
                <span className="text-[10px]">Text</span>
              </button>
            </div>
          </div>
          
          {/* --- Tool Specific Panels --- */}

          {/* Text Tool Panel */}
          {state.tool === ToolType.TEXT && (
             <div className="space-y-4 animate-in slide-in-from-left-4">
                <div className="space-y-2">
                   <label className="text-xs font-semibold text-zinc-500 uppercase">Text Content</label>
                   <textarea
                     value={textContent}
                     onChange={(e) => setTextContent(e.target.value)}
                     className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                     rows={2}
                   />
                </div>
                
                <div className="space-y-2">
                   <label className="text-xs font-semibold text-zinc-500 uppercase">Font Family</label>
                   <select 
                      value={state.fontFamily}
                      onChange={(e) => onChange({ fontFamily: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-white outline-none"
                   >
                      {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                   </select>
                </div>

                <div className="flex gap-2">
                    <button 
                       onClick={() => onChange({ isBold: !state.isBold })}
                       className={`flex-1 p-2 rounded border transition-colors ${state.isBold ? 'bg-zinc-700 border-zinc-500 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}
                       title="Bold"
                    >
                       <Bold className="w-4 h-4 mx-auto" />
                    </button>
                    <button 
                       onClick={() => onChange({ isItalic: !state.isItalic })}
                       className={`flex-1 p-2 rounded border transition-colors ${state.isItalic ? 'bg-zinc-700 border-zinc-500 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}
                       title="Italic"
                    >
                       <Italic className="w-4 h-4 mx-auto" />
                    </button>
                    <button 
                       onClick={() => onChange({ hasShadow: !state.hasShadow })}
                       className={`flex-1 p-2 rounded border transition-colors ${state.hasShadow ? 'bg-zinc-700 border-zinc-500 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}
                       title="Drop Shadow"
                    >
                       <CaseSensitive className="w-4 h-4 mx-auto" />
                    </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Font Size</h3>
                    <span className="text-xs text-zinc-400 font-mono">{state.fontSize}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    value={state.fontSize}
                    onChange={(e) => onChange({ fontSize: parseInt(e.target.value) })}
                    className="w-full accent-white h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer hover:bg-zinc-700"
                  />
                </div>

                {state.hasShadow && (
                  <div className="space-y-2 pt-2 border-t border-zinc-800">
                     <div className="flex justify-between items-center text-xs text-zinc-500">
                        <span>Shadow Blur</span>
                        <span>{state.shadowBlur}px</span>
                     </div>
                     <input
                        type="range"
                        min="0"
                        max="20"
                        value={state.shadowBlur}
                        onChange={(e) => onChange({ shadowBlur: parseInt(e.target.value) })}
                        className="w-full accent-blue-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                     />
                     <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-zinc-500">Color:</span>
                        <input 
                           type="color" 
                           value={state.shadowColor} 
                           onChange={(e) => onChange({ shadowColor: e.target.value })}
                           className="bg-transparent w-6 h-6 rounded cursor-pointer"
                        />
                     </div>
                  </div>
                )}

                <button 
                   onClick={handleAddText}
                   className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center gap-2 font-medium shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
                >
                   <Plus className="w-4 h-4" /> Add Text Layer
                </button>
             </div>
          )}

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
    </>
  );
};

export default Toolbar;