import { useState, useMemo } from 'react'
import { 
  X, 
  History, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  AlertTriangle,
  Loader2,
  Calendar,
  Building2,
  DollarSign,
  ArrowRight,
  Layers
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { InventoryService, InventoryItem, SupplierService } from '@/lib/api'
import { format, differenceInDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface StockHistoryModalProps {
  item: InventoryItem
  onClose: () => void
}

export function StockHistoryModal({ item, onClose }: StockHistoryModalProps) {
  // 1. Fetch Transactions
  const { data: historyRes, isLoading: historyLoading } = useQuery({
    queryKey: ['inventory', 'history', item.productId],
    queryFn: () => InventoryService.getHistory(item.productId!, { page: 0, size: 50 }).then(res => res.data),
    enabled: !!item.productId
  })

  // 2. Fetch Batches
  const { data: batchesData, isLoading: batchesLoading } = useQuery({
    queryKey: ['inventory', 'batches', item.productId],
    queryFn: () => InventoryService.getBatches(item.productId!).then(res => res.data),
    enabled: !!item.productId
  })

  // 3. Fetch Suppliers for mapping (optional, but good for display)
  const { data: suppliersRes } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => SupplierService.getAll().then(res => res.data)
  })

  const isLoading = historyLoading || batchesLoading
  const transactions = historyRes?.content || []
  const suppliers = suppliersRes?.data || []

  // Enrich batches with supplier names
  const batches = useMemo(() => {
    if (!batchesData) return []
    return batchesData.map(batch => ({
      ...batch,
      supplierName: suppliers.find(s => s.id === batch.supplierId)?.name || 'Неизвестный поставщик'
    }))
  }, [batchesData, suppliers])

  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'INBOUND': return { label: 'Приход', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' }
      case 'WRITE_OFF': return { label: 'Списание', icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-50' }
      case 'SALE': return { label: 'Продажа', icon: TrendingDown, color: 'text-neutral-500', bg: 'bg-neutral-100' }
      default: return { label: type, icon: Package, color: 'text-neutral-500', bg: 'bg-neutral-100' }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-neutral-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 shadow-sm">
              <Package size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                История движения товара
              </h2>
              <p className="text-[13px] font-bold text-neutral-400 uppercase tracking-wider mt-1">
                {item.name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-neutral-200 text-neutral-400 hover:text-neutral-900 hover:border-neutral-300 transition-all shadow-sm">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-neutral-50/30">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-neutral-400 gap-4">
               <Loader2 size={32} className="animate-spin text-neutral-300" />
               <p className="text-sm font-medium">Загрузка истории...</p>
            </div>
          ) : (
            <div className="space-y-10">
              
              {/* === ПАРТИИ (BATCHES) === */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                   <Layers size={14} /> Текущие партии на складе
                </h3>
                
                {batches.length === 0 ? (
                  <div className="bg-white rounded-xl border border-dashed border-neutral-200 p-8 text-center text-neutral-400 text-sm">
                    Нет активных партий
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {batches.map(batch => {
                      const percent = Math.round((batch.quantityRemaining / batch.quantityReceived) * 100);
                      const isExpired = batch.expiresAt && new Date(batch.expiresAt) < new Date();
                      
                      return (
                        <div key={batch.id} className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm hover:border-neutral-300 transition-colors">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                               <div className={cn(
                                 "w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1",
                                 batch.status === 'AVAILABLE' ? 'bg-emerald-500' : 
                                 batch.status === 'DEPLETED' ? 'bg-neutral-300' : 'bg-rose-500'
                               )} />
                               <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                                      {batch.sourceDocumentId}
                                    </span>
                                    <span className="text-[11px] font-bold text-neutral-400 flex items-center gap-1">
                                      <Calendar size={12} /> {format(new Date(batch.receivedAt), 'dd MMM yyyy', { locale: ru })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[13px] font-bold text-neutral-900">
                                    <Building2 size={14} className="text-neutral-400" />
                                    {batch.supplierName}
                                  </div>
                               </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-neutral-900 tabular-nums">
                                {batch.unitCost.toLocaleString('ru-RU')} <span className="text-[11px] text-neutral-400">₽/шт</span>
                              </div>
                              {batch.expiresAt && (
                                <div className={cn(
                                  "text-[10px] font-bold mt-1.5 flex items-center gap-1 justify-end",
                                  isExpired ? "text-rose-500" : "text-amber-500"
                                )}>
                                  <AlertTriangle size={10} />
                                  Годен до: {format(new Date(batch.expiresAt), 'dd.MM', { locale: ru })}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-2">
                             <div className="flex justify-between text-[11px] font-bold">
                               <span className="text-neutral-500">Остаток: <span className="text-neutral-900 text-sm">{batch.quantityRemaining}</span> из {batch.quantityReceived}</span>
                               <span className="text-neutral-400">{percent}%</span>
                             </div>
                             <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                               <div 
                                 className={cn(
                                   "h-full rounded-full transition-all duration-500",
                                   percent > 50 ? "bg-emerald-500" : percent > 20 ? "bg-amber-400" : "bg-rose-500"
                                 )}
                                 style={{ width: `${percent}%` }}
                               />
                             </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* === ИСТОРИЯ (TRANSACTIONS) === */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                   <History size={14} /> Журнал операций
                </h3>
                
                {transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-neutral-400 text-sm italic">
                    <History className="h-10 w-10 text-neutral-200 mb-3" />
                    История операций пуста
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
                    <div className="divide-y divide-neutral-100">
                      {transactions.map(t => {
                        const { label, icon: Icon, color, bg } = formatTransactionType(t.type)
                        const isPositive = t.type === 'INBOUND'
                        
                        return (
                          <div key={t.id} className="p-4 hover:bg-neutral-50 transition-colors flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", bg, color)}>
                                <Icon size={18} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[13px] font-bold text-neutral-900">{label}</span>
                                  {t.writeOffReason && (
                                    <span className="text-[10px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded font-bold">
                                      {t.writeOffReason}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[11px] font-medium text-neutral-400">
                                    {format(new Date(t.createdAt), 'dd MMM yyyy, HH:mm', { locale: ru })}
                                  </span>
                                  <span className="text-neutral-300">•</span>
                                  <span className="text-[11px] font-medium text-neutral-400">
                                    Док: {t.sourceDocumentId}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className={cn(
                                "text-sm font-bold tabular-nums flex items-center justify-end gap-1",
                                isPositive ? "text-emerald-600" : "text-neutral-900"
                              )}>
                                {isPositive ? '+' : '-'}{t.quantity} шт
                                {t.type !== 'SALE' && (
                                   <span className="text-[11px] text-neutral-400 font-medium ml-2">
                                     ({(t.quantity * t.costBasis).toLocaleString('ru-RU')} ₽)
                                   </span>
                                )}
                              </div>
                              {t.comment && (
                                <div className="text-[11px] text-neutral-400 mt-1 max-w-[200px] truncate">
                                  {t.comment}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-100 bg-white flex justify-end">
          <button 
            type="button"
            onClick={onClose}
            className="h-11 px-8 bg-neutral-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg shadow-black/20"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  )
}
