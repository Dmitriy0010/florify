import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Package, Clock, CheckCircle2, XCircle, Truck, Gift, ChevronRight, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ordersApi } from '@/api/orders'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const statusMap = {
  'NEW': { label: 'Новый', icon: Clock, className: 'bg-blue-100 text-blue-700 border-blue-200' },
  'ASSEMBLING': { label: 'Сборка', icon: Gift, className: 'bg-amber-100 text-amber-700 border-amber-200' },
  'READY': { label: 'Готов', icon: CheckCircle2, className: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  'DELIVERY': { label: 'Доставка', icon: Truck, className: 'bg-sky-100 text-sky-700 border-sky-200' },
  'COMPLETED': { label: 'Выполнен', icon: CheckCircle2, className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  'CANCELLED': { label: 'Отменен', icon: XCircle, className: 'bg-rose-100 text-rose-700 border-rose-200' },
}

export function AccountOrdersPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => ordersApi.getMyOrders(),
    retry: false,
  })

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-brand)]" />
      </div>
    )
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[var(--color-border)] p-12 text-center space-y-6">
        <div className="h-20 w-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto text-neutral-300">
          <Package className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">У вас пока нет заказов</h2>
          <p className="text-[var(--color-text-tertiary)] max-w-sm mx-auto">
            Самое время порадовать себя или близких прекрасным букетом из нашего каталога.
          </p>
        </div>
        <Link to="/catalog">
          <Button variant="brand" className="rounded-xl px-8">
            Перейти в каталог
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-[var(--color-text-primary)]">Мои заказы</h1>
        <Badge variant="outline" className="rounded-full bg-neutral-50 border-neutral-200 px-3 py-0.5 font-medium text-neutral-600">
          Всего: {orders.length}
        </Badge>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => {
          const status = statusMap[order.status as keyof typeof statusMap] || statusMap.NEW
          return (
            <Link 
              key={order.id} 
              to={`/order/${order.id}`}
              className="group bg-white rounded-2xl border border-[var(--color-border)] p-5 transition-all hover:shadow-md hover:border-[var(--color-brand)]/20"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-[var(--color-text-primary)]">
                      №{order.orderNumber}
                    </span>
                    <Badge className={cn('rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold border', status.className)}>
                      <status.icon className="h-3 w-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-[var(--color-text-tertiary)]">
                    {format(new Date(order.createdAt), 'd MMMM yyyy, HH:mm', { locale: ru })}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="text-right">
                    <p className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wide font-medium">Сумма</p>
                    <p className="text-lg font-bold text-[var(--color-text-primary)]">
                      {order.finalAmount.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:bg-[var(--color-brand-light)] group-hover:text-[var(--color-brand)] transition-colors">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
              
              {/* Simple Item Preview & Actions */}
              <div className="mt-5 pt-5 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-hidden">
                  {order.items?.slice(0, 3).map((item, idx) => (
                     <span key={idx} className="text-xs px-2.5 py-1.5 bg-neutral-50 text-neutral-600 rounded-lg whitespace-nowrap font-medium border border-neutral-100/50">
                       {item.name} {item.quantity > 1 ? `x${item.quantity}` : ''}
                     </span>
                  ))}
                  {(order.items?.length || 0) > 3 && (
                    <span className="text-xs text-neutral-400 font-medium px-2 py-1">
                      + еще {(order.items?.length || 0) - 3}
                    </span>
                  )}
                </div>
                
                <Button variant="outline" size="sm" className="hidden sm:flex rounded-xl h-9 hover:bg-[var(--color-brand-light)] hover:text-[var(--color-brand)] border-transparent bg-neutral-50" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                  <Package className="h-4 w-4 mr-2" />
                  Повторить заказ
                </Button>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
