import { useState } from 'react'
import { 
  X, 
  FileText, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ChevronRight,
  PackageCheck,
  Info,
  Edit,
  Printer,
  Scale,
  Warehouse
} from 'lucide-react'
import { InvoiceService, Invoice, ReceiveInvoiceItemRequest, InvoiceStatus, StoreService } from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { toast } from 'sonner'

import { useDashboardStore } from '@/store/useDashboardStore'

interface InvoiceDetailModalProps {
  invoice: Invoice
  onClose: () => void
  onRefresh: () => void
  onEdit: (invoice: Invoice) => void
}

export function InvoiceDetailModal({ invoice, onClose, onRefresh, onEdit }: InvoiceDetailModalProps) {
  const queryClient = useQueryClient()
  const { currentStoreId } = useDashboardStore()
  const [isConfirmingReceive, setIsConfirmingReceive] = useState(false)
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false)
  const [receivedQtys, setReceivedQtys] = useState<Record<string, number>>(
    Object.fromEntries((invoice.items || []).map(item => [item.id!, item.receivedQuantity || item.orderedQuantity || 0]))
  )

  const { data: storesRes } = useQuery({
    queryKey: ['stores'],
    queryFn: () => StoreService.getAll().then(res => res.data)
  })

  const dummyId = '00000000-0000-0000-0000-000000000001'
  const effectiveStoreId = (currentStoreId && currentStoreId !== dummyId) ? currentStoreId : invoice.storeId
  const targetStore = (storesRes || []).find(s => s.id === effectiveStoreId)

  const submitMutation = useMutation({
    mutationFn: () => InvoiceService.submit(invoice.id!),
    onSuccess: () => {
      toast.success('Заказ подтвержден')
      onRefresh()
      onClose()
    }
  })

  const receiveMutation = useMutation({
    mutationFn: () => {
      const items: ReceiveInvoiceItemRequest[] = Object.entries(receivedQtys).map(([itemId, qty]) => ({
        itemId,
        receivedQuantity: qty
      }))
      return InvoiceService.receive(invoice.id!, effectiveStoreId!, items)
    },
    onSuccess: () => {
      toast.success('Поставка принята')
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      onRefresh()
      onClose()
    }
  })

  const cancelMutation = useMutation({
    mutationFn: () => InvoiceService.cancel(invoice.id!),
    onSuccess: () => {
      toast.success('Закупка аннулирована')
      onRefresh()
      onClose()
    }
  })

  const handleQtyChange = (itemId: string, value: string) => {
    setReceivedQtys(prev => ({ ...prev, [itemId]: parseFloat(value) || 0 }))
  }

  const getStatusInfo = (status: InvoiceStatus | undefined) => {
    switch (status) {
      case 'DRAFT': return { label: 'Черновик', color: 'text-neutral-400', bg: 'bg-neutral-50', icon: FileText }
      case 'SUBMITTED': return { label: 'Заказано', color: 'text-blue-500', bg: 'bg-blue-50', icon: Truck }
      case 'RECEIVED': return { label: 'Принято', color: 'text-emerald-500', bg: 'bg-emerald-50', icon: CheckCircle2 }
      case 'PARTIALLY_RECEIVED': return { label: 'Частично', color: 'text-amber-500', bg: 'bg-amber-50', icon: AlertCircle }
      case 'CANCELLED': return { label: 'Аннулировано', color: 'text-red-500', bg: 'bg-red-50', icon: X }
      default: return { label: status || 'DRAFT', color: 'text-neutral-400', bg: 'bg-neutral-50', icon: FileText }
    }
  }

  const statusInfo = getStatusInfo(invoice.status)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-neutral-900/40 backdrop-blur-sm animate-in fade-in duration-300 print:bg-white print:p-0">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden flex flex-col h-[85vh] animate-in zoom-in-95 duration-300 border border-neutral-200 print:h-auto print:rounded-none">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-neutral-100 flex items-center justify-between bg-white print:border-b-2">
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 bg-neutral-50 rounded-lg flex items-center justify-center text-neutral-400 border border-neutral-100 print:hidden">
                <FileText size={20} />
             </div>
             <div>
                <div className="flex items-center gap-3">
                   <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Закупка № {invoice.invoiceNumber}</h2>
                   <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", statusInfo.bg, statusInfo.color)}>
                      {statusInfo.label}
                   </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">Контрагент: <span className="text-neutral-900 font-bold">{invoice.supplierName}</span></p>
             </div>
          </div>
          <div className="flex items-center gap-2 print:hidden">
             <button onClick={() => window.print()} className="h-9 px-4 flex items-center gap-2 rounded-lg text-xs font-bold text-neutral-500 hover:bg-neutral-50 transition-all border border-neutral-100">
               <Printer size={16} /> Печать
             </button>
             <button onClick={onClose} className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors text-neutral-400">
               <X size={20} />
             </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
           {/* Delivery Timeline / Logistics Card */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 p-6 rounded-[28px] bg-neutral-900 text-white relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Truck size={120} />
                 </div>
                 <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4 flex items-center gap-2">
                          <PackageCheck size={14} className="text-emerald-400" /> Статус доставки и логистика
                       </p>
                       <div className="flex items-center gap-4">
                          <div className={cn(
                             "w-12 h-12 rounded-2xl flex items-center justify-center border-2",
                             invoice.status === 'RECEIVED' ? "bg-emerald-500 border-emerald-400" : "bg-white/10 border-white/5"
                          )}>
                             {invoice.status === 'RECEIVED' ? <CheckCircle2 className="text-white" /> : <Truck className="text-white/60" />}
                          </div>
                          <div>
                             <h4 className="text-xl font-black tracking-tight">
                                {invoice.status === 'RECEIVED' ? 'Груз успешно принят' : 
                                 invoice.status === 'SUBMITTED' ? 'В процессе транспортировки' : 
                                 invoice.status === 'PARTIALLY_RECEIVED' ? 'Частично доставлено' : 'Ожидает отправки'}
                             </h4>
                             <p className="text-xs text-white/50 font-bold mt-1">Ожидаемое прибытие: {invoice.plannedDeliveryAt ? format(new Date(invoice.plannedDeliveryAt), 'd MMMM yyyy (EEEE)', { locale: ru }) : 'Не указано'}</p>
                          </div>
                       </div>
                    </div>

                    {/* Simple Timeline Progress */}
                    <div className="flex items-center gap-1">
                       <div className="flex-1 h-2 bg-emerald-500 rounded-full" />
                       <div className={cn("flex-1 h-2 rounded-full", (invoice.status === 'SUBMITTED' || invoice.status === 'RECEIVED' || invoice.status === 'PARTIALLY_RECEIVED') ? "bg-emerald-500" : "bg-white/10")} />
                       <div className={cn("flex-1 h-2 rounded-full", (invoice.status === 'RECEIVED' || invoice.status === 'PARTIALLY_RECEIVED') ? "bg-emerald-500" : "bg-white/10")} />
                    </div>

                    <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-white/30">
                       <span>Создано</span>
                       <span>В пути</span>
                       <span>Принято</span>
                    </div>
                 </div>
              </div>

              <div className="bg-neutral-50 rounded-[28px] border border-neutral-100 p-6 flex flex-col justify-between">
                 <div>
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4">Финансовый итог</p>
                    <p className="text-4xl font-black text-neutral-900 tracking-tighter">{(invoice.totalAmount ?? 0).toLocaleString()} ₽</p>
                    {invoice.status === 'RECEIVED' && (
                       <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest mt-3">
                          <CheckCircle2 size={10} /> К оплате (Approved)
                       </span>
                    )}
                 </div>
                 <div className="pt-4 border-t border-neutral-200 mt-4 h-full flex flex-col justify-end">
                   <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">ID Транзакции</p>
                   <p className="text-[10px] font-bold text-neutral-500 font-mono truncate">{invoice.id}</p>
                 </div>
              </div>
           </div>

           {/* Top Info Cards */}
           <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-5 rounded-2xl border border-neutral-100 bg-white hover:bg-neutral-50 transition-all group">
                 <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 group-hover:text-neutral-900">Дата создания</p>
                 <p className="text-sm font-black text-neutral-900">
                    {invoice.createdAt ? format(new Date(invoice.createdAt), 'dd MMMM yyyy', { locale: ru }) : '—'}
                 </p>
              </div>
              <div className="p-5 rounded-2xl border border-neutral-100 bg-white hover:bg-neutral-50 transition-all group">
                 <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 group-hover:text-neutral-900">Склад приёмки</p>
                 <p className="text-sm font-black text-neutral-900 truncate">
                    {targetStore?.name || '—'}
                 </p>
              </div>
              <div className="p-5 rounded-2xl border border-neutral-100 bg-white hover:bg-neutral-50 transition-all group">
                 <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 group-hover:text-neutral-900">Принято на склад</p>
                 <p className="text-sm font-black text-neutral-900">
                    {invoice.receivedAt ? format(new Date(invoice.receivedAt), 'dd MMMM yyyy', { locale: ru }) : '—'}
                 </p>
              </div>
              <div className="p-5 rounded-2xl border border-neutral-100 bg-white hover:bg-neutral-50 transition-all group">
                 <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 group-hover:text-neutral-900">Позиций в чеке</p>
                 <p className="text-sm font-black text-neutral-900">{(invoice.items || []).length} товаров</p>
              </div>
              <div className="p-5 rounded-2xl border border-neutral-100 bg-white hover:bg-neutral-50 transition-all group">
                 <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 group-hover:text-neutral-900">Поставщик</p>
                 <p className="text-sm font-black text-neutral-900 truncate">{invoice.supplierName}</p>
              </div>
           </div>

           {/* Table */}
           <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                 <Scale size={16} className="text-neutral-400" />
                 <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Спецификация</h3>
              </div>

              <div className="rounded-xl border border-neutral-100 overflow-hidden shadow-sm">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-neutral-50/50 border-b border-neutral-100">
                          <th className="px-6 py-3 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Товар / SKU</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-neutral-400 uppercase tracking-wider text-center">Заказ</th>
                          {invoice.status === 'SUBMITTED' && (
                             <th className="px-6 py-3 text-[10px] font-bold text-neutral-400 uppercase tracking-wider text-center">Факт приёма</th>
                          )}
                          {(invoice.status === 'RECEIVED' || invoice.status === 'PARTIALLY_RECEIVED') && (
                             <th className="px-6 py-3 text-[10px] font-bold text-neutral-400 uppercase tracking-wider text-center">Принято</th>
                          )}
                          <th className="px-6 py-3 text-[10px] font-bold text-neutral-400 uppercase tracking-wider text-right">Цена</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                       {(invoice.items || []).map(item => {
                         const diff = (receivedQtys[item.id!] || item.receivedQuantity || 0) - (item.orderedQuantity || 0);
                         return (
                          <tr key={item.id} className="hover:bg-neutral-50/20 transition-colors">
                             <td className="px-6 py-4">
                                <p className="text-sm font-bold text-neutral-900">{item.productName || '—'}</p>
                                <p className="text-[10px] text-neutral-400 tabular-nums">SKU: {item.productId?.slice(0,8).toUpperCase()}</p>
                             </td>
                             <td className="px-6 py-4 text-center">
                                <span className="text-sm font-medium text-neutral-600">{(item.orderedQuantity ?? 0)}</span>
                             </td>
                             
                             {invoice.status === 'SUBMITTED' && (
                                <td className="px-6 py-4">
                                   <div className="flex flex-col items-center gap-1">
                                      <input 
                                        type="number"
                                        min="0"
                                        value={receivedQtys[item.id!] || 0}
                                        onFocus={(e) => e.target.select()}
                                        onChange={(e) => {
                                          const val = Math.max(0, Number(e.target.value));
                                          handleQtyChange(item.id!, val.toString());
                                        }}
                                        className="w-20 h-9 bg-white border border-neutral-200 rounded-lg text-center text-xs font-bold outline-none focus:border-neutral-900 tabular-nums"
                                      />
                                      {diff !== 0 && (
                                        <span className={cn(
                                          "text-[9px] font-bold uppercase",
                                          diff < 0 ? "text-rose-500" : "text-emerald-600"
                                        )}>
                                          {diff < 0 ? `Недовоз: ${Math.abs(diff)}` : `Лишнее: +${diff}`}
                                        </span>
                                      )}
                                   </div>
                                </td>
                             )}

                             {(invoice.status === 'RECEIVED' || invoice.status === 'PARTIALLY_RECEIVED') && (
                               <td className="px-6 py-4 text-center">
                                  <div className="flex flex-col items-center">
                                    <span className="text-sm font-bold text-neutral-900">{(item.receivedQuantity ?? 0)}</span>
                                    {item.receivedQuantity !== item.orderedQuantity && (
                                       <span className="text-[9px] font-bold text-rose-500 uppercase">
                                          {(item.receivedQuantity ?? 0) - (item.orderedQuantity ?? 0)}
                                       </span>
                                    )}
                                  </div>
                               </td>
                             )}

                             <td className="px-6 py-4 text-right">
                                <span className="text-sm font-bold text-neutral-400 tabular-nums">{(item.unitPrice ?? 0).toLocaleString()} ₽</span>
                             </td>
                           </tr>
                         )
                       })}
                    </tbody>
                 </table>
              </div>
           </div>

           {invoice.comment && (
              <div className="px-6 py-4 bg-amber-50/50 rounded-xl border border-amber-100 flex gap-3 italic">
                 <Info size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                 <p className="text-xs text-amber-900 leading-relaxed">{invoice.comment}</p>
              </div>
           )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-between print:hidden">
           <div className="flex items-center gap-2">
             <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
             <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Обработка активна</span>
           </div>

           <div className="flex items-center gap-3">
              {(invoice.status === 'DRAFT' || invoice.status === 'SUBMITTED') && (
                 <button 
                   onClick={() => setIsConfirmingCancel(true)}
                   className="h-10 px-6 text-sm font-bold text-rose-500 hover:text-rose-700 transition-all border border-rose-100 rounded-lg bg-rose-50/50"
                 >
                   Аннулировать
                 </button>
              )}

              {invoice.status === 'DRAFT' && (
                 <>
                    <button 
                      onClick={() => onEdit(invoice)}
                      className="h-10 px-6 text-sm font-bold text-neutral-500 hover:text-neutral-900 transition-all border border-neutral-200 rounded-lg bg-white"
                    >
                      Редактировать
                    </button>
                    <button 
                      onClick={() => submitMutation.mutate()}
                      disabled={submitMutation.isPending}
                      className="h-10 px-8 bg-neutral-900 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-black/5"
                    >
                       {submitMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <Truck size={16} />}
                       Подтвердить заказ
                    </button>
                 </>
              )}

              {invoice.status === 'SUBMITTED' && (
                 <button 
                    onClick={() => setIsConfirmingReceive(true)}
                    className="h-10 px-10 bg-emerald-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/10"
                 >
                    <PackageCheck size={18} />
                    Принять поставку
                 </button>
              )}
           </div>
        </div>

        {/* Cancellation Confirmation Modal */}
        {isConfirmingCancel && (
           <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-neutral-900/60 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center animate-in zoom-in-95 duration-300 border border-neutral-100">
                 <div className="h-16 w-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle size={32} />
                 </div>
                 <h3 className="text-xl font-bold text-neutral-900">Аннулировать закупку?</h3>
                 <p className="text-sm text-neutral-500 mt-2">Это действие нельзя отменить. Закупка №{invoice.invoiceNumber} будет помечена как отмененная.</p>
                 <div className="flex flex-col gap-2 mt-8">
                    <button 
                       onClick={() => {
                          cancelMutation.mutate()
                          setIsConfirmingCancel(false)
                       }}
                       disabled={cancelMutation.isPending}
                       className="h-11 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 disabled:opacity-50 transition-all shadow-lg shadow-rose-600/10"
                    >
                       {cancelMutation.isPending ? 'Загрузка...' : 'Да, аннулировать'}
                    </button>
                    <button 
                       onClick={() => setIsConfirmingCancel(false)}
                       className="h-11 bg-transparent text-neutral-500 font-bold text-sm hover:text-neutral-900"
                    >
                       Отмена
                    </button>
                 </div>
              </div>
           </div>
        )}

        {/* Confirmation Modal Overlay (Reception) */}
        {isConfirmingReceive && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-neutral-900/60 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-300 border border-neutral-100">
                 <div className="h-20 w-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Warehouse size={40} />
                 </div>
                 <h3 className="text-2xl font-black text-center text-neutral-900 tracking-tight">Подтверждение приёмки</h3>
                 <p className="text-center text-neutral-500 mt-3 text-sm leading-relaxed">
                    Вы уверены, что хотите зачислить товар на склад <b>«{targetStore?.name}»</b>? <br/>
                    Это действие обновит фактические остатки в системе.
                 </p>

                 <div className="mt-8 space-y-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                    <div className="flex justify-between text-xs">
                       <span className="text-neutral-400 font-bold uppercase tracking-wider">Поставщик</span>
                       <span className="text-neutral-900 font-bold">{invoice.supplierName}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                       <span className="text-neutral-400 font-bold uppercase tracking-wider">Кол-во товаров</span>
                       <span className="text-neutral-900 font-bold">{(invoice.items || []).length} поз.</span>
                    </div>
                    <div className="h-px bg-neutral-200" />
                    <div className="flex justify-between items-center pt-1">
                       <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">ИТОГО К ПРИХОДУ</span>
                       <span className="text-lg font-black text-neutral-900 tabular-nums">{(invoice.totalAmount || 0).toLocaleString()} ₽</span>
                    </div>
                 </div>

                 <div className="flex flex-col gap-3 mt-8">
                    <button 
                       onClick={() => {
                          receiveMutation.mutate()
                          setIsConfirmingReceive(false)
                       }}
                       disabled={receiveMutation.isPending}
                       className="h-12 bg-neutral-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl shadow-black/10"
                    >
                       {receiveMutation.isPending ? <Loader2 className="animate-spin h-5 w-5" /> : <PackageCheck size={20} />}
                       Да, зачислить на склад
                    </button>
                    <button 
                       onClick={() => setIsConfirmingReceive(false)}
                       className="h-12 bg-transparent text-neutral-400 font-bold text-sm hover:text-neutral-900 transition-colors"
                    >
                       Отменить приёмку
                    </button>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  )
}
