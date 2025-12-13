import React, { useState, useEffect } from 'react';
import { Key, X, Check, ExternalLink, Lock } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  initialKey: string;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, initialKey }) => {
  const [tempKey, setTempKey] = useState('');

  useEffect(() => {
    setTempKey(initialKey);
  }, [initialKey, isOpen]);

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
               To generate custom AI textures, this app requires a <strong>Google Gemini API Key</strong>. The key is stored locally in your browser and is never sent to our servers.
             </p>
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