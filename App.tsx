import React, { useState, useCallback, useRef } from 'react';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import Editor from './components/Editor';
import { CAR_MODELS } from './constants';
import { CarModel, DrawingState, ToolType } from './types';

const App: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<CarModel>(CAR_MODELS[0]);
  const [drawingState, setDrawingState] = useState<DrawingState>({
    color: '#FF0000',
    brushSize: 10,
    tool: ToolType.BRUSH,
    opacity: 1,
  });
  const [textureToApply, setTextureToApply] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleStateChange = (updates: Partial<DrawingState>) => {
    setDrawingState(prev => ({ ...prev, ...updates }));
  };

  const handleClearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear to white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Create a temporary link
    const link = document.createElement('a');
    link.download = `tesla-wrap-${selectedModel.id}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [selectedModel]);

  const handleCanvasRef = (canvas: HTMLCanvasElement | null) => {
    canvasRef.current = canvas;
  };

  const handleApplyTexture = (texture: string) => {
    setTextureToApply(texture);
  };

  const handleTextureApplied = () => {
    setTextureToApply(null);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-white">
      <Header 
        selectedModel={selectedModel} 
        onSelectModel={setSelectedModel}
        onDownload={handleDownload}
      />
      
      <main className="flex-1 flex overflow-hidden">
        <Toolbar 
          state={drawingState} 
          selectedModel={selectedModel}
          onChange={handleStateChange}
          onClear={handleClearCanvas}
          onApplyTexture={handleApplyTexture}
        />
        
        <Editor 
          model={selectedModel}
          drawingState={drawingState}
          onCanvasRef={handleCanvasRef}
          textureToApply={textureToApply}
          onTextureApplied={handleTextureApplied}
        />
      </main>
    </div>
  );
};

export default App;