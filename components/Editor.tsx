import React, { useRef, useEffect, useState } from 'react';
import { CarModel, DrawingState, Point, ToolType } from '../types';
import { GITHUB_BASE_URL } from '../constants';
import { Loader2, Eye, EyeOff, AlertCircle, Move, Check, X as XIcon, Maximize, ArrowLeftRight, ArrowUpDown } from 'lucide-react';

interface EditorProps {
  model: CarModel;
  drawingState: DrawingState;
  onCanvasRef: (canvas: HTMLCanvasElement | null) => void;
  textureToApply: string | null;
  onTextureApplied: () => void;
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
  onCanvasRef, 
  textureToApply,
  onTextureApplied 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const templateImgRef = useRef<HTMLImageElement | null>(null);
  
  const [isTemplateLoaded, setIsTemplateLoaded] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const [referenceError, setReferenceError] = useState(false);
  const [templateError, setTemplateError] = useState(false);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);

  // Texture Alignment State
  const [pendingTexture, setPendingTexture] = useState<string | null>(null);
  const [transform, setTransform] = useState<TransformState>({ x: 0, y: 0, scaleX: 1, scaleY: 1 });

  // Construct URLs
  const templateUrl = `${GITHUB_BASE_URL}/${model.folderName}/template.png`;
  const referenceUrl = `${GITHUB_BASE_URL}/${model.folderName}/vehicle_image.png`;

  // Initialize Canvas & Template
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
      initCanvas(img);
    };

    img.onerror = () => {
      setTemplateError(true);
      console.error(`Failed to load template from ${templateUrl}`);
    };

  }, [model]);

  // Handle incoming texture: Set as pending for alignment instead of applying immediately
  useEffect(() => {
    if (textureToApply && isTemplateLoaded) {
      setPendingTexture(textureToApply);
      setTransform({ x: 0, y: 0, scaleX: 1, scaleY: 1 });
      onTextureApplied(); // Clear parent state so we don't re-trigger
    }
  }, [textureToApply, isTemplateLoaded, onTextureApplied]);


  const initCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;

    // Set canvas dimensions to match image natural size for high quality
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill white background initially
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Pass ref back to parent
    onCanvasRef(canvas);
  };

  const applyPendingTexture = () => {
    if (!canvasRef.current || !pendingTexture || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = pendingTexture;
    
    img.onload = () => {
      // Calculate Mapping from Screen Pixels (CSS Transform) to Canvas Pixels
      const rect = containerRef.current!.getBoundingClientRect();
      const ratioX = canvas.width / rect.width;
      const ratioY = canvas.height / rect.height;

      // Calculate logic for centered transform
      const finalW = canvas.width * transform.scaleX;
      const finalH = canvas.height * transform.scaleY;
      
      const shiftX = transform.x * ratioX;
      const shiftY = transform.y * ratioY;

      const centerX = (canvas.width / 2) + shiftX;
      const centerY = (canvas.height / 2) + shiftY;

      const left = centerX - (finalW / 2);
      const top = centerY - (finalH / 2);

      // Draw onto canvas
      const prevComposite = ctx.globalCompositeOperation;
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(img, left, top, finalW, finalH);
      ctx.globalCompositeOperation = prevComposite;

      setPendingTexture(null);
    };
  };

  const cancelPendingTexture = () => {
    setPendingTexture(null);
  };

  // Drawing Logic
  const getPoint = (e: React.MouseEvent | React.TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
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
    if (pendingTexture) return; // Disable drawing while aligning
    e.preventDefault(); 
    setIsDrawing(true);
    const point = getPoint(e);
    setLastPoint(point);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !lastPoint || pendingTexture) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const currentPoint = getPoint(e);
    if (!currentPoint) return;

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

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPoint(null);
  };

  return (
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

      {/* Floating Reference Window */}
      {showReference && (
        <div className="absolute top-16 right-4 z-30 w-72 bg-zinc-900 rounded-xl border border-zinc-700 shadow-2xl overflow-hidden animate-in slide-in-from-right-4 fade-in duration-200">
           <div className="bg-zinc-800/50 px-3 py-2 border-b border-zinc-700 flex justify-between items-center">
             <span className="text-xs font-medium text-zinc-300">Vehicle Reference</span>
             <button onClick={() => setShowReference(false)} className="text-zinc-500 hover:text-white"><EyeOff className="w-3 h-3"/></button>
           </div>
           <div className="p-2 bg-zinc-950">
             {referenceError ? (
               <div className="h-32 flex flex-col items-center justify-center text-red-400 gap-2">
                 <AlertCircle className="w-6 h-6" />
                 <span className="text-xs">Image unavailable</span>
               </div>
             ) : (
               <img 
                  src={referenceUrl} 
                  alt="Reference" 
                  className="w-full h-auto rounded border border-zinc-800"
                  onError={() => setReferenceError(true)}
               />
             )}
           </div>
        </div>
      )}

      {/* Loading State */}
      {!isTemplateLoaded && !templateError && (
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          <p className="animate-pulse">Loading template...</p>
        </div>
      )}

      {/* Error State */}
      {templateError && (
        <div className="text-red-400 bg-red-950/20 p-6 rounded-xl border border-red-900/50 flex flex-col items-center gap-2 max-w-sm text-center">
          <AlertCircle className="w-8 h-8" />
          <p className="font-medium">Failed to load template</p>
          <p className="text-xs opacity-70">Could not fetch the template image for {model.name}. Please check your internet connection.</p>
        </div>
      )}

      {/* Alignment Tool Overlay */}
      {pendingTexture && (
        <div className="absolute bottom-6 z-50 animate-in slide-in-from-bottom-6 fade-in duration-300">
          <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 p-4 rounded-xl shadow-2xl w-80 ring-1 ring-black/50">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Move className="w-4 h-4 text-purple-400" /> Adjust Alignment
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={cancelPendingTexture} 
                  className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors"
                  title="Cancel"
                >
                  <XIcon className="w-4 h-4"/>
                </button>
                <button 
                  onClick={applyPendingTexture} 
                  className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-lg shadow-green-900/20 transition-colors"
                  title="Apply Texture"
                >
                  <Check className="w-4 h-4"/>
                </button>
              </div>
            </div>

            <div className="space-y-4">
               {/* Position Controls */}
               <div className="space-y-3">
                 <div className="flex items-center justify-between text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">
                    <span className="flex items-center gap-1"><Move className="w-3 h-3"/> Position</span>
                    <button 
                      onClick={() => setTransform(prev => ({ ...prev, x: 0, y: 0 }))}
                      className="hover:text-white cursor-pointer"
                    >Reset</button>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1">
                      <div className="flex justify-between text-xs text-zinc-400">
                        <span>X</span> <span className="font-mono text-zinc-500">{transform.x}px</span>
                      </div>
                      <input 
                        type="range" min="-300" max="300" 
                        value={transform.x} 
                        onChange={e => setTransform(p => ({...p, x: Number(e.target.value)}))}
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-ew-resize accent-purple-500"
                      />
                   </div>
                   <div className="space-y-1">
                      <div className="flex justify-between text-xs text-zinc-400">
                        <span>Y</span> <span className="font-mono text-zinc-500">{transform.y}px</span>
                      </div>
                      <input 
                        type="range" min="-300" max="300" 
                        value={transform.y} 
                        onChange={e => setTransform(p => ({...p, y: Number(e.target.value)}))}
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-ns-resize accent-purple-500"
                      />
                   </div>
                 </div>
               </div>

               {/* Scale Controls */}
               <div className="space-y-3 pt-2 border-t border-zinc-800">
                 <div className="flex items-center justify-between text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">
                    <span className="flex items-center gap-1"><Maximize className="w-3 h-3"/> Scale</span>
                    <button 
                      onClick={() => setTransform(prev => ({ ...prev, scaleX: 1, scaleY: 1 }))}
                      className="hover:text-white cursor-pointer"
                    >Reset</button>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1">
                      <div className="flex justify-between text-xs text-zinc-400">
                        <span className="flex items-center gap-1"><ArrowLeftRight className="w-3 h-3"/> Width</span> 
                        <span className="font-mono text-zinc-500">{transform.scaleX.toFixed(2)}x</span>
                      </div>
                      <input 
                        type="range" step="0.01" min="0.5" max="1.5" 
                        value={transform.scaleX} 
                        onChange={e => setTransform(p => ({...p, scaleX: Number(e.target.value)}))}
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-ew-resize accent-blue-500"
                      />
                   </div>
                   <div className="space-y-1">
                      <div className="flex justify-between text-xs text-zinc-400">
                        <span className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3"/> Height</span> 
                        <span className="font-mono text-zinc-500">{transform.scaleY.toFixed(2)}x</span>
                      </div>
                      <input 
                        type="range" step="0.01" min="0.5" max="1.5" 
                        value={transform.scaleY} 
                        onChange={e => setTransform(p => ({...p, scaleY: Number(e.target.value)}))}
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-ns-resize accent-blue-500"
                      />
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace */}
      <div 
        ref={containerRef}
        className={`relative shadow-2xl transition-all duration-500 ease-out ring-1 ring-zinc-800 ${isTemplateLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        style={{ 
          maxWidth: '100%', 
          maxHeight: '100%',
          aspectRatio: templateImgRef.current ? `${templateImgRef.current.naturalWidth}/${templateImgRef.current.naturalHeight}` : 'auto' 
        }}
      >
        
        {/* Drawing Canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="block w-full h-full cursor-crosshair bg-white"
        />

        {/* Pending Texture Preview Layer - Rendered BETWEEN Canvas and Wireframe */}
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

        {/* Template Overlay (Wireframe) */}
        {isTemplateLoaded && (
            <img 
                src={templateUrl} 
                alt="Template"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-60 mix-blend-multiply select-none" 
            />
        )}
      </div>
    </div>
  );
};

export default Editor;