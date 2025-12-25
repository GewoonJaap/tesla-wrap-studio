
import React, { useState, useEffect, useRef } from 'react';
import { CarModel, DrawingState, ToolType } from '../types';
import { PRESET_COLORS, GITHUB_BASE_URL, GOOGLE_FONTS } from '../constants';
import { generateTexture } from '../services/geminiService';
import ColorPicker from './ColorPicker';
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
  Key,
  Lock,
  X,
  Paperclip,
  Zap,
  Cpu,
  Pipette,
  Square,
  Minus,
  PaintBucket,
  BoxSelect,
  Lasso,
  Check,
  Globe,
  Coffee,
  Sun,
  History,
  Save,
  Bookmark
} from 'lucide-react';

interface ToolbarProps {
  state: DrawingState;
  selectedModel: CarModel;
  onChange: (updates: Partial<DrawingState>) => void;
  onClear: () => void;
  onApplyTexture: (base64Texture: string) => void;
  getCanvasData: () => string | undefined;
  apiKey: string;
  onOpenApiKeyModal: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const GEN_MODELS = [
  { id: 'gemini-2.5-flash-image', name: 'Standard (Flash)', icon: Zap, description: 'Fast, efficient generation' },
  { id: 'gemini-3-pro-image-preview', name: 'Pro (Gemini 3)', icon: Cpu, description: 'High fidelity details' }
];

const Toolbar: React.FC<ToolbarProps> = ({ 
  state, 
  selectedModel, 
  onChange, 
  onClear, 
  onApplyTexture, 
  getCanvasData,
  apiKey,
  onOpenApiKeyModal,
  isOpen,
  onClose
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Model & Batch Selection
  const [selectedGenModel, setSelectedGenModel] = useState<string>(GEN_MODELS[0].id);
  const [batchSize, setBatchSize] = useState<number>(1);
  const [useGrounding, setUseGrounding] = useState(false);
  
  // Generated Results State
  const [generatedVariants, setGeneratedVariants] = useState<string[]>([]);
  const [showVariants, setShowVariants] = useState(false);

  // customReference handles Paste, uploadedImages handles Button upload
  const [customReference, setCustomReference] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  // Color History & Saved State
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [savedColors, setSavedColors] = useState<string[]>([]);
  const historyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Custom Color Picker State
  const [activePicker, setActivePicker] = useState<'primary' | 'secondary' | null>(null);

  const [textContent, setTextContent] = useState('Tesla');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAiStudioKey = apiKey === 'AI_STUDIO_KEY';

  useEffect(() => {
    // Load persisted model choice
    const savedModel = localStorage.getItem('tesla_wrap_gen_model');
    if (savedModel && GEN_MODELS.some(m => m.id === savedModel)) {
      setSelectedGenModel(savedModel);
    }

    // Load persisted colors
    try {
        const loadedSaved = JSON.parse(localStorage.getItem('tesla_saved_colors') || '[]');
        setSavedColors(loadedSaved);
        const loadedHistory = JSON.parse(localStorage.getItem('tesla_color_history') || '[]');
        setRecentColors(loadedHistory);
    } catch (e) {
        console.warn("Failed to load color data", e);
    }

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (typeof event.target?.result === 'string') setCustomReference(event.target.result);
            };
            reader.readAsDataURL(blob as Blob);
            e.preventDefault(); 
          }
          break;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // --- Dynamic Font Loader ---
  useEffect(() => {
    if (state.tool === ToolType.TEXT && state.fontFamily) {
       const fontName = state.fontFamily;
       // Check if it's a Google Font
       if (GOOGLE_FONTS.includes(fontName)) {
           const linkId = `font-${fontName.replace(/\s+/g, '-')}`;
           if (!document.getElementById(linkId)) {
               const link = document.createElement('link');
               link.id = linkId;
               link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:ital,wght@0,400;0,700;1,400&display=swap`;
               link.rel = 'stylesheet';
               document.head.appendChild(link);
           }
       }
    }
  }, [state.fontFamily, state.tool]);

  // --- Color History Logic ---
  useEffect(() => {
    // Debounce the history add to prevent adding every intermediate color while dragging
    if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);

    historyTimeoutRef.current = setTimeout(() => {
        setRecentColors(prev => {
            const newColor = state.color;
            // Avoid duplicates at the top of the stack
            if (prev[0] === newColor) return prev;
            
            const updated = [newColor, ...prev.filter(c => c !== newColor)].slice(0, 7);
            localStorage.setItem('tesla_color_history', JSON.stringify(updated));
            return updated;
        });
    }, 1000);

    return () => {
        if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);
    };
  }, [state.color]);

  const handleSaveColor = () => {
      if (!savedColors.includes(state.color)) {
          const updated = [...savedColors, state.color];
          setSavedColors(updated);
          localStorage.setItem('tesla_saved_colors', JSON.stringify(updated));
      }
  };

  const handleDeleteSavedColor = (colorToDelete: string, e: React.MouseEvent) => {
      e.preventDefault(); // Prevent context menu
      const updated = savedColors.filter(c => c !== colorToDelete);
      setSavedColors(updated);
      localStorage.setItem('tesla_saved_colors', JSON.stringify(updated));
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedGenModel(modelId);
    localStorage.setItem('tesla_wrap_gen_model', modelId);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const promises = files.map(file => new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (typeof event.target?.result === 'string') {
            resolve(event.target.result);
          }
        };
        reader.readAsDataURL(file as Blob);
      }));

      Promise.all(promises).then(newImages => {
        setUploadedImages(prev => [...prev, ...newImages]);
      });
      
      // Reset input so same files can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Helper to fetch the Mask Image
  const getMaskImage = async (): Promise<string> => {
     // Handle License Plate: No external template, just a white canvas
     if (selectedModel.id === 'license-plate') {
        const canvas = document.createElement('canvas');
        canvas.width = 420;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, 420, 100);
            return Promise.resolve(canvas.toDataURL('image/png'));
        }
        return Promise.reject(new Error("Failed to create license plate mask"));
     }

     const maskUrl = `${GITHUB_BASE_URL}/${selectedModel.folderName}/template_ai_mask.png`;
     
     return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error("Could not create canvas context"));
                return;
            }
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => {
            console.warn("Mask not found, falling back to standard template.");
            const fallbackUrl = `${GITHUB_BASE_URL}/${selectedModel.folderName}/template.png`;
            const fbImg = new Image();
            fbImg.crossOrigin = "anonymous";
            fbImg.onload = () => {
                 const canvas = document.createElement('canvas');
                 canvas.width = fbImg.naturalWidth;
                 canvas.height = fbImg.naturalHeight;
                 const ctx = canvas.getContext('2d');
                 if(ctx) {
                     ctx.drawImage(fbImg, 0, 0);
                     resolve(canvas.toDataURL('image/png'));
                 } else {
                     reject(new Error("Fallback failed"));
                 }
            };
            fbImg.onerror = () => reject(new Error("Failed to load mask or template"));
            fbImg.src = fallbackUrl;
        };
        img.src = maskUrl;
     });
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (!apiKey) { onOpenApiKeyModal(); return; }
    setIsGenerating(true);
    setGeneratedVariants([]);
    try {
      // 1. Get the Mask (AI Mask)
      const maskData = await getMaskImage();
      
      // 2. Get the Sketch (Current User Drawing from Canvas)
      const sketchData = getCanvasData();

      // 3. Generate
      const results = await generateTexture(
        prompt, 
        maskData, 
        sketchData,
        apiKey, 
        uploadedImages,
        selectedGenModel,
        batchSize,
        useGrounding,
        selectedModel.id
      );
      
      if (results.length === 1) {
          onApplyTexture(results[0]);
          onClose(); // Auto-close on mobile
      } else if (results.length > 1) {
          setGeneratedVariants(results);
          setShowVariants(true);
      }
    } catch (e: any) {
      alert(`Failed: ${e.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectVariant = (texture: string) => {
    onApplyTexture(texture);
    setShowVariants(false);
    setGeneratedVariants([]);
    onClose(); // Auto-close on mobile
  };

  const handleAddText = async () => {
    if (!textContent.trim()) return;

    if (state.fontFamily && GOOGLE_FONTS.includes(state.fontFamily)) {
        try {
            await document.fonts.load(`${state.isBold ? 'bold' : ''} ${state.isItalic ? 'italic' : ''} 1em "${state.fontFamily}"`);
        } catch(e) {
            console.warn("Font loading check failed, attempting render anyway", e);
        }
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const fontSize = state.fontSize * 4; 
    const fontString = `${state.isItalic ? 'italic' : ''} ${state.isBold ? 'bold' : ''} ${fontSize}px "${state.fontFamily}", sans-serif`;
    
    ctx.font = fontString;
    const metrics = ctx.measureText(textContent);
    
    const shadowPadding = state.hasShadow ? state.shadowBlur * 2 + 20 : 0;
    const textHeight = fontSize * 1.2; 
    
    const width = Math.ceil(metrics.width) + shadowPadding * 2 + 50; 
    const height = Math.ceil(textHeight) + shadowPadding * 2 + 50;
    
    canvas.width = width;
    canvas.height = height;
    
    ctx.font = fontString;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    
    const centerX = width / 2;
    const centerY = height / 2;

    if (state.hasShadow) {
        ctx.shadowColor = state.shadowColor;
        ctx.shadowBlur = state.shadowBlur;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;
    }

    ctx.fillStyle = state.color;
    ctx.fillText(textContent, centerX, centerY);
    
    onApplyTexture(canvas.toDataURL());
    onClose(); 
  };

  const handleApplyExample = (filename: string) => {
    const url = `${GITHUB_BASE_URL}/${selectedModel.folderName}/example/${filename}`;
    onApplyTexture(url);
    onClose(); 
  };

  const placeholderText = selectedModel.id === 'license-plate' 
     ? "Describe your license plate style (e.g. 'Cyberpunk neon California plate', 'Matte black minimalist')..."
     : "Describe the style (e.g. 'Cyberpunk pattern using the uploaded logos')...";

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200" onClick={onClose} />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full shrink-0 overflow-y-auto transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:shadow-none'}`}>
        <div className="md:hidden p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900 sticky top-0 z-10">
           <h2 className="font-bold text-white">Tools</h2>
           <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">AI Texture Gen</h2>
            </div>
            <button onClick={onOpenApiKeyModal} className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${apiKey ? (isAiStudioKey ? 'text-blue-400 bg-blue-400/10 hover:bg-blue-400/20' : 'text-green-400 bg-green-400/10 hover:bg-green-400/20') : 'text-zinc-400 bg-zinc-800 hover:text-white'}`}>
                {apiKey ? <Key className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {apiKey ? (isAiStudioKey ? 'AI Studio' : 'Key Set') : 'Set Key'}
            </button>
          </div>

          {/* Model Selector */}
          <div className="mb-3">
             <div className="relative">
                <select 
                  value={selectedGenModel} 
                  onChange={(e) => handleModelSelect(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-2 appearance-none focus:ring-1 focus:ring-purple-500/50 outline-none"
                >
                  {GEN_MODELS.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-zinc-500">
                  <Cpu className="w-3 h-3" />
                </div>
             </div>
             
             {/* Search Grounding Toggle (Pro Only) */}
             {selectedGenModel === 'gemini-3-pro-image-preview' && (
                <div className="mt-2 flex items-center gap-2 px-1 animate-in slide-in-from-top-1 fade-in duration-200">
                    <button 
                        onClick={() => setUseGrounding(!useGrounding)}
                        className={`flex items-center gap-2 text-xs transition-colors ${useGrounding ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-400'}`}
                    >
                        <div className={`w-3.5 h-3.5 border rounded flex items-center justify-center transition-colors ${useGrounding ? 'bg-blue-500 border-blue-500' : 'border-zinc-600 bg-transparent'}`}>
                            {useGrounding && <Check className="w-2.5 h-2.5 text-black" />}
                        </div>
                        <span className="flex items-center gap-1.5">
                           <Globe className="w-3 h-3" />
                           Google Search Grounding
                        </span>
                    </button>
                </div>
             )}
             
             <div className="text-[10px] text-zinc-500 mt-1 px-1">
               {GEN_MODELS.find(m => m.id === selectedGenModel)?.description}
             </div>
          </div>

          {/* Upload Section */}
          <div className="mb-3 space-y-2">
             <input 
               ref={fileInputRef} 
               type="file" 
               accept="image/*" 
               multiple
               className="hidden" 
               onChange={handleImageUpload}
             />
             
             {uploadedImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square bg-zinc-950 rounded-lg border border-zinc-700 overflow-hidden group">
                      <img src={img} className="w-full h-full object-cover" alt={`Ref ${idx}`} />
                      <button 
                          onClick={() => removeImage(idx)} 
                          className="absolute top-1 right-1 p-1 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                      >
                          <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button 
                     onClick={() => fileInputRef.current?.click()}
                     className="aspect-square bg-zinc-900 border border-zinc-800 border-dashed rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                  >
                     <Plus className="w-5 h-5" />
                  </button>
                </div>
             )}

             {uploadedImages.length === 0 && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs text-zinc-400 flex items-center justify-center gap-2 transition-all border-dashed"
                >
                  <Paperclip className="w-3 h-3" />
                  Add Reference Images
                </button>
             )}
          </div>

          <textarea 
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-sm text-white resize-none outline-none focus:ring-2 focus:ring-purple-500/50" 
            rows={3} 
            placeholder={placeholderText}
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)} 
          />
          
          <div className="mt-3 flex items-center justify-between gap-3">
             <div className="flex bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 shrink-0">
                {[1, 2, 4].map((count) => (
                    <button
                        key={count}
                        onClick={() => setBatchSize(count)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                            batchSize === count 
                            ? 'bg-zinc-800 text-white shadow-sm' 
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                        title={`Generate ${count} image${count > 1 ? 's' : ''}`}
                    >
                        {count}
                    </button>
                ))}
             </div>
             
             <button onClick={handleGenerate} disabled={isGenerating || !prompt} className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-2">
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Generate
             </button>
          </div>

        </div>
        {selectedModel.examples.length > 0 && (
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Inspiration</h2>
            <div className="grid grid-cols-3 gap-2">
              {selectedModel.examples.map((ex) => (
                <button key={ex} onClick={() => handleApplyExample(ex)} className="aspect-square rounded-lg overflow-hidden border border-zinc-700 hover:border-white transition-all">
                  <img src={`${GITHUB_BASE_URL}/${selectedModel.folderName}/example/${ex}`} className="w-full h-full object-cover" crossOrigin="anonymous" />
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="p-6 space-y-8 flex-1">
          <div>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Tools</h3>
            <div className="grid grid-cols-4 gap-2">
              <button onClick={() => onChange({ tool: ToolType.BRUSH })} className={`p-2 rounded-lg border flex flex-col items-center gap-1 ${state.tool === ToolType.BRUSH ? 'bg-zinc-800 border-white text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}><Brush className="w-4 h-4" /><span className="text-[10px]">Brush</span></button>
              <button onClick={() => onChange({ tool: ToolType.ERASER })} className={`p-2 rounded-lg border flex flex-col items-center gap-1 ${state.tool === ToolType.ERASER ? 'bg-zinc-800 border-white text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}><Eraser className="w-4 h-4" /><span className="text-[10px]">Eraser</span></button>
              <button onClick={() => onChange({ tool: ToolType.FILL })} className={`p-2 rounded-lg border flex flex-col items-center gap-1 ${state.tool === ToolType.FILL ? 'bg-zinc-800 border-white text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}><PaintBucket className="w-4 h-4" /><span className="text-[10px]">Fill</span></button>
              <button onClick={() => onChange({ tool: ToolType.GRADIENT })} className={`p-2 rounded-lg border flex flex-col items-center gap-1 ${state.tool === ToolType.GRADIENT ? 'bg-zinc-800 border-white text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}><MoveDiagonal className="w-4 h-4" /><span className="text-[10px]">Grad</span></button>
              
              <button onClick={() => onChange({ tool: ToolType.SELECT_RECT })} className={`p-2 rounded-lg border flex flex-col items-center gap-1 ${state.tool === ToolType.SELECT_RECT ? 'bg-zinc-800 border-white text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}><BoxSelect className="w-4 h-4" /><span className="text-[10px]">Rect Sel</span></button>
              <button onClick={() => onChange({ tool: ToolType.SELECT_LASSO })} className={`p-2 rounded-lg border flex flex-col items-center gap-1 ${state.tool === ToolType.SELECT_LASSO ? 'bg-zinc-800 border-white text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}><Lasso className="w-4 h-4" /><span className="text-[10px]">Lasso</span></button>
              <button onClick={() => onChange({ tool: ToolType.TRANSFORM })} className={`p-2 rounded-lg border flex flex-col items-center gap-1 ${state.tool === ToolType.TRANSFORM ? 'bg-zinc-800 border-white text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}><Scissors className="w-4 h-4" /><span className="text-[10px]">Cut/Mv</span></button>
              <button onClick={() => onChange({ tool: ToolType.TEXT })} className={`p-2 rounded-lg border flex flex-col items-center gap-1 ${state.tool === ToolType.TEXT ? 'bg-zinc-800 border-white text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}><Type className="w-4 h-4" /><span className="text-[10px]">Text</span></button>
              
              <button onClick={() => onChange({ tool: ToolType.RECTANGLE })} className={`p-2 rounded-lg border flex flex-col items-center gap-1 ${state.tool === ToolType.RECTANGLE ? 'bg-zinc-800 border-white text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}><Square className="w-4 h-4" /><span className="text-[10px]">Rect</span></button>
              <button onClick={() => onChange({ tool: ToolType.ELLIPSE })} className={`p-2 rounded-lg border flex flex-col items-center gap-1 ${state.tool === ToolType.ELLIPSE ? 'bg-zinc-800 border-white text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}><Circle className="w-4 h-4" /><span className="text-[10px]">Circle</span></button>
              <button onClick={() => onChange({ tool: ToolType.LINE })} className={`p-2 rounded-lg border flex flex-col items-center gap-1 ${state.tool === ToolType.LINE ? 'bg-zinc-800 border-white text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}><Minus className="w-4 h-4 -rotate-45" /><span className="text-[10px]">Line</span></button>
            </div>
          </div>
          
          {/* Enhanced Text Tool Panel */}
          {state.tool === ToolType.TEXT && (
            <div className="space-y-4 p-4 bg-zinc-950 rounded-xl border border-zinc-800 animate-in slide-in-from-left-4 duration-300">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Text Settings</h3>
              
              {/* Font Family */}
              <div className="space-y-1">
                 <label className="text-[10px] text-zinc-400">Font Family</label>
                 <select 
                    value={state.fontFamily} 
                    onChange={(e) => onChange({ fontFamily: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-2 py-2 outline-none focus:border-blue-500"
                    style={{ fontFamily: state.fontFamily }}
                 >
                    {GOOGLE_FONTS.map(font => (
                        <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                    ))}
                 </select>
              </div>

              {/* Font Size */}
              <div className="space-y-1">
                 <div className="flex justify-between">
                     <label className="text-[10px] text-zinc-400">Size</label>
                     <span className="text-[10px] text-zinc-400">{state.fontSize}px</span>
                 </div>
                 <input 
                    type="range" 
                    min="10" 
                    max="200" 
                    value={state.fontSize} 
                    onChange={(e) => onChange({ fontSize: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                 />
              </div>

              {/* Style Toggles */}
              <div className="flex gap-2">
                 <button 
                    onClick={() => onChange({ isBold: !state.isBold })}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${state.isBold ? 'bg-blue-600 border-blue-600 text-white' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'}`}
                 >
                    B
                 </button>
                 <button 
                    onClick={() => onChange({ isItalic: !state.isItalic })}
                    className={`flex-1 py-1.5 rounded-lg border text-xs italic transition-all ${state.isItalic ? 'bg-blue-600 border-blue-600 text-white' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'}`}
                 >
                    I
                 </button>
              </div>

              {/* Shadow Toggle */}
              <div className="pt-2 border-t border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                     <label className="text-[10px] text-zinc-400 flex items-center gap-1">
                        <Sun className="w-3 h-3"/> Drop Shadow
                     </label>
                     <button 
                        onClick={() => onChange({ hasShadow: !state.hasShadow })}
                        className={`w-8 h-4 rounded-full transition-colors relative ${state.hasShadow ? 'bg-blue-600' : 'bg-zinc-700'}`}
                     >
                        <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${state.hasShadow ? 'translate-x-4' : 'translate-x-0'}`} />
                     </button>
                  </div>
                  
                  {state.hasShadow && (
                      <div className="flex gap-2 items-center animate-in fade-in duration-200">
                          <input 
                            type="range" 
                            min="0" max="50" 
                            value={state.shadowBlur} 
                            onChange={(e) => onChange({ shadowBlur: parseInt(e.target.value) })}
                            className="flex-1 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-400"
                            title="Shadow Blur"
                          />
                          <input 
                            type="color"
                            value={state.shadowColor}
                            onChange={(e) => onChange({ shadowColor: e.target.value })}
                            className="w-6 h-6 rounded overflow-hidden border-none p-0 bg-transparent cursor-pointer"
                            title="Shadow Color"
                          />
                      </div>
                  )}
              </div>

              {/* Text Input */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <textarea 
                    value={textContent} 
                    onChange={(e) => setTextContent(e.target.value)} 
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" 
                    rows={2} 
                    placeholder="Enter text..."
                    style={{ fontFamily: state.fontFamily, fontWeight: state.isBold ? 'bold' : 'normal', fontStyle: state.isItalic ? 'italic' : 'normal' }}
                />
                <button 
                    onClick={handleAddText} 
                    className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg text-sm font-medium shadow-lg transition-all active:scale-95"
                >
                    Add Text Layer
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
             <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Color Palette</h3>
             </div>
             
             {/* Current Color Active Display */}
             <div className="bg-zinc-950/50 p-2 rounded-xl border border-zinc-800 flex items-center gap-3">
                 <div 
                    onClick={() => setActivePicker('primary')}
                    className="w-10 h-10 rounded-lg border-2 border-white shadow-lg cursor-pointer hover:scale-105 transition-transform relative overflow-hidden group" 
                    style={{ backgroundColor: state.color }}
                 >
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Pipette className="w-4 h-4 text-white drop-shadow-md" />
                    </div>
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-zinc-500 font-medium uppercase mb-0.5">Active</div>
                    <div className="flex items-center gap-2">
                        <code className="text-xs font-mono text-zinc-300">{state.color}</code>
                    </div>
                 </div>
                 <button 
                    onClick={handleSaveColor}
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors"
                    title="Save to palette"
                 >
                     <Save className="w-4 h-4" />
                 </button>
             </div>

             {/* Recent History */}
             {recentColors.length > 0 && (
                <div className="space-y-1.5 animate-in slide-in-from-left-2 duration-300">
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase font-medium">
                        <History className="w-3 h-3" /> Recent
                    </div>
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                        {recentColors.map((c, i) => (
                            <button 
                                key={i} 
                                onClick={() => onChange({ color: c })} 
                                className={`w-6 h-6 rounded-full border border-zinc-700 shrink-0 hover:scale-110 transition-transform ${state.color === c ? 'ring-2 ring-white ring-offset-1 ring-offset-zinc-900' : ''}`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                </div>
             )}

             {/* Saved Colors */}
             <div className="space-y-1.5">
                 <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase font-medium">
                     <span className="flex items-center gap-1.5"><Bookmark className="w-3 h-3" /> Saved</span>
                     {savedColors.length > 0 && <span className="text-[9px] opacity-70">Right click to delete</span>}
                 </div>
                 
                 <div className="grid grid-cols-7 gap-1.5">
                     {savedColors.map((c, i) => (
                         <button 
                             key={i} 
                             onClick={() => onChange({ color: c })} 
                             onContextMenu={(e) => handleDeleteSavedColor(c, e)}
                             className={`aspect-square rounded-md border border-zinc-700 hover:scale-110 transition-transform relative group ${state.color === c ? 'ring-2 ring-white ring-offset-1 ring-offset-zinc-900 z-10' : ''}`}
                             style={{ backgroundColor: c }}
                             title="Right click to delete"
                         />
                     ))}
                     {savedColors.length === 0 && (
                         <button onClick={handleSaveColor} className="col-span-full py-2 text-xs text-zinc-600 border border-dashed border-zinc-800 rounded-lg hover:border-zinc-600 hover:text-zinc-400 transition-colors">
                             Save active color
                         </button>
                     )}
                 </div>
             </div>

             {/* Presets */}
             <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                <div className="text-[10px] text-zinc-500 uppercase font-medium">Presets</div>
                <div className="grid grid-cols-8 gap-1.5">
                    {PRESET_COLORS.map((c) => (
                        <button 
                            key={c} 
                            onClick={() => onChange({ color: c })} 
                            className={`aspect-square rounded-full border border-zinc-700 hover:scale-110 transition-transform ${state.color === c ? 'ring-2 ring-white ring-offset-1 ring-offset-zinc-900 z-10' : ''}`} 
                            style={{ backgroundColor: c }} 
                        />
                    ))}
                    <button 
                        onClick={() => setActivePicker('primary')}
                        className="aspect-square rounded-full border border-zinc-700 bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>
             </div>
            
            {/* Gradient Secondary Color */}
            {state.tool === ToolType.GRADIENT && (
               <div className="pt-4 border-t border-zinc-800 animate-in slide-in-from-top-2 fade-in duration-200">
                  <div className="flex items-center justify-between mb-2">
                     <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Gradient End</h3>
                     <span className="text-[10px] text-zinc-600 font-mono uppercase">{state.secondaryColor}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-zinc-950/50 p-2 rounded-lg border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors" onClick={() => setActivePicker('secondary')}>
                      <div 
                         className="w-8 h-8 rounded border border-zinc-700 shadow-sm"
                         style={{ backgroundColor: state.secondaryColor }}
                      />
                      <span className="text-xs text-zinc-300">Choose End Color</span>
                  </div>
               </div>
            )}
          </div>
        </div>
        <div className="p-6 border-t border-zinc-800 space-y-3">
          <div className="xl:hidden">
              <a
                href="https://buymeacoffee.com/mrproper"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-black py-2 rounded-lg text-sm font-medium transition-colors mb-3 shadow-lg shadow-yellow-900/10"
              >
                <Coffee className="w-4 h-4" />
                <span>Buy me a coffee</span>
              </a>
          </div>
          <button onClick={onClear} className="w-full border border-red-500/20 text-red-400 py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors"><RotateCcw className="w-4 h-4" /> Clear Layer</button>
        </div>
      </aside>

      {/* Result Selection Modal */}
      {showVariants && generatedVariants.length > 0 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-4xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Select a Variation</h2>
                        <p className="text-zinc-400 text-sm mt-1">Choose the generation you want to apply to your vehicle.</p>
                    </div>
                    <button 
                        onClick={() => { setShowVariants(false); setGeneratedVariants([]); }}
                        className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto p-2 scrollbar-thin">
                    {generatedVariants.map((variant, idx) => (
                        <div key={idx} className="group relative aspect-square bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-purple-500 transition-all cursor-pointer shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02]" onClick={() => handleSelectVariant(variant)}>
                             <img src={variant} alt={`Variant ${idx + 1}`} className="w-full h-full object-contain p-2" />
                             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                 <div className="bg-purple-600 text-white px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all font-medium text-sm shadow-xl flex items-center gap-2">
                                     <Check className="w-4 h-4" /> Select
                                 </div>
                             </div>
                             <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm border border-white/10">
                                 #{idx + 1}
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* Custom Color Picker Modal */}
      {activePicker && (
          <ColorPicker 
              color={activePicker === 'primary' ? state.color : state.secondaryColor} 
              onChange={(c) => onChange(activePicker === 'primary' ? { color: c } : { secondaryColor: c })}
              onClose={() => setActivePicker(null)}
          />
      )}
    </>
  );
};
export default Toolbar;
