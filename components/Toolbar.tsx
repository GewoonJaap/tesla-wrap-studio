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
  Lasso
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

const FONTS = [
  'Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 
  'Verdana', 'Georgia', 'Garamond', 'Comic Sans MS', 'Trebuchet MS', 'Impact'
];

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
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSecondaryColorPicker, setShowSecondaryColorPicker] = useState(false);
  
  // Model Selection
  const [selectedGenModel, setSelectedGenModel] = useState<string>(GEN_MODELS[0].id);

  // customReference handles Paste, uploadedImages handles Button upload
  const [customReference, setCustomReference] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  const [textContent, setTextContent] = useState('Tesla');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const secondaryColorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load persisted model choice
    const savedModel = localStorage.getItem('tesla_wrap_gen_model');
    if (savedModel && GEN_MODELS.some(m => m.id === savedModel)) {
      setSelectedGenModel(savedModel);
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
    try {
      // 1. Get the Mask (AI Mask)
      const maskData = await getMaskImage();
      
      // 2. Get the Sketch (Current User Drawing from Canvas)
      const sketchData = getCanvasData();

      // 3. Generate
      const textureUrl = await generateTexture(
        prompt, 
        maskData, 
        sketchData,
        apiKey, 
        uploadedImages,
        selectedGenModel
      );
      
      onApplyTexture(textureUrl);
      onClose(); // Auto-close on mobile
    } catch (e: any) {
      alert(`Failed: ${e.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddText = () => {
    if (!textContent.trim()) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const fontString = `${state.isItalic ? 'italic' : ''} ${state.isBold ? 'bold' : ''} ${state.fontSize * 5}px "${state.fontFamily}"`;
    ctx.font = fontString;
    const metrics = ctx.measureText(textContent);
    const padding = state.hasShadow ? state.shadowBlur * 2 + 10 : 0;
    const width = Math.ceil(metrics.width) + padding * 2;
    const height = Math.ceil(state.fontSize * 5 * 1.5) + padding * 2; 
    canvas.width = width;
    canvas.height = height;
    ctx.font = fontString;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    if (state.hasShadow) {
        ctx.shadowColor = state.shadowColor;
        ctx.shadowBlur = state.shadowBlur;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
    }
    ctx.fillStyle = state.color;
    ctx.fillText(textContent, width / 2, height / 2);
    onApplyTexture(canvas.toDataURL());
    onClose(); // Auto-close on mobile
  };

  const handleApplyExample = (filename: string) => {
    const url = `${GITHUB_BASE_URL}/${selectedModel.folderName}/example/${filename}`;
    onApplyTexture(url);
    onClose(); // Auto-close on mobile
  };

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
            <button onClick={onOpenApiKeyModal} className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${apiKey ? 'text-green-400 bg-green-400/10 hover:bg-green-400/20' : 'text-zinc-400 bg-zinc-800 hover:text-white'}`}>
                {apiKey ? <Key className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {apiKey ? 'Key Set' : 'Set Key'}
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

          <textarea className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-sm text-white resize-none outline-none focus:ring-2 focus:ring-purple-500/50" rows={3} placeholder="Describe the style (e.g. 'Cyberpunk pattern using the uploaded logos')..." value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          <button onClick={handleGenerate} disabled={isGenerating || !prompt} className="w-full mt-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-2">
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Generate
          </button>
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
          {state.tool === ToolType.TEXT && (
            <div className="space-y-3 p-3 bg-zinc-950 rounded-lg border border-zinc-800">
              <textarea value={textContent} onChange={(e) => setTextContent(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-white" rows={2} />
              <button onClick={handleAddText} className="w-full py-2 bg-blue-600 text-white rounded text-sm">Add Text Layer</button>
            </div>
          )}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
               <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Color</h3>
               <span className="text-[10px] text-zinc-600 font-mono uppercase">{state.color}</span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {PRESET_COLORS.slice(0, 9).map((c) => (
                <button key={c} onClick={() => onChange({ color: c })} className={`aspect-square rounded-full border-2 ${state.color === c ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
              ))}
              
              <button 
                onClick={() => colorInputRef.current?.click()}
                className={`aspect-square rounded-full border-2 flex items-center justify-center overflow-hidden relative ${!PRESET_COLORS.includes(state.color) ? 'border-white scale-110' : 'border-zinc-700'}`}
                title="Custom Color"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-green-500 to-blue-500 opacity-80" />
                <Plus className="w-4 h-4 text-white relative z-10 drop-shadow-md" />
              </button>
              
              <input 
                ref={colorInputRef}
                type="color"
                value={state.color}
                onChange={(e) => onChange({ color: e.target.value })}
                className="hidden"
              />
            </div>
            
            {/* Gradient Secondary Color */}
            {state.tool === ToolType.GRADIENT && (
               <div className="pt-4 border-t border-zinc-800 animate-in slide-in-from-top-2 fade-in duration-200">
                  <div className="flex items-center justify-between mb-2">
                     <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Gradient End</h3>
                     <span className="text-[10px] text-zinc-600 font-mono uppercase">{state.secondaryColor}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-zinc-950/50 p-2 rounded-lg border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors" onClick={() => secondaryColorInputRef.current?.click()}>
                      <div 
                         className="w-8 h-8 rounded border border-zinc-700 shadow-sm"
                         style={{ backgroundColor: state.secondaryColor }}
                      />
                      <span className="text-xs text-zinc-300">Choose End Color</span>
                      <input 
                        ref={secondaryColorInputRef}
                        type="color" 
                        value={state.secondaryColor}
                        onChange={(e) => onChange({ secondaryColor: e.target.value })}
                        className="hidden"
                      />
                  </div>
               </div>
            )}
          </div>
        </div>
        <div className="p-6 border-t border-zinc-800">
          <button onClick={onClear} className="w-full border border-red-500/20 text-red-400 py-2 rounded-lg text-sm flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4" /> Clear Layer</button>
        </div>
      </aside>
    </>
  );
};
export default Toolbar;