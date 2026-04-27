import { useState } from 'react'
import { X, Trash2, Loader2, AlertTriangle } from 'lucide-react'
import { InventoryService, InventoryItem } from '@/lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface WriteOffModalProps {
  item: InventoryItem
  storeId: string
  onClose: () => void
}

export function WriteOffModal({ item, storeId, onClose }: WriteOffModalProps) {
  const queryClient = useQueryClient()
  const [quantity, setQuantity] = useState(0)
  const [reason, setReason] = useState('SPOILAGE')
  const [comment, setComment] = useState('')
  const [docId, setDocId] = useState('')

  const mutation = useMutation({
    mutationFn: InventoryService.writeOff,
    onSuccess: () => {
      toast.success('Списание успешно оформлено')
      queryClient.invalidateQueries({ queryKey: ['inventory', storeId] })
      onClose()
    },
    onError: (err: any) => {
      toast.error('Ошибка: ' + (err.response?.data?.message || err.message))
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (quantity <= 0) {
        toast.error('Введите количество товара')
        return
    }
    if (quantity > (item.quantity ?? 0)) {
        toast.error('Недостаточно товара на складе')
        return
    }

    mutation.mutate({
      productId: item.productId!,
      storeId,
      quantity,
      reason: reason as "SPOILAGE" | "DAMAGE" | "INVENTORY_LOSS",
      comment,
      sourceDocumentId: docId
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-neutral-100 flex items-center justify-between bg-red-50/30">
          <div>
            <h2 className="text-xl font-black text-red-900 tracking-tight">Списание товара</h2>
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mt-1">{item.name}</p>
          </div>
          <button onClick={onClose} className="h-10 w-10 flex items-center justify-center rounded-2xl hover:bg-white transition-all text-neutral-400 hover:text-red-600 shadow-sm border border-transparent hover:border-red-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="p-4 bg-red-50 rounded-2xl flex gap-3 border border-red-100">
            <AlertTriangle className="text-red-500 shrink-0" size={18} />
            <p className="text-[11px] font-bold text-red-600 leading-tight">
                Вы списываете товар со склада. Это действие отразится на финансовых отчетах. 
                Текущий остаток: {item.quantity} {item.unit}.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Кол-во для списания</label>
              <input 
                type="number"
                step="1"
                max={item.quantity}
                value={quantity || ''}
                min="1"
                value={quantity}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const val = Math.max(1, Number(e.target.value));
                  setQuantity(val);
                }}
                className="w-full h-12 px-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:border-rose-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Причина</label>
              <select 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full h-12 px-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:border-red-500 outline-none appearance-none"
              >
                <option value="SPOILAGE">Порча / Увядание</option>
                <option value="DAMAGE">Брак / Поломка</option>
                <option value="INVENTORY_LOSS">Недостача</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Документ / Акт (необязательно)</label>
            <input 
              type="text"
              placeholder="Напр. Акт №45"
              value={docId}
              onChange={(e) => setDocId(e.target.value)}
              className="w-full h-12 px-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:border-red-500 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Комментарий</label>
            <textarea 
               value={comment}
               onChange={(e) => setComment(e.target.value)}
               className="w-full h-24 p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:border-red-500 outline-none resize-none"
               placeholder="Опишите причину подробнее..."
            />
          </div>

          <button 
            type="submit"
            disabled={mutation.isPending}
            className="w-full h-14 bg-red-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-xl shadow-red-600/10 disabled:opacity-50"
          >
            {mutation.isPending ? <Loader2 className="animate-spin" /> : <Trash2 size={18} />}
            Подтвердить списание
          </button>
        </form>
      </div>
    </div>
  )
}
