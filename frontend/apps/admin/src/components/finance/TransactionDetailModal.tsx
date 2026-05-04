import { 
  X, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  User, 
  FileText, 
  Link as LinkIcon, 
  Tag,
  Info,
  Package,
  ArrowRight,
  Loader2
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { AuthService, InventoryService, CatalogService } from '@/lib/api'
import { useNavigate } from 'react-router-dom'

interface Transaction {
  id: string
  type: string
  amount: number
  description: string
  referenceId?: string
  occurredAt: string
  performedBy?: string
}

interface TransactionDetailModalProps {
  transaction: Transaction
  onClose: () => void
  typeConfig: { label: string; color: string; sign: string; bgColor: string }
}

export function TransactionDetailModal({ transaction, onClose, typeConfig }: TransactionDetailModalProps) {
  const isRevenue = typeConfig.sign === '+'
  const navigate = useNavigate()
  
  // 1. Fetch Performer Info
  const { data: performer } = useQuery({
    queryKey: ['auth-user', transaction.performedBy],
    queryFn: () => AuthService.getUser(transaction.performedBy!).then(r => r.data),
    enabled: !!transaction.performedBy
  })

  // 2. Fetch Stock Transaction Info (if write-off or related to inventory)
  const isInventoryRelated = transaction.type.includes('WRITE_OFF') || transaction.type.includes('PURCHASE') || transaction.type.includes('COGS')
  const { data: stockTx, isLoading: isStockLoading, isError: isStockError } = useQuery({
    queryKey: ['inventory-tx', transaction.referenceId],
    queryFn: () => InventoryService.getTransaction(transaction.referenceId!).then(r => r.data),
    enabled: isInventoryRelated && !!transaction.referenceId,
    retry: false
  })

  // 3. Fetch Order Details if stock tx fails or if it's a sale
  const isSaleRelated = transaction.type.includes('SALE') || transaction.type.includes('COGS') || transaction.description.includes('SALE')
  const { data: orderData } = useQuery({
    queryKey: ['order-details', transaction.referenceId],
    queryFn: () => OrderService.getById(transaction.referenceId!).then(r => r.data),
    enabled: !!transaction.referenceId && (isSaleRelated || isStockError)
  })

  // 4. Fetch Product Info if we have a productId from stock transaction
  const productId = stockTx?.productId
  const { data: product } = useQuery({
    queryKey: ['catalog-product', productId],
    queryFn: () => CatalogService.getProduct(productId!).then(r => r.data),
    enabled: !!productId
  })

  // Helper to Russify common backend strings
  const displayDescription = (desc: string) => {
    if (desc.includes('Revenue from order')) return desc.replace('Revenue from order', 'Выручка по заказу')
    if (desc.includes('COGS for order')) return desc.replace('COGS for order', 'Себестоимость заказа')
    if (desc.includes('Inventory loss')) return desc.replace('Inventory loss', 'Убыток от списания')
    if (desc.includes('Purchase from supplier')) return 'Закупка у поставщика'
    return desc
  }

  const handleGoToDocument = () => {
    if (!transaction.referenceId) return
    
    // If it's related to a sale or we have order data, go to orders
    if (isSaleRelated || orderData) {
      navigate(`/admin/orders?id=${transaction.referenceId}`)
    } else if (transaction.type.includes('WRITE_OFF')) {
      navigate(`/admin/inventory/write-off`)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl flex flex-col relative overflow-hidden">
        
        {/* Decorative background accent */}
        <div className={cn("absolute top-0 left-0 right-0 h-32 opacity-10", isRevenue ? "bg-emerald-500" : "bg-red-500")} />

        <div className="px-8 pt-10 pb-6 flex items-start justify-between relative z-10">
          <div className="flex gap-4">
             <div className={cn(
               "h-14 w-14 rounded-2xl flex items-center justify-center border",
               isRevenue ? "bg-emerald-50 border-emerald-100 text-emerald-500" : "bg-red-50 border-red-100 text-red-500"
             )}>
                {isRevenue ? <ArrowUpRight size={28} /> : <ArrowDownRight size={28} />}
             </div>
             <div className="space-y-1">
                <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Детали операции</h2>
                <div className={cn("inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest", typeConfig.bgColor, typeConfig.color)}>
                  {typeConfig.label}
                </div>
             </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-neutral-50 transition-all text-neutral-400">
            <X size={20} />
          </button>
        </div>

        <div className="px-8 pb-10 space-y-6 relative z-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* Amount Section */}
          <div className="text-center py-6 bg-neutral-50 rounded-3xl border border-neutral-100">
             <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-1">Сумма транзакции</p>
             <p className={cn("text-4xl font-black tabular-nums tracking-tighter", isRevenue ? "text-emerald-600" : "text-red-500")}>
                {typeConfig.sign}{Math.abs(transaction.amount).toLocaleString('ru')} ₽
             </p>
          </div>

          {/* Details Section */}
          <div className="space-y-4">
             {/* Description & Performer */}
             <div className="p-4 bg-white rounded-2xl border border-neutral-100 space-y-3">
                <div className="flex items-start gap-3">
                   <div className="h-8 w-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400 shrink-0"><Info size={16} /></div>
                   <div className="space-y-0.5">
                      <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Описание</p>
                      <p className="text-sm font-bold text-neutral-800 leading-tight">{displayDescription(transaction.description)}</p>
                   </div>
                </div>
                
                {performer && (
                   <div className="flex items-start gap-3 pt-2 border-t border-neutral-50">
                      <div className="h-8 w-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400 shrink-0"><User size={16} /></div>
                      <div className="space-y-0.5">
                         <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Инициатор</p>
                         <p className="text-sm font-bold text-neutral-800">{performer.firstName} {performer.lastName}</p>
                      </div>
                   </div>
                )}
             </div>

             {/* Inventory Details (If applicable) */}
             {isInventoryRelated && (
               <div className="p-4 bg-neutral-900 rounded-2xl text-white space-y-4">
                  <div className="flex items-center justify-between">
                     <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Складской объект</p>
                     <Package size={14} className="text-white/20" />
                  </div>
                  
                  {isStockLoading ? (
                    <div className="py-2 flex justify-center"><Loader2 size={20} className="animate-spin text-white/20" /></div>
                  ) : stockTx ? (
                    <div className="space-y-3">
                       <div className="flex justify-between items-end">
                          <div className="space-y-1">
                             <p className="text-xs font-black text-white/60">Товар</p>
                             <p className="text-base font-black text-white tracking-tight">{product?.name || 'Загрузка...'}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-xs font-black text-white/60">Количество</p>
                             <p className="text-xl font-black text-emerald-400">{stockTx.quantity} шт.</p>
                          </div>
                       </div>
                       
                       <div className="pt-3 border-t border-white/5 flex justify-between items-center text-[10px] font-bold">
                          <span className="text-white/40 uppercase">Причина списания:</span>
                          <span className="px-2 py-0.5 bg-white/10 rounded-md text-white uppercase tracking-tight">
                             {stockTx.writeOffReason || 'Продажа'}
                          </span>
                       </div>
                    </div>
                  ) : orderData ? (
                    <div className="space-y-2">
                       <p className="text-[10px] font-bold text-white/40 uppercase">Связано с заказом</p>
                       <div className="flex justify-between items-center">
                          <p className="text-sm font-bold text-white">Заказ #{orderData.orderNumber?.slice(-8)}</p>
                          <p className="text-sm font-black text-emerald-400">{orderData.finalAmount} ₽</p>
                       </div>
                       <p className="text-[10px] text-white/40">Списание произошло автоматически при продаже</p>
                    </div>
                  ) : (
                    <p className="text-xs text-white/40 italic">Детали склада недоступны</p>
                  )}
               </div>
             )}

             {/* Meta Grid */}
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-neutral-100">
                   <div className="flex items-center gap-2 mb-1.5 text-neutral-400">
                      <Calendar size={12} />
                      <p className="text-[8px] font-black uppercase tracking-widest">Дата и время</p>
                   </div>
                   <p className="text-xs font-bold text-neutral-800">
                      {transaction.occurredAt ? format(parseISO(transaction.occurredAt), 'dd MMM yyyy, HH:mm', { locale: ru }) : '—'}
                   </p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-neutral-100">
                   <div className="flex items-center gap-2 mb-1.5 text-neutral-400">
                      <Tag size={12} />
                      <p className="text-[8px] font-black uppercase tracking-widest">Связанный ID</p>
                   </div>
                   <p className="text-[9px] font-mono font-bold text-neutral-500 truncate">{transaction.referenceId || '—'}</p>
                </div>
             </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
             <button 
               onClick={onClose}
               className="h-12 w-full bg-neutral-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-black/10"
             >
               Закрыть
             </button>
          </div>
        </div>

      </div>
    </div>
  )
}
