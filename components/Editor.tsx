import React, { useRef, useEffect, useState } from 'react';
import { CarModel, DrawingState, Point, ToolType, Layer } from '../types';
import { GITHUB_BASE_URL } from '../constants';
import { Loader2, Eye, EyeOff, Move, Check, X as XIcon, Maximize, ArrowLeftRight, ArrowUpDown } from 'lucide-react';
import LayerPanel from './LayerPanel';

interface EditorProps {
  model: CarModel;
  drawingState: DrawingState;
  textureToApply: string | null;
  onTextureApplied: () => void;
  onCompositeRequest: (callback: () => string | undefined) => void;
}

interface TransformState {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
}

const Editor: React.FC<EditorProps> = ({ 
  model, 
  drawingState, 
  textureToApply,
  onTextureApplied,
  onCompositeRequest
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Layer Management
  const [layers, setLayers] = useState<Layer[]>([
    { id: 'layer-1', name: 'Background', visible: true, opacity: 1 }
  ]);
  const [activeLayerId, setActiveLayerId] = useState<string>('layer-1');
  
  // Map to hold references to all canvas elements
  const layerCanvasRefs = useRef<Map<string, HTMLCanvasElement>>(new Map());
  
  const templateImgRef = useRef<HTMLImageElement | null>(null);
  
  const [isTemplateLoaded, setIsTemplateLoaded] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const [referenceError, setReferenceError] = useState(false);
  const [templateError, setTemplateError] = useState(false);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);

  // Gradient State
  const [gradientStart, setGradientStart] = useState<Point | null>(null);
  const [currentDrag, setCurrentDrag] = useState<Point | null>(null);

  // Texture Alignment State
  const [pendingTexture, setPendingTexture] = useState<string | null>(null);
  const [transform, setTransform] = useState<TransformState>({ x: 0, y: 0, scaleX: 1, scaleY: 1 });

  // Construct URLs
  const templateUrl = `${GITHUB_BASE_URL}/${model.folderName}/template.png`;
  const referenceUrl = `${GITHUB_BASE_URL}/${model.folderName}/vehicle_image.png`;

  // --- Layer Operations ---

  const addLayer = (name: string = `Layer ${layers.length + 1}`) => {
    const newId = `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setLayers(prev => [...prev, { id: newId, name, visible: true, opacity: 1 }]);
    setActiveLayerId(newId);
    return newId;
  };

  const removeLayer = (id: string) => {
    if (layers.length <= 1) return; // Don't remove last layer
    
    const index = layers.findIndex(l => l.id === id);
    const newLayers = layers.filter(l => l.id !== id);
    setLayers(newLayers);
    layerCanvasRefs.current.delete(id);

    // Update active layer if we deleted the active one
    if (activeLayerId === id) {
        // Try to select the one below, or 0 if none
        const newActiveIndex = Math.max(0, index - 1);
        setActiveLayerId(newLayers[newActiveIndex].id);
    }
  };

  const moveLayer = (id: string, direction: 'up' | 'down') => {
    const index = layers.findIndex(l => l.id === id);
    if (direction === 'up' && index === layers.length - 1) return;
    if (direction === 'down' && index === 0) return;

    const newLayers = [...layers];
    const swapIndex = direction === 'up' ? index + 1 : index - 1;
    
    [newLayers[index], newLayers[swapIndex]] = [newLayers[swapIndex], newLayers[index]];
    setLayers(newLayers);
  };

  const toggleVisibility = (id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  };

  const updateOpacity = (id: string, opacity: number) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, opacity } : l));
  };

  // --- Lifecycle & Initialization ---

  // Initialize Template
  useEffect(() => {
    setIsTemplateLoaded(false);
    setTemplateError(false);
    setReferenceError(false);
    setPendingTexture(null);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = templateUrl;
    
    img.onload = () => {
      templateImgRef.current = img;
      setIsTemplateLoaded(true);
      // Force update to ensure canvases get sized
      setLayers(prev => [...prev]);
    };

    img.onerror = () => {
      setTemplateError(true);
      console.error(`Failed to load template from ${templateUrl}`);
    };

  }, [model]);

  // Handle incoming texture
  useEffect(() => {
    if (textureToApply && isTemplateLoaded) {
      // 1. Create a New Layer automatically for the AI texture
      const newId = addLayer("AI Texture");
      
      // 2. Set as pending for alignment
      setPendingTexture(textureToApply);
      setTransform({ x: 0, y: 0, scaleX: 1, scaleY: 1 });
      
      // 3. Clear parent signal
      onTextureApplied(); 
    }
  }, [textureToApply, isTemplateLoaded, onTextureApplied]);

  // Expose Composite Data Generator to Parent
  useEffect(() => {
    if (onCompositeRequest) {
        onCompositeRequest(() => {
            if (!templateImgRef.current) return undefined;
            
            // Create a temp canvas
            const canvas = document.createElement('canvas');
            canvas.width = templateImgRef.current.naturalWidth;
            canvas.height = templateImgRef.current.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) return undefined;

            // Fill White Background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw all visible layers in order
            layers.forEach(layer => {
                if (layer.visible) {
                    const layerCanvas = layerCanvasRefs.current.get(layer.id);
                    if (layerCanvas) {
                        ctx.globalAlpha = layer.opacity;
                        ctx.drawImage(layerCanvas, 0, 0);
                    }
                }
            });

            return canvas.toDataURL('image/png');
        });
    }
  }, [layers, onCompositeRequest]);


  // Helper: Init a specific layer canvas
  const initLayerCanvas = (canvas: HTMLCanvasElement, isBackground: boolean) => {
    if (!templateImgRef.current) return;
    
    // Only resize if needed to avoid clearing content
    if (canvas.width !== templateImgRef.current.naturalWidth || canvas.height !== templateImgRef.current.naturalHeight) {
        canvas.width = templateImgRef.current.naturalWidth;
        canvas.height = templateImgRef.current.naturalHeight;
        
        if (isBackground) {
             const ctx = canvas.getContext('2d');
             if (ctx) {
                 ctx.fillStyle = '#FFFFFF';
                 ctx.fillRect(0, 0, canvas.width, canvas.height);
             }
        }
    }
  };


  // --- Logic ---

  const applyPendingTexture = () => {
    // Apply to the ACTIVE layer (which we just created)
    const canvas = layerCanvasRefs.current.get(activeLayerId);
    if (!canvas || !pendingTexture || !containerRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = pendingTexture;
    
    img.onload = () => {
      // Calculate Mapping
      const rect = containerRef.current!.getBoundingClientRect();
      const ratioX = canvas.width / rect.width;
      const ratioY = canvas.height / rect.height;

      const finalW = canvas.width * transform.scaleX;
      const finalH = canvas.height * transform.scaleY;
      
      const shiftX = transform.x * ratioX;
      const shiftY = transform.y * ratioY;

      const centerX = (canvas.width / 2) + shiftX;
      const centerY = (canvas.height / 2) + shiftY;

      const left = centerX - (finalW / 2);
      const top = centerY - (finalH / 2);

      const prevComposite = ctx.globalCompositeOperation;
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(img, left, top, finalW, finalH);
      ctx.globalCompositeOperation = prevComposite;

      setPendingTexture(null);
    };
  };

  const cancelPendingTexture = () => {
    setPendingTexture(null);
    // Remove the layer created for this texture if we cancel
    if (activeLayerId && layers.find(l => l.id === activeLayerId)?.name === "AI Texture") {
        removeLayer(activeLayerId);
    }
  };

  const getPoint = (e: React.MouseEvent | React.TouchEvent): Point | null => {
    const canvas = layerCanvasRefs.current.get(activeLayerId);
    if (!canvas) return null;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (pendingTexture) return;
    
    // Don't draw if clicking on hidden layer
    const activeLayer = layers.find(l => l.id === activeLayerId);
    if (!activeLayer?.visible) return;

    e.preventDefault(); 
    
    const point = getPoint(e);
    if (!point) return;

    setIsDrawing(true);

    if (drawingState.tool === ToolType.GRADIENT) {
      setGradientStart(point);
      setCurrentDrag(point);
    } else {
      setLastPoint(point);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || pendingTexture) return;
    e.preventDefault();

    const currentPoint = getPoint(e);
    if (!currentPoint) return;

    if (drawingState.tool === ToolType.GRADIENT) {
      setCurrentDrag(currentPoint);
      return;
    }

    if (!lastPoint) return;
    
    // Draw on Active Layer
    const canvas = layerCanvasRefs.current.get(activeLayerId);
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = drawingState.brushSize;
    ctx.globalAlpha = drawingState.opacity;

    if (drawingState.tool === ToolType.ERASER) {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = drawingState.color;
    }

    ctx.stroke();
    setLastPoint(currentPoint);
  };

  const stopDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    // Apply Gradient
    if (drawingState.tool === ToolType.GRADIENT && gradientStart && currentDrag) {
      const canvas = layerCanvasRefs.current.get(activeLayerId);
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        const start = gradientStart;
        const end = currentDrag;

        const prevComposite = ctx.globalCompositeOperation;
        const prevAlpha = ctx.globalAlpha;
        
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = drawingState.opacity;

        let gradient;
        if (drawingState.gradientType === 'linear') {
          gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
        } else {
          const r = Math.hypot(end.x - start.x, end.y - start.y);
          gradient = ctx.createRadialGradient(start.x, start.y, 0, start.x, start.y, r);
        }

        gradient.addColorStop(0, drawingState.color);
        gradient.addColorStop(1, drawingState.secondaryColor);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.globalCompositeOperation = prevComposite;
        ctx.globalAlpha = prevAlpha;
      }
    }

    setIsDrawing(false);
    setLastPoint(null);
    setGradientStart(null);
    setCurrentDrag(null);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
        {/* Workspace Center */}
        <div className="flex-1 bg-zinc-950/50 relative overflow-hidden flex items-center justify-center p-8 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 to-zinc-950">
        
            {/* View Toggle */}
            <div className="absolute top-4 right-4 z-10">
                <button 
                onClick={() => setShowReference(!showReference)}
                className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-all border shadow-lg ${
                    showReference 
                    ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white hover:border-zinc-600'
                }`}
                >
                {showReference ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                {showReference ? 'Hide Reference' : 'Show Reference'}
                </button>
            </div>

            {/* Reference Window */}
            {showReference && (
                <div className="absolute top-16 right-4 z-30 w-72 bg-zinc-900 rounded-xl border border-zinc-700 shadow-2xl overflow-hidden animate-in slide-in-from-right-4 fade-in duration-200">
                <div className="bg-zinc-800/50 px-3 py-2 border-b border-zinc-700 flex justify-between items-center">
                    <span className="text-xs font-medium text-zinc-300">Vehicle Reference</span>
                    <button onClick={() => setShowReference(false)} className="text-zinc-500 hover:text-white"><EyeOff className="w-3 h-3"/></button>
                </div>
                <div className="p-2 bg-zinc-950">
                    <img 
                        src={referenceUrl} 
                        alt="Reference" 
                        className="w-full h-auto rounded border border-zinc-800"
                        onError={() => setReferenceError(true)}
                    />
                </div>
                </div>
            )}

            {/* Loading/Error States */}
            {!isTemplateLoaded && !templateError && (
                <div className="flex flex-col items-center gap-3 text-zinc-400">
                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                <p className="animate-pulse">Loading template...</p>
                </div>
            )}

            {/* Alignment Tool */}
            {pendingTexture && (
                <div className="absolute bottom-6 z-50 animate-in slide-in-from-bottom-6 fade-in duration-300">
                <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 p-4 rounded-xl shadow-2xl w-80 ring-1 ring-black/50">
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Move className="w-4 h-4 text-purple-400" /> Adjust Alignment
                    </h3>
                    <div className="flex gap-2">
                        <button onClick={cancelPendingTexture} className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg"><XIcon className="w-4 h-4"/></button>
                        <button onClick={applyPendingTexture} className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg"><Check className="w-4 h-4"/></button>
                    </div>
                    </div>
                    {/* Controls */}
                    <div className="space-y-4">
                        {/* Position */}
                        <div className="space-y-3">
                             <div className="flex justify-between text-[10px] uppercase text-zinc-500 font-semibold"><span>Position</span></div>
                             <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="text-xs text-zinc-400 block mb-1">X</span>
                                    <input type="range" min="-300" max="300" value={transform.x} onChange={e => setTransform(p => ({...p, x: Number(e.target.value)}))} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-ew-resize accent-purple-500"/>
                                </div>
                                <div>
                                    <span className="text-xs text-zinc-400 block mb-1">Y</span>
                                    <input type="range" min="-300" max="300" value={transform.y} onChange={e => setTransform(p => ({...p, y: Number(e.target.value)}))} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-ns-resize accent-purple-500"/>
                                </div>
                             </div>
                        </div>
                        {/* Scale */}
                        <div className="space-y-3 pt-2 border-t border-zinc-800">
                             <div className="flex justify-between text-[10px] uppercase text-zinc-500 font-semibold"><span>Scale</span></div>
                             <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="text-xs text-zinc-400 block mb-1">W</span>
                                    <input type="range" step="0.01" min="0.5" max="1.5" value={transform.scaleX} onChange={e => setTransform(p => ({...p, scaleX: Number(e.target.value)}))} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-ew-resize accent-blue-500"/>
                                </div>
                                <div>
                                    <span className="text-xs text-zinc-400 block mb-1">H</span>
                                    <input type="range" step="0.01" min="0.5" max="1.5" value={transform.scaleY} onChange={e => setTransform(p => ({...p, scaleY: Number(e.target.value)}))} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-ns-resize accent-blue-500"/>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
                </div>
            )}

            {/* Canvas Container */}
            <div 
                ref={containerRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className={`relative shadow-2xl transition-all duration-500 ease-out ring-1 ring-zinc-800 ${isTemplateLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                style={{ 
                maxWidth: '100%', 
                maxHeight: '100%',
                // aspectRatio Removed as the Ghost Image now dictates size
                cursor: drawingState.tool === ToolType.GRADIENT ? 'crosshair' : 'default'
                }}
            >
                {/* 
                  RENDER STACK:
                  0. Ghost Image (Relative, Invisible) - Forces container size
                  1. White Base (Absolute)
                  2. Layers (Absolute)
                  3. Pending Texture (Absolute)
                  4. Template Overlay (Absolute)
                  5. SVG Overlay (Absolute)
                */}
                
                {/* Ghost Image to prop open the container */}
                {isTemplateLoaded && (
                    <img 
                        src={templateUrl} 
                        alt=""
                        className="invisible relative pointer-events-none select-none z-[-1]" 
                        aria-hidden="true"
                    />
                )}

                {/* Background Fill (Visible white background behind layers) */}
                <div className="absolute inset-0 bg-white" />

                {/* Dynamic Layers */}
                {layers.map(layer => (
                    <canvas
                        key={layer.id}
                        ref={(el) => {
                            if (el) {
                                layerCanvasRefs.current.set(layer.id, el);
                                initLayerCanvas(el, layer.name === 'Background');
                            } else {
                                layerCanvasRefs.current.delete(layer.id);
                            }
                        }}
                        className={`absolute inset-0 w-full h-full pointer-events-none ${!layer.visible ? 'invisible' : ''}`}
                        style={{ opacity: layer.opacity }}
                    />
                ))}

                {/* Pending Texture Preview */}
                {pendingTexture && (
                <img 
                    src={pendingTexture}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none opacity-95" 
                    style={{
                    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scaleX}, ${transform.scaleY})`,
                    transformOrigin: 'center'
                    }}
                />
                )}

                {/* Template Wireframe Overlay */}
                {isTemplateLoaded && (
                    <img 
                        src={templateUrl} 
                        alt="Template"
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-60 mix-blend-multiply select-none" 
                    />
                )}

                {/* Vector SVG for Gradient Tool */}
                {isDrawing && drawingState.tool === ToolType.GRADIENT && gradientStart && currentDrag && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-50">
                        <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                        </marker>
                        </defs>
                        <line 
                        x1={gradientStart.x / (containerRef.current?.getBoundingClientRect().width || 1) * 100 + '%'} 
                        y1={gradientStart.y / (containerRef.current?.getBoundingClientRect().height || 1) * 100 + '%'} 
                        x2={currentDrag.x / (containerRef.current?.getBoundingClientRect().width || 1) * 100 + '%'} 
                        y2={currentDrag.y / (containerRef.current?.getBoundingClientRect().height || 1) * 100 + '%'} 
                        stroke="#3b82f6" 
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        markerEnd="url(#arrowhead)"
                        />
                         {drawingState.gradientType === 'radial' && (
                            <circle 
                                cx={gradientStart.x / (containerRef.current?.getBoundingClientRect().width || 1) * 100 + '%'} 
                                cy={gradientStart.y / (containerRef.current?.getBoundingClientRect().height || 1) * 100 + '%'} 
                                r={Math.hypot(currentDrag.x - gradientStart.x, currentDrag.y - gradientStart.y) / (containerRef.current?.getBoundingClientRect().width || 1) * 100 + '%'}
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="1"
                                opacity="0.5"
                            />
                         )}
                    </svg>
                )}
            </div>
        </div>

        {/* Layer Panel Sidebar */}
        <LayerPanel 
            layers={layers}
            activeLayerId={activeLayerId}
            onLayerClick={setActiveLayerId}
            onToggleVisibility={toggleVisibility}
            onAddLayer={addLayer}
            onRemoveLayer={removeLayer}
            onMoveLayer={moveLayer}
            onUpdateOpacity={updateOpacity}
        />
    </div>
  );
};

export default Editor;