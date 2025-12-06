import React, { useRef, useEffect, useState } from 'react';
import { CarModel, DrawingState, Point, ToolType } from '../types';
import { GITHUB_BASE_URL } from '../constants';
import { Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface EditorProps {
  model: CarModel;
  drawingState: DrawingState;
  onCanvasRef: (canvas: HTMLCanvasElement | null) => void;
  textureToApply: string | null;
  onTextureApplied: () => void;
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

  // Construct URLs
  const templateUrl = `${GITHUB_BASE_URL}/${model.folderName}/template.png`;
  const referenceUrl = `${GITHUB_BASE_URL}/${model.folderName}/vehicle_image.png`;

  // Initialize Canvas & Template
  useEffect(() => {
    setIsTemplateLoaded(false);
    setTemplateError(false);
    setReferenceError(false);

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

  // Handle Texture Application from AI or Examples
  useEffect(() => {
    if (textureToApply && canvasRef.current && isTemplateLoaded) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      // Important for exporting the canvas if the image comes from an external URL
      img.crossOrigin = "anonymous"; 
      
      img.onload = () => {
        // Draw the texture over the whole canvas
        const prevComposite = ctx.globalCompositeOperation;
        ctx.globalCompositeOperation = 'source-over';
        
        // Draw image stretched to fit (simplest for now)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Restore
        ctx.globalCompositeOperation = prevComposite;
        onTextureApplied();
      };
      img.onerror = () => {
        console.error("Failed to load applied texture");
        onTextureApplied(); // Reset state anyway
      };
      
      // Append a timestamp to avoid CORS issues with cached non-CORS images
      // if the URL is from the example list (GitHub). 
      // Base64 URLs won't be affected by this logic significantly or are safe.
      const src = textureToApply.startsWith('data:') 
        ? textureToApply 
        : `${textureToApply}?t=${Date.now()}`;
        
      img.src = src;
    }
  }, [textureToApply, isTemplateLoaded, onTextureApplied]);


  const initCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;

    // Set canvas dimensions to match image natural size for high quality
    // We will scale it down with CSS
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
    e.preventDefault(); // Prevent scrolling on touch
    setIsDrawing(true);
    const point = getPoint(e);
    setLastPoint(point);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !lastPoint) return;
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

        {/* Template Overlay (Wireframe) */}
        {/* pointer-events-none allows drawing 'through' the wireframe */}
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