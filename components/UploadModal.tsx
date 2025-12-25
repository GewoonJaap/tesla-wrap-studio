
import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Loader2, Check } from 'lucide-react';
import { CarModel, GalleryItem } from '../types';
import { CAR_MODELS } from '../constants';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialImage?: string | null;
  initialModelId?: string;
  onSubmit: (data: { title: string; author: string; tags: string[]; carModelId: string; image: string }) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ 
  isOpen, 
  onClose, 
  initialImage, 
  initialModelId, 
  onSubmit 
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [tags, setTags] = useState('');
  const [selectedModelId, setSelectedModelId] = useState(initialModelId || CAR_MODELS[1].id); // Default to Cybertruck if none provided
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialImage) setImage(initialImage);
      if (initialModelId) setSelectedModelId(initialModelId);
      setTitle('');
      setAuthor('');
      setTags('');
      setIsSubmitting(false);
    }
  }, [isOpen, initialImage, initialModelId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setImage(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !title || !author) return;

    setIsSubmitting(true);
    
    // Simulate network delay for better UX
    setTimeout(() => {
      onSubmit({
        title,
        author,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        carModelId: selectedModelId,
        image
      });
      setIsSubmitting(false);
      onClose();
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh]">
        
        {/* Left: Image Preview */}
        <div className="w-full md:w-1/2 bg-zinc-950 p-6 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-zinc-800 relative min-h-[300px]">
          {image ? (
            <div className="relative w-full h-full flex items-center justify-center group">
               <img src={image} alt="Preview" className="max-w-full max-h-[400px] object-contain rounded-lg shadow-lg" />
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg"
               >
                 <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-white flex items-center gap-2">
                    <Upload className="w-4 h-4" /> Change Image
                 </div>
               </button>
            </div>
          ) : (
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full border-2 border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors bg-zinc-900/50 hover:bg-zinc-900"
            >
                <div className="p-4 bg-zinc-800 rounded-full">
                    <ImageIcon className="w-8 h-8 text-zinc-400" />
                </div>
                <div className="text-center">
                    <p className="text-zinc-300 font-medium">Click to upload design</p>
                    <p className="text-zinc-500 text-sm">PNG, JPG up to 5MB</p>
                </div>
            </div>
          )}
          <input 
             ref={fileInputRef}
             type="file" 
             accept="image/*"
             className="hidden"
             onChange={handleFileChange}
          />
        </div>

        {/* Right: Form */}
        <div className="w-full md:w-1/2 flex flex-col">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Share Design</h2>
                <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Design Title</label>
                    <input 
                        type="text" 
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Cyberpunk Neon Glitch"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Author Name</label>
                    <input 
                        type="text" 
                        required
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="e.g. ElonMuskFan"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Car Model</label>
                    <select 
                        value={selectedModelId}
                        onChange={(e) => setSelectedModelId(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all appearance-none"
                    >
                        {CAR_MODELS.map(model => (
                            <option key={model.id} value={model.id}>{model.name}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Tags (Optional)</label>
                    <input 
                        type="text" 
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="blue, matte, racing, futuristic..."
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                    />
                    <p className="text-[10px] text-zinc-500">Comma separated keywords</p>
                </div>
            </form>

            <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-3">
                <button 
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2 text-zinc-400 hover:text-white font-medium transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting || !image || !title || !author}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-500 hover:to-red-500 text-white font-medium rounded-lg shadow-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Publish Design
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
