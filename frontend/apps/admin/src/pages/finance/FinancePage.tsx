import { useState, useMemo } from 'react'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Calendar,
  Download,
  BarChart3,
  Activity,
  CreditCard,
  FileText,
  ChevronRight,
  ChevronDown,
  DollarSign,
  AlertTriangle
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { FinanceService, AnalyticsService } from '@/lib/api'
import { cn } from '@/lib/utils'
import { format, parseISO, startOfMonth, subMonths } from 'date-fns'
import { ru } from 'date-fns/locale'

// ─────────────────────────────────────────────────────────────────────────────
// Transaction type config
// ─────────────────────────────────────────────────────────────────────────────
const TX_TYPE_CONFIG: Record<string, { label: string; color: string; sign: '+' | '-'; bgColor: string }> = {
  REVENUE_SALE:      { label: 'Продажа',    color: 'text-emerald-600', sign: '+', bgColor: 'bg-emerald-50 border-emerald-100' },
  EXPENSE_PURCHASE:  { label: 'Закупка',    color: 'text-red-500',     sign: '-', bgColor: 'bg-red-50 border-red-100' },
  EXPENSE_SALARY:    { label: 'Зарплата',   color: 'text-violet-500',  sign: '-', bgColor: 'bg-violet-50 border-violet-100' },
  EXPENSE_RENT:      { label: 'Аренда',     color: 'text-amber-600',   sign: '-', bgColor: 'bg-amber-50 border-amber-100' },
  EXPENSE_MARKETING: { label: 'Маркетинг',  color: 'text-sky-500',     sign: '-', bgColor: 'bg-sky-50 border-sky-100' },
  REVENUE_REFUND:    { label: 'Возврат',    color: 'text-orange-500',  sign: '-', bgColor: 'bg-orange-50 border-orange-100' },
  EXPENSE_WRITEOFF:  { label: 'Списание',   color: 'text-neutral-500', sign: '-', bgColor: 'bg-neutral-50 border-neutral-200' },
}

const getTxConfig = (type: string) => TX_TYPE_CONFIG[type] ?? { label: type, color: 'text-neutral-500', sign: '+' as const, bgColor: 'bg-neutral-50 border-neutral-100' }

// Quick date range presets
const PRESETS = [
  { label: '7 дней',  days: 7 },
  { label: '30 дней', days: 30 },
  { label: '3 мес',   days: 90 },
  { label: 'Месяц',   days: 0, monthStart: true },
]

const toDate = (d: number, monthStart?: boolean) => {
  if (monthStart) return format(startOfMonth(new Date()), 'yyyy-MM-dd')
  const dt = new Date()
  dt.setDate(dt.getDate() - d)
  return format(dt, 'yyyy-MM-dd')
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI Card
// ─────────────────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, trend, accent }: {
  label: string; value: string; sub?: string; icon: any; trend?: 'up' | 'down' | 'neutral'; accent?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">{label}</p>
        <div className={cn('h-8 w-8 rounded-xl flex items-center justify-center', accent || 'bg-neutral-50')}>
          <Icon size={16} className={cn(
            trend === 'up' ? 'text-emerald-500' :
            trend === 'down' ? 'text-red-500' : 'text-neutral-400'
          )} />
        </div>
      </div>
      <p className="text-2xl font-black text-neutral-900 tabular-nums leading-none">{value}</p>
      {sub && (
        <div className="flex items-center gap-1.5">
          {trend === 'up' && <ArrowUpRight size={12} className="text-emerald-500" />}
          {trend === 'down' && <ArrowDownRight size={12} className="text-red-500" />}
          <p className={cn('text-[9px] font-black uppercase tracking-widest', trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-neutral-400')}>{sub}</p>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Mini bar chart (pure CSS)
// ─────────────────────────────────────────────────────────────────────────────
function PnlBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max === 0 ? 0 : Math.min(100, (value / max) * 100)
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">{label}</span>
        <span className="text-sm font-black text-neutral-900 tabular-nums">{value.toLocaleString('ru')} ₽</span>
      </div>
      <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-700', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function FinancePage() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [dateRange, setDateRange] = useState({
    from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    to: today
  })
  const [txSearch, setTxSearch] = useState('')
  const [txTypeFilter, setTxTypeFilter] = useState('')

  const { data: report, isLoading } = useQuery({
    queryKey: ['finance-pnl', dateRange],
    queryFn: () => FinanceService.getPnlReport(dateRange).then(r => r.data)
  })

  const { data: txData, isLoading: isTxLoading } = useQuery({
    queryKey: ['finance-transactions'],
    queryFn: () => FinanceService.getTransactions({ page: 0, size: 100 }).then(r => r.data)
  })
  const allTransactions = txData?.content || []

  const transactions = useMemo(() => allTransactions.filter((tx: any) => {
    const matchSearch = !txSearch || (tx.description || '').toLowerCase().includes(txSearch.toLowerCase())
    const matchType = !txTypeFilter || tx.type === txTypeFilter
    return matchSearch && matchType
  }), [allTransactions, txSearch, txTypeFilter])

  const revenue = report?.revenue || 0
  const grossProfit = report?.grossProfit || 0
  const netProfit = report?.netProfit || 0
  const cogs = report?.cogs || 0
  const opEx = report?.operatingExpenses || 0
  const writeOff = report?.writeOffLosses || 0
  const grossMargin = revenue > 0 ? Math.round((grossProfit / revenue) * 100) : 0
  const netMargin = revenue > 0 ? Math.round((netProfit / revenue) * 100) : 0

  const handleExport = async () => {
    try {
      const res = await AnalyticsService.export('PNL', dateRange.from, dateRange.to)
      const url = window.URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url; a.download = `pnl-${dateRange.from}-${dateRange.to}.pdf`
      document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url)
    } catch { }
  }

  return (
    <div className="flex flex-col h-screen bg-[#F7F8FA] overflow-hidden">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-neutral-100 px-8 py-5 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-neutral-900 tracking-tight leading-none">Финансовый учёт</h1>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-1">P&L — Отчёт о прибылях и убытках</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Presets */}
          <div className="flex items-center gap-1.5">
            {PRESETS.map(p => (
              <button key={p.label} onClick={() => setDateRange({ from: toDate(p.days, p.monthStart), to: today })}
                className="h-8 px-3 bg-neutral-50 border border-neutral-200 rounded-lg text-[9px] font-black text-neutral-500 uppercase tracking-widest hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all">
                {p.label}
              </button>
            ))}
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-xl px-4 h-10">
            <Calendar size={14} className="text-neutral-400" />
            <input type="date" value={dateRange.from} onChange={e => setDateRange(d => ({ ...d, from: e.target.value }))}
              className="text-xs font-bold bg-transparent outline-none text-neutral-700" />
            <span className="text-neutral-300">—</span>
            <input type="date" value={dateRange.to} onChange={e => setDateRange(d => ({ ...d, to: e.target.value }))}
              className="text-xs font-bold bg-transparent outline-none text-neutral-700" />
          </div>

          <button onClick={handleExport} className="h-10 px-5 bg-neutral-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-black/10">
            <Download size={15} /> PDF
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-8 space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-neutral-200" size={40} />
            <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Формирование отчёта...</p>
          </div>
        ) : (
          <>
            {/* ── KPI Cards ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard label="Выручка" value={`${revenue.toLocaleString('ru')} ₽`} icon={TrendingUp} trend="up" sub="За период" accent="bg-emerald-50" />
              <KpiCard label="COGS (Себестоимость)" value={`${cogs.toLocaleString('ru')} ₽`} icon={TrendingDown} trend="down" sub="Закупки и производство" accent="bg-red-50" />
              <KpiCard label="Валовая прибыль" value={`${grossProfit.toLocaleString('ru')} ₽`} icon={DollarSign} trend={grossProfit >= 0 ? 'up' : 'down'} sub={`Маржа: ${grossMargin}%`} accent="bg-sky-50" />
              <KpiCard label="Чистая прибыль" value={`${netProfit.toLocaleString('ru')} ₽`} icon={ArrowUpRight} trend={netProfit >= 0 ? 'up' : 'down'} sub={`Рентабельность: ${netMargin}%`} accent="bg-violet-50" />
            </div>

            {/* ── Main content grid ─────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-6">

              {/* Expense breakdown — 2/3 */}
              <div className="col-span-2 bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-neutral-900 tracking-tight">Расшифровка расходов</h3>
                    <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mt-0.5">Детализация затрат периода</p>
                  </div>
                  <BarChart3 size={18} className="text-neutral-200" />
                </div>

                <div className="space-y-4">
                  <PnlBar label="Операционные расходы" value={opEx} max={revenue || 1} color="bg-sky-400" />
                  <PnlBar label="Списания и потери" value={writeOff} max={revenue || 1} color="bg-red-400" />
                  <PnlBar label="Себестоимость (COGS)" value={cogs} max={revenue || 1} color="bg-amber-400" />
                </div>

                {/* Margin insight */}
                <div className="pt-4 border-t border-neutral-50 flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-neutral-50 flex items-center justify-center flex-shrink-0">
                    <Activity size={18} className="text-neutral-400" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-neutral-900">Анализ маржинальности</p>
                    <p className="text-[10px] font-bold text-neutral-400 mt-1 leading-relaxed">
                      Валовая маржа: <strong className="text-neutral-700">{grossMargin}%</strong> ·
                      Чистая рентабельность: <strong className="text-neutral-700">{netMargin}%</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Tax calendar — 1/3 */}
              <div className="bg-neutral-900 rounded-2xl p-6 text-white flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 bg-white/10 rounded-2xl flex items-center justify-center mb-5">
                    <Wallet size={18} className="text-white" />
                  </div>
                  <h3 className="text-base font-black tracking-tight mb-2">Налоговый календарь</h3>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                    Следующий платёж:{' '}
                    <span className="text-white/70">
                      {format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 25), 'd MMMM', { locale: ru })}
                    </span>
                  </p>

                  {/* Margin mini-cards */}
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Чистая прибыль</p>
                      <p className="text-xl font-black text-white">{netMargin}%</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Вал. маржа</p>
                      <p className="text-xl font-black text-emerald-400">{grossMargin}%</p>
                    </div>
                  </div>
                </div>

                <button onClick={handleExport} className="mt-6 w-full h-11 bg-white text-neutral-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-100 transition-all flex items-center justify-center gap-2">
                  <Download size={14} /> Скачать PDF
                </button>
              </div>
            </div>

            {/* ── Transactions ──────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
              {/* Toolbar */}
              <div className="px-6 py-5 border-b border-neutral-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="text-sm font-black text-neutral-900">История операций</h3>
                  </div>
                  <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">({transactions.length})</span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Type filter */}
                  <select value={txTypeFilter} onChange={e => setTxTypeFilter(e.target.value)}
                    className="h-9 px-3 bg-neutral-50 border border-neutral-200 rounded-xl text-[10px] font-black text-neutral-500 outline-none appearance-none uppercase tracking-widest min-w-[130px]">
                    <option value="">Все типы</option>
                    {Object.entries(TX_TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>

                  {/* Search */}
                  <input type="text" placeholder="Поиск по описанию..." value={txSearch} onChange={e => setTxSearch(e.target.value)}
                    className="h-9 px-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold outline-none focus:border-neutral-500 w-48" />
                </div>
              </div>

              {/* Table header */}
              <div className="px-6 py-3 border-b border-neutral-50 bg-neutral-50/50 grid grid-cols-12 gap-4">
                {['Тип', 'Сумма', 'Описание', 'Дата'].map((h, i) => (
                  <div key={h} className={cn('text-[9px] font-black text-neutral-400 uppercase tracking-widest', i === 0 ? 'col-span-2' : i === 1 ? 'col-span-2' : i === 2 ? 'col-span-6' : 'col-span-2 text-right')}>{h}</div>
                ))}
              </div>

              {isTxLoading ? (
                <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-neutral-200" size={28} /></div>
              ) : transactions.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Нет записей</p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-50">
                  {transactions.map((tx: any, idx: number) => {
                    const cfg = getTxConfig(tx.type)
                    return (
                      <div key={tx.id} className={cn('grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-neutral-50/50 transition-colors', idx % 2 === 1 ? 'bg-neutral-50/20' : 'bg-white')}>
                        <div className="col-span-2">
                          <span className={cn('px-2.5 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest', cfg.bgColor, cfg.color)}>
                            {cfg.label}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className={cn('text-sm font-black tabular-nums', cfg.sign === '+' ? 'text-emerald-600' : 'text-red-500')}>
                            {cfg.sign}{tx.amount.toLocaleString('ru')} ₽
                          </span>
                        </div>
                        <div className="col-span-6">
                          <p className="text-xs font-bold text-neutral-600 truncate">{tx.description || 'Без описания'}</p>
                        </div>
                        <div className="col-span-2 text-right">
                          <span className="text-[10px] font-black text-neutral-400 tabular-nums">
                            {tx.occurredAt ? format(parseISO(tx.occurredAt), 'dd.MM HH:mm') : '—'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Status bar ──────────────────────────────────────────────────── */}
      <div className="bg-white border-t border-neutral-100 px-8 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-6">
          <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">
            Период: {format(parseISO(dateRange.from), 'd MMM', { locale: ru })} — {format(parseISO(dateRange.to), 'd MMM yyyy', { locale: ru })}
          </span>
          {netProfit < 0 && (
            <div className="flex items-center gap-1.5">
              <AlertTriangle size={12} className="text-amber-500" />
              <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Убыточный период</span>
            </div>
          )}
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 text-[9px] font-black text-neutral-400 hover:text-neutral-900 uppercase tracking-widest transition-colors">
          <ArrowUpRight size={14} /> Экспорт P&L
        </button>
      </div>
    </div>
  )
}
