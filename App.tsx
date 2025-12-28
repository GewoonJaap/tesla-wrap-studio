
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import Editor from './components/Editor';
import ThreeDViewer from './components/ThreeDViewer';
import ApiKeyModal from './components/ApiKeyModal';
import Gallery from './components/Gallery';
import HomePage from './components/HomePage';
import UploadModal from './components/UploadModal';
import AuthModal from './components/AuthModal';
import ConfirmDialog from './components/ConfirmDialog';
import Footer from './components/Footer';
import FaqPage from './components/FaqPage';
import GuidePage from './components/GuidePage';
import AboutPage from './components/AboutPage';
import { CAR_MODELS } from './constants';
import { CarModel, DrawingState, ToolType, EditorHandle, GalleryItem } from './types';
import { supabase, fetchWraps, uploadWrapToSupabase, getUserFavorites, toggleFavoriteInDb, deleteWrap } from './services/supabase';
import { processAndDownloadImage } from './services/imageUtils';

type ViewState = 'home' | 'editor' | 'gallery' | 'faq' | 'about' | 'guide';

const App: React.FC = () => {
  // --- Routing Logic ---
  const [currentView, setCurrentView] = useState<ViewState>(() => {
     if (typeof window !== 'undefined') {
         const path = window.location.pathname;
         if (path === '/editor') return 'editor';
         if (path === '/gallery') return 'gallery';
         if (path === '/faq') return 'faq';
         if (path === '/guide') return 'guide';
         if (path === '/about') return 'about';
         return 'home';
     }
     return 'home';
  });

  // Scroll Container Ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to top on view change
  useEffect(() => {
      if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo(0, 0);
      }
      window.scrollTo(0, 0);
  }, [currentView]);

  // Handle URL updates and History
  const navigate = useCallback((view: ViewState) => {
      setCurrentView(view);
      let path = '/';
      if (view === 'editor') path = '/editor';
      if (view === 'gallery') path = '/gallery';
      if (view === 'faq') path = '/faq';
      if (view === 'guide') path = '/guide';
      if (view === 'about') path = '/about';
      
      if (window.location.pathname !== path) {
          window.history.pushState(null, '', path);
      }
  }, []);

  // Listen for Back/Forward navigation
  useEffect(() => {
      const handlePopState = () => {
          const path = window.location.pathname;
          if (path === '/editor') setCurrentView('editor');
          else if (path === '/gallery') setCurrentView('gallery');
          else if (path === '/faq') setCurrentView('faq');
          else if (path === '/guide') setCurrentView('guide');
          else if (path === '/about') setCurrentView('about');
          else setCurrentView('home');
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update SEO Meta
  useEffect(() => {
      let title = 'Tesla Wrap Studio | Free Wrap Maker & Designer';
      let desc = 'The #1 Free Tesla Wrap Maker. Create, design, and download custom wraps for Cybertruck, Model 3, and Model Y. Compatible with the Tesla Holiday Update 2025.';

      if (currentView === 'editor') {
          title = 'Wrap Editor | Design Custom Tesla Wraps';
          desc = 'Powerful browser-based editor to design custom wraps for your Tesla Cybertruck, Model 3, and Model Y.';
      } else if (currentView === 'gallery') {
          title = 'Tesla Wrap Gallery | Free Custom Wraps Download';
          desc = 'Explore thousands of free custom Tesla wraps. Download unique designs for Cybertruck, Model 3, and Model Y created by the community.';
      } else if (currentView === 'faq') {
          title = 'FAQ | Tesla Wrap Studio';
          desc = 'Common questions about creating and downloading custom Tesla wraps.';
      } else if (currentView === 'guide') {
          title = 'How to Install Custom Tesla Wraps | Step-by-Step Guide';
          desc = 'Learn how to install custom wraps and license plates on your Tesla Model 3, Model Y, or Cybertruck using a USB drive. Updated for Holiday Update 2025.';
      } else if (currentView === 'about') {
          title = 'About Tesla Wrap Studio | The Best Free Wrap Creator';
          desc = 'About Tesla Wrap Studio. We provide the best free tools for Tesla owners to design, visualize, and share custom vehicle wraps.';
      }

      document.title = title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', desc);
  }, [currentView]);
  // ---------------------

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
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());

  // Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
      isOpen: boolean;
      title: string;
      message: string;
      variant: 'danger' | 'default' | 'success';
      confirmLabel?: string;
      showCancel?: boolean;
      onConfirm: () => void;
  }>({
      isOpen: false,
      title: '',
      message: '',
      variant: 'default',
      onConfirm: () => {},
  });

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
     setConfirmDialog({
         isOpen: true,
         title: 'Clear Active Layer',
         message: 'Are you sure you want to clear the active layer? This cannot be undone.',
         variant: 'danger',
         showCancel: true,
         confirmLabel: 'Clear',
         onConfirm: () => {
             editorRef.current?.clearLayer();
             setConfirmDialog(prev => ({ ...prev, isOpen: false }));
         }
     });
  }, []);

  const handleDownload = useCallback(async () => {
    const dataUrl = editorRef.current?.getCompositeData();
    if (!dataUrl) {
        alert("Canvas not ready");
        return;
    }

    setIsDownloading(true);
    try {
        let filename;
        let limit = 1000 * 1024; // 1MB default
        let maxDim = 1024; // 1024x1024 max for wraps

        // Short ID to ensure filename length < 30 chars
        const timestamp = Date.now().toString().slice(-6);
        
        if (selectedModel.id === 'license-plate') {
            filename = `Plate_${timestamp}`;
            limit = 500 * 1024; // 500KB for plates
            maxDim = 420;
        } else {
            // Map long IDs to short codes
            const modelMap: Record<string, string> = {
                'cybertruck': 'CT',
                'model3': 'M3',
                'model3-2024-perf': 'M3P',
                'model3-2024-base': 'M3',
                'modely': 'MY',
                'modely-2025-base': 'MY',
                'modely-2025-perf': 'MYP',
                'modely-2025-prem': 'MY',
                'modely-l': 'MYLR'
            };
            const shortCode = modelMap[selectedModel.id] || 'Tesla';
            filename = `Wrap_${shortCode}_${timestamp}`;
        }
        
        filename += '.png';

        await processAndDownloadImage(dataUrl, filename, limit, maxDim);

    } catch (e: any) {
        console.error("Download Error", e);
        setConfirmDialog({
            isOpen: true,
            title: 'Export Failed',
            message: "Failed to optimize image for export. Please try again.",
            variant: 'danger',
            showCancel: false,
            confirmLabel: 'Close',
            onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false }))
        });
    } finally {
        setIsDownloading(false);
    }
  }, [selectedModel]);

  const handleGalleryDownload = async (e: React.MouseEvent, item: GalleryItem) => {
      e.stopPropagation();
      if (downloadingIds.has(item.id)) return;

      setDownloadingIds(prev => {
          const next = new Set(prev);
          next.add(item.id);
          return next;
      });

      try {
          const response = await fetch(item.imageUrl, { mode: 'cors' });
          const blob = await response.blob();
          const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
          });

          const isPlate = item.carModelId === 'license-plate';
          const limit = isPlate ? 500 * 1024 : 1000 * 1024;
          const maxDim = isPlate ? 420 : 1024;
          
          const filename = `${item.title}.png`;
          await processAndDownloadImage(base64, filename, limit, maxDim);

          // Success State
          setDownloadedIds(prev => {
            const next = new Set(prev);
            next.add(item.id);
            return next;
          });

          // Reset success state after 3 seconds
          setTimeout(() => {
            setDownloadedIds(prev => {
              const next = new Set(prev);
              next.delete(item.id);
              return next;
            });
          }, 3000);

      } catch (e) {
          console.error("Download failed:", e);
          alert("Failed to process download. Please try again.");
      } finally {
          setDownloadingIds(prev => {
              const next = new Set(prev);
              next.delete(item.id);
              return next;
          });
      }
  };

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
    // If not already in editor, go there
    if (currentView !== 'editor') navigate('editor');
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
          navigate('editor');
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
    
    // We do NOT navigate here immediately, allowing the modal to show Success/Share state.
    // We let the modal call navigate or close after success if needed, but primarily we just update the list.
    
    try {
        const newItem = await uploadWrapToSupabase(data.image, {
            ...data,
            userId: session.user.id
        });

        if (newItem) {
            setGalleryItems(prev => [newItem, ...prev]);
        }
    } catch (e: any) {
        throw e; // Let the modal handle the error
    }
  };

  const handleDeleteWrap = (item: GalleryItem) => {
      if (!session || session.user.id !== item.userId) return;

      setConfirmDialog({
          isOpen: true,
          title: 'Delete Design',
          message: 'Are you sure you want to permanently delete this design? This action cannot be undone.',
          variant: 'danger',
          showCancel: true,
          confirmLabel: 'Delete',
          onConfirm: async () => {
              try {
                  await deleteWrap(item.id, item.imageUrl);
                  setGalleryItems(prev => prev.filter(i => i.id !== item.id));
                  setConfirmDialog(prev => ({ ...prev, isOpen: false }));
              } catch (e: any) {
                  setConfirmDialog({
                      isOpen: true,
                      title: 'Delete Failed',
                      message: e.message,
                      variant: 'danger',
                      showCancel: false,
                      confirmLabel: 'Close',
                      onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false }))
                  });
              }
          }
      });
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

  const renderContent = () => {
      switch (currentView) {
          case 'home':
             return (
                 <div ref={scrollContainerRef} className="h-full overflow-y-auto">
                    <HomePage 
                        onNavigate={navigate}
                        onSelectModel={setSelectedModel}
                        featuredWraps={galleryItems}
                        likedItemIds={likedWraps}
                        onToggleLike={handleToggleLike}
                        onPreview3D={handleGalleryPreview3D}
                        onRemix={handleRemix}
                        onDownload={handleGalleryDownload}
                        currentUserId={session?.user.id}
                        isDownloadingIds={downloadingIds}
                        downloadedIds={downloadedIds}
                    />
                    <Footer onNavigate={navigate} />
                 </div>
             );
          case 'editor':
              return (
                <div className="h-full flex flex-col relative overflow-hidden">
                    <div className="flex-1 flex overflow-hidden relative">
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
                            onOpen3D={handleOpen3D}
                        />
                    </div>
                </div>
              );
          case 'gallery':
              return (
                  <div ref={scrollContainerRef} className="h-full overflow-y-auto">
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
                        onAuth={() => setIsAuthModalOpen(true)}
                    />
                    <Footer onNavigate={navigate} />
                  </div>
              );
          case 'guide':
              return (
                  <div ref={scrollContainerRef} className="h-full overflow-y-auto">
                      <GuidePage />
                      <Footer onNavigate={navigate} />
                  </div>
              );
          case 'faq':
              return (
                  <div ref={scrollContainerRef} className="h-full overflow-y-auto">
                      <FaqPage />
                      <Footer onNavigate={navigate} />
                  </div>
              );
          case 'about':
              return (
                  <div ref={scrollContainerRef} className="h-full overflow-y-auto">
                      <AboutPage />
                      <Footer onNavigate={navigate} />
                  </div>
              );
          default:
              return null;
      }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-white">
      <Header 
        currentView={currentView}
        onChangeView={(view) => navigate(view)}
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
        isDownloading={isDownloading}
      />
      
      <main className="flex-1 overflow-hidden relative">
        {renderContent()}
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
        onClose={() => {
            setIsUploadModalOpen(false);
            // If we closed the modal while in Gallery view, we don't need to do anything else.
            // If in editor, maybe user wants to go to gallery? 
            // For now, let's just close.
        }}
        initialImage={uploadImageBlob}
        initialModelId={currentView === 'editor' ? selectedModel.id : undefined}
        onSubmit={handleUploadSubmit}
      />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {}}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog 
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        showCancel={confirmDialog.showCancel}
        confirmLabel={confirmDialog.confirmLabel}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default App;
