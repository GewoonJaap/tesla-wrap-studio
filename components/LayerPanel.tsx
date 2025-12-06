import React, { useState, useRef, useEffect } from 'react';
import { Layer } from '../types';
import { Eye, EyeOff, Plus, Trash2, ArrowUp, ArrowDown, Layers, Pencil } from 'lucide-react';

interface LayerPanelProps {
  layers: Layer[];
  activeLayerId: string;
  onLayerClick: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onAddLayer: () => void;
  onRemoveLayer: (id: string) => void;
  onMoveLayer: (id: string, direction: 'up' | 'down') => void;
  onUpdateOpacity: (id: string, opacity: number) => void;
  onRenameLayer: (id: string, name: string) => void;
}

const LayerPanel: React.FC<LayerPanelProps> = ({
  layers,
  activeLayerId,
  onLayerClick,
  onToggleVisibility,
  onAddLayer,
  onRemoveLayer,
  onMoveLayer,
  onUpdateOpacity,
  onRenameLayer
}) => {
  // We reverse the layers for display so the "Top" layer is at the top of the list
  // But logically, index 0 is the background (bottom)
  const displayLayers = [...layers].reverse();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const startEditing = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    setEditingId(id);
    setEditName(name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
  };

  const saveEditing = () => {
    if (editingId && editName.trim()) {
      onRenameLayer(editingId, editName.trim());
    }
    cancelEditing();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEditing();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  return (
    <div className="w-64 bg-zinc-900 border-l border-zinc-800 flex flex-col h-full shrink-0 z-20 shadow-xl">
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
        <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-zinc-400" />
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">Layers</h3>
        </div>
        <button
          onClick={onAddLayer}
          className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors text-zinc-300 hover:text-white"
          title="New Layer"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
        {displayLayers.map((layer, index) => {
          // Calculate actual index in the original array
          const originalIndex = layers.length - 1 - index;
          const isActive = layer.id === activeLayerId;
          const isEditing = editingId === layer.id;

          return (
            <div
              key={layer.id}
              onClick={() => !isEditing && onLayerClick(layer.id)}
              className={`group flex flex-col gap-1 p-2 rounded-lg text-sm border cursor-pointer transition-all select-none ${
                isActive
                  ? 'bg-zinc-800 border-zinc-600 shadow-md ring-1 ring-white/10'
                  : 'bg-zinc-900/50 border-transparent hover:bg-zinc-800 hover:border-zinc-700 text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <button
                    onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(layer.id);
                    }}
                    className={`p-1 rounded hover:bg-zinc-700 ${layer.visible ? 'text-zinc-400' : 'text-zinc-600'}`}
                >
                    {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                {isEditing ? (
                   <input 
                      ref={inputRef}
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={saveEditing}
                      onKeyDown={handleKeyDown}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 min-w-0 bg-zinc-950 border border-blue-500 rounded px-1.5 py-0.5 text-sm text-white focus:outline-none"
                   />
                ) : (
                  <span 
                    className={`flex-1 truncate ${isActive ? 'text-white font-medium' : ''}`}
                    onDoubleClick={(e) => startEditing(e, layer.id, layer.name)}
                    title="Double-click to rename"
                  >
                      {layer.name}
                  </span>
                )}

                {isActive && !isEditing && (
                    <div className="flex items-center gap-1 opacity-100 transition-opacity">
                        <button
                          onClick={(e) => startEditing(e, layer.id, layer.name)}
                          className="p-1 hover:text-white text-zinc-500"
                          title="Rename"
                        >
                           <Pencil className="w-3 h-3"/>
                        </button>
                        <div className="flex flex-col gap-0.5">
                            <button
                            disabled={originalIndex === layers.length - 1}
                            onClick={(e) => {
                                e.stopPropagation();
                                onMoveLayer(layer.id, 'up');
                            }}
                            className="p-0.5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                            <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                            disabled={originalIndex === 0}
                            onClick={(e) => {
                                e.stopPropagation();
                                onMoveLayer(layer.id, 'down');
                            }}
                            className="p-0.5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                            <ArrowDown className="w-3 h-3" />
                            </button>
                        </div>
                        <button
                            onClick={(e) => {
                            e.stopPropagation();
                            onRemoveLayer(layer.id);
                            }}
                            className="p-1.5 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 rounded transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
              </div>
              
              {isActive && !isEditing && (
                <div className="px-1 pt-1 flex items-center gap-2 animate-in slide-in-from-top-1 fade-in duration-200">
                    <span className="text-[10px] text-zinc-500 w-6">Op:</span>
                    <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01"
                        value={layer.opacity}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => onUpdateOpacity(layer.id, parseFloat(e.target.value))}
                        className="flex-1 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Active Layer Status */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-950/50 text-xs text-zinc-500 text-center">
         {layers.length} Layers • {layers.filter(l => l.visible).length} Visible
      </div>
    </div>
  );
};

export default LayerPanel;