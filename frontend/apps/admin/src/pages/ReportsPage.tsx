import { useState } from 'react'
import {
  FileText,
  Download,
  Calendar,
  PieChart,
  TrendingUp,
  Package,
  Loader2,
  FileSpreadsheet,
  BarChart3,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileDown
} from 'lucide-react'
import { AnalyticsService } from '@/lib/api'
import { cn } from '@/lib/utils'
import { format, startOfMonth } from 'date-fns'
import { ru } from 'date-fns/locale'
import { toast } from 'sonner'

type ReportType = 'PNL' | 'SALES' | 'INVENTORY'

interface ReportDef {
  id: ReportType
  title: string
  subtitle: string
  description: string
  icon: any
  color: string
  metrics: string[]
}

const REPORTS: ReportDef[] = [
  {
    id: 'PNL',
    title: 'P&L Report',
    subtitle: 'Прибыли и убытки',
    description: 'Детальный финансовый P&L: выручка, COGS, операционные расходы, валовая и чистая прибыль. Включает анализ маржинальности.',
    icon: PieChart,
    color: 'blue',
    metrics: ['Выручка', 'Себестоимость', 'Операционные расходы', 'Чистая прибыль']
  },
  {
    id: 'SALES',
    title: 'Sales Report',
    subtitle: 'Отчёт по продажам',
    description: 'Анализ транзакций, популярных товаров, динамика чеков и эффективность каналов продаж (WEB/POS/MOBILE).',
    icon: TrendingUp,
    color: 'green',
    metrics: ['Кол-во заказов', 'Средний чек', 'Топ продукты', 'Каналы продаж']
  },
  {
    id: 'INVENTORY',
    title: 'Inventory Report',
    subtitle: 'Складской отчёт',
    description: 'Движение товаров, инвентаризация, акты списания, текущие остатки и оборачиваемость склада.',
    icon: Package,
    color: 'amber',
    metrics: ['Остатки', 'Оборачиваемость', 'Списания', 'Поступления']
  }
]

const PRESETS = [
  { label: '7 дней',   from: () => { const d = new Date(); d.setDate(d.getDate() - 7); return format(d, 'yyyy-MM-dd') } },
  { label: '30 дней',  from: () => { const d = new Date(); d.setDate(d.getDate() - 30); return format(d, 'yyyy-MM-dd') } },
  { label: 'Месяц',    from: () => format(startOfMonth(new Date()), 'yyyy-MM-dd') },
  { label: 'Квартал',  from: () => { const d = new Date(); d.setMonth(d.getMonth() - 3); return format(d, 'yyyy-MM-dd') } },
]

// ─────────────────────────────────────────────────────────────────────────────
// Report card
// ─────────────────────────────────────────────────────────────────────────────
function ReportCard({ report, exporting, onExport }: {
  report: ReportDef
  exporting: ReportType | null
  onExport: (id: ReportType, fmt: 'PDF' | 'EXCEL') => void
}) {
  const isExporting = exporting === report.id
  const colorMap = {
    blue: {
      icon: 'bg-sky-50 text-sky-500',
      bar: 'bg-sky-500',
      badge: 'bg-sky-50 text-sky-600 border-sky-100',
      button: 'bg-sky-600 hover:bg-sky-700',
    },
    green: {
      icon: 'bg-emerald-50 text-emerald-500',
      bar: 'bg-emerald-500',
      badge: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      button: 'bg-emerald-600 hover:bg-emerald-700',
    },
    amber: {
      icon: 'bg-amber-50 text-amber-500',
      bar: 'bg-amber-500',
      badge: 'bg-amber-50 text-amber-600 border-amber-100',
      button: 'bg-amber-600 hover:bg-amber-700',
    },
  }[report.color]!

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 flex flex-col hover:shadow-lg transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={cn('h-11 w-11 rounded-2xl flex items-center justify-center flex-shrink-0', colorMap.icon)}>
            <report.icon size={20} />
          </div>
          <div>
            <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">{report.title}</p>
            <h3 className="text-sm font-black text-neutral-900 mt-0.5">{report.subtitle}</h3>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-[11px] font-bold text-neutral-500 leading-relaxed mb-5">{report.description}</p>

      {/* Metrics chips */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {report.metrics.map(m => (
          <span key={m} className={cn('px-2 py-0.5 rounded border text-[8px] font-black uppercase tracking-widest', colorMap.badge)}>
            {m}
          </span>
        ))}
      </div>

      {/* Export buttons */}
      <div className="mt-auto space-y-2">
        <button
          onClick={() => onExport(report.id, 'PDF')}
          disabled={!!exporting}
          className={cn(
            'w-full h-11 rounded-xl flex items-center justify-center gap-2 text-white text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 active:scale-95 shadow-md',
            colorMap.button
          )}
        >
          {isExporting ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />}
          Скачать PDF
        </button>
        <button
          onClick={() => onExport(report.id, 'EXCEL')}
          disabled={!!exporting}
          className="w-full h-11 rounded-xl flex items-center justify-center gap-2 bg-neutral-50 border border-neutral-200 text-neutral-600 text-[10px] font-black uppercase tracking-widest hover:bg-neutral-100 transition-all disabled:opacity-50 active:scale-95"
        >
          {isExporting ? <Loader2 size={15} className="animate-spin" /> : <FileSpreadsheet size={15} />}
          Скачать Excel
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [dateRange, setDateRange] = useState({
    from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    to: today
  })
  const [exporting, setExporting] = useState<ReportType | null>(null)

  const handleExport = async (type: ReportType, formatType: 'PDF' | 'EXCEL') => {
    try {
      setExporting(type)
      const res = await AnalyticsService.export(type, dateRange.from, dateRange.to, formatType)
      const blob = new Blob([res.data], { type: 'application/octet-stream' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const ext = formatType === 'PDF' ? 'pdf' : 'xlsx'
      link.setAttribute('download', `${type.toLowerCase()}_${dateRange.from}_${dateRange.to}.${ext}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Отчёт сформирован и загружен')
    } catch {
      toast.error('Ошибка при генерации отчёта')
    } finally {
      setExporting(null)
    }
  }

  const days = Math.ceil((new Date(dateRange.to).getTime() - new Date(dateRange.from).getTime()) / 86400000) + 1

  return (
    <div className="flex flex-col h-screen bg-[#F7F8FA] overflow-hidden">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-neutral-100 px-8 py-5 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-neutral-900 tracking-tight leading-none">Отчёты и Экспорт</h1>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-1">Выгрузка данных в PDF и Excel</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Presets */}
          <div className="flex items-center gap-1.5">
            {PRESETS.map(p => (
              <button key={p.label} onClick={() => setDateRange({ from: p.from(), to: today })}
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
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-8 space-y-6">

        {/* Period info banner */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-neutral-50 flex items-center justify-center">
              <Clock size={18} className="text-neutral-400" />
            </div>
            <div>
              <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Выбранный период</p>
              <p className="text-sm font-black text-neutral-900 mt-0.5">
                {format(new Date(dateRange.from), 'd MMMM', { locale: ru })} — {format(new Date(dateRange.to), 'd MMMM yyyy', { locale: ru })}
              </p>
            </div>
          </div>
          <div className="h-8 w-px bg-neutral-100" />
          <div>
            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Дней в периоде</p>
            <p className="text-sm font-black text-neutral-900 mt-0.5">{days} дней</p>
          </div>
          <div className="h-8 w-px bg-neutral-100" />
          <div className="flex items-center gap-2">
            {exporting ? (
              <div className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-neutral-400" />
                <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Формирование отчёта...</p>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Готов к экспорту</p>
              </div>
            )}
          </div>
        </div>

        {/* Report cards */}
        <div className="grid grid-cols-3 gap-6">
          {REPORTS.map(report => (
            <ReportCard key={report.id} report={report} exporting={exporting} onExport={handleExport} />
          ))}
        </div>

        {/* Custom report card */}
        <div className="bg-neutral-900 rounded-2xl p-8 text-white flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <BarChart3 size={22} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">Нужен специальный отчёт?</h3>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                Кастомные срезы, специфические фильтры, выгрузка для бухгалтерии
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Export all */}
            <button
              onClick={() => Promise.all(REPORTS.map(r => handleExport(r.id, 'PDF')))}
              disabled={!!exporting}
              className="h-11 px-6 bg-white text-neutral-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-100 transition-all disabled:opacity-50 flex items-center gap-2 active:scale-95"
            >
              <FileDown size={15} /> Скачать все PDF
            </button>
          </div>
        </div>
      </div>

      {/* ── Status bar ──────────────────────────────────────────────────── */}
      <div className="bg-white border-t border-neutral-100 px-8 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">3 типа отчётов</span>
          <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">·</span>
          <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">PDF + Excel</span>
        </div>
        {exporting && (
          <div className="flex items-center gap-2">
            <Loader2 size={12} className="animate-spin text-neutral-400" />
            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Экспорт {exporting}...</span>
          </div>
        )}
      </div>
    </div>
  )
}
