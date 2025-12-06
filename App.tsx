import React, { useState, useCallback, useRef } from 'react';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import Editor from './components/Editor';
import { CAR_MODELS } from './constants';
import { CarModel, DrawingState, ToolType, EditorHandle } from './types';

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

  // Ref to access editor methods
  const editorRef = useRef<EditorHandle>(null);

  const handleStateChange = (updates: Partial<DrawingState>) => {
    setDrawingState(prev => ({ ...prev, ...updates }));
  };

  const handleClearCanvas = useCallback(() => {
     if (window.confirm("Are you sure you want to clear the active layer?")) {
         editorRef.current?.clearLayer();
     }
  }, []);

  const handleDownload = useCallback(() => {
    const dataUrl = editorRef.current?.getCompositeData();
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
    // Use the ref directly instead of a separate callback ref
    return editorRef.current?.getCompositeData();
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
          ref={editorRef}
          model={selectedModel}
          drawingState={drawingState}
          textureToApply={textureToApply}
          onTextureApplied={handleTextureApplied}
        />
      </main>
    </div>
  );
};

export default App;