import { 
  X, 
  ShoppingBag, 
  Calendar, 
  Clock, 
  User, 
  Truck, 
  CreditCard, 
  CheckCircle2, 
  Loader2,
  Package,
  MapPin,
  Printer,
  Banknote,
  SmartphoneNfc,
  Receipt,
  FileText,
  Boxes
} from 'lucide-react'
import { OrderService, OrderStatus } from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { toast } from 'sonner'

interface OrderDetailModalProps {
  orderId: string
  onClose: () => void
}

export function OrderDetailModal({ orderId, onClose }: OrderDetailModalProps) {
  const queryClient = useQueryClient()

  const { data: order, isLoading } = useQuery({
    queryKey: ['order-detail', orderId],
    queryFn: () => OrderService.getById(orderId).then(res => res.data)
  })

  const statusMutation = useMutation({
    mutationFn: (nextStatus: OrderStatus) => OrderService.updateStatus(orderId, nextStatus),
    onSuccess: (_, nextStatus) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order-detail', orderId] })
      if (nextStatus === 'CANCELLED') {
        toast.success('Заказ отменён')
      } else {
        toast.success('Статус заказа обновлён')
      }
    },
    onError: (error: any) => {
      const serverMessage = error?.response?.data?.message || error?.message || 'Неизвестная ошибка'
      console.error('[OrderDetailModal] Status update failed:', error)
      toast.error(`Ошибка обновления статуса: ${serverMessage}`)
    }
  })

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
        <Loader2 className="h-10 w-10 animate-spin text-neutral-400" />
      </div>
    )
  }

  if (!order) return null

  const getStatusConfig = (status: OrderStatus | undefined) => {
    switch (status) {
      case 'COMPLETED': return { label: 'ЗАВЕРШЕН', color: 'text-emerald-500 bg-emerald-50', progress: 100, step: 5, statusText: 'Заказ выполнен успешно', subText: 'Все товары переданы клиенту' }
      case 'CANCELLED': return { label: 'ОТМЕНЕН', color: 'text-rose-500 bg-rose-50', progress: 0, step: 0, statusText: 'Заказ отменен', subText: 'Обработка прекращена' }
      case 'OUT_FOR_DELIVERY': return { label: 'ДОСТАВКА', color: 'text-sky-500 bg-sky-50', progress: 80, step: 4, statusText: 'Заказ в пути', subText: 'Курьер доставляет товары' }
      case 'READY': return { label: 'ГОТОВО', color: 'text-amber-500 bg-amber-50', progress: 80, step: 4, statusText: 'Готов к выдаче', subText: 'Ожидает клиента или курьера' }
      case 'IN_PROGRESS': return { label: 'В РАБОТЕ', color: 'text-indigo-500 bg-indigo-50', progress: 60, step: 3, statusText: 'Сборка заказа', subText: 'Флорист подготавливает букет' }
      case 'CONFIRMED': return { label: 'ПОДТВЕРЖДЕНО', color: 'text-emerald-500 bg-emerald-50', progress: 40, step: 2, statusText: 'Заказ подтвержден', subText: 'Ожидает начала сборки' }
      case 'NEW': return { label: 'НОВОЕ', color: 'text-blue-500 bg-blue-50', progress: 20, step: 1, statusText: 'Заказ принят', subText: 'Склад подтвердил наличие' }
      case 'PENDING_STOCK': return { label: 'ОЖИДАНИЕ', color: 'text-neutral-500 bg-neutral-100', progress: 10, step: 1, statusText: 'Проверка наличия', subText: 'Ожидает ответа от склада' }
      default: return { label: 'ОЖИДАНИЕ', color: 'text-neutral-500 bg-neutral-100', progress: 10, step: 1, statusText: 'Заказ получен', subText: 'Ожидает проверки' }
    }
  }

  const statusConfig = getStatusConfig(order.status)

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300 overflow-hidden">
      <div className="bg-white w-full max-w-6xl h-[94vh] rounded-3xl shadow-2xl flex flex-col relative overflow-hidden">
        
        {/* HEADER SECTION */}
        <div className="px-10 pt-10 pb-6 flex items-start justify-between">
          <div className="flex gap-4">
             <div className="h-14 w-14 bg-neutral-50 rounded-2xl flex items-center justify-center border border-neutral-100 text-neutral-400">
                <FileText size={28} strokeWidth={1.5} />
             </div>
             <div className="space-y-1">
                <div className="flex items-center gap-3">
                   <h2 className="text-3xl font-black text-neutral-900 tracking-tight">Заказ № {order.orderNumber}</h2>
                   <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", statusConfig.color)}>
                      {statusConfig.label}
                   </div>
                </div>
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest leading-none">
                   Клиент: <span className="text-neutral-900 ml-1">{order.guestName || (order.customerId ? 'Зарегистрирован' : 'Гостевой заказ')}</span>
                   {order.guestPhone && <span className="text-neutral-300 mx-2">|</span>}
                   {order.guestPhone && <span className="text-neutral-900">{order.guestPhone}</span>}
                </p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => window.print()} className="h-12 px-6 flex items-center gap-2.5 rounded-2xl hover:bg-neutral-50 border border-neutral-100 transition-all font-bold text-xs text-neutral-600 bg-white shadow-sm">
                <Printer size={16} />
                Печать
             </button>
             <button onClick={onClose} className="h-12 w-12 flex items-center justify-center rounded-2xl hover:bg-neutral-50 transition-all text-neutral-400 border border-transparent hover:border-neutral-100">
               <X size={28} />
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-10 pb-10 space-y-10 custom-scrollbar">
           
           {/* HERO SECTION: Logistics + Financials */}
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT: Delivery Stats (Dark Card) */}
              <div className="lg:col-span-8 bg-[#18181A] rounded-[2.5rem] p-10 flex flex-col justify-between relative overflow-hidden min-h-[260px]">
                 <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] relative z-10">
                    <Truck size={14} className="text-emerald-500" />
                    <span>Статус исполнения и логистика</span>
                 </div>
                 
                 <div className="relative z-10 flex items-center gap-6 mt-4">
                    <div className={cn(
                      "h-16 w-16 rounded-3xl flex items-center justify-center text-white shadow-lg transition-all transform",
                      order.status === 'COMPLETED' ? "bg-emerald-500 shadow-emerald-500/20" : "bg-neutral-800 shadow-black/20"
                    )}>
                       {order.status === 'COMPLETED' ? <CheckCircle2 size={32} strokeWidth={2.5} /> : <Clock size={32} strokeWidth={2.5} />}
                    </div>
                    <div className="flex-1">
                       <h3 className="text-3xl font-black text-white leading-none">
                          {statusConfig.statusText}
                       </h3>
                       <div className="flex items-center justify-between mt-2">
                          <p className="text-xs font-bold text-white/40 uppercase tracking-widest">
                             {statusConfig.subText}
                          </p>
                          {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                             <div className="flex gap-2">
                                <button 
                                  onClick={() => {
                                    // Не используем window.confirm() — он блокируется браузером в некоторых окружениях
                                    // Сразу мутируем, показываем toast с подтверждением
                                    toast('Отменить заказ?', {
                                      description: 'Это действие необратимо.',
                                      action: {
                                        label: 'Да, отменить',
                                        onClick: () => statusMutation.mutate('CANCELLED'),
                                      },
                                      cancel: {
                                        label: 'Нет',
                                        onClick: () => {},
                                      },
                                      duration: 8000,
                                    })
                                  }}
                                  disabled={statusMutation.isPending}
                                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-500/20"
                                >
                                  {statusMutation.isPending ? '...' : 'Отменить'}
                                </button>
                               <button 
                                 onClick={() => {
                                   const current = order.status || 'NEW'
                                   const nextMap: Record<string, OrderStatus> = {
                                     PENDING_STOCK: 'NEW',
                                     NEW: 'CONFIRMED',
                                     CONFIRMED: 'IN_PROGRESS',
                                     IN_PROGRESS: 'READY',
                                     READY: (order.type === 'DELIVERY' ? 'OUT_FOR_DELIVERY' : 'COMPLETED') as OrderStatus,
                                     OUT_FOR_DELIVERY: 'COMPLETED'
                                   }
                                   if (nextMap[current]) statusMutation.mutate(nextMap[current])
                                 }}
                                 disabled={statusMutation.isPending}
                                 className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20"
                               >
                                  Продвинуть на этап
                               </button>
                             </div>
                          )}
                       </div>
                    </div>
                 </div>

                 <div className="relative z-10 space-y-6 mt-8">
                    {/* Progress Bar (5 Segments) */}
                    <div className="h-[5px] w-full bg-white/10 rounded-full flex gap-1 group">
                       <div className={cn("h-full rounded-full transition-all duration-700", statusConfig.step >= 1 ? "bg-emerald-500 w-1/5" : "bg-white/5 w-1/5")} />
                       <div className={cn("h-full rounded-full transition-all duration-700 delay-100", statusConfig.step >= 2 ? "bg-emerald-500 w-1/5" : "bg-white/5 w-1/5")} />
                       <div className={cn("h-full rounded-full transition-all duration-700 delay-200", statusConfig.step >= 3 ? "bg-emerald-500 w-1/5" : "bg-white/5 w-1/5")} />
                       <div className={cn("h-full rounded-full transition-all duration-700 delay-300", statusConfig.step >= 4 ? "bg-emerald-500 w-1/5" : "bg-white/5 w-1/5")} />
                       <div className={cn("h-full rounded-full transition-all duration-700 delay-400", statusConfig.step >= 5 ? "bg-emerald-500 w-1/5" : "bg-white/5 w-1/5")} />
                    </div>
                    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-[0.15em] text-white/20 whitespace-pre">
                       <span className={cn(statusConfig.step >= 1 && "text-emerald-500")}>Новое</span>
                       <span className={cn(statusConfig.step >= 2 && "text-emerald-500")}>Подтверждено</span>
                       <span className={cn(statusConfig.step >= 3 && "text-emerald-500")}>В работе</span>
                       <span className={cn(statusConfig.step >= 4 && "text-emerald-500")}>{order.type === 'DELIVERY' ? 'Доставка' : 'Готово'}</span>
                       <span className={cn(statusConfig.step >= 5 && "text-emerald-500")}>Завершено</span>
                    </div>
                 </div>
                 
                 <Truck size={140} className="absolute -right-8 top-1/2 -translate-y-1/2 text-white/5 opacity-50" />
              </div>

              {/* RIGHT: Financial Summary (Light Card) */}
              <div className="lg:col-span-4 bg-neutral-50 border border-neutral-100 rounded-[2.5rem] p-10 flex flex-col justify-between relative">
                 <div>
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Финансовый итог</span>
                    <div className="mt-4 flex flex-col gap-4">
                       <span className="text-4xl font-black text-neutral-900 tracking-tighter">
                          {(order.finalAmount || 0).toLocaleString()} ₽
                       </span>
                       <div className="flex flex-col gap-2">
                          <div className={cn(
                            "inline-flex items-center self-start gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                            order.isPaid ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/10" : "bg-rose-500/10 text-rose-500 border border-rose-500/10"
                          )}>
                             <CheckCircle2 size={12} />
                             <span>{order.isPaid ? 'ОПЛАЧЕНО (APPROVED)' : 'ОЖИДАЕТ ОПЛАТЫ'}</span>
                          </div>
                          {!order.isPaid && (
                             <button
                               onClick={async () => {
                                 try {
                                   await fetch(`/api/v1/payments/webhooks/simulate/${orderId}`, { method: 'POST' })
                                   queryClient.invalidateQueries({ queryKey: ['order-detail', orderId] })
                                   queryClient.invalidateQueries({ queryKey: ['orders'] })
                                 } catch (e) {}
                               }}
                               className="w-full py-2 bg-neutral-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-colors shadow-lg shadow-black/10"
                             >
                               Имитировать оплату
                             </button>
                          )}
                       </div>
                    </div>
                 </div>

                 <div className="mt-8 pt-8 border-t border-neutral-200/60">
                    <span className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em]">id транзакции</span>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono mt-1 leading-relaxed break-all">
                       {order.id?.toLowerCase()}
                    </p>
                 </div>
              </div>
           </div>

           {/* INFO TILES SECTION */}
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-white border border-neutral-100 p-6 rounded-3xl space-y-2 group hover:border-neutral-900 transition-colors cursor-default">
                 <span className="text-[9px] font-black text-neutral-300 uppercase tracking-[0.2em]">Дата создания</span>
                 <p className="text-sm font-black text-neutral-900 uppercase tracking-tighter">
                    {order.createdAt ? format(new Date(order.createdAt), 'dd MMMM yyyy', { locale: ru }) : '—'}
                 </p>
              </div>
              <div className="bg-white border border-neutral-100 p-6 rounded-3xl space-y-2 group hover:border-neutral-900 transition-colors cursor-default">
                 <span className="text-[9px] font-black text-neutral-300 uppercase tracking-[0.2em]">Тип / Источник</span>
                 <p className="text-sm font-black text-neutral-900 uppercase tracking-tighter">
                    {order.type === 'DELIVERY' ? 'Доставка' : 'Самовывоз'} / {order.source}
                 </p>
              </div>
              <div className="bg-white border border-neutral-100 p-6 rounded-3xl space-y-2 group hover:border-neutral-900 transition-colors cursor-default">
                 <span className="text-[9px] font-black text-neutral-300 uppercase tracking-[0.2em]">Обновлено</span>
                 <p className="text-sm font-black text-neutral-900 uppercase tracking-tighter">
                    {order.updatedAt ? format(new Date(order.updatedAt), 'dd MMMM yyyy', { locale: ru }) : '—'}
                 </p>
              </div>
              <div className="bg-white border border-neutral-100 p-6 rounded-3xl space-y-2 group hover:border-neutral-900 transition-colors cursor-default">
                 <span className="text-[9px] font-black text-neutral-300 uppercase tracking-[0.2em]">Позиций в чеке</span>
                 <p className="text-sm font-black text-neutral-900 uppercase tracking-tighter">{order.items?.length || 0} товаров</p>
              </div>
              <div className="bg-white border border-neutral-100 p-6 rounded-[2rem] hover:border-neutral-300 transition-all group">
                 <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest leading-none">Метод оплаты</span>
                 <p className="mt-4 text-sm font-black text-neutral-900 uppercase tracking-tight">
                    {order.paymentMethod === 'CASH' ? 'Наличные' : 
                     order.paymentMethod === 'CARD' ? 'Карта' : 
                     order.paymentMethod === 'ONLINE' ? 'СБП / Онлайн' : 
                     (order.paymentMethod || '—')}
                 </p>
              </div>
           </div>

           {/* SPECIFICATION SECTION */}
           <div className="space-y-6">
              <div className="flex items-center gap-3 px-1">
                 <Boxes size={18} className="text-neutral-400" />
                 <h3 className="text-[11px] font-black text-neutral-900 uppercase tracking-[0.2em]">Спецификация</h3>
              </div>
              
              <div className="bg-white rounded-3xl border border-neutral-100 overflow-hidden shadow-sm">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-neutral-50/50">
                          <th className="px-8 py-5 text-[9px] font-black text-neutral-300 uppercase tracking-[0.2em]">Товар / SKU</th>
                          <th className="px-8 py-5 text-[9px] font-black text-neutral-300 uppercase tracking-[0.2em] text-center">Заказ</th>
                          <th className="px-8 py-5 text-[9px] font-black text-neutral-300 uppercase tracking-[0.2em] text-center">Выдано</th>
                          <th className="px-8 py-5 text-[9px] font-black text-neutral-300 uppercase tracking-[0.2em] text-right">Цена</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                       {(order.items && order.items.length > 0) ? order.items.map((item, i) => (
                         <tr key={i} className="hover:bg-neutral-50/20 transition-colors underline-offset-4">
                            <td className="px-8 py-6">
                               <p className="text-sm font-black text-neutral-900 leading-none mb-1">{item.productName || 'Товар'}</p>
                               <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest font-mono">
                                  SKU: {item.productId?.slice(0, 8).toUpperCase()}
                               </span>
                            </td>
                            <td className="px-8 py-6 text-center">
                               <span className="text-sm font-bold text-neutral-400 tabular-nums">{item.quantity}</span>
                            </td>
                            <td className="px-8 py-6 text-center font-black text-neutral-900 tabular-nums">
                               {item.quantity}
                            </td>
                            <td className="px-8 py-6 text-right">
                               <span className="text-sm font-black text-neutral-900 tabular-nums">{(item.unitPrice || 0).toLocaleString()} ₽</span>
                            </td>
                         </tr>
                       )) : (
                         <tr>
                            <td colSpan={4} className="px-8 py-16 text-center text-[10px] font-black text-neutral-200 uppercase tracking-[0.3em]">
                               Пустая спецификация
                            </td>
                         </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        {/* FOOTER BAR */}
        <div className="px-10 py-5 bg-white border-t border-neutral-100 flex items-center gap-3 flex-shrink-0">
           <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-300">Обработка активна</span>
        </div>

      </div>
    </div>
  )
}
