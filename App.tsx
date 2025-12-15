import React, { useState, useCallback, useRef, useEffect } from 'react';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import Editor from './components/Editor';
import ThreeDViewer from './components/ThreeDViewer';
import ApiKeyModal from './components/ApiKeyModal';
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
    fontFamily: 'Inter',
    fontSize: 40,
    isBold: false,
    isItalic: false,
    hasShadow: false,
    shadowColor: '#000000',
    shadowBlur: 5
  });
  const [textureToApply, setTextureToApply] = useState<string | null>(null);
  
  // API Key & Modal State
  const [apiKey, setApiKey] = useState('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // 3D Preview State
  const [show3D, setShow3D] = useState(false);
  const [previewTexture, setPreviewTexture] = useState<string | null>(null);

  // Mobile Menu States
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isLayersOpen, setIsLayersOpen] = useState(false);

  // Ref to access editor methods
  const editorRef = useRef<EditorHandle>(null);

  // Load API Key on Mount
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
    setIsApiKeyModalOpen(false);
  };

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
    
    if (selectedModel.id === 'license-plate') {
        // Tesla License Plate requirements: Max 32 chars, alphanumeric only (roughly)
        // We use a short timestamp to ensure uniqueness and compliance
        const shortId = Date.now().toString().slice(-6);
        link.download = `Plate_${shortId}.png`;
    } else {
        link.download = `tesla-wrap-${selectedModel.id}-${Date.now()}.png`;
    }

    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [selectedModel]);

  const handleOpen3D = useCallback(() => {
    const dataUrl = editorRef.current?.getCompositeData();
    if (dataUrl) {
        setPreviewTexture(dataUrl);
        setShow3D(true);
    } else {
        alert("Canvas is not ready yet.");
    }
  }, []);

  const handleApplyTexture = (texture: string) => {
    setTextureToApply(texture);
  };

  const handleTextureApplied = () => {
    setTextureToApply(null);
  };

  // Wrapper for Toolbar to get data (passed to AI for context)
  const getCanvasData = useCallback((): string | undefined => {
    return editorRef.current?.getCompositeData();
  }, []);

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-white">
      <Header 
        selectedModel={selectedModel} 
        onSelectModel={setSelectedModel}
        onDownload={handleDownload}
        onOpen3D={handleOpen3D}
        onToggleTools={() => setIsToolsOpen(!isToolsOpen)}
        onToggleLayers={() => setIsLayersOpen(!isLayersOpen)}
      />
      
      <main className="flex-1 flex overflow-hidden relative">
        <Toolbar 
          state={drawingState} 
          selectedModel={selectedModel}
          onChange={handleStateChange}
          onClear={handleClearCanvas}
          onApplyTexture={handleApplyTexture}
          getCanvasData={getCanvasData}
          apiKey={apiKey}
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          isOpen={isToolsOpen}
          onClose={() => setIsToolsOpen(false)}
        />
        
        <Editor 
          ref={editorRef}
          model={selectedModel}
          drawingState={drawingState}
          textureToApply={textureToApply}
          onTextureApplied={handleTextureApplied}
          isLayerPanelOpen={isLayersOpen}
          onCloseLayerPanel={() => setIsLayersOpen(false)}
        />
      </main>

      {/* 3D Modal Overlay */}
      {show3D && (
        <ThreeDViewer 
            model={selectedModel}
            textureData={previewTexture}
            onClose={() => setShow3D(false)}
        />
      )}

      {/* API Key Modal */}
      <ApiKeyModal 
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={handleSaveApiKey}
        initialKey={apiKey}
      />
    </div>
  );
};

export default App;