
import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Loader2, Check, Share2, Link, FileText, Twitter, Github } from 'lucide-react';
import { CarModel, GalleryItem } from '../types';
import { CAR_MODELS } from '../constants';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialImage?: string | null;
  initialModelId?: string;
  onSubmit: (data: { title: string; author: string; tags: string[]; carModelId: string; image: string }) => Promise<void>;
}

type UploadStep = 'edit' | 'uploading' | 'success';

const UploadModal: React.FC<UploadModalProps> = ({ 
  isOpen, 
  onClose, 
  initialImage, 
  initialModelId, 
  onSubmit 
}) => {
  const [step, setStep] = useState<UploadStep>('edit');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [tags, setTags] = useState('');
  const [selectedModelId, setSelectedModelId] = useState(initialModelId || CAR_MODELS[1].id); // Default to Cybertruck if none provided
  const [image, setImage] = useState<string | null>(initialImage || null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialImage) setImage(initialImage);
      if (initialModelId) setSelectedModelId(initialModelId);
      setTitle('');
      setAuthor('');
      setTags('');
      setStep('edit');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !title || !author) return;

    setStep('uploading');
    
    try {
        await onSubmit({
            title,
            author,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            carModelId: selectedModelId,
            image
        });
        setStep('success');
    } catch (e) {
        console.error("Upload failed", e);
        setStep('edit'); // Or error state
    }
  };

  const handleShareTwitter = () => {
    const text = `Check out this custom Tesla wrap I designed! " ${title} " by ${author}. Create your own for free here:`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent('https://tesla-wrap.mrproper.dev')}`;
    window.open(url, '_blank');
  };

  const handleShareReddit = () => {
    const url = `https://www.reddit.com/submit?url=${encodeURIComponent('https://tesla-wrap.mrproper.dev')}&title=${encodeURIComponent(`Custom Tesla Wrap: ${title}`)}`;
    window.open(url, '_blank');
  };

  const handleCopyLink = () => {
      navigator.clipboard.writeText('https://tesla-wrap.mrproper.dev');
      alert("Link copied to clipboard!");
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
               {step === 'edit' && (
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg"
                >
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-white flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Change Image
                    </div>
                </button>
               )}
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

        {/* Right: Form or Success */}
        <div className="w-full md:w-1/2 flex flex-col relative">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">
                    {step === 'success' ? 'Published Successfully!' : 'Share Design'}
                </h2>
                <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>
            
            {step === 'success' ? (
                <div className="p-8 flex flex-col items-center justify-center h-full space-y-6 text-center animate-in fade-in slide-in-from-right-8">
                     <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20 mb-2">
                         <Check className="w-8 h-8 text-green-500" />
                     </div>
                     <div>
                        <h3 className="text-2xl font-bold text-white mb-2">You're Live!</h3>
                        <p className="text-zinc-400">Your design is now available in the public gallery. Share it with the community to get downloads.</p>
                     </div>

                     <div className="w-full space-y-3">
                         <button onClick={handleShareTwitter} className="w-full py-3 bg-[#1DA1F2] hover:bg-[#1a91da] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-900/20">
                             <Twitter className="w-5 h-5 fill-current" /> Share on X / Twitter
                         </button>
                         <button onClick={handleShareReddit} className="w-full py-3 bg-[#FF4500] hover:bg-[#e03d00] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-orange-900/20">
                             <Share2 className="w-5 h-5" /> Share on Reddit
                         </button>
                         <button onClick={handleCopyLink} className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                             <Link className="w-5 h-5" /> Copy Link
                         </button>
                     </div>
                     
                     <div className="pt-4 w-full">
                        <button onClick={onClose} className="text-sm text-zinc-500 hover:text-white underline decoration-zinc-700 underline-offset-4">
                            Close and return to gallery
                        </button>
                     </div>
                </div>
            ) : (
                <>
                    <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Design Title</label>
                            <input 
                                type="text" 
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Cyberpunk Neon Glitch"
                                disabled={step === 'uploading'}
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all disabled:opacity-50"
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
                                disabled={step === 'uploading'}
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all disabled:opacity-50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Car Model</label>
                            <select 
                                value={selectedModelId}
                                onChange={(e) => setSelectedModelId(e.target.value)}
                                disabled={step === 'uploading'}
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all appearance-none disabled:opacity-50"
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
                                disabled={step === 'uploading'}
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all disabled:opacity-50"
                            />
                            <p className="text-[10px] text-zinc-500">Comma separated keywords</p>
                        </div>
                    </form>

                    <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-3">
                        <button 
                            type="button"
                            onClick={onClose}
                            disabled={step === 'uploading'}
                            className="px-5 py-2 text-zinc-400 hover:text-white font-medium transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSubmit}
                            disabled={step === 'uploading' || !image || !title || !author}
                            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-500 hover:to-red-500 text-white font-medium rounded-lg shadow-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                        >
                            {step === 'uploading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            {step === 'uploading' ? 'Publishing...' : 'Publish Design'}
                        </button>
                    </div>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
