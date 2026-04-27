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
  Loader2
} from 'lucide-react'
import { ordersApi } from '@/api/orders'
import type { Order, OrderStatus } from '@/api/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const statuses: { id: OrderStatus; name: string; icon: any; color: string }[] = [
  { id: 'NEW', name: 'Принят', icon: Clock, color: 'text-blue-500' },
  { id: 'ASSEMBLING', name: 'Сборка', icon: Flower2, color: 'text-orange-500' },
  { id: 'READY', name: 'Готов', icon: Package, color: 'text-green-500' },
  { id: 'DELIVERY', name: 'Доставка', icon: Truck, color: 'text-purple-500' },
  { id: 'COMPLETED', name: 'Вручен', icon: CheckCircle2, color: 'text-[var(--color-brand)]' },
]

export function OrderTrackingPage() {
  const { id } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return
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
        <Button asChild rounded-full>
          <Link to="/">Вернуться на главную</Link>
        </Button>
      </div>
    )
  }

  const currentStatusIndex = statuses.findIndex(s => s.id === order.status)

  return (
    <div className="container-custom py-12 md:py-20 animate-in fade-in duration-700">
      <div className="flex items-center gap-4 mb-12">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full shadow-sm bg-white"
          asChild
        >
          <Link to="/catalog">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-bold tracking-tight">Трекинг заказа</h1>
          <p className="text-sm font-bold font-mono text-[var(--color-brand)] tracking-wider">#{order.orderNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Status Tracker */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/30">
            <h2 className="text-2xl font-bold mb-12 flex items-center gap-3">
              Статус: 
              <span className={cn(
                "px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-neutral-100",
                statuses[currentStatusIndex]?.color.replace('text-', 'bg-').replace('500', '50') || '',
                statuses[currentStatusIndex]?.color || ''
              )}>
                {statuses[currentStatusIndex]?.name || order.status}
              </span>
            </h2>

            {/* Progress Bar Container */}
            <div className="relative flex justify-between items-start">
              {/* Background Line */}
              <div className="absolute top-6 left-0 right-0 h-1 bg-gray-100 z-0" />
              {/* Active Line */}
              <div 
                className="absolute top-6 left-0 h-1 bg-[var(--color-brand)] z-0 transition-all duration-1000" 
                style={{ width: `${(currentStatusIndex / (statuses.length - 1)) * 100}%` }}
              />

              {statuses.map((status, index) => {
                const isCompleted = index <= currentStatusIndex
                const isActive = index === currentStatusIndex
                
                return (
                  <div key={status.id} className="relative z-10 flex flex-col items-center gap-4 group">
                    <div className={cn(
                      "h-12 w-12 rounded-full flex items-center justify-center border-4 transition-all duration-500",
                      isCompleted ? "bg-[var(--color-brand)] border-[var(--color-brand)] text-white" : "bg-white border-gray-100 text-gray-300",
                      isActive && "scale-125 shadow-lg shadow-[var(--color-brand)]/30 ring-4 ring-white"
                    )}>
                      <status.icon className="h-5 w-5" />
                    </div>
                    <div className="text-center w-20">
                      <p className={cn(
                        "text-[10px] font-black uppercase tracking-widest mb-1 transition-colors",
                        isCompleted ? "text-[var(--color-text-primary)]" : "text-gray-300"
                      )}>
                        {status.name}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-16 p-6 bg-neutral-50 rounded-2xl border border-gray-100 flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                <MapPin className="h-5 w-5 text-[var(--color-brand)]" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Адрес доставки</p>
                <p className="text-sm font-bold text-neutral-700">{order.type === 'DELIVERY' ? 'г. Москва, ул. Арбат, д. 15, кв. 42' : 'Самовывоз: ул. Арбат 1'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details Sidebar */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl shadow-gray-100/30">
              <h3 className="text-xl font-bold mb-6">Детали заказа</h3>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                    <p className="font-bold flex-1 pr-4 leading-tight">{item.name} <span className="text-neutral-300 text-xs ml-1">×{item.quantity}</span></p>
                    <p className="font-display font-black whitespace-nowrap">{item.price * item.quantity} ₽</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100 space-y-4">
                <div className="flex justify-between items-end">
                   <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pb-1">Уплачено</span>
                   <span className="text-3xl font-display font-black text-[var(--color-text-primary)]">{order.finalAmount} <span className="text-lg text-[var(--color-brand)]">₽</span></span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg w-fit">
                   <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                   <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Оплата прошла</span>
                </div>
              </div>
           </div>

           <Link to="/catalog" className="flex items-center justify-center h-14 bg-neutral-900 text-white rounded-[1.5rem] font-bold text-sm tracking-wide gap-2 hover:bg-black transition-all">
              Продолжить шопинг
              <Flower2 className="h-4 w-4" />
           </Link>
        </div>
      </div>
    </div>
  )
}