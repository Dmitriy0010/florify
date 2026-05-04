import { useState } from 'react'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Loader2,
  Package,
  Activity,
  Star,
  LineChart,
  User,
  Calendar
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { AnalyticsService } from '@/lib/api'
import { cn } from '@/lib/utils'
import { format, startOfMonth } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { toast } from 'sonner'

const toISO = (date: string, endOfDay = false) => `${date}T${endOfDay ? '23:59:59' : '00:00:00'}Z`

const PRESETS = [
  { label: '7 дней', from: () => { const d = new Date(); d.setDate(d.getDate() - 7); return format(d, 'yyyy-MM-dd') } },
  { label: '30 дней', from: () => { const d = new Date(); d.setDate(d.getDate() - 30); return format(d, 'yyyy-MM-dd') } },
  { label: 'Месяц', from: () => format(startOfMonth(new Date()), 'yyyy-MM-dd') },
  { label: '3 мес', from: () => { const d = new Date(); d.setMonth(d.getMonth() - 3); return format(d, 'yyyy-MM-dd') } },
]

// ─────────────────────────────────────────────────────────────────────────────
// Interactive Recharts Area Chart
// ─────────────────────────────────────────────────────────────────────────────
function SalesChart({ points, isLoading }: { points: any[]; isLoading: boolean }) {
  const data = points.map(p => ({
    date: p.period ? format(new Date(p.period), 'dd MMM', { locale: ru }) : '',
    revenue: p.revenue ?? 0
  }))

  return (
    <div className="bg-white rounded-[2rem] border border-neutral-100 shadow-sm p-6 lg:p-8 flex flex-col h-full relative overflow-hidden group">
      {/* Decorative gradient blur */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-700" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h3 className="text-lg font-black text-neutral-900 flex items-center gap-2">
            <LineChart size={20} className="text-emerald-500" />
            Динамика выручки
          </h3>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">
            Продажи по дням
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 rounded-lg">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">В реальном времени</span>
        </div>
      </div>

      <div className="flex-1 min-h-[280px] w-full relative z-10">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-20">
            <Loader2 className="animate-spin text-emerald-500" size={32} />
          </div>
        ) : data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-2 opacity-50">
            <BarChart3 size={32} className="text-neutral-300" />
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Нет данных за период</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#a3a3a3', fontWeight: 700 }}
                dy={10}
                minTickGap={30}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#a3a3a3', fontWeight: 700 }}
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}
                itemStyle={{ color: '#10b981', fontWeight: 900, fontSize: '14px' }}
                labelStyle={{ color: '#a3a3a3', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, marginBottom: '4px' }}
                formatter={(value: number) => [`${value.toLocaleString('ru')} ₽`, 'Выручка']}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [dateRange, setDateRange] = useState({
    from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    to: today
  })
  const [isExporting, setIsExporting] = useState(false)

  // Queries
  const { data: dashboard } = useQuery({
    queryKey: ['analytics-dashboard', dateRange],
    queryFn: () => AnalyticsService.getDashboard({ from: toISO(dateRange.from), to: toISO(dateRange.to, true) }).then(r => r.data)
  })

  const { data: salesRes, isLoading: isLoadingSales } = useQuery({
    queryKey: ['analytics-sales', dateRange],
    queryFn: () => AnalyticsService.getSales(dateRange.from, dateRange.to, 'DAY').then(r => r.data)
  })

  const { data: topProductsRes } = useQuery({
    queryKey: ['analytics-top-products', dateRange],
    queryFn: () => AnalyticsService.getTopProducts(dateRange.from, dateRange.to, 8).then(r => r.data)
  })

  const { data: employeesRes } = useQuery({
    queryKey: ['analytics-employees', dateRange],
    queryFn: () => AnalyticsService.getEmployeePerformance(dateRange.from, dateRange.to).then(r => r.data)
  })

  const { data: customerStats } = useQuery({
    queryKey: ['analytics-customers'],
    queryFn: () => AnalyticsService.getCustomerStats().then(r => r.data)
  })

  const salesPoints = salesRes?.points || []
  const topProducts = topProductsRes?.items || []
  const employees = employeesRes?.items || []

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const res = await AnalyticsService.export('SALES', dateRange.from, dateRange.to)
      const url = window.URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url; a.download = `analytics-${dateRange.from}-${dateRange.to}.pdf`
      document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url)
      toast.success('Отчет успешно скачан')
    } catch {
      toast.error('Ошибка при скачивании отчета')
    } finally {
      setIsExporting(false)
    }
  }

  const returnRate = customerStats?.uniqueCustomers
    ? Math.round(((customerStats.repeatCustomers ?? 0) / customerStats.uniqueCustomers) * 100)
    : 0

  return (
    <div className="flex flex-col h-full overflow-hidden bg-neutral-50/50">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-neutral-100 px-8 py-5 flex items-center justify-between flex-shrink-0 z-10 relative">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight leading-none">Аналитика</h1>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Ключевые показатели бизнеса
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-neutral-100/50 p-1 rounded-xl border border-neutral-200/50">
            {PRESETS.map(p => (
              <button key={p.label} onClick={() => setDateRange({ from: p.from(), to: today })}
                className="h-8 px-4 rounded-lg text-[9px] font-black text-neutral-500 uppercase tracking-widest hover:bg-white hover:text-neutral-900 hover:shadow-sm transition-all">
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-xl px-4 h-10 shadow-sm focus-within:ring-2 ring-emerald-500/20 transition-all">
            <Calendar size={14} className="text-neutral-400" />
            <input type="date" value={dateRange.from} onChange={e => setDateRange(d => ({ ...d, from: e.target.value }))}
              className="text-xs font-bold bg-transparent outline-none text-neutral-700 w-[110px]" />
            <span className="text-neutral-300">—</span>
            <input type="date" value={dateRange.to} onChange={e => setDateRange(d => ({ ...d, to: e.target.value }))}
              className="text-xs font-bold bg-transparent outline-none text-neutral-700 w-[110px]" />
          </div>
          <button 
            onClick={handleExport} 
            disabled={isExporting}
            className="h-10 px-6 bg-neutral-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all flex items-center gap-2 shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />} 
            {isExporting ? 'Формирование...' : 'Экспорт'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-8 space-y-8">

        {/* ── KPI Row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            { label: 'Выручка',    value: `${(dashboard?.totalRevenue || 0).toLocaleString('ru')} ₽`, icon: DollarSign, trend: 'up',   bg: 'from-emerald-500/10 to-emerald-500/0', border: 'border-emerald-100', text: 'text-emerald-500' },
            { label: 'Заказы',     value: (dashboard?.totalOrders   || 0).toString(),                  icon: Package,  trend: 'up',   bg: 'from-blue-500/10 to-blue-500/0', border: 'border-blue-100', text: 'text-blue-500' },
            { label: 'Ср. чек',    value: `${(dashboard?.averageCheck || 0).toLocaleString('ru')} ₽`,  icon: TrendingUp, trend: 'neutral', bg: 'from-violet-500/10 to-violet-500/0', border: 'border-violet-100', text: 'text-violet-500' },
            { label: 'Списания',   value: `${(dashboard?.writeOffAmount || 0).toLocaleString('ru')} ₽`, icon: TrendingDown, trend: 'down', bg: 'from-rose-500/10 to-rose-500/0', border: 'border-rose-100', text: 'text-rose-500' },
          ].map(({ label, value, icon: Icon, trend, bg, border, text }) => (
            <div key={label} className={cn("bg-gradient-to-b rounded-[2rem] border shadow-sm p-6 relative overflow-hidden group", bg, border)}>
              <div className="absolute top-0 right-0 p-6 opacity-20 transform translate-x-4 -translate-y-4 group-hover:scale-110 group-hover:opacity-40 transition-all duration-500">
                <Icon size={80} className={text} />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">{label}</p>
                <p className="text-3xl font-black text-neutral-900 tabular-nums tracking-tighter">{value}</p>
                <div className="flex items-center gap-1.5 mt-4">
                  <div className={cn("px-2 py-0.5 rounded-md flex items-center gap-1", 
                    trend === 'up' ? 'bg-emerald-100/50 text-emerald-600' : 
                    trend === 'down' ? 'bg-rose-100/50 text-rose-600' : 'bg-neutral-100 text-neutral-500'
                  )}>
                    {trend === 'up' && <ArrowUpRight size={10} />}
                    {trend === 'down' && <ArrowDownRight size={10} />}
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      {trend === 'up' ? 'Рост' : trend === 'down' ? 'Контроль' : 'Стабильно'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Sales chart + Customer stats ─────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <SalesChart points={salesPoints} isLoading={isLoadingSales} />
          </div>

          {/* Customer card */}
          <div className="bg-neutral-900 rounded-[2rem] p-8 text-white flex flex-col relative overflow-hidden shadow-xl shadow-black/5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="mb-8 relative z-10">
              <div className="h-10 w-10 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                <Users size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-black tracking-tight text-white mb-1">Клиентская база</h3>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Анализ аудитории</p>
            </div>

            <div className="flex-1 space-y-6 relative z-10">
              {[
                { label: 'Новые (Уникальные)', value: customerStats?.uniqueCustomers || 0, width: 100, color: 'bg-emerald-400' },
                { label: 'Постоянные (Возврат)', value: customerStats?.repeatCustomers || 0, width: returnRate, color: 'bg-blue-400' },
              ].map(({ label, value, width, color }) => (
                <div key={label} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">{label}</span>
                    <span className="text-lg font-black text-white tabular-nums">{value}</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-1000", color)} style={{ width: `${width}%` }} />
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4 pt-6 mt-4 border-t border-white/10">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-colors">
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Retention Rate</p>
                  <p className="text-2xl font-black text-white">{returnRate}%</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-2xl p-4 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
                  <p className="text-[9px] font-black text-emerald-500/70 uppercase tracking-widest mb-1">Тренд</p>
                  <p className="text-2xl font-black text-emerald-400 flex items-center gap-1">
                    <TrendingUp size={20} /> LTV
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Top products + Employee performance ───────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Top products */}
          <div className="bg-white rounded-[2rem] border border-neutral-100 shadow-sm p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                  <Star size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-neutral-900">Лидеры продаж</h3>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">Самые популярные товары</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {topProducts.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-neutral-100 rounded-2xl">
                  <Package size={32} className="mx-auto text-neutral-200 mb-3" />
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Нет данных для анализа</p>
                </div>
              ) : topProducts.map((item: any, i: number) => {
                const maxRev = topProducts[0]?.revenue || 1
                const pct = Math.max(5, Math.round(((item.revenue ?? 0) / maxRev) * 100))
                return (
                  <div key={i} className="flex items-center gap-4 p-3 hover:bg-neutral-50 rounded-2xl transition-colors group">
                    <div className={cn(
                      'h-10 w-10 rounded-2xl flex items-center justify-center text-xs font-black shadow-sm',
                      i === 0 ? 'bg-amber-400 text-white shadow-amber-400/30' : 
                      i === 1 ? 'bg-neutral-300 text-white' : 
                      i === 2 ? 'bg-orange-300 text-white' : 
                      'bg-neutral-100 text-neutral-500'
                    )}>
                      #{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-bold text-neutral-900 truncate pr-4">{item.productName || 'Неизвестный товар'}</p>
                        <p className="text-sm font-black text-neutral-900 tabular-nums">{(item.revenue ?? 0).toLocaleString('ru')} ₽</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 flex-1 bg-neutral-100 rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full transition-all duration-1000", i === 0 ? "bg-amber-400" : "bg-neutral-900")} 
                            style={{ width: `${pct}%` }} 
                          />
                        </div>
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest whitespace-nowrap">
                          {item.unitsSold || 0} шт
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Employee performance */}
          <div className="bg-white rounded-[2rem] border border-neutral-100 shadow-sm p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                  <Activity size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-neutral-900">Команда</h3>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">Эффективность флористов</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {employees.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-neutral-100 rounded-2xl">
                  <Users size={32} className="mx-auto text-neutral-200 mb-3" />
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Нет сотрудников в базе</p>
                </div>
              ) : employees.map((emp: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white border border-neutral-100 shadow-sm rounded-2xl hover:border-emerald-200 hover:ring-2 hover:ring-emerald-50 transition-all cursor-pointer group">
                  <div className="h-12 w-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <User size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-black text-neutral-900 truncate">{emp.employeeName || 'Неизвестно'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-neutral-100 rounded-md text-[9px] font-black text-neutral-500 uppercase tracking-widest">
                        {emp.ordersHandled || 0} заказов
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-neutral-900 tabular-nums">{(emp.totalRevenue ?? 0).toLocaleString('ru')} ₽</p>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-0.5 flex items-center justify-end gap-1">
                      <ArrowUpRight size={12} /> {Math.round(emp.avgOrderValue ?? 0).toLocaleString('ru')} ₽ ср. чек
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
