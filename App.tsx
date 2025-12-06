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
    secondaryColor: '#0000FF',
    gradientType: 'linear',
    brushSize: 10,
    tool: ToolType.BRUSH,
    opacity: 1,
  });
  const [textureToApply, setTextureToApply] = useState<string | null>(null);

  // Function ref to get data from Editor (since we now have multiple layers)
  const getCompositeDataRef = useRef<() => string | undefined>(() => undefined);

  const handleStateChange = (updates: Partial<DrawingState>) => {
    setDrawingState(prev => ({ ...prev, ...updates }));
  };

  const handleClearCanvas = useCallback(() => {
     // A full clear is now a reload to reset the complexity of layers
     if (window.confirm("This will reset all layers and clear the workspace. Continue?")) {
         window.location.reload(); 
     }
  }, []);

  const handleDownload = useCallback(() => {
    const dataUrl = getCompositeDataRef.current();
    if (!dataUrl) {
        alert("Canvas not ready");
        return;
    }
    
    // Create a temporary link
    const link = document.createElement('a');
    link.download = `tesla-wrap-${selectedModel.id}-${Date.now()}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [selectedModel]);

  const handleApplyTexture = (texture: string) => {
    setTextureToApply(texture);
  };

  const handleTextureApplied = () => {
    setTextureToApply(null);
  };

  // Wrapper for Toolbar to get data (passed to AI for context)
  const getCanvasData = useCallback((): string | undefined => {
    return getCompositeDataRef.current();
  }, []);

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
          getCanvasData={getCanvasData}
        />
        
        <Editor 
          model={selectedModel}
          drawingState={drawingState}
          textureToApply={textureToApply}
          onTextureApplied={handleTextureApplied}
          onCompositeRequest={(fn) => { getCompositeDataRef.current = fn; }}
        />
      </main>
    </div>
  );
};

export default App;