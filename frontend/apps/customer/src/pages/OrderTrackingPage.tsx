import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Flower2,
  ArrowLeft,
  Loader2,
  ShoppingBag,
  XCircle,
} from 'lucide-react'
import { ordersApi } from '@/api/orders'
import type { Order } from '@/api/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function OrderTrackingPage() {
  const { id } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const fetchOrder = async () => {
      try {
        const data = await ordersApi.getOrderById(id)
        setOrder(data)
      } catch (error) {
        console.error('Failed to fetch order', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchOrder()
    // Poll every 15s for live updates
    const timer = setInterval(fetchOrder, 15_000)
    return () => clearInterval(timer)
  }, [id])

  if (isLoading) {
    return (
      <div className="container-custom py-32 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-[var(--color-brand)]" />
        <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Получаем данные заказа...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container-custom py-32 text-center space-y-6">
        <h1 className="text-3xl font-display font-bold">Заказ не найден</h1>
        <p className="text-neutral-500">Мы не смогли найти информацию о заказе с таким номером.</p>
        <Button asChild><Link to="/">Вернуться на главную</Link></Button>
      </div>
    )
  }

  const isPickup = order.type === 'PICKUP' || order.type === 'POS'
  const isDelivery = order.type === 'DELIVERY'
  const isCancelled = order.status === 'CANCELLED'

  // Build step list depending on order type
  const getSteps = () => {
    const base = [
      { id: 'NEW',         name: 'Принят',    icon: Clock,        color: 'blue'   },
      { id: 'IN_PROGRESS', name: 'Сборка',    icon: Flower2,      color: 'orange' },
      { id: 'READY',       name: 'Готов',     icon: Package,      color: 'green'  },
    ]
    if (isDelivery) {
      base.push({ id: 'OUT_FOR_DELIVERY', name: 'Доставка', icon: Truck, color: 'purple' })
    }
    base.push({
      id: 'COMPLETED',
      name: isDelivery ? 'Вручён' : 'Выдан',
      icon: CheckCircle2,
      color: 'brand',
    })
    return base
  }

  const steps = getSteps()

  // Map status to step index
  const statusToStep: Record<string, string> = {
    PENDING_STOCK: 'NEW',
    NEW:           'NEW',
    CONFIRMED:     'NEW',
    IN_PROGRESS:   'IN_PROGRESS',
    READY:         'READY',
    OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
    COMPLETED:     'COMPLETED',
  }
  const mappedStatus = statusToStep[order.status] ?? 'NEW'
  const currentIdx = steps.findIndex(s => s.id === mappedStatus)

  const statusLabels: Record<string, string> = {
    PENDING_STOCK:    'Обработка',
    NEW:              'Принят',
    CONFIRMED:        'Принят',
    IN_PROGRESS:      'Собирается',
    READY:            'Готов',
    OUT_FOR_DELIVERY: 'В доставке',
    COMPLETED:        'Выполнен',
    CANCELLED:        'Отменён',
  }

  const stepColorClass = (color: string, variant: 'bg' | 'text' | 'ring') => {
    const map: Record<string, Record<string, string>> = {
      blue:   { bg: 'bg-blue-500',   text: 'text-blue-500',   ring: 'ring-blue-200'   },
      orange: { bg: 'bg-orange-500', text: 'text-orange-500', ring: 'ring-orange-200' },
      green:  { bg: 'bg-green-500',  text: 'text-green-500',  ring: 'ring-green-200'  },
      purple: { bg: 'bg-purple-500', text: 'text-purple-500', ring: 'ring-purple-200' },
      brand:  { bg: 'bg-[var(--color-brand)]', text: 'text-[var(--color-brand)]', ring: 'ring-[var(--color-brand)]/30' },
    }
    return map[color]?.[variant] ?? ''
  }

  // Payment display
  const paymentMethodLabel: Record<string, string> = {
    CASH:   'Наличными',
    CARD:   'Картой',
    ONLINE: 'Онлайн',
    SBP:    'СБП',
  }
  const methodLabel = paymentMethodLabel[order.paymentMethod as string] ?? (order.paymentMethod || 'Наличными')
  const isPaid = (order as any).isPaid === true

  return (
    <div className="container-custom py-12 md:py-20 animate-in fade-in duration-700">
      <div className="flex items-center gap-4 mb-12">
        <Button variant="ghost" size="icon" className="rounded-full shadow-sm bg-white" asChild>
          <Link to="/catalog"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-bold tracking-tight">Трекинг заказа</h1>
          <p className="text-sm font-bold font-mono text-[var(--color-brand)] tracking-wider">#{order.orderNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Status Tracker */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/30">

            {/* Status badge */}
            <div className="flex items-center gap-3 mb-10">
              <span className="text-xl font-bold text-neutral-700">Статус:</span>
              {isCancelled ? (
                <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 text-rose-500 text-xs font-black uppercase tracking-widest">
                  <XCircle className="h-4 w-4" /> Отменён
                </span>
              ) : (
                <span className={cn(
                  'px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest',
                  currentIdx >= 0
                    ? `${stepColorClass(steps[currentIdx].color, 'bg').replace('bg-', 'bg-').replace('500', '50')} ${stepColorClass(steps[currentIdx].color, 'text')}`
                    : 'bg-neutral-100 text-neutral-500'
                )}>
                  {statusLabels[order.status] ?? order.status}
                </span>
              )}
            </div>

            {/* Progress steps */}
            {!isCancelled && (
              <div className="relative flex justify-between items-start">
                {/* Background rail */}
                <div className="absolute top-6 left-0 right-0 h-1 bg-gray-100 z-0" />
                {/* Active rail */}
                <div
                  className="absolute top-6 left-0 h-1 bg-[var(--color-brand)] z-0 transition-all duration-1000"
                  style={{ width: `${(Math.max(0, currentIdx) / (steps.length - 1)) * 100}%` }}
                />
                {steps.map((step, idx) => {
                  const done   = idx <= currentIdx
                  const active = idx === currentIdx
                  return (
                    <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                      <div className={cn(
                        'h-12 w-12 rounded-full flex items-center justify-center border-4 transition-all duration-500',
                        done
                          ? 'bg-[var(--color-brand)] border-[var(--color-brand)] text-white'
                          : 'bg-white border-gray-100 text-gray-300',
                        active && 'scale-125 shadow-lg ring-4 ring-white'
                      )}>
                        <step.icon className="h-5 w-5" />
                      </div>
                      <p className={cn(
                        'text-[10px] font-black uppercase tracking-widest text-center w-20 transition-colors',
                        done ? 'text-[var(--color-text-primary)]' : 'text-gray-300'
                      )}>
                        {step.name}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Info block — pickup vs delivery */}
            <div className="mt-14 p-6 bg-neutral-50 rounded-2xl border border-gray-100 flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                {isDelivery ? (
                  <Truck className="h-5 w-5 text-purple-500" />
                ) : (
                  <ShoppingBag className="h-5 w-5 text-[var(--color-brand)]" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                  {isDelivery ? 'Адрес доставки' : 'Самовывоз'}
                </p>
                <p className="text-sm font-bold text-neutral-700">
                  {isDelivery
                    ? (order.deliveryAddress || 'Адрес не указан')
                    : 'Заберите заказ в магазине, когда он будет готов'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl shadow-gray-100/30">
            <h3 className="text-xl font-bold mb-6">Детали заказа</h3>
            <div className="space-y-4">
              {(order.items || []).map((item: any, idx: number) => {
                const price = item.unitPrice || item.price || 0
                return (
                  <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                    <p className="font-bold flex-1 pr-4 leading-tight">
                      {item.name || item.productName}
                      <span className="text-neutral-300 text-xs ml-1">×{item.quantity}</span>
                    </p>
                    <p className="font-display font-black whitespace-nowrap">{(price * item.quantity).toLocaleString()} ₽</p>
                  </div>
                )
              })}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100 space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pb-1">Итого</span>
                <span className="text-3xl font-display font-black text-[var(--color-text-primary)]">
                  {(order.finalAmount ?? (order as any).totalAmount ?? 0).toLocaleString()}
                  <span className="text-lg text-[var(--color-brand)] ml-1">₽</span>
                </span>
              </div>

              {/* Payment status */}
              <div className="flex items-center gap-2">
                <div className={cn(
                  'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest',
                  'bg-neutral-100 text-neutral-500'
                )}>
                  {methodLabel}
                </div>
                {isPaid ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Оплачено</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-lg">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">При получении</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Link
            to="/catalog"
            className="flex items-center justify-center h-14 bg-neutral-900 text-white rounded-[1.5rem] font-bold text-sm tracking-wide gap-2 hover:bg-black transition-all"
          >
            Продолжить шопинг
            <Flower2 className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}