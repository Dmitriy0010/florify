import { useEffect } from 'react'
import { ShoppingBag, ArrowUpRight, ArrowDownRight, Flower2, Wallet, Target, Loader2, Clock, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDashboardStore } from '@/store/useDashboardStore'
import { useAuthStore } from '@/store/useAuthStore'
import { DashboardFilters } from '@/components/dashboard/DashboardFilters'
import { useQuery } from '@tanstack/react-query'
import { InventoryService, OrderService, AnalyticsService, OrderResponse } from '@/lib/api'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Link } from 'react-router-dom'

// Custom Ruble Icon component
function RubleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 5h7a4 4 0 1 1 0 8H6" /><path d="M6 13h10" /><path d="M6 17h10" /><path d="M6 5v16" />
    </svg>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { stats, fetchDashboardData, isLoading, currentStoreId, stores, dateRange } = useDashboardStore()
  
  const { data: prevStats } = useQuery({
    queryKey: ['dashboard-stats-prev', currentStoreId, dateRange],
    queryFn: async () => {
      const currentFrom = new Date(dateRange.from)
      const currentTo = new Date(dateRange.to)
      const diff = currentTo.getTime() - currentFrom.getTime()
      
      const prevFrom = new Date(currentFrom.getTime() - diff).toISOString()
      const prevTo = currentFrom.toISOString()

      const res = await AnalyticsService.getDashboard({
        storeId: currentStoreId || undefined,
        from: prevFrom,
        to: prevTo
      })
      return res.data
    },
    enabled: !!stats
  })

  const { data: inventoryItems = [] } = useQuery({
    queryKey: ['inventory-low-stock', currentStoreId],
    queryFn: () => InventoryService.getStocks(currentStoreId || undefined).then(res => res.data),
    enabled: !!currentStoreId
  })

  const { data: recentOrdersData } = useQuery({
    queryKey: ['recent-orders', currentStoreId],
    queryFn: () => OrderService.getOrders({ customerId: undefined }).then(res => res.data)
  })

  const recentOrders = (recentOrdersData as unknown as OrderResponse[]) || []
  const lowStockItems = inventoryItems.filter(item => (item.quantity ?? 0) <= (item.minThreshold ?? 0)).slice(0, 2)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const calculateChange = (current: number, prev: number) => {
    if (!prev) return null
    const change = ((current - prev) / prev) * 100
    return change
  }

  const currentStore = stores.find(s => s.id === currentStoreId)
  const greeting = new Date().getHours() < 12 ? 'Доброе утро' : new Date().getHours() < 18 ? 'Добрый день' : 'Добрый вечер'

  const statsWithTrends = [
    { 
      name: 'Выручка', 
      value: stats?.totalRevenue?.toLocaleString('ru-RU') || '0', 
      icon: RubleIcon,
      color: 'text-neutral-900',
      bg: 'bg-neutral-50',
      trend: calculateChange(stats?.totalRevenue || 0, prevStats?.totalRevenue || 0)
    },
    { 
      name: 'Ср. чек', 
      value: stats?.averageCheck?.toLocaleString('ru-RU') || '0', 
      icon: Wallet,
      color: 'text-neutral-900',
      bg: 'bg-neutral-50',
      trend: calculateChange(stats?.averageCheck || 0, prevStats?.averageCheck || 0)
    },
    { 
      name: 'Заказы', 
      value: (stats?.totalOrders || 0).toString(), 
      icon: ShoppingBag,
      color: 'text-neutral-900',
      bg: 'bg-neutral-50',
      trend: calculateChange(stats?.totalOrders || 0, prevStats?.totalOrders || 0)
    },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-1000 py-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-100">
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center text-3xl shadow-sm">
             👋
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 tracking-tight leading-none">
              {greeting}, {user?.firstName?.split(' ')[0] || 'Дмитрий'}
            </h1>
            <p className="text-sm text-neutral-400 mt-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Все системы работают стабильно • {format(new Date(), 'dd MMMM', { locale: ru })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
            disabled={isLoading}
            onClick={() => fetchDashboardData()}
            className="h-10 px-6 bg-neutral-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
           >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Обновить данные'}
           </button>
        </div>
      </div>

      <div className="p-1 px-4 bg-neutral-50 rounded-2xl border border-neutral-100">
        <DashboardFilters />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsWithTrends.map((stat) => (
          <div key={stat.name} className="bg-white p-8 rounded-xl border border-neutral-200 shadow-sm space-y-6 group hover:border-neutral-900 transition-colors">
            <div className="flex items-center justify-between">
              <div className={cn("h-10 w-10 flex items-center justify-center rounded-lg border border-neutral-100 text-neutral-400 group-hover:text-neutral-900 transition-colors bg-white")}>
                <stat.icon size={20} />
              </div>
              {stat.trend !== null && (
                <div className={cn(
                  "flex items-center gap-1 text-[11px] font-bold tabular-nums",
                  stat.trend >= 0 ? "text-emerald-600" : "text-rose-600"
                )}>
                  {stat.trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {Math.abs(stat.trend).toFixed(1)}%
                </div>
              )}
            </div>
            <div>
               <p className="text-3xl font-bold text-neutral-900 tabular-nums tracking-tighter">
                  {stat.value}
                  {stat.name !== 'Заказы' && <span className="text-xl font-medium text-neutral-300 ml-1.5">₽</span>}
               </p>
               <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mt-1">{stat.name}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col flex-1">
             <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/30">
                <div className="flex items-center gap-3">
                   <h3 className="text-base font-bold text-neutral-900">Операционная активность</h3>
                   <span className="px-2 py-0.5 bg-white border border-neutral-200 rounded text-[9px] font-bold text-emerald-500 uppercase tracking-tight">Live</span>
                </div>
                <Link to="/admin/orders" className="text-[10px] font-bold text-neutral-400 hover:text-neutral-900 uppercase tracking-widest flex items-center gap-1.5 transition-colors">
                   Журнал заказов <ChevronRight size={12} />
                </Link>
             </div>
             
             <div className="flex-1">
                {recentOrders.length === 0 ? (
                  <div className="py-20 text-center text-neutral-200 italic text-sm">Нет недавних транзакций</div>
                ) : (
                  <div className="divide-y divide-neutral-50 px-2 pb-2">
                    {recentOrders.map(order => (
                      <div key={order.id} className="p-4 flex items-center justify-between group hover:bg-neutral-50 transition-colors rounded-lg cursor-pointer">
                         <div className="flex items-center gap-4">
                            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-neutral-50 text-neutral-400 group-hover:bg-white group-hover:text-neutral-900 transition-all border border-transparent group-hover:border-neutral-100">
                               <ShoppingBag size={18} />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-neutral-900">Заказ №{order.id?.slice(-6).toUpperCase()}</p>
                               <div className="flex items-center gap-2 mt-0.5">
                                 <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight tabular-nums">
                                   {order.createdAt ? format(new Date(order.createdAt), 'HH:mm', { locale: ru }) : '--:--'}
                                 </span>
                                 <div className="h-0.5 w-0.5 rounded-full bg-neutral-200" />
                                 <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight">{order.items?.length || 0} поз.</span>
                               </div>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-sm font-bold text-neutral-900 tabular-nums">{(order.totalAmount || 0).toLocaleString()} ₽</p>
                            <span className={cn(
                              "text-[9px] font-bold uppercase tracking-tight",
                              order.status === 'COMPLETED' ? "text-emerald-500" : "text-amber-500"
                            )}>
                              {order.status === 'COMPLETED' ? 'Завершен' : 'В обработке'}
                            </span>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Sidebar Info Area */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          {/* AI Info Card */}
          <div className="bg-[#1F2128] rounded-xl p-8 text-white relative overflow-hidden group shadow-2xl">
             <div className="relative z-10 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold uppercase tracking-widest text-emerald-400">
                   <Target size={12} /> AI Insights
                </div>
                <div className="space-y-3">
                   <h4 className="text-xl font-bold tracking-tight">Эффективность склада</h4>
                   <p className="text-sm font-normal text-white/50 leading-relaxed">
                      Сегодня наблюдается пиковая активность в категории <b>«Розы»</b>. Рекомендуем проверить график поставок для филиала {currentStore?.name || 'Главный'}.
                   </p>
                </div>
                <Link to="/admin/inventory/stock" className="flex items-center justify-center w-full h-11 bg-emerald-500 text-neutral-950 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">
                   Ситуация по остаткам
                </Link>
             </div>
             <Flower2 className="absolute -right-8 -bottom-8 h-44 w-44 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
          </div>

          {/* Stock Health Widget */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-6">
             <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100">
                   <AlertCircle size={16} />
                </div>
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-widest">Здоровье склада</h4>
             </div>
             
             <div className="space-y-3">
                {lowStockItems.length === 0 ? (
                  <div className="flex flex-col items-center py-6 text-center gap-3 border-2 border-dashed border-neutral-50 rounded-xl">
                     <CheckCircle2 size={24} className="text-emerald-200" />
                     <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">Критических проблем нет</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                       {lowStockItems.map(item => (
                         <div key={item.id} className="p-3 bg-neutral-50 border border-neutral-100 rounded-lg">
                            <p className="text-xs font-bold text-neutral-900 line-clamp-1">{item.name}</p>
                            <p className="text-[10px] font-medium text-rose-500 mt-1">Остаток: {item.quantity} шт. (Порог {item.minThreshold})</p>
                         </div>
                       ))}
                    </div>
                    <Link to="/admin/inventory/stock" className="block text-center text-[10px] font-bold text-neutral-400 hover:text-neutral-900 uppercase tracking-widest transition-colors pt-2">
                       Смотреть все остатки
                    </Link>
                  </>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
