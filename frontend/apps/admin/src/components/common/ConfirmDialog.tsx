import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  isDestructive = true,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <div className="p-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             {isDestructive && (
                <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                   <AlertTriangle size={18} />
                </div>
             )}
             <h2 className={cn("text-xl font-black tracking-tight", isDestructive ? "text-red-900" : "text-neutral-900")}>
               {title}
             </h2>
          </div>
          <button 
             onClick={onClose} 
             className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-all text-neutral-400 hover:text-neutral-900"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-8 pb-8 space-y-8">
          <p className="text-sm font-bold text-neutral-500 leading-relaxed pl-1">
             {message}
          </p>

          <div className="flex gap-4">
             <button 
               onClick={onConfirm}
               className={cn(
                  "flex-1 h-14 text-white rounded-2xl font-bold text-sm tracking-wider transition-all shadow-lg",
                  isDestructive 
                    ? "bg-red-600 hover:bg-red-700 shadow-red-600/20" 
                    : "bg-neutral-900 hover:bg-black shadow-black/10"
               )}
             >
               {confirmText}
             </button>
             <button 
               onClick={onClose}
               className="flex-1 h-14 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 rounded-2xl font-bold text-sm tracking-wider transition-all"
             >
               {cancelText}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
