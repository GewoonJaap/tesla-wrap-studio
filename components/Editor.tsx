import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { CarModel, DrawingState, Point, ToolType, Layer, EditorHandle } from '../types';
import { GITHUB_BASE_URL } from '../constants';
import { Loader2, Eye, EyeOff, Move, Check, X as XIcon, RotateCw, GripHorizontal, FlipHorizontal, FlipVertical } from 'lucide-react';
import LayerPanel from './LayerPanel';

interface EditorProps {
  model: CarModel;
  drawingState: DrawingState;
  textureToApply: string | null;
  onTextureApplied: () => void;
  isLayerPanelOpen?: boolean;
  onCloseLayerPanel?: () => void;
}

interface TransformState {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
}

const Editor = forwardRef<EditorHandle, EditorProps>(({ 
  model, 
  drawingState, 
  textureToApply,
  onTextureApplied,
  isLayerPanelOpen,
  onCloseLayerPanel
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Canvas Dimensions State (Dynamic based on template)
  const [canvasSize, setCanvasSize] = useState({ width: 1024, height: 1024 });
  const [layoutDims, setLayoutDims] = useState({ width: 0, height: 0 });

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
  const [transform, setTransform] = useState<TransformState>({ x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 });
  
  // Restore State for cancellation
  const [restoreState, setRestoreState] = useState<{ x: number, y: number, layerId: string } | null>(null);

  // Interactive Transform State
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformStart, setTransformStart] = useState<{ x: number, y: number } | null>(null);
  const [initialTransform, setInitialTransform] = useState<TransformState | null>(null);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);

  // Selection Tool State
  const [selectionStart, setSelectionStart] = useState<Point | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<Point | null>(null);

  // Construct URLs
  const templateUrl = `${GITHUB_BASE_URL}/${model.folderName}/template.png`;
  const referenceUrl = `${GITHUB_BASE_URL}/${model.folderName}/vehicle_image.png`;

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    clearLayer: () => {
      const canvas = layerCanvasRefs.current.get(activeLayerId);
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // If it's the background layer, refill with white
        const activeLayer = layers.find(l => l.id === activeLayerId);
        if (activeLayer?.name === 'Background') {
           ctx.fillStyle = '#FFFFFF';
           ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    },
    getCompositeData: () => {
      if (!templateImgRef.current && model.id !== 'license-plate') return undefined;

      const canvas = document.createElement('canvas');
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return undefined;

      // Fill White Background Base
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw all visible layers in order
      layers.forEach(layer => {
          if (layer.visible) {
              const layerCanvas = layerCanvasRefs.current.get(layer.id);
              if (layerCanvas) {
                  ctx.globalAlpha = layer.opacity;
                  ctx.drawImage(layerCanvas, 0, 0, canvasSize.width, canvasSize.height);
              }
          }
      });

      return canvas.toDataURL('image/png');
    }
  }), [layers, activeLayerId, canvasSize, model.id]);

  // --- Layout Observer for strict Aspect Ratio ---
  useEffect(() => {
    if (!wrapperRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const { width, height } = entry.contentRect;
      if (width === 0 || height === 0) return;

      const aspectRatio = canvasSize.width / canvasSize.height;
      let newWidth, newHeight;

      // Calculate 'object-fit: contain' dimensions manually
      if (width / height > aspectRatio) {
        // Parent is wider than needed, constrain by height
        newHeight = height;
        newWidth = newHeight * aspectRatio;
      } else {
        // Parent is taller than needed, constrain by width
        newWidth = width;
        newHeight = newWidth / aspectRatio;
      }

      setLayoutDims({ width: newWidth, height: newHeight });
    });

    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [canvasSize]);


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

  const renameLayer = (id: string, name: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, name } : l));
  };

  // --- Lifecycle & Initialization ---

  useEffect(() => {
    setIsTemplateLoaded(false);
    setTemplateError(false);
    setReferenceError(false);
    setPendingTexture(null);

    // SPECIAL CASE: License Plate
    if (model.id === 'license-plate') {
        // Recommended resolution by Tesla is 420x100
        setCanvasSize({ width: 420, height: 100 });
        setIsTemplateLoaded(true);
        templateImgRef.current = null;
        // Trigger re-render to ensure canvas resizes
        setLayers(prev => [...prev]);
        return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = templateUrl;
    
    img.onload = () => {
      templateImgRef.current = img;
      // Set dimensions dynamically based on template (Best results)
      setCanvasSize({
        width: img.naturalWidth || 1024,
        height: img.naturalHeight || 1024
      });
      setIsTemplateLoaded(true);
      // Force update to ensure canvases get sized
      setLayers(prev => [...prev]);
    };

    img.onerror = () => {
      setTemplateError(true);
      console.error(`Failed to load template from ${templateUrl}`);
    };

  }, [model]);

  useEffect(() => {
    if (textureToApply && isTemplateLoaded) {
      const newId = addLayer("New Layer");
      setPendingTexture(textureToApply);
      setTransform({ x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 });
      setRestoreState(null); 
      onTextureApplied(); 
    }
  }, [textureToApply, isTemplateLoaded, onTextureApplied]);

  // Helper: Init a specific layer canvas
  const initLayerCanvas = (canvas: HTMLCanvasElement, isBackground: boolean) => {
    // Dynamic Resolution
    if (canvas.width !== canvasSize.width || canvas.height !== canvasSize.height) {
        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;
        
        if (isBackground) {
             const ctx = canvas.getContext('2d');
             if (ctx) {
                 ctx.fillStyle = '#FFFFFF';
                 ctx.fillRect(0, 0, canvas.width, canvas.height);
             }
        }
    }
  };

  // --- Transform Logic ---

  const applyPendingTexture = () => {
    const canvas = layerCanvasRefs.current.get(activeLayerId);
    if (!canvas || !pendingTexture || !containerRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = pendingTexture;
    
    img.onload = () => {
      const rect = containerRef.current!.getBoundingClientRect();
      const ratioX = canvas.width / rect.width;
      const ratioY = canvas.height / rect.height;
      
      const shiftX = transform.x * ratioX;
      const shiftY = transform.y * ratioY;

      const centerX = (canvas.width / 2) + shiftX;
      const centerY = (canvas.height / 2) + shiftY;

      const targetW = canvas.width * transform.scaleX;
      const targetH = canvas.height * transform.scaleY;

      const prevComposite = ctx.globalCompositeOperation;
      ctx.globalCompositeOperation = 'source-over';

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((transform.rotation * Math.PI) / 180);
      
      ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
      
      ctx.restore();
      ctx.globalCompositeOperation = prevComposite;
      setPendingTexture(null);
      setRestoreState(null);
    };
  };

  const cancelPendingTexture = () => {
    if (restoreState && pendingTexture) {
         // Restore content to original location
         const canvas = layerCanvasRefs.current.get(restoreState.layerId);
         const ctx = canvas?.getContext('2d');
         if (canvas && ctx) {
             const img = new Image();
             img.onload = () => {
                 const prevComposite = ctx.globalCompositeOperation;
                 ctx.globalCompositeOperation = 'source-over';
                 ctx.drawImage(img, restoreState.x, restoreState.y);
                 ctx.globalCompositeOperation = prevComposite;
             };
             img.src = pendingTexture;
         }
    } else if (activeLayerId && layers.find(l => l.id === activeLayerId)?.name === "New Layer") {
        // Only remove layer if it was auto-created 
        removeLayer(activeLayerId);
    }
    setPendingTexture(null);
    setRestoreState(null);
  };

  // --- Interactive Gizmo Logic ---

  const getClientCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if ('touches' in e) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY };
  };

  const startTransform = (e: React.MouseEvent | React.TouchEvent, handle: string) => {
    e.stopPropagation();
    e.preventDefault();
    const coords = getClientCoordinates(e);
    setIsTransforming(true);
    setTransformStart(coords);
    setInitialTransform({ ...transform });
    setActiveHandle(handle);
  };

  const handleTransformMove = (e: MouseEvent | TouchEvent) => {
    if (!isTransforming || !transformStart || !initialTransform || !containerRef.current) return;
    e.preventDefault();

    const coords = getClientCoordinates(e);
    const deltaX = coords.x - transformStart.x;
    const deltaY = coords.y - transformStart.y;
    const rect = containerRef.current.getBoundingClientRect();

    if (activeHandle === 'move') {
        setTransform({
            ...initialTransform,
            x: initialTransform.x + deltaX,
            y: initialTransform.y + deltaY
        });
    } else {
        const angleRad = (initialTransform.rotation * Math.PI) / 180;
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);
        const localDeltaX = deltaX * cos + deltaY * sin;
        const localDeltaY = -deltaX * sin + deltaY * cos;
        const scaleFactorX = 2 / rect.width; 
        const scaleFactorY = 2 / rect.height;

        let newScaleX = initialTransform.scaleX;
        let newScaleY = initialTransform.scaleY;

        if (activeHandle?.includes('e')) newScaleX += localDeltaX * scaleFactorX;
        if (activeHandle?.includes('w')) newScaleX -= localDeltaX * scaleFactorX;
        if (activeHandle?.includes('s')) newScaleY += localDeltaY * scaleFactorY;
        if (activeHandle?.includes('n')) newScaleY -= localDeltaY * scaleFactorY;

        setTransform({
            ...initialTransform,
            scaleX: newScaleX,
            scaleY: newScaleY
        });
    }
  };

  const handleTransformEnd = () => {
    setIsTransforming(false);
    setTransformStart(null);
    setInitialTransform(null);
    setActiveHandle(null);
  };

  useEffect(() => {
    if (isTransforming) {
        window.addEventListener('mousemove', handleTransformMove, { passive: false });
        window.addEventListener('mouseup', handleTransformEnd);
        window.addEventListener('touchmove', handleTransformMove, { passive: false });
        window.addEventListener('touchend', handleTransformEnd);
        return () => {
            window.removeEventListener('mousemove', handleTransformMove);
            window.removeEventListener('mouseup', handleTransformEnd);
            window.removeEventListener('touchmove', handleTransformMove);
            window.removeEventListener('touchend', handleTransformEnd);
        };
    }
  }, [isTransforming, transformStart, initialTransform, activeHandle]);

  // --- Drawing & Selection Logic ---

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
    const activeLayer = layers.find(l => l.id === activeLayerId);
    if (!activeLayer?.visible) return;

    e.preventDefault(); 
    const point = getPoint(e);
    if (!point) return;

    setIsDrawing(true);

    if (drawingState.tool === ToolType.GRADIENT) {
      setGradientStart(point);
      setCurrentDrag(point);
    } else if (drawingState.tool === ToolType.TRANSFORM) {
      setSelectionStart(point);
      setSelectionEnd(point);
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

    if (drawingState.tool === ToolType.TRANSFORM) {
      setSelectionEnd(currentPoint);
      return;
    }

    if (!lastPoint) return;
    
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
      setGradientStart(null);
      setCurrentDrag(null);
    }
    
    // Apply Transform Extraction (Cut pixel data)
    if (drawingState.tool === ToolType.TRANSFORM && selectionStart && selectionEnd) {
      const canvas = layerCanvasRefs.current.get(activeLayerId);
      const ctx = canvas?.getContext('2d');
      
      if (canvas && ctx && containerRef.current) {
        // Normalize coordinates
        const x = Math.min(selectionStart.x, selectionEnd.x);
        const y = Math.min(selectionStart.y, selectionEnd.y);
        const w = Math.abs(selectionEnd.x - selectionStart.x);
        const h = Math.abs(selectionEnd.y - selectionStart.y);

        if (w > 5 && h > 5) {
            try {
                // 1. Extract ImageData
                const imageData = ctx.getImageData(x, y, w, h);
                
                // 2. Clear Source
                ctx.clearRect(x, y, w, h);

                // 3. Create temp canvas for the cutout
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = w;
                tempCanvas.height = h;
                const tempCtx = tempCanvas.getContext('2d');
                if (tempCtx) {
                    tempCtx.putImageData(imageData, 0, 0);
                    
                    // 4. Set pending texture
                    setPendingTexture(tempCanvas.toDataURL());
                    
                    // SAVE RESTORE STATE FOR CANCEL
                    setRestoreState({
                        x, 
                        y, 
                        layerId: activeLayerId
                    });

                    // 5. Calculate offset and SCALE to place it exactly
                    const canvasCenterX = canvas.width / 2;
                    const canvasCenterY = canvas.height / 2;
                    const cutoutCenterX = x + (w / 2);
                    const cutoutCenterY = y + (h / 2);

                    const rect = containerRef.current.getBoundingClientRect();
                    const ratioX = rect.width / canvas.width;
                    const ratioY = rect.height / canvas.height;

                    const offsetX = (cutoutCenterX - canvasCenterX) * ratioX;
                    const offsetY = (cutoutCenterY - canvasCenterY) * ratioY;
                    
                    // Initial scale: Fraction of canvas this fragment represents
                    const initialScaleX = w / canvas.width;
                    const initialScaleY = h / canvas.height;

                    setTransform({
                        x: offsetX,
                        y: offsetY,
                        scaleX: initialScaleX,
                        scaleY: initialScaleY,
                        rotation: 0
                    });
                }
            } catch (err) {
                console.error("Failed to extract selection", err);
            }
        }
      }
      setSelectionStart(null);
      setSelectionEnd(null);
    }

    setIsDrawing(false);
    setLastPoint(null);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
        {/* Workspace Center */}
        <div ref={wrapperRef} className="flex-1 bg-zinc-950/50 relative overflow-hidden flex items-center justify-center p-8 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 to-zinc-950 select-none">
        
            {/* View Toggle */}
            {model.id !== 'license-plate' && (
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
            )}

            {/* Reference Window */}
            {showReference && model.id !== 'license-plate' && (
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
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-zinc-400 z-0">
                    <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                    <p className="animate-pulse">Loading template...</p>
                </div>
            )}

            {/* Alignment Tool Controls */}
            {pendingTexture && (
                <div className="absolute bottom-6 z-50 animate-in slide-in-from-bottom-6 fade-in duration-300">
                <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 p-4 rounded-xl shadow-2xl w-80 ring-1 ring-black/50">
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Move className="w-4 h-4 text-purple-400" /> Adjust & Place
                    </h3>
                    <div className="flex gap-2">
                        <button onClick={cancelPendingTexture} className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg"><XIcon className="w-4 h-4"/></button>
                        <button onClick={applyPendingTexture} className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg"><Check className="w-4 h-4"/></button>
                    </div>
                    </div>
                    {/* Controls */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                             <div className="flex justify-between text-[10px] uppercase text-zinc-500 font-semibold">
                                <span>Position</span>
                                <span className="text-zinc-400 font-mono">{Math.round(transform.x)}, {Math.round(transform.y)}</span>
                             </div>
                             <div className="text-xs text-zinc-500 flex items-center gap-2">
                                <GripHorizontal className="w-4 h-4"/> Drag to move, handles to scale
                             </div>
                        </div>

                        {/* Rotation */}
                        <div className="space-y-3 pt-2 border-t border-zinc-800">
                             <div className="flex justify-between text-[10px] uppercase text-zinc-500 font-semibold">
                                <span className="flex items-center gap-1"><RotateCw className="w-3 h-3"/> Rotation</span>
                                <span className="text-zinc-400 font-mono">{transform.rotation}°</span>
                             </div>
                             <input type="range" min="-180" max="180" value={transform.rotation} onChange={e => setTransform(p => ({...p, rotation: Number(e.target.value)}))} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-ew-resize accent-orange-500"/>
                        </div>

                        {/* Scale Sliders */}
                        <div className="space-y-3 pt-2 border-t border-zinc-800">
                             <div className="flex justify-between text-[10px] uppercase text-zinc-500 font-semibold"><span>Scale</span></div>
                             <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="text-xs text-zinc-400 block mb-1">W</span>
                                    <input 
                                        type="range" step="0.01" min="0.5" max="2" 
                                        value={Math.abs(transform.scaleX)} 
                                        onChange={e => setTransform(p => ({...p, scaleX: Number(e.target.value) * (p.scaleX < 0 ? -1 : 1)}))} 
                                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-ew-resize accent-blue-500"
                                    />
                                </div>
                                <div>
                                    <span className="text-xs text-zinc-400 block mb-1">H</span>
                                    <input 
                                        type="range" step="0.01" min="0.5" max="2" 
                                        value={Math.abs(transform.scaleY)} 
                                        onChange={e => setTransform(p => ({...p, scaleY: Number(e.target.value) * (p.scaleY < 0 ? -1 : 1)}))} 
                                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-ns-resize accent-blue-500"
                                    />
                                </div>
                             </div>
                        </div>

                        {/* Mirror Buttons */}
                        <div className="space-y-3 pt-2 border-t border-zinc-800">
                             <div className="flex justify-between text-[10px] uppercase text-zinc-500 font-semibold">
                                <span>Mirror</span>
                             </div>
                             <div className="flex gap-2">
                                <button 
                                    onClick={() => setTransform(p => ({ ...p, scaleX: p.scaleX * -1 }))}
                                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-2 transition-colors ${transform.scaleX < 0 ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}
                                    title="Flip Horizontal"
                                >
                                    <FlipHorizontal className="w-4 h-4" /> Horizontal
                                </button>
                                <button 
                                    onClick={() => setTransform(p => ({ ...p, scaleY: p.scaleY * -1 }))}
                                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-2 transition-colors ${transform.scaleY < 0 ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}
                                    title="Flip Vertical"
                                >
                                    <FlipVertical className="w-4 h-4" /> Vertical
                                </button>
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
                    // Explicit sizing handled by ResizeObserver to maintain aspect ratio perfectly
                    width: layoutDims.width || '100%',
                    height: layoutDims.height || 'auto',
                    aspectRatio: `${canvasSize.width} / ${canvasSize.height}`,
                    cursor: drawingState.tool === ToolType.GRADIENT || drawingState.tool === ToolType.TRANSFORM ? 'crosshair' : 'default'
                }}
            >
                {/* Background Fill */}
                <div className="absolute inset-0 bg-white" />

                {/* Layers */}
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

                {/* Pending Texture Preview & Gizmo */}
                {pendingTexture && (
                    <>
                        <img 
                            src={pendingTexture}
                            alt="Preview"
                            className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none opacity-90 mix-blend-multiply" 
                            style={{
                                transform: `translate(${transform.x}px, ${transform.y}px) rotate(${transform.rotation}deg) scale(${transform.scaleX}, ${transform.scaleY})`,
                                transformOrigin: 'center'
                            }}
                        />
                        
                        <div 
                           className="absolute inset-0 w-full h-full select-none"
                           style={{
                                transform: `translate(${transform.x}px, ${transform.y}px) rotate(${transform.rotation}deg) scale(${transform.scaleX}, ${transform.scaleY})`,
                                transformOrigin: 'center'
                           }}
                        >
                             <div 
                                className="absolute inset-0 border-2 border-purple-500/80 shadow-2xl cursor-move hover:bg-purple-500/5 transition-colors"
                                onMouseDown={(e) => startTransform(e, 'move')}
                                onTouchStart={(e) => startTransform(e, 'move')}
                             ></div>
                             
                             {['nw', 'ne', 'sw', 'se'].map((pos) => (
                                <div
                                    key={pos}
                                    className={`absolute w-4 h-4 bg-white border-2 border-purple-600 rounded-full shadow-lg z-20 hover:scale-125 transition-transform ${
                                        pos === 'nw' ? '-top-2 -left-2 cursor-nw-resize' :
                                        pos === 'ne' ? '-top-2 -right-2 cursor-ne-resize' :
                                        pos === 'sw' ? '-bottom-2 -left-2 cursor-sw-resize' :
                                        '-bottom-2 -right-2 cursor-se-resize'
                                    }`}
                                    onMouseDown={(e) => startTransform(e, pos)}
                                    onTouchStart={(e) => startTransform(e, pos)}
                                ></div>
                             ))}
                             <div className="absolute top-1/2 -left-2 w-3 h-6 -mt-3 bg-white border border-purple-600 rounded cursor-w-resize z-10" onMouseDown={(e) => startTransform(e, 'w')} />
                             <div className="absolute top-1/2 -right-2 w-3 h-6 -mt-3 bg-white border border-purple-600 rounded cursor-e-resize z-10" onMouseDown={(e) => startTransform(e, 'e')} />
                             <div className="absolute left-1/2 -top-2 w-6 h-3 -ml-3 bg-white border border-purple-600 rounded cursor-n-resize z-10" onMouseDown={(e) => startTransform(e, 'n')} />
                             <div className="absolute left-1/2 -bottom-2 w-6 h-3 -ml-3 bg-white border border-purple-600 rounded cursor-s-resize z-10" onMouseDown={(e) => startTransform(e, 's')} />
                        </div>
                    </>
                )}

                {/* Template Wireframe */}
                {isTemplateLoaded && model.id !== 'license-plate' && (
                    <img 
                        src={templateUrl} 
                        alt="Template"
                        className="absolute inset-0 w-full h-full object-fill pointer-events-none opacity-60 mix-blend-multiply select-none" 
                    />
                )}
                
                {/* License Plate Guide */}
                {model.id === 'license-plate' && (
                    <div className="absolute inset-0 border-4 border-black/10 pointer-events-none rounded-lg z-10"></div>
                )}

                {/* SVG Overlays */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-50">
                    <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                    </marker>
                    </defs>

                    {/* Gradient Line */}
                    {isDrawing && drawingState.tool === ToolType.GRADIENT && gradientStart && currentDrag && (
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
                    )}

                    {/* Selection Box */}
                    {isDrawing && drawingState.tool === ToolType.TRANSFORM && selectionStart && selectionEnd && (
                         <rect 
                            x={Math.min(selectionStart.x, selectionEnd.x) / (layerCanvasRefs.current.get(activeLayerId)?.width || canvasSize.width) * 100 + '%'}
                            y={Math.min(selectionStart.y, selectionEnd.y) / (layerCanvasRefs.current.get(activeLayerId)?.height || canvasSize.height) * 100 + '%'}
                            width={Math.abs(selectionEnd.x - selectionStart.x) / (layerCanvasRefs.current.get(activeLayerId)?.width || canvasSize.width) * 100 + '%'}
                            height={Math.abs(selectionEnd.y - selectionStart.y) / (layerCanvasRefs.current.get(activeLayerId)?.height || canvasSize.height) * 100 + '%'}
                            fill="rgba(59, 130, 246, 0.1)"
                            stroke="#3b82f6"
                            strokeWidth="1"
                            strokeDasharray="4,4"
                            vectorEffect="non-scaling-stroke"
                         />
                    )}
                </svg>
            </div>
        </div>

        <LayerPanel 
            layers={layers}
            activeLayerId={activeLayerId}
            onLayerClick={setActiveLayerId}
            onToggleVisibility={toggleVisibility}
            onAddLayer={addLayer}
            onRemoveLayer={removeLayer}
            onMoveLayer={moveLayer}
            onUpdateOpacity={updateOpacity}
            onRenameLayer={renameLayer}
            isOpen={isLayerPanelOpen}
            onClose={onCloseLayerPanel}
        />
    </div>
  );
});

export default Editor;