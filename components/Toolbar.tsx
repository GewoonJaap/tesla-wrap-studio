import React, { useState } from 'react';
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
  Image as ImageIcon
} from 'lucide-react';

interface ToolbarProps {
  state: DrawingState;
  selectedModel: CarModel;
  onChange: (updates: Partial<DrawingState>) => void;
  onClear: () => void;
  onApplyTexture: (base64Texture: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ state, selectedModel, onChange, onClear, onApplyTexture }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const textureUrl = await generateTexture(prompt);
      onApplyTexture(textureUrl);
    } catch (e) {
      console.error(e);
      alert('Failed to generate texture. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyExample = (filename: string) => {
    const url = `${GITHUB_BASE_URL}/${selectedModel.folderName}/example/${filename}`;
    onApplyTexture(url);
  };

  return (
    <aside className="w-80 bg-zinc-900 border-l border-zinc-800 flex flex-col h-full shrink-0 overflow-y-auto">
      
      {/* AI Section */}
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">AI Texture Gen</h2>
        </div>
        <div className="space-y-3">
          <textarea 
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-sm text-white resize-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none placeholder:text-zinc-600"
            rows={3}
            placeholder="E.g., Carbon fiber pattern with red stripes..."
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
              className="relative aspect-square rounded-lg overflow-hidden border border-zinc-700 hover:border-white transition-all group"
              title={example.replace('.png', '').replace(/_/g, ' ')}
            >
              <img 
                src={`${GITHUB_BASE_URL}/${selectedModel.folderName}/example/${example}`}
                alt={example}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-[10px] text-white font-medium px-1 text-center leading-tight">
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
                  ? 'bg-zinc-800 border-white/20 text-white' 
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <Brush className="w-5 h-5" />
              <span className="text-xs">Brush</span>
            </button>
            <button
              onClick={() => onChange({ tool: ToolType.ERASER })}
              className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-all border ${
                state.tool === ToolType.ERASER 
                  ? 'bg-zinc-800 border-white/20 text-white' 
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <Eraser className="w-5 h-5" />
              <span className="text-xs">Eraser</span>
            </button>
          </div>
        </div>

        {/* Brush Settings */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Size</h3>
            <span className="text-xs text-zinc-400">{state.brushSize}px</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={state.brushSize}
            onChange={(e) => onChange({ brushSize: parseInt(e.target.value) })}
            className="w-full accent-white h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Opacity</h3>
            <span className="text-xs text-zinc-400">{Math.round(state.opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={state.opacity}
            onChange={(e) => onChange({ opacity: parseFloat(e.target.value) })}
            className="w-full accent-white h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Color Picker */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Color</h3>
            <button 
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
            >
                <Palette className="w-3 h-3" /> Custom
            </button>
          </div>
          
          <div className="grid grid-cols-5 gap-2 mb-3">
            {PRESET_COLORS.slice(0, 10).map((color) => (
              <button
                key={color}
                onClick={() => onChange({ color, tool: ToolType.BRUSH })}
                className={`w-full aspect-square rounded-full border-2 transition-all ${
                  state.color === color && state.tool !== ToolType.ERASER ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-110'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          {showColorPicker && (
             <div className="pt-2 border-t border-zinc-800 mt-2">
                 <input 
                    type="color" 
                    value={state.color}
                    onChange={(e) => onChange({ color: e.target.value, tool: ToolType.BRUSH })}
                    className="w-full h-10 bg-transparent rounded cursor-pointer"
                 />
             </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-zinc-800">
        <button
          onClick={onClear}
          className="w-full border border-red-500/20 text-red-400 hover:bg-red-500/10 px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
        >
          <RotateCcw className="w-4 h-4" />
          Clear Canvas
        </button>
      </div>
    </aside>
  );
};

export default Toolbar;