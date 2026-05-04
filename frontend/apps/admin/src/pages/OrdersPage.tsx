import { useState, useMemo, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { 
  MoreVertical, 
  RotateCcw,
  Loader2,
  ChevronRight,
  Truck,
  XCircle,
  Package,
  Zap,
  LayoutGrid,
  Calendar,
  ChevronLeft,
  User,
  CheckCircle2,
  Pencil
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getKanbanOrders, updateOrderStatus } from '@/lib/api/orders'
import { apiClient } from '@/lib/api/client'
import { OrderKanbanResponse, OrderStatus, OrderResponse } from '@/lib/api'
import { toast } from 'sonner'
import { OrderDetailModal } from '@/components/orders/OrderDetailModal'
import { format, startOfWeek, addDays, isToday, isSameDay } from 'date-fns'
import { ru } from 'date-fns/locale'

// --- Types ---
type KanbanColumnConfig = {
  id: string;
  statuses: OrderStatus[];
  name: string;
  color: string;
  accent: string;
}

const columns: KanbanColumnConfig[] = [
  { id: 'NEW_GROUP',        statuses: ['PENDING_STOCK', 'NEW', 'CONFIRMED'], name: 'Новые',     color: 'bg-blue-600',    accent: 'text-blue-600 bg-blue-50 border-blue-100' },
  { id: 'IN_PROGRESS',     statuses: ['IN_PROGRESS'],                        name: 'Собраны',   color: 'bg-emerald-500', accent: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  { id: 'OUT_FOR_DELIVERY',statuses: ['OUT_FOR_DELIVERY'],                   name: 'У курьера', color: 'bg-amber-500',   accent: 'text-amber-600 bg-amber-50 border-amber-100' },
  { id: 'COMPLETED',       statuses: ['COMPLETED', 'READY'],                 name: 'Завершенные', color: 'bg-neutral-800', accent: 'text-neutral-500 bg-white border-neutral-100' },
  { id: 'CANCELLED',       statuses: ['CANCELLED'],                          name: 'Отменены',  color: 'bg-rose-500',    accent: 'text-rose-500 bg-rose-50 border-rose-100' },
]

const LIMIT_OPTIONS = [10, 15, 25, 50, 100]

// --- Hover Details Component ---
function OrderHoverCard({ orderId, anchorRect }: { orderId: string, anchorRect: DOMRect }) {
  const { data: order, isLoading } = useQuery({
    queryKey: ['order-hover', orderId],
    queryFn: async () => {
      const { data } = await apiClient.get<OrderResponse>(`/v1/orders/${orderId}`)
      return data
    },
    staleTime: 30000
  })

  // Calculate position: preferred right side
  const top = anchorRect.top
  const left = anchorRect.right + 12

  return (
    <div 
      className="fixed z-[999] w-[240px] bg-white rounded-xl shadow-2xl border border-neutral-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      style={{ top: `${top}px`, left: `${left}px` }}
    >
      <div className="bg-emerald-500 px-4 py-2 flex items-center justify-between">
        <span className="text-[11px] font-black text-white uppercase tracking-wider">Детали заказа</span>
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Бюджет</span>
          <p className="text-sm font-black text-neutral-900 mt-0.5">
            {order?.finalAmount?.toLocaleString() || '---'} ₽
          </p>
        </div>

        <div>
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Состав</span>
          <div className="mt-1 space-y-1">
            {isLoading ? (
              <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                <Loader2 size={10} className="animate-spin" /> Загрузка состава...
              </div>
            ) : order?.items && order.items.length > 0 ? (
              order.items.map((item, i) => (
                <p key={i} className="text-[11px] font-bold text-neutral-700 leading-tight">
                  {item.productName} <span className="text-neutral-400">{item.quantity}шт</span>
                </p>
              ))
            ) : (
              <p className="text-[10px] text-neutral-300 italic">Нет товаров</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-neutral-50">
          <div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Флорист</span>
            <p className="text-[11px] font-bold text-blue-600 flex items-center gap-1.5 mt-0.5 pointer-events-auto cursor-pointer hover:underline">
              {order?.floristName || 'Олеся'} <Pencil size={10} />
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Статус</span>
            <div className={cn(
              "flex items-center gap-1 text-[11px] font-bold mt-0.5 justify-end",
              order?.isPaid ? "text-emerald-500" : "text-amber-500"
            )}>
              {order?.isPaid ? 'Оплачено' : 'Ожидает'}
              <CheckCircle2 size={12} className={order?.isPaid ? "text-emerald-500" : "text-amber-500"} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- KanbanCard ---
function KanbanCard({ 
  order, onOrderClick, compact = false, onHoverChange
}: { 
  order: OrderKanbanResponse; 
  onOrderClick: (id: string) => void;
  compact?: boolean;
  onHoverChange?: (id: string | null, rect: DOMRect | null) => void;
}) {
  const queryClient = useQueryClient()
  const ref = useRef<HTMLDivElement>(null)
  
  const statusMutation = useMutation({
    mutationFn: (nextStatus: OrderStatus) => {
      if (!order.id) throw new Error('Order ID is missing')
      return updateOrderStatus(order.id!, nextStatus)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Статус заказа обновлён')
    },
    onError: (err: any) => {
      toast.error('Ошибка: ' + (err.response?.data?.message || err.message))
    }
  })

  const timeStr = order.createdAt 
    ? new Date(order.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    : '--:--'
  const price = typeof order.finalAmount === 'number' ? order.finalAmount : 0
  const clientName = order.guestName 
    ? order.guestName.split(' ').map((p, i) => i === 0 ? p : p[0] + '.').join(' ')
    : 'Клиент'
  const phone = order.guestPhone
    ? order.guestPhone.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '+$1 $2 $3-$4-$5')
    : null

  const handleMouseEnter = () => {
    if (onHoverChange && ref.current && order.id) {
      onHoverChange(order.id, ref.current.getBoundingClientRect())
    }
  }

  const handleMouseLeave = () => {
    if (onHoverChange) onHoverChange(null, null)
  }

  return (
    <div 
      ref={ref}
      onClick={() => order.id && onOrderClick(order.id)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "bg-white rounded-lg border border-neutral-200 p-4 cursor-pointer hover:border-blue-500 hover:ring-2 hover:ring-blue-100 transition-all group relative flex flex-col gap-1 shadow-sm",
        compact ? "p-3" : "p-4"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-black text-neutral-900 tracking-tight leading-none">{timeStr}</span>
        {order.type === 'DELIVERY' && <Truck size={14} className="text-emerald-500" />}
        {!order.type && <Package size={14} className="text-neutral-200" />}
      </div>

      <p className="text-sm font-black text-neutral-900 mt-1 leading-tight">{clientName}</p>
      {phone && <p className="text-[11px] font-bold text-neutral-400 mt-0.5">{phone}</p>}
      
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-50">
        <span className="text-sm font-black text-neutral-900 tabular-nums">{price.toLocaleString()} ₽</span>
        <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-tight">#{order.orderNumber?.slice(-8)}</span>
      </div>
    </div>
  )
}

// --- CalendarView ---
function CalendarView({ onOrderClick }: { onOrderClick: (id: string) => void }) {
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDayIdx, setSelectedDayIdx] = useState(() => {
    const today = new Date().getDay()
    return today === 0 ? 6 : today - 1
  })
  const [hoveredOrder, setHoveredOrder] = useState<{ id: string, rect: DOMRect } | null>(null)

  const weekStart = useMemo(() => {
    const base = startOfWeek(new Date(), { weekStartsOn: 1 })
    return addDays(base, weekOffset * 7)
  }, [weekOffset])

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])
  const selectedDay = weekDays[selectedDayIdx] || weekDays[0]

  const { data: allOrders = [], isLoading } = useQuery({
    queryKey: ['orders', 'calendar', weekOffset],
    queryFn: async () => {
      const statusesToFetch: OrderStatus[] = ['NEW', 'CONFIRMED', 'PENDING_STOCK', 'IN_PROGRESS', 'READY', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED']
      const responses = await Promise.all(statusesToFetch.map(s => getKanbanOrders(s, 200)))
      return responses.flat()
    },
    refetchInterval: 30000
  })

  const getOrdersForDayAndStatuses = (day: Date, statuses: OrderStatus[]) =>
    allOrders.filter(o => {
      if (!o.createdAt) return false
      return isSameDay(new Date(o.createdAt), day) && statuses.includes(o.status as OrderStatus)
    }).sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime())

  const getDayTotal = (day: Date) =>
    allOrders.filter(o => o.createdAt && isSameDay(new Date(o.createdAt), day)).length

  return (
    <div className="flex-1 flex flex-col bg-neutral-50/50 rounded-b-2xl border-x border-b border-neutral-200 overflow-hidden">
      {/* Day tabs header */}
      <div className="bg-neutral-100/50 px-2 flex items-center gap-0 flex-shrink-0 border-b border-neutral-200">
        <button
          onClick={() => setWeekOffset(w => w - 1)}
          className="h-14 w-12 flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>

        {weekDays.map((day, idx) => {
          const isSelected = idx === selectedDayIdx
          const isT = isToday(day)
          const count = getDayTotal(day)
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDayIdx(idx)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-3 relative group transition-all h-14",
                isSelected ? "bg-white shadow-sm ring-1 ring-neutral-200" : "hover:bg-neutral-200/50"
              )}
            >
              <div className="flex items-center gap-1.5">
                <span className={cn("text-[10px] font-bold uppercase", isT ? "text-emerald-500" : isSelected ? "text-neutral-900" : "text-neutral-400")}>
                  {format(day, 'EEE', { locale: ru })}
                </span>
                <span className={cn("text-[10px] font-bold", isT ? "text-emerald-500" : isSelected ? "text-neutral-900" : "text-neutral-400")}>
                  {format(day, 'd')}
                </span>
                {count > 0 && <div className={cn("h-1 w-1 rounded-full", isT ? "bg-emerald-500" : "bg-neutral-300")} />}
              </div>
              {isSelected && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600" />}
            </button>
          )
        })}

        <button
          onClick={() => setWeekOffset(w => w + 1)}
          className="h-14 w-12 flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Main Kanban Content for Selected Day */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6 relative">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="animate-spin text-neutral-300" size={32} />
          </div>
        ) : (
          columns.slice(0, 4).map(col => {
            const dayOrders = getOrdersForDayAndStatuses(selectedDay, col.statuses)
            return (
              <div key={col.id} className="flex-1 flex flex-col min-w-0">
                <div className={cn("h-10 flex items-center justify-between px-4 rounded-t-xl mb-1", col.color)}>
                  <span className="text-[11px] font-black text-white uppercase tracking-widest">{col.name}</span>
                  <span className="px-1.5 py-0.5 bg-white/20 text-white rounded text-[10px] font-black">{dayOrders.length}</span>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1 pt-2">
                  {dayOrders.map(order => (
                    <KanbanCard 
                      key={order.id} 
                      order={order} 
                      onOrderClick={onOrderClick}
                      onHoverChange={(id, rect) => setHoveredOrder(id && rect ? { id, rect } : null)}
                    />
                  ))}
                  {dayOrders.length === 0 && (
                    <div className="h-32 border-2 border-dashed border-neutral-100 rounded-xl flex flex-col items-center justify-center gap-2 opacity-20">
                      <Package size={24} />
                      <span className="text-[10px] font-bold uppercase">Пусто</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}

        {/* Floating Detail Card on Hover */}
        {hoveredOrder && (
          <OrderHoverCard orderId={hoveredOrder.id} anchorRect={hoveredOrder.rect} />
        )}
      </div>
    </div>
  )
}

// --- Main Page ---
export default function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  useEffect(() => {
    const orderId = searchParams.get('id')
    if (orderId) {
      setSelectedOrderId(orderId)
      // Clear the param after opening to avoid re-opening on every render if state changes
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('id')
      setSearchParams(newParams, { replace: true })
    }
  }, [searchParams, setSearchParams])
  
  return (
    <div className="h-full flex flex-col overflow-hidden animate-in fade-in duration-500">
      {/* Constraints Wrapper */}
      <div className="max-w-[1440px] w-full mx-auto h-full flex flex-col bg-white shadow-2xl shadow-black/5 rounded-2xl border border-neutral-200 my-4">
        
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-4">
             <div className="bg-neutral-900 p-3 rounded-2xl text-white">
                <Calendar size={24} />
             </div>
             <div>
                <h1 className="text-2xl font-black text-neutral-900 tracking-tight leading-none">Календарь заказов</h1>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                   <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   Центральный филиал · Активно
                </p>
             </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex border border-neutral-200 rounded-xl overflow-hidden p-1 shadow-sm">
               <button className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">Календарь</button>
               <button className="px-4 py-2 hover:bg-neutral-50 rounded-lg text-[10px] font-black uppercase tracking-widest text-neutral-400 transition-all">Канбан</button>
            </div>
            <div className="h-10 w-10 flex items-center justify-center text-neutral-400 hover:text-neutral-900 border border-neutral-200 rounded-xl cursor-not-allowed">
              <MoreVertical size={18} />
            </div>
          </div>
        </div>

        {/* Content */}
        <CalendarView onOrderClick={setSelectedOrderId} />
      </div>

      {selectedOrderId && (
        <OrderDetailModal 
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </div>
  )
}
