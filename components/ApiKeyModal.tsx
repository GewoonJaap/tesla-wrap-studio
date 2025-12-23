import React, { useState, useEffect } from 'react';
import { Key, X, Check, ExternalLink, Lock, Sparkles } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  initialKey: string;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, initialKey }) => {
  const [tempKey, setTempKey] = useState('');
  const [hasAiStudio, setHasAiStudio] = useState(false);

  useEffect(() => {
    setTempKey(initialKey === 'AI_STUDIO_KEY' ? '' : initialKey);
    // Check if running in an environment with AI Studio integration
    setHasAiStudio(!!(window as any).aistudio);
  }, [initialKey, isOpen]);

  const handleAiStudioSelect = async () => {
    try {
        const aistudio = (window as any).aistudio;
        if (aistudio) {
            await aistudio.openSelectKey();
            // We use a placeholder to indicate the key is managed by the environment
            onSave('AI_STUDIO_KEY'); 
        }
    } catch (e) {
        console.error("Failed to open AI Studio key selector", e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
                <Key className="w-5 h-5 text-purple-500" />
            </div>
            API Configuration
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
             <p className="text-sm text-zinc-400 leading-relaxed">
               To generate custom AI textures, this app requires a <strong>Google Gemini API Key</strong>.
             </p>
          </div>
          
          {hasAiStudio && (
              <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-4 mb-4">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
                    Fast Setup
                  </h3>
                  <button
                    onClick={handleAiStudioSelect}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-medium rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                      <Sparkles className="w-4 h-4" />
                      Select Key via AI Studio
                  </button>
                  <p className="text-[10px] text-zinc-500 mt-2 text-center">
                      Uses the API key from your AI Studio session securely.
                  </p>
              </div>
          )}

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="flex-shrink-0 mx-4 text-xs text-zinc-600 font-medium">OR ENTER MANUALLY</span>
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
              Gemini API Key
            </label>
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-zinc-500 group-focus-within:text-purple-500 transition-colors" />
                </div>
                <input
                    type="password"
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="block w-full pl-10 pr-3 py-2.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all sm:text-sm font-mono"
                    autoFocus
                />
            </div>
            <div className="flex justify-end">
                <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-xs text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1"
                >
                    Get a free API key <ExternalLink className="w-3 h-3" />
                </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950/50 border-t border-zinc-800 flex justify-end gap-3">
            <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
                Cancel
            </button>
            <button
                onClick={() => onSave(tempKey)}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-purple-900/20 flex items-center gap-2 transition-all active:scale-95"
            >
                <Check className="w-4 h-4" />
                Save Key
            </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;