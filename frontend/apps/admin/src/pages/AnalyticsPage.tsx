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
  Calendar,
  Package,
  Activity,
  Target,
  Star
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { AnalyticsService } from '@/lib/api'
import { cn } from '@/lib/utils'
import { format, startOfMonth } from 'date-fns'
import { ru } from 'date-fns/locale'

const toISO = (date: string, endOfDay = false) => `${date}T${endOfDay ? '23:59:59' : '00:00:00'}Z`

const PRESETS = [
  { label: '7 дней', from: () => { const d = new Date(); d.setDate(d.getDate() - 7); return format(d, 'yyyy-MM-dd') } },
  { label: '30 дней', from: () => { const d = new Date(); d.setDate(d.getDate() - 30); return format(d, 'yyyy-MM-dd') } },
  { label: 'Месяц', from: () => format(startOfMonth(new Date()), 'yyyy-MM-dd') },
  { label: '3 мес', from: () => { const d = new Date(); d.setMonth(d.getMonth() - 3); return format(d, 'yyyy-MM-dd') } },
]

// ─────────────────────────────────────────────────────────────────────────────
// Mini horizontal bar chart
// ─────────────────────────────────────────────────────────────────────────────
function SalesChart({ points, isLoading }: { points: any[]; isLoading: boolean }) {
  const maxVal = Math.max(...points.map(p => p.revenue ?? 0), 1)
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-black text-neutral-900">Динамика продаж</h3>
          <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mt-0.5">Выручка по дням</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-neutral-900" />
          <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Выручка ₽</span>
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center">
          <Loader2 className="animate-spin text-neutral-200" size={28} />
        </div>
      ) : points.length === 0 ? (
        <div className="h-48 flex items-center justify-center">
          <p className="text-[10px] font-black text-neutral-200 uppercase tracking-widest">Нет данных</p>
        </div>
      ) : (
        <div className="h-52 flex items-end gap-[3px]">
          {points.slice(-30).map((point, idx) => {
            const h = Math.max(4, ((point.revenue ?? 0) / maxVal) * 100)
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 bg-neutral-900 text-white px-2 py-1 rounded-lg text-[8px] font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10">
                  {(point.revenue ?? 0).toLocaleString('ru')} ₽
                </div>
                <div
                  className="w-full bg-neutral-100 group-hover:bg-neutral-900 rounded-t transition-all duration-200"
                  style={{ height: `${h}%` }}
                />
                {idx % 5 === 0 && (
                  <span className="text-[7px] font-black text-neutral-300 rotate-0">
                    {point.period ? format(new Date(point.period), 'dd', { locale: ru }) : ''}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
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
    try {
      const res = await AnalyticsService.export('SALES', dateRange.from, dateRange.to)
      const url = window.URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url; a.download = `analytics-${dateRange.from}-${dateRange.to}.pdf`
      document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url)
    } catch { }
  }

  const returnRate = customerStats?.uniqueCustomers
    ? Math.round(((customerStats.repeatCustomers ?? 0) / customerStats.uniqueCustomers) * 100)
    : 0

  return (
    <div className="flex flex-col h-screen bg-[#F7F8FA] overflow-hidden">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-neutral-100 px-8 py-5 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-neutral-900 tracking-tight leading-none">Аналитика бизнеса</h1>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-1">Ключевые показатели и эффективность</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {PRESETS.map(p => (
              <button key={p.label} onClick={() => setDateRange({ from: p.from(), to: today })}
                className="h-8 px-3 bg-neutral-50 border border-neutral-200 rounded-lg text-[9px] font-black text-neutral-500 uppercase tracking-widest hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all">
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-xl px-4 h-10">
            <Calendar size={14} className="text-neutral-400" />
            <input type="date" value={dateRange.from} onChange={e => setDateRange(d => ({ ...d, from: e.target.value }))}
              className="text-xs font-bold bg-transparent outline-none text-neutral-700" />
            <span className="text-neutral-300">—</span>
            <input type="date" value={dateRange.to} onChange={e => setDateRange(d => ({ ...d, to: e.target.value }))}
              className="text-xs font-bold bg-transparent outline-none text-neutral-700" />
          </div>
          <button onClick={handleExport} className="h-10 px-5 bg-neutral-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-black/10">
            <Download size={15} /> Экспорт
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-8 space-y-6">

        {/* ── KPI Row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Выручка',    value: `${(dashboard?.totalRevenue || 0).toLocaleString('ru')} ₽`, icon: DollarSign, trend: 'up',   bg: 'bg-emerald-50' },
            { label: 'Заказы',     value: (dashboard?.totalOrders   || 0).toString(),                  icon: BarChart3,  trend: 'up',   bg: 'bg-sky-50' },
            { label: 'Ср. чек',    value: `${(dashboard?.averageCheck || 0).toLocaleString('ru')} ₽`,  icon: TrendingUp, trend: 'neutral', bg: 'bg-violet-50' },
            { label: 'Списания',   value: `${(dashboard?.writeOffAmount || 0).toLocaleString('ru')} ₽`, icon: TrendingDown, trend: 'down', bg: 'bg-red-50' },
          ].map(({ label, value, icon: Icon, trend, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">{label}</p>
                <div className={cn('h-8 w-8 rounded-xl flex items-center justify-center', bg)}>
                  <Icon size={16} className={cn(trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-neutral-400')} />
                </div>
              </div>
              <p className="text-2xl font-black text-neutral-900 tabular-nums">{value}</p>
              <div className="flex items-center gap-1 mt-2">
                {trend === 'up' && <ArrowUpRight size={12} className="text-emerald-400" />}
                {trend === 'down' && <ArrowDownRight size={12} className="text-red-400" />}
                <p className={cn('text-[9px] font-black uppercase tracking-widest', trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-neutral-400')}>
                  {trend === 'up' ? 'Рост' : trend === 'down' ? 'Контроль' : 'Стабильно'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Sales chart + Customer stats ─────────────────────────────── */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <SalesChart points={salesPoints} isLoading={isLoadingSales} />
          </div>

          {/* Customer card */}
          <div className="bg-neutral-900 rounded-2xl p-6 text-white flex flex-col">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Users size={16} className="text-white/40" />
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Клиентская база</p>
              </div>
              <h3 className="text-base font-black tracking-tight">Покупатели</h3>
            </div>

            <div className="flex-1 space-y-5">
              {[
                { label: 'Уникальных', value: customerStats?.uniqueCustomers || 0, width: 100 },
                { label: 'Повторных', value: customerStats?.repeatCustomers || 0, width: returnRate },
              ].map(({ label, value, width }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{label}</span>
                    <span className="text-sm font-black text-white">{value}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-white/30 rounded-full transition-all duration-700" style={{ width: `${width}%` }} />
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3 pt-4">
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Возврат</p>
                  <p className="text-xl font-black text-white">{returnRate}%</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Тренд</p>
                  <p className="text-xl font-black text-emerald-400">↑ LTV</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Top products + Employee performance ───────────────────────── */}
        <div className="grid grid-cols-2 gap-6">

          {/* Top products */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-black text-neutral-900">Лидеры продаж</h3>
                <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mt-0.5">Топ по выручке</p>
              </div>
              <Package size={16} className="text-neutral-200" />
            </div>

            <div className="space-y-3">
              {topProducts.length === 0 ? (
                <div className="py-10 text-center"><p className="text-[10px] font-black text-neutral-200 uppercase tracking-widest">Нет данных</p></div>
              ) : topProducts.map((item: any, i: number) => {
                const maxRev = topProducts[0]?.revenue || 1
                const pct = Math.round(((item.revenue ?? 0) / maxRev) * 100)
                return (
                  <div key={i} className="flex items-center gap-3 group">
                    <div className={cn('h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 transition-all',
                      i === 0 ? 'bg-amber-500 text-white' : i === 1 ? 'bg-neutral-400 text-white' : i === 2 ? 'bg-orange-400 text-white' : 'bg-neutral-100 text-neutral-500'
                    )}>
                      {i === 0 ? <Star size={12} /> : `${i + 1}`}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-black text-neutral-800 truncate">{item.productName || '—'}</p>
                        <p className="text-xs font-black text-neutral-900 ml-2 tabular-nums flex-shrink-0">{(item.revenue ?? 0).toLocaleString('ru')} ₽</p>
                      </div>
                      <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full bg-neutral-800 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <span className="text-[9px] font-black text-neutral-300 w-8 text-right">{item.unitsSold || 0} шт</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Employee performance */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-black text-neutral-900">Эффективность персонала</h3>
                <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mt-0.5">Продажи и средний чек</p>
              </div>
              <Activity size={16} className="text-neutral-200" />
            </div>

            <div className="space-y-2">
              {employees.length === 0 ? (
                <div className="py-10 text-center"><p className="text-[10px] font-black text-neutral-200 uppercase tracking-widest">Нет данных</p></div>
              ) : employees.map((emp: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-100 hover:border-neutral-300 hover:bg-white transition-all cursor-pointer group">
                  <div className="h-9 w-9 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-[10px] font-black text-neutral-500 group-hover:bg-neutral-900 group-hover:text-white group-hover:border-neutral-900 transition-all">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-neutral-900 truncate">{emp.employeeName || '—'}</p>
                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">{emp.ordersHandled || 0} заказов</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black text-neutral-900 tabular-nums">{(emp.totalRevenue ?? 0).toLocaleString('ru')} ₽</p>
                    <div className="flex items-center justify-end gap-1">
                      <ArrowUpRight size={10} className="text-emerald-400" />
                      <span className="text-[9px] font-black text-emerald-500">{Math.round(emp.avgOrderValue ?? 0)} ₽ ср. чек</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Status bar ──────────────────────────────────────────────────── */}
      <div className="bg-white border-t border-neutral-100 px-8 py-3 flex items-center justify-between flex-shrink-0">
        <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">
          {format(new Date(dateRange.from), 'd MMM', { locale: ru })} — {format(new Date(dateRange.to), 'd MMM yyyy', { locale: ru })}
        </span>
        <button onClick={handleExport} className="flex items-center gap-2 text-[9px] font-black text-neutral-400 hover:text-neutral-900 uppercase tracking-widest transition-colors">
          <Download size={14} /> Экспорт отчёта
        </button>
      </div>
    </div>
  )
}
