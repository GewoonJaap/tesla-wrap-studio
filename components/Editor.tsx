import React, { useRef, useEffect, useState } from 'react';
import { CarModel, DrawingState, Point, ToolType } from '../types';
import { GITHUB_BASE_URL } from '../constants';
import { Loader2, Eye, EyeOff } from 'lucide-react';

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
      img.src = textureToApply;
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
    <div className="flex-1 bg-zinc-950/50 relative overflow-hidden flex items-center justify-center p-8">
      
      {/* View Toggle */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
         <button 
           onClick={() => setShowReference(!showReference)}
           className="bg-zinc-800 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 hover:bg-zinc-700 transition border border-zinc-700 shadow-lg"
         >
           {showReference ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
           {showReference ? 'Hide Reference' : 'Show Reference'}
         </button>
      </div>

      {/* Loading State */}
      {!isTemplateLoaded && !templateError && (
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          <p>Loading template...</p>
        </div>
      )}

      {/* Error State */}
      {templateError && (
        <div className="text-red-400 bg-red-950/30 p-4 rounded-lg border border-red-900">
          <p>Error loading template for {model.name}.</p>
          <p className="text-xs mt-1 opacity-70">Check internet connection or GitHub availability.</p>
        </div>
      )}

      {/* Main Workspace */}
      <div 
        ref={containerRef}
        className={`relative shadow-2xl transition-opacity duration-500 ${isTemplateLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ 
          maxWidth: '100%', 
          maxHeight: '100%',
          aspectRatio: templateImgRef.current ? `${templateImgRef.current.naturalWidth}/${templateImgRef.current.naturalHeight}` : 'auto' 
        }}
      >
        
        {/* Reference Image (Underlay - optional view) */}
        {showReference && !referenceError && (
             <img 
               src={referenceUrl} 
               alt="Reference" 
               className="absolute inset-0 w-full h-full object-contain pointer-events-none z-50 bg-black/80"
               onError={() => setReferenceError(true)}
             />
        )}

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
        {/* We use pointer-events-none so we can draw 'through' the wireframe */}
        {isTemplateLoaded && (
            <img 
                src={templateUrl} 
                alt="Template"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-60 mix-blend-multiply" 
            />
        )}
      </div>
    </div>
  );
};

export default Editor;