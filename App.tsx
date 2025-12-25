
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import Editor from './components/Editor';
import ThreeDViewer from './components/ThreeDViewer';
import ApiKeyModal from './components/ApiKeyModal';
import Gallery from './components/Gallery';
import UploadModal from './components/UploadModal';
import AuthModal from './components/AuthModal';
import { CAR_MODELS } from './constants';
import { CarModel, DrawingState, ToolType, EditorHandle, GalleryItem } from './types';
import { supabase, fetchWraps, uploadWrapToSupabase, getUserFavorites, toggleFavoriteInDb, deleteWrap } from './services/supabase';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'editor' | 'gallery'>('editor');

  // Initialize from localStorage if available
  const [selectedModel, setSelectedModel] = useState<CarModel>(() => {
    try {
        const savedId = localStorage.getItem('tesla_wrap_last_model');
        if (savedId) {
            const found = CAR_MODELS.find(m => m.id === savedId);
            if (found) return found;
        }
    } catch (e) {
        console.warn("Failed to retrieve saved model preference", e);
    }
    return CAR_MODELS[0];
  });

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
  const [previewModel, setPreviewModel] = useState<CarModel | null>(null);

  // Gallery, Upload & Auth State
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [likedWraps, setLikedWraps] = useState<Set<string>>(new Set());
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadImageBlob, setUploadImageBlob] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  // Mobile Menu States
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isLayersOpen, setIsLayersOpen] = useState(false);

  // Ref to access editor methods
  const editorRef = useRef<EditorHandle>(null);

  // Initial Data Load & Auth Check
  useEffect(() => {
    // 1. Check Auth Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // 2. Load API Key
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) setApiKey(savedKey);

    // 3. Fetch Gallery Data (Supabase)
    fetchWraps().then(wraps => {
      setGalleryItems(wraps);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Favorites when session is active
  useEffect(() => {
    if (session) {
      getUserFavorites(session.user.id).then(ids => {
        setLikedWraps(new Set(ids));
      });
    } else {
      setLikedWraps(new Set());
    }
  }, [session]);

  // Persist Model Selection
  useEffect(() => {
    localStorage.setItem('tesla_wrap_last_model', selectedModel.id);
  }, [selectedModel.id]);

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
    const link = document.createElement('a');
    if (selectedModel.id === 'license-plate') {
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
        setPreviewModel(selectedModel);
        setShow3D(true);
    } else {
        alert("Canvas is not ready yet.");
    }
  }, [selectedModel]);

  const handleApplyTexture = (texture: string) => {
    setTextureToApply(texture);
  };

  const handleImportWrap = (base64: string) => {
    setTextureToApply(base64);
  };

  const handleTextureApplied = () => {
    setTextureToApply(null);
  };

  // Wrapper for Toolbar to get data (passed to AI for context)
  const getCanvasData = useCallback((): string | undefined => {
    return editorRef.current?.getCompositeData();
  }, []);

  // --- Gallery Handlers ---

  const handleRemix = (item: GalleryItem) => {
      const model = CAR_MODELS.find(m => m.id === item.carModelId);
      if (model) {
          setSelectedModel(model);
          setTextureToApply(item.imageUrl);
          setCurrentView('editor');
      } else {
          alert("Car model for this item not found.");
      }
  };

  const handleGalleryPreview3D = (item: GalleryItem) => {
      const model = CAR_MODELS.find(m => m.id === item.carModelId);
      if (model) {
          setPreviewModel(model);
          setPreviewTexture(item.imageUrl);
          setShow3D(true);
      }
  };

  // Auth Guard Helper
  const requireAuth = (action: () => void) => {
    if (session) {
      action();
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleShareFromEditor = () => {
    const data = editorRef.current?.getCompositeData();
    if (data) {
        setUploadImageBlob(data);
        requireAuth(() => setIsUploadModalOpen(true));
    } else {
        alert("Canvas is empty or not ready.");
    }
  };

  const handleOpenUploadModal = () => {
      setUploadImageBlob(null);
      requireAuth(() => setIsUploadModalOpen(true));
  };

  const handleUploadSubmit = async (data: { title: string; author: string; tags: string[]; carModelId: string; image: string }) => {
    if (!session) return;
    
    try {
        const newItem = await uploadWrapToSupabase(data.image, {
            ...data,
            userId: session.user.id
        });

        if (newItem) {
            setGalleryItems(prev => [newItem, ...prev]);
            setCurrentView('gallery');
            alert("Design published successfully!");
        }
    } catch (e: any) {
        alert("Failed to upload: " + e.message);
    }
  };

  const handleDeleteWrap = async (item: GalleryItem) => {
      if (!session || session.user.id !== item.userId) return;

      if (!window.confirm("Are you sure you want to delete this design? This action cannot be undone.")) {
          return;
      }

      try {
          await deleteWrap(item.id, item.imageUrl);
          setGalleryItems(prev => prev.filter(i => i.id !== item.id));
      } catch (e: any) {
          alert("Failed to delete wrap: " + e.message);
      }
  };

  const handleToggleLike = async (item: GalleryItem) => {
    if (!session) {
        setIsAuthModalOpen(true);
        return;
    }

    const isLiked = likedWraps.has(item.id);
    
    // Optimistic Update: Local State
    const newSet = new Set(likedWraps);
    if (isLiked) newSet.delete(item.id);
    else newSet.add(item.id);
    setLikedWraps(newSet);

    // Optimistic Update: Gallery Items Count
    setGalleryItems(prev => prev.map(g => {
        if (g.id === item.id) {
            return { ...g, likes: Math.max(0, g.likes + (isLiked ? -1 : 1)) };
        }
        return g;
    }));

    try {
        const result = await toggleFavoriteInDb(session.user.id, item.id);
        
        // Re-sync with server truth (fixes potential race conditions)
        setGalleryItems(prev => prev.map(g => {
            if (g.id === item.id) {
                return { ...g, likes: result.newCount };
            }
            return g;
        }));
    } catch (e) {
        console.error("Like failed", e);
        // Revert on error
        setLikedWraps(likedWraps);
        setGalleryItems(prev => prev.map(g => {
            if (g.id === item.id) {
                return { ...g, likes: item.likes };
            }
            return g;
        }));
        alert("Failed to update like. Please try again.");
    }
  };

  const handleSignOut = async () => {
      await supabase.auth.signOut();
      setLikedWraps(new Set());
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-white">
      <Header 
        currentView={currentView}
        onChangeView={setCurrentView}
        selectedModel={selectedModel} 
        onSelectModel={setSelectedModel}
        onDownload={handleDownload}
        onImportWrap={handleImportWrap}
        onOpen3D={handleOpen3D}
        onToggleTools={() => setIsToolsOpen(!isToolsOpen)}
        onToggleLayers={() => setIsLayersOpen(!isLayersOpen)}
        onShare={handleShareFromEditor}
        onUpload={handleOpenUploadModal}
        session={session}
        onAuth={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
      />
      
      <main className="flex-1 flex overflow-hidden relative">
        {currentView === 'editor' ? (
            <>
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
            </>
        ) : (
            <Gallery 
                items={galleryItems}
                onRemix={handleRemix}
                onPreview3D={handleGalleryPreview3D}
                onUpload={handleOpenUploadModal}
                likedItemIds={likedWraps}
                onToggleLike={handleToggleLike}
                isLoggedIn={!!session}
                currentUserId={session?.user.id}
                onDelete={handleDeleteWrap}
            />
        )}
      </main>

      {/* 3D Modal Overlay */}
      {show3D && previewModel && (
        <ThreeDViewer 
            model={previewModel}
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

      {/* Upload Modal */}
      <UploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        initialImage={uploadImageBlob}
        initialModelId={currentView === 'editor' ? selectedModel.id : undefined}
        onSubmit={handleUploadSubmit}
      />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
            // If user logged in while upload modal was pending, we could reopen it, 
            // but for simplicity we just let them click share again.
        }}
      />
    </div>
  );
};

export default App;
