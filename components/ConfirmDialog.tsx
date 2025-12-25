
import React from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'default' | 'success';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden transform transition-all">
        
        <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
                {variant === 'danger' && (
                    <div className="p-3 bg-red-500/10 rounded-full shrink-0">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                )}
                 {variant === 'default' && (
                    <div className="p-3 bg-zinc-800 rounded-full shrink-0">
                         <Info className="w-6 h-6 text-zinc-400" />
                    </div>
                )}
                {variant === 'success' && (
                    <div className="p-3 bg-green-500/10 rounded-full shrink-0">
                         <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </div>
                )}
                <h3 className="text-lg font-bold text-white leading-tight">{title}</h3>
            </div>
            
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                {message}
            </p>

            <div className="flex gap-3 justify-end">
                <button 
                    onClick={onCancel}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                    {cancelLabel}
                </button>
                <button 
                    onClick={onConfirm}
                    className={`px-4 py-2 rounded-lg text-sm font-medium text-white shadow-lg transition-all active:scale-95 ${
                        variant === 'danger' 
                        ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20' 
                        : 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/20'
                    }`}
                >
                    {confirmLabel}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
