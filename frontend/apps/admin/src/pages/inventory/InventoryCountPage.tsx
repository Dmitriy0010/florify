import { useState, useEffect } from 'react'
import {
  Search,
  Save,
  Loader2,
  CheckCircle2,
  TrendingDown,
  AlertCircle,
  Package,
  History,
  Filter,
  ArrowUpDown,
  TrendingUp,
  RefreshCw,
  ChevronRight,
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { InventoryService, InventoryItem } from '@/lib/api'
import { useDashboardStore } from '@/store/useDashboardStore'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface CountItem extends InventoryItem {
  actualQuantity: string
}

interface ReconciliationResult {
  matchCount: number
  shortageCount: number
  surplusCount: number
  netResult: number
}

export default function InventoryCountPage() {
  const queryClient = useQueryClient()
  const { currentStoreId } = useDashboardStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'MISMATCH' | 'MATCHED'>('ALL')
  const [isCompleted, setIsCompleted] = useState(false)
  const [items, setItems] = useState<CountItem[]>([])
  // Сохраняем итоги ДО сброса данных
  const [finalResult, setFinalResult] = useState<ReconciliationResult | null>(null)

  const { data: stocksData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['inventory', currentStoreId],
    queryFn: () => InventoryService.getStocks(currentStoreId || undefined).then(res => res.data),
    enabled: !!currentStoreId,
  })

  useEffect(() => {
    if (stocksData) {
      setItems(stocksData.map(item => ({ ...item, actualQuantity: (item.quantity ?? 0).toString() })))
    }
  }, [stocksData])

  const computeTotals = (currentItems: CountItem[]): ReconciliationResult =>
    currentItems.reduce(
      (acc, item) => {
        const act = parseFloat(item.actualQuantity) || 0
        const diff = act - (item.quantity ?? 0)
        if (diff < 0) {
          acc.shortageCount++
          acc.netResult -= Math.abs(diff) * (item.averageCost || 0)
        } else if (diff > 0) {
          acc.surplusCount++
          acc.netResult += diff * (item.averageCost || 0)
        } else {
          acc.matchCount++
        }
        return acc
      },
      { matchCount: 0, shortageCount: 0, surplusCount: 0, netResult: 0 }
    )

  const totals = computeTotals(items)

  const saveMutation = useMutation({
    mutationFn: async (reconciliations: { productId: string; diff: number }[]) => {
      const shortages = reconciliations.filter(r => r.diff < 0)
      const surpluses = reconciliations.filter(r => r.diff > 0)

      const lossPromises = shortages.map(r =>
        InventoryService.writeOff({
          storeId: currentStoreId!,
          productId: r.productId,
          quantity: Math.abs(r.diff),
          reason: 'INVENTORY_LOSS',
          comment: `Инвентаризация (авто): -${Math.abs(r.diff)}`,
          sourceDocumentId: `INV-LOG-${Date.now()}`,
        })
      )

      const surplusPromises = surpluses.map(r => {
        const item = items.find(i => i.productId === r.productId)
        return InventoryService.receive({
          storeId: currentStoreId!,
          productId: r.productId,
          quantity: r.diff,
          purchasePrice: item?.averageCost || 0,
          sourceDocumentId: `INV-AUDIT-${Date.now()}`,
        })
      })

      return Promise.all([...lossPromises, ...surplusPromises])
    },
    onSuccess: () => {
      toast.success('Результаты инвентаризации сохранены')
      // Invalidate AFTER saving final result to avoid race condition
      queryClient.invalidateQueries({ queryKey: ['inventory', currentStoreId] })
      setIsCompleted(true)
    },
    onError: (err: any) => {
      toast.error('Ошибка сохранения: ' + (err.response?.data?.message || err.message))
    },
  })

  const handleQuantityChange = (id: string, value: string) => {
    setItems(prev =>
      prev.map(item => ((item.productId || item.id) === id ? { ...item, actualQuantity: value } : item))
    )
  }

  const filteredItems = items.filter(item => {
    const matchesSearch =
      (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.categoryName || '').toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false
    const diff = (parseFloat(item.actualQuantity) || 0) - (item.quantity ?? 0)
    if (activeFilter === 'MISMATCH') return diff !== 0
    if (activeFilter === 'MATCHED') return diff === 0
    return true
  })

  const handleSubmit = () => {
    const diffs = items
      .map(item => ({
        productId: item.productId || item.id || '',
        diff: (parseFloat(item.actualQuantity) || 0) - (item.quantity ?? 0),
      }))
      .filter(d => d.productId && d.diff !== 0)

    // Capture totals BEFORE any state reset
    const capturedTotals = computeTotals(items)
    setFinalResult(capturedTotals)

    if (diffs.length === 0) {
      toast.info('Расхождений нет')
      setIsCompleted(true)
      return
    }

    saveMutation.mutate(diffs)
  }

  const getImagePath = (path?: string) => {
    if (!path) return ''
    if (path.startsWith('http')) return path
    return `/api/v1/media/${path}`
  }

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-60 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
        <p className="text-sm text-neutral-400">Загрузка данных инвентаризации...</p>
      </div>
    )
  }

  // ─── Completion Screen ─────────────────────────────────────────────────────
  if (isCompleted && finalResult) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-8 animate-in fade-in duration-500">
        <div className="relative inline-block">
          <div className="h-20 w-20 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
            <CheckCircle2 size={40} strokeWidth={1.5} />
          </div>
          <div className="absolute -bottom-1 -right-1 h-7 w-7 bg-white rounded-full border border-neutral-200 flex items-center justify-center shadow-sm">
            <TrendingUp size={14} className="text-emerald-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-neutral-900">Сверка успешно завершена</h1>
          <p className="text-sm text-neutral-500 leading-relaxed max-w-sm mx-auto">
            Все фактические остатки зафиксированы. Система автоматически произвела корректировку
            складских запасов.
          </p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-8 grid grid-cols-2 gap-8 text-left shadow-sm">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp size={12} className="text-blue-500" /> Фин. результат
            </p>
            <p className={cn('text-3xl font-bold tabular-nums', finalResult.netResult >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
              {finalResult.netResult > 0 ? '+' : ''}
              {Math.round(finalResult.netResult).toLocaleString()}
              <span className="text-lg font-normal ml-1">₽</span>
            </p>
          </div>
          <div className="space-y-2 border-l border-neutral-100 pl-8">
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle size={12} className="text-orange-500" /> Расхождения
            </p>
            <p className="text-3xl font-bold text-neutral-900 tabular-nums">
              {finalResult.shortageCount + finalResult.surplusCount}
              <span className="text-lg font-normal text-neutral-400 ml-1.5">поз.</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => {
              setIsCompleted(false)
              setFinalResult(null)
              queryClient.invalidateQueries({ queryKey: ['inventory'] })
            }}
            className="h-11 px-6 bg-neutral-900 text-white rounded-lg text-sm font-semibold hover:bg-neutral-800 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={15} /> Начать новый пересчёт
          </button>
        </div>
      </div>
    )
  }

  // ─── Main Page ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-32">

      {/* Page Header — compact CRM style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Инвентаризация</span>
            <ChevronRight size={12} className="text-neutral-300" />
            <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">Сеанс сверки</span>
          </div>
          <h1 className="text-xl font-bold text-neutral-900">
            Пересчёт от {format(new Date(), 'd MMMM yyyy', { locale: ru })}
          </h1>
          <p className="text-sm text-neutral-400 mt-0.5">
            Сессия активна с {format(new Date(), 'HH:mm', { locale: ru })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-emerald-700">Live Reconciliation</span>
          </div>
          <button
            onClick={() => refetch()}
            className="h-9 w-9 border border-neutral-200 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-50 hover:text-neutral-700 transition-colors"
            title="Обновить данные"
          >
            <RefreshCw size={16} className={cn(isRefetching && 'animate-spin')} />
          </button>
          <button
            onClick={handleSubmit}
            disabled={saveMutation.isPending}
            className="h-9 px-5 bg-neutral-900 text-white rounded-lg text-sm font-semibold hover:bg-neutral-800 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={15} />}
            Провести сверку
          </button>
        </div>
      </div>

      {/* KPI Cards — compact, clean */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-3">Совпадает</p>
          <p className="text-3xl font-bold text-neutral-900 tabular-nums">{totals.matchCount}</p>
          <p className="text-[11px] text-neutral-400 mt-2">позиций</p>
        </div>

        <div className="bg-white border border-rose-200 bg-rose-50/30 rounded-xl p-5 shadow-sm">
          <p className="text-[11px] font-semibold text-rose-500 uppercase tracking-wider mb-3">Недостача</p>
          <p className="text-3xl font-bold text-rose-600 tabular-nums">{totals.shortageCount}</p>
          <p className="text-[11px] text-rose-400 mt-2">позиций</p>
        </div>

        <div className="bg-white border border-blue-200 bg-blue-50/30 rounded-xl p-5 shadow-sm">
          <p className="text-[11px] font-semibold text-blue-500 uppercase tracking-wider mb-3">Излишки</p>
          <p className="text-3xl font-bold text-blue-600 tabular-nums">{totals.surplusCount}</p>
          <p className="text-[11px] text-blue-400 mt-2">позиций</p>
        </div>

        <div className={cn(
          'rounded-xl p-5 shadow-sm border',
          totals.netResult < 0 ? 'bg-neutral-900 border-neutral-800' : 'bg-emerald-600 border-emerald-500'
        )}>
          <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-3">Фин. результат</p>
          <p className="text-3xl font-bold text-white tabular-nums">
            {totals.netResult > 0 ? '+' : ''}
            {Math.round(totals.netResult).toLocaleString()}
            <span className="text-lg ml-1 font-normal opacity-60">₽</span>
          </p>
          <p className="text-[11px] text-white/40 mt-2">оценка по WAC</p>
        </div>
      </div>

      {/* Table Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Найти по названию, SKU или категории..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-9 pl-9 pr-4 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200 focus:border-neutral-400 transition-all w-72 text-neutral-900 placeholder:text-neutral-400"
            />
          </div>

          <div className="flex items-center bg-white border border-neutral-200 rounded-lg p-1 gap-1">
            {(['ALL', 'MISMATCH', 'MATCHED'] as const).map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={cn(
                  'px-3 h-7 rounded text-[11px] font-semibold uppercase tracking-wider transition-all',
                  activeFilter === f
                    ? f === 'MISMATCH'
                      ? 'bg-rose-600 text-white'
                      : f === 'MATCHED'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-900 text-white'
                    : 'text-neutral-500 hover:text-neutral-900'
                )}
              >
                {f === 'ALL' ? 'Все' : f === 'MISMATCH' ? 'Расхождения' : 'Совпало'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
          <ArrowUpDown size={14} />
          <span>{filteredItems.length} позиций</span>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-6 py-3.5 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Товарная единица</th>
              <th className="px-6 py-3.5 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider text-center">Система</th>
              <th className="px-6 py-3.5 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider text-center">Факт</th>
              <th className="px-6 py-3.5 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider text-right">Статус сверки</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredItems.map(item => {
              const diff = (parseFloat(item.actualQuantity) || 0) - (item.quantity ?? 0)
              const isMismatch = diff !== 0

              return (
                <tr key={item.productId || item.id} className="hover:bg-neutral-50/50 transition-colors">
                  {/* Product info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden flex-shrink-0 relative">
                        {item.imageUrl ? (
                          <img src={getImagePath(item.imageUrl)} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-300">
                            <Package size={18} />
                          </div>
                        )}
                        {isMismatch && (
                          <div className="absolute top-0.5 right-0.5 h-2 w-2 bg-orange-500 border border-white rounded-full" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">{item.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-neutral-400 uppercase tracking-wider">{item.categoryName || 'General'}</span>
                          {(item.sku || item.productId) && (
                            <span className="text-[11px] text-neutral-300">·</span>
                          )}
                          <span className="text-[11px] text-neutral-400 font-mono">
                            SKU: {(item.sku || item.productId?.slice(0, 8) || '—').toString().toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* System qty */}
                  <td className="px-6 py-4 text-center">
                    <span className="text-base font-semibold tabular-nums text-neutral-500">
                      {item.quantity}
                    </span>
                    <span className="text-[11px] text-neutral-400 ml-1 uppercase">{item.unit}</span>
                  </td>

                  {/* Actual input */}
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={item.actualQuantity}
                        onFocus={e => e.target.select()}
                        onChange={e => handleQuantityChange((item.productId || item.id)!, e.target.value)}
                        className={cn(
                          'w-24 h-9 border rounded-lg text-center text-sm font-semibold outline-none focus:ring-2 transition-all tabular-nums',
                          isMismatch
                            ? 'border-rose-300 bg-rose-50 text-rose-600 focus:ring-rose-100'
                            : 'border-neutral-200 bg-white text-neutral-900 focus:ring-neutral-100 focus:border-neutral-400'
                        )}
                      />
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 text-right">
                    {isMismatch ? (
                      <div className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-semibold tabular-nums',
                        diff < 0
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      )}>
                        {diff > 0 && '+'}
                        {diff}
                        {diff < 0 ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
                        <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70 ml-0.5">
                          {diff < 0 ? 'Недостача' : 'Излишек'}
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-emerald-600 text-[11px] font-semibold uppercase tracking-wider opacity-50">
                        <CheckCircle2 size={13} />
                        Full Match
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}

            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Filter size={32} className="text-neutral-200" />
                    <p className="text-sm font-semibold text-neutral-500">Ничего не найдено</p>
                    <p className="text-xs text-neutral-400">Попробуйте изменить параметры поиска</p>
                    <button
                      onClick={() => { setSearchQuery(''); setActiveFilter('ALL') }}
                      className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Сбросить фильтры
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Floating Footer Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[720px]">
        <div className="bg-neutral-900 rounded-2xl px-8 py-5 shadow-2xl border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div>
              <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1">Итоговый баланс</p>
              <p className={cn('text-xl font-bold tabular-nums leading-none', totals.netResult >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                {totals.netResult > 0 ? '+' : ''}
                {Math.round(totals.netResult).toLocaleString()}
                <span className="text-sm font-normal ml-1 opacity-50">руб</span>
              </p>
            </div>

            <div className="h-8 w-px bg-white/10" />

            <div className="flex items-center gap-6">
              <div>
                <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1">Проверено</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold text-white tabular-nums">{totals.matchCount}</span>
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1">Расхождения</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold text-white tabular-nums">
                    {totals.shortageCount + totals.surplusCount}
                  </span>
                  <div className={cn('h-1.5 w-1.5 rounded-full', (totals.shortageCount + totals.surplusCount) > 0 ? 'bg-orange-500' : 'bg-white/20')} />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={saveMutation.isPending}
            className="h-11 px-7 bg-white text-neutral-900 rounded-xl text-sm font-bold hover:bg-neutral-100 transition-colors flex items-center gap-2 disabled:opacity-50 active:scale-95"
          >
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
            Завершить сверку
          </button>
        </div>
      </div>
    </div>
  )
}
