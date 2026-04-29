import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { inventoryApi } from '../lib/inventoryApi';
import { enqueueMutation } from '../lib/offlineQueue';
import { useOfflineStore } from '../store/offlineStore';
import { useStoreStore } from '../store/useStoreStore';
import type { EnhancedStockBalanceResponse, WriteOffReason } from '../lib/types';
import { X, Trash2, AlertTriangle, MessageSquare, Package, Hash } from 'lucide-react';
import { cn } from '../lib/utils';

const schema = z.object({
  productId: z.string().min(1, 'Выберите товар'),
  quantity: z.number().positive('Количество должно быть больше 0').max(10000),
  reason: z.enum(['SPOILAGE', 'DAMAGE', 'INVENTORY_LOSS']),
  comment: z.string().max(500).optional(),
});

type FormData = z.infer<typeof schema>;

interface WriteOffModalProps {
  open: boolean;
  onClose: () => void;
  products: EnhancedStockBalanceResponse[];
  defaultProductId?: string;
  onSuccess?: () => void;
}

const reasonLabels: Record<WriteOffReason, string> = {
  SPOILAGE: 'Увядание / сгнил',
  DAMAGE: 'Поломка / повреждение',
  INVENTORY_LOSS: 'Недостача (инвентаризация)',
};

export function WriteOffModal({ open, onClose, products, defaultProductId, onSuccess }: WriteOffModalProps) {
  const isOnline = useOfflineStore((state) => state.isOnline);
  const storeId = useStoreStore((state) => state.currentStoreId);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      productId: defaultProductId ?? products[0]?.productId ?? '',
      quantity: 1,
      reason: 'SPOILAGE',
      comment: '',
    },
  });

  if (!open) return null;

  const submit = async (data: FormData) => {
    if (!storeId) {
      alert('Магазин не выбран');
      return;
    }
    if (isOnline) {
      await inventoryApi.writeOff({
        productId: data.productId,
        storeId: storeId,
        quantity: data.quantity,
        reason: data.reason,
        comment: data.comment,
      });
    } else {
      await enqueueMutation({
        type: 'write-off',
        payload: {
          productId: data.productId,
          storeId: storeId,
          quantity: data.quantity,
          reason: data.reason,
          comment: data.comment,
        },
      });
    }
    reset();
    onClose();
    onSuccess?.();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-neutral-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#F8F9FA] w-full max-w-2xl rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-500">
        
        {/* Header */}
        <div className="h-24 bg-white border-b border-neutral-100 flex items-center justify-between px-10 shrink-0">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-rose-200">
                 <Trash2 size={24} />
              </div>
              <div>
                 <h3 className="text-xl font-black text-neutral-900 tracking-tight">Списание товара</h3>
                 <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none mt-1">Оформление брака или порчи</p>
              </div>
           </div>
           <button 
             onClick={onClose}
             className="w-12 h-12 rounded-2xl bg-neutral-50 text-neutral-400 flex items-center justify-center hover:bg-neutral-100 transition-all active:scale-90"
           >
              <X size={24} />
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-10">
           <form id="write-off-form" onSubmit={handleSubmit(submit)} className="space-y-10">
              
              {/* Product */}
              <div className="space-y-4">
                 <label className="flex items-center gap-3 px-2 text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                    <Package size={14} /> Выберите товар
                 </label>
                 <select 
                   {...register('productId')}
                   className={cn(
                     "w-full h-20 bg-white border-2 border-neutral-100 rounded-[1.5rem] px-8 text-lg font-black outline-none focus:border-rose-500 transition-all appearance-none",
                     errors.productId && "border-rose-500"
                   )}
                 >
                   {products.map((product) => (
                     <option value={product.productId} key={product.productId}>
                       {product.name || product.productName}
                     </option>
                   ))}
                 </select>
                 {errors.productId && <p className="px-4 text-xs font-bold text-rose-500">{errors.productId.message as string}</p>}
              </div>

              <div className="grid grid-cols-2 gap-8">
                 {/* Quantity */}
                 <div className="space-y-4">
                    <label className="flex items-center gap-3 px-2 text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                       <Hash size={14} /> Количество
                    </label>
                    <input 
                      type="number"
                      {...register('quantity', { valueAsNumber: true })}
                      className="w-full h-20 bg-white border-2 border-neutral-100 rounded-[1.5rem] px-8 text-2xl font-black outline-none focus:border-rose-500 transition-all text-center tabular-nums"
                    />
                    {errors.quantity && <p className="px-4 text-xs font-bold text-rose-500">{errors.quantity.message as string}</p>}
                 </div>

                 {/* Reason */}
                 <div className="space-y-4">
                    <label className="flex items-center gap-3 px-2 text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                       <AlertTriangle size={14} /> Причина
                    </label>
                    <select 
                      {...register('reason')}
                      className="w-full h-20 bg-white border-2 border-neutral-100 rounded-[1.5rem] px-8 text-sm font-black outline-none focus:border-rose-500 transition-all appearance-none"
                    >
                      {Object.entries(reasonLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                 </div>
              </div>

              {/* Comment */}
              <div className="space-y-4">
                 <label className="flex items-center gap-3 px-2 text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                    <MessageSquare size={14} /> Комментарий
                 </label>
                 <textarea 
                   {...register('comment')}
                   rows={3}
                   className="w-full bg-white border-2 border-neutral-100 rounded-[1.5rem] p-8 text-lg font-bold outline-none focus:border-rose-500 transition-all resize-none"
                   placeholder="Напишите подробности (например, номер накладной)..."
                 />
              </div>
           </form>
        </div>

        {/* Actions */}
        <div className="h-32 bg-white border-t border-neutral-100 px-10 flex items-center gap-6 shrink-0">
           <button 
             type="button" 
             onClick={onClose}
             className="flex-1 h-20 rounded-[2rem] bg-neutral-50 text-neutral-400 text-sm font-black uppercase tracking-widest hover:bg-neutral-100 transition-all active:scale-95"
           >
              Отмена
           </button>
           <button 
             form="write-off-form"
             type="submit" 
             disabled={isSubmitting}
             className="flex-[2] h-20 rounded-[2rem] bg-rose-500 text-white text-sm font-black uppercase tracking-widest shadow-2xl shadow-rose-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
           >
              {isSubmitting ? <Hash size={24} className="animate-spin text-white/50" /> : <Trash2 size={24} />}
              <span>{isSubmitting ? 'Сохраняем...' : isOnline ? 'Завершить списание' : 'Сохранить офлайн'}</span>
           </button>
        </div>
      </div>
    </div>
  );
}
